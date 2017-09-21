const noop = () => {}
const debug = 1 ? console.log.bind(null, '[handWrite]') : noop;
const PI = Math.PI;

const addEventListener = (target, event, callback) => {
  target.addEventListener(event, callback, false);
  return {
    remove() {
      target.removeEventListener(event, callback, false);
    }
  }
}
export default class HandWrite {
  constructor(canvas) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    this.ctx = ctx;
    this._resize();

    ctx.fillStyle = '#f00';
    ctx.strokeStyle = '#f00';
    ctx.lineWidth = 3;

    this.lastPos = {};
    this._drawabled = false;
    this._isHandWrittingModel = true;
    this.bindEvents();

  }

  _resize() {
    const devicePixelRatio = Math.max(window.devicePixelRatio||1, 1);
    const {canvas, ctx} = this;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    canvas.height = height * devicePixelRatio; // 画布宽高放大
    canvas.width = width * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio); // 画布内容放大相同的倍数
  }

  bindEvents() {
    if (this._isMobile()){
      this._addTouchEvent();
    } else {
      this._addMouseEvent();
    }
  }

  _addTouchEvent() {
    const canvas = this.canvas;
    this._touchstartEvent = addEventListener(canvas, 'touchstart', this._start.bind(this));
    this._touchmoveEvent = addEventListener(canvas, 'touchmove', this._move.bind(this));
    this._touchendEvent = addEventListener(document, 'touchend', this._end.bind(this));
  }

  _addMouseEvent() {
    const canvas = this.canvas;
    this._mousedownEvent = addEventListener(canvas, 'mousedown', this._start.bind(this));
    this._mousemoveEvent = addEventListener(canvas, 'mousemove', this._move.bind(this));
    this._mouseupEvent = addEventListener(document, 'mouseup', this._end.bind(this));
    this._mouseleaveEvent = addEventListener(canvas, 'mouseleave', this._end.bind(this));
  }

  _removeTouchEvent() {
    this._touchstartEvent && this._touchstartEvent.remove();
    this._touchmoveEvent && this._touchmoveEvent.remove();
    this._touchendEvent && this._touchendEvent.remove();
  }

  _removeMouseEvent() {
    this._mousedownEvent && this._mousedownEvent.remove();
    this._mousemoveEvent && this._mousemoveEvent.remove();
    this._mouseupEvent && this._mouseupEvent.remove();
    this._mouseleaveEvent && this._mouseleaveEvent.remove();
  }

  _isMobile() {
    return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
  }

  _draw(pos) {
    const {ctx, lastPos, _isHandWrittingModel} = this;
    if (_isHandWrittingModel) {
      this._drawWithArc(pos);
    } else {
      this._drawWithLine(pos);
    }
  }

  _drawWithLine(pos) {
    const ctx = this.ctx;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  _drawWithArc(pos, r=3) {
    const {ctx, lastPos, lastR=0} = this;
    const distance = this._getDistance(pos, lastPos);
    if (distance < 2) { return false;} // 避免单点
    const threshold = 30; // 移速相关，过大或过小都会造成笔画粗细不明显
    let rate = distance > threshold ? 1 : distance/threshold;
    const finalR = r + 2.5*r*(1-rate); // 笔画的目标粗细， lastR 为上一次笔画最终粗细

    const len = Math.round(distance/2)+1;
    for (let i = 0, or = 0; i < len; i++) { // 由于画的是圆，需要在两个圆之前添加补间，形成笔画
      const x = lastPos.x + (pos.x-lastPos.x)/len*i;
      const y = lastPos.y + (pos.y-lastPos.y)/len*i;
      or = lastR + (finalR - lastR)/len*i;
      ctx.beginPath();
      ctx.arc(x, y, or, 0, 2*PI);
      ctx.fill();
    }
    this.lastR = finalR;

    lastPos.x = pos.x;
    lastPos.y = pos.y;
  }

  _rafDraw(e) {
    requestAnimationFrame(() => {
      if (this._drawabled) {
        const pos = this._getCoordinate(e);
        this._draw(pos);
      }
    });
  }

  _start(e) {
    debug('start', pos)
    e.preventDefault();
    const pos = this._getCoordinate(e);
    this._drawabled = true;
    if (!this._isHandWrittingModel) {
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
    }
    this._draw(pos);
  }

  _move(e) {
    if (this._drawabled){
      e.preventDefault();
      this._rafDraw(e);
    }
  }

  _end(e) {
    if (this._drawabled) {
      e.preventDefault();
      const pos = this._getCoordinate(e);
      this._draw(pos);
    }
    this._drawabled = false;
    this.lastPos = {};
    this.lastR = 0;
  }

  _getCanvasBounding() {
    if (this._drawabled) { // 只在 _start的时候重新读取布局
      return this._canvasBounding;
    }
    this._canvasBounding = this.canvas.getBoundingClientRect();
    return this._canvasBounding;
  }

  _getCoordinate(e) {
    const {left, top} = this._getCanvasBounding();
    e = this._isMobile() ? e.touches[0] : e;
    return {
      x: e.clientX - left + 0.5,
      y: e.clientY - top + 0.5,
    }
  }

  _getDistance(pos1, pos2) {
    if (!pos1 || !pos2) {
      return 0;
    }
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
  }

  destroy() {
    this._removeTouchEvent();
    this._removeMouseEvent();
  }

  clear() {
    const {canvas, ctx} = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  handWrittingModel() {
    this._isHandWrittingModel = true;
  }

  linearModel() {
    this._isHandWrittingModel = false;
  }

  formatType(type) {
    type = type.toLowerCase().replace(/jpg/i, 'jpeg');
		type = 'image/' + type.match(/png|jpeg|bmp|gif/)[0];
    return type;
  }

  getImgData(type='png', canvas=this.canvas) {
    type = this.formatType(type);
    return canvas.toDataURL(type);
  }

  downloadImage(type='png', canvas = this.canvas) {
    type = this.formatType(type);
    const url = canvas.toDataURL(type).replace(type, 'image/octet-stream');
    document.location.href = url;
  }

}
