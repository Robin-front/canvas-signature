import HandWrite from '../index.js'

const canvas = document.querySelector('#canvas');

let timer = null;
const instance = new HandWrite(canvas, {});

const $rewrite = document.querySelector('.J-rewrite');
const $linearModel = document.querySelector('.J-linear-model');
const $handWriteModel = document.querySelector('.J-hand-write');
const $downloadPNGImage = document.querySelector('.J-download');

$rewrite.addEventListener('click', function (){
  instance.clear();
}, false);

$handWriteModel.addEventListener('click', function (){
  instance.handWrittingModel();
}, false);

$linearModel.addEventListener('click', function (){
  instance.linearModel();
}, false);

$downloadPNGImage.addEventListener('click', function (){
  instance.downloadImage('jpeg');
}, false);
