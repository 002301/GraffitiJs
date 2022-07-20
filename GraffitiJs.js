
let isPC
/**
 * GraffitiJs
 * 涂鸦板功能，可以实现涂鸦和擦除功能
 * 
 * config{
 * bg : (color|URL)设置背景,可以是 rgba|#fff|imageUrl 图片地址
 * color:#fff 设置画笔颜色
 * lineWidth:30 设置画笔粗细
 * scratch:false 设置涂鸦还是擦除 
 * percent:0.5 设置擦除百分比，达到后执行结束回调函数
 * onComplete:function 设置结束回调
 * }
 **/

export default class GraffitiJs{
  constructor(dom,config){
    this._canvas = null;
    this._ctx = null;
    this._dpr = null;
    this._dom = dom;
    this._config = {
      bg: "rgba(255,255,255,0.2)",
      color: "#000",
      lineWidth: 40,
      scratch: false,
      percent:0,
      onComplete:()=>{},
      top:0,
      left:0
    }
    Object.assign(this._config,config);
    console.log(this._config)
    this.initCanvas(dom);

  }
  initCanvas(dom){
    this._dom = document.querySelector(dom);
    // console.log(this._dom.getBoundingClientRect())
    this._canvas = document.createElement('canvas');
    this._dom.appendChild(this._canvas);
    if (this._canvas != null) {
      this._ctx = this._canvas.getContext('2d');
      isPC = IsPC();
      if (isPC) {
        this.dpr = 1;
      } else {
        // this.dpr = window.devicePixelRatio;
        this.dpr = 2;
        this._config["lineWidth"]=80
      }
      let { width: cssWidth, height: cssHeight ,top:_top,left:_left} = this._dom.getBoundingClientRect();
      this._config.top = _top * this.dpr;
      this._config.left = _left * this.dpr;

      this._canvas.width = cssWidth * this.dpr;
      this._canvas.height = cssHeight * this.dpr;
      let st = `width:${this._canvas.width / this.dpr}px;height:${this._canvas.height / this.dpr}px`;
      // console.log(st)
      this._canvas.style = st;
      this.setBg()
      this.listenToUser();
    } else {
      console.log('canvas null')
    }
  }
  //初始化背景
  setBg(){
    if (this._config["bg"].search(/.jpg|.png|.gif/)==-1){
      this._ctx.fillStyle = this._config["bg"];
      this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }else{
      let img = new Image();
      img.crossOrigin = '*'
      img.src = this._config["bg"]+"?";
      img.onload = ()=>{
        let scale = this._canvas.width / img.width;
        img.width = this._canvas.width;
        img.height = img.height * scale;
        this._ctx.drawImage(img, 0, 0, img.width,img.height);

      }
    }
    
  }


  //设置颜色
  setColor(color){
    this._config["color"] = color;
  }

  //设置监听
  listenToUser() {
    let painting = false;
    let _this = this;
    let lastPoint = { x: undefined, y: undefined };
    if (isPC){
      this._canvas.addEventListener("mousedown",onDown);
      this._canvas.addEventListener("mousemove",onMove);
      this._canvas.addEventListener("mouseup",onUp);
      this._canvas.addEventListener("mouseout",onUp);
    }else{
      this._canvas.addEventListener("touchstart", onDown);
      this._canvas.addEventListener("touchmove", onMove);
      this._canvas.addEventListener("touchend", onUp);
    }
    function onDown(e) {
      e.preventDefault();
      e.stopPropagation();
      let { top, left } = _this._dom.getBoundingClientRect()
      painting = true;
      let _x, _y
      if (isPC) {
        _x = e.layerX;
        _y = e.layerY;
      } else {
        _y = e.touches[0].pageY * 2 - top * _this.dpr;
        _x = e.touches[0].pageX * 2 - left * _this.dpr;
      }

      lastPoint = { 'x': _x, 'y': _y };
    }
    function onMove(e) {
      e.preventDefault();
      e.stopPropagation();
      let { top, left } = _this._dom.getBoundingClientRect()

      if (painting) {
        let _x, _y
        if (isPC) {
          _x = e.layerX;
          _y = e.layerY;
        } else {
          _x = e.touches[0].pageX * 2 - left * _this.dpr;
          _y = e.touches[0].pageY * 2 - top * _this.dpr;
        }
        let newPoint = { 'x': _x, 'y': _y };
        _this.drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);
        lastPoint = newPoint;
      }
    }
    function onUp(e){
      e.preventDefault();
      e.stopPropagation();
      painting = false;
      if (_this._config["scratch"] && _this._config["percent"]>0){
        _this.scratchComplete(_this._config["percent"], _this._config["onComplete"])
      }
    }
    console.log('touchInit')
  }

  //擦除面积计算
  scratchComplete(percent=0.5, callback=()=>{}) {
    var imageDate = this._ctx.getImageData(0, 0, this._canvas.width, this._canvas.height);
    var allPX = imageDate.width * imageDate.height;
    var iNum = 0;//记录刮开的像素点个数
    for (var i = 0; i < allPX; i++) {
      if (imageDate.data[i * 4 + 3] == 0) {
        iNum++;
      }
    }
    // console.log(iNum, allPX * percent)
    if (iNum >= allPX * percent) {
      this._ctx.globalCompositeOperation = "destination-out";
      this._ctx.beginPath();
      this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height)
      callback()
    }
  }
    //划线
  drawLine(x1, y1, x2, y2) {
    this._ctx.lineWidth = this._config["lineWidth"];
    this._ctx.lineCap = "round";
    this._ctx.lineJoin = "round";
    this._ctx.strokeStyle = this._config["color"];
    // 设置添加还是删除划线部分
    if (this._config["scratch"]) {
      this._ctx.globalCompositeOperation = 'destination-out';
    }
    this._ctx.beginPath();
    this._ctx.moveTo(x1, y1);
    this._ctx.lineTo(x2, y2);
    this._ctx.stroke();
    this._ctx.closePath();
  }
}


// 平台判断
function IsPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
  }
  return flag;
}
