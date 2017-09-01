const noop = () => {}
const debug = 1 ? console.log.bind(null, '[handWrite]') : noop;
const PI = Math.PI;
export default class HandWrite {
  constructor(canvas) {

    this.canvas = canvas;
    const ctx = canvas.getContext('2d');

    const devicePixelRatio = window.devicePixelRatio;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    if (devicePixelRatio) {
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.height = height * devicePixelRatio; // 画布宽高放大
      canvas.width = width * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio); // 画布内容放大相同的倍数
    }

    this.ctx = ctx;
    ctx.fillStyle = '#f00';
    ctx.strokeStyle = '#f00';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // ctx.shadowBlur = 1;
    // ctx.shadowColor = '#000';
    ctx.lineWidth = 6;

    this.lastPos = {};
    this.drawabled = false;
    this.isHandWrittingModel = true;
    this.bindEvents();

  }

  bindEvents() {
    this.canvas.addEventListener('touchstart', this.start.bind(this), false);
    this.canvas.addEventListener('mousedown', this.start.bind(this), false);
    this.canvas.addEventListener('touchend', this.up.bind(this), false);
    this.canvas.addEventListener('mouseup', this.up.bind(this), false);
    this.canvas.addEventListener('mouseleave', this.up.bind(this), false);
  }

  __isMobile() {
    return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
  }

  draw(pos) {
    const {ctx, lastPos, isHandWrittingModel} = this;
    if (isHandWrittingModel) {
      this.drawWithArc(pos);
    } else {
      this.drawWithLine(pos);
    }
  }

  drawWithLine(pos) {
    const ctx = this.ctx;
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  drawWithArc(pos, r=3) {
    const {ctx, lastPos, lastR=0} = this;
    const distance = this.getDistance(pos, lastPos);
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

  rafDraw(e) {
    requestAnimationFrame(() => {
      if (this.drawabled) {
        const pos = this.getCoordinate(e);
        this.draw(pos);
      }
    });
  }

  throttleDraw(e) {
    this.rafDraw(e);
  }

  start(e) {
    e.preventDefault();
    const pos = this.getCoordinate(e);
    debug('start', pos)
    this.drawabled = true;
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
    this.draw(pos);

    this.canvas.addEventListener('touchmove', this.move.bind(this), false);
    this.canvas.addEventListener('mousemove', this.move.bind(this), false);
  }

  move(e) {
    e.preventDefault();
    this.throttleDraw(e);
  }

  up(e) {
    e.preventDefault();
    if (this.drawabled) {
      const pos = this.getCoordinate(e);
      this.draw(pos);
    }
    this.drawabled = false;
    this.lastPos = {};
    this.lastR = 0;

    this.canvas.removeEventListener('touchmove', this.move.bind(this), false);
    this.canvas.removeEventListener('mousemove', this.move.bind(this), false);
  }

  getCoordinate(e) {
    const {left, top} = this.canvas.getBoundingClientRect();
    e = this.__isMobile() ? e.touches[0] : e;
    return {
      x: e.clientX - left + 0.5,
      y: e.clientY - top + 0.5,
    }
  }

  getDistance(pos1, pos2) {
    if (!pos1 || !pos2) {
      return 0;
    }
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
  }

  clear() {
    const canvas = this.canvas;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  destroy() {
    this.canvas.removeEventListener('touchstart', this.start.bind(this), false);
    this.canvas.removeEventListener('mousedown', this.start.bind(this), false);
    this.canvas.removeEventListener('touchmove', this.move.bind(this), false);
    this.canvas.removeEventListener('mousemove', this.move.bind(this), false);
    this.canvas.removeEventListener('touchend', this.up.bind(this), false);
    this.canvas.removeEventListener('mouseup', this.up.bind(this), false);
  }

  clearCanvas() {
    const {canvas, ctx} = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  handWrittingModel() {
    this.isHandWrittingModel = true;
  }

  linearModel() {
    this.isHandWrittingModel = false;
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

  downloadPNGImage(type='png', canvas = this.canvas) {
    type = this.formatType(type);
    const url = canvas.toDataURL(type).replace(type, 'image/octet-stream');
    document.location.href = url;
  }

}
