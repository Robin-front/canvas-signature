

基于canvas 的网页签名组件，支持毛笔字模式和普通模式，或导出图片。

Signature on website base on html5 canvas, it provide handwritting simulation feature and pen mode.

## test

```js
yarn install

yarn start
```

open http://localhost:8080 in browser.

## usage

**base**

```js
import HandWrite from 'canvas-signature'

const canvas = document.querySelector('#canvas');
const instance = new HandWrite(canvas[, options]);
```

## options && default

```js
const options = {
  paintColor: '#f00',
  backgroundColor: 'rgba(0, 0, 0, 0)',
  isHandWrittingModel: true,
  maxWidth: 15,
  minWidth: 5,
  writeSpeed: 30, // 书写速度，关联控制速度与笔画粗细的阈值
  beforeWrite: ()=>{},
  onWritting: ()=>{}, // 谨慎使用，可能造成性能问题
  afterWrite: ()=>{},
}
```

## API

**handWrittingModel**

```js
instance.handWrittingModel();
```

**linearModel**

```js
instance.linearModel();
```

**getImgData**

```js
instance.getImgData('png'); //  default: png
```

**downloadImage**

```js
instance.downloadImage('jpeg'); //  default: png
```

**clear Canvas**

```js
instance.clear();
```

[see example](./example/index.html)


## todo

- [x] 无依赖组件
- [ ] react 组件
