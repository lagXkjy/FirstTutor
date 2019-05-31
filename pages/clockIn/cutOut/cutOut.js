const $common = require('../../../utils/common.js');
const app = getApp();
Page({
  data: {
    imgW: 0, //图片的尺寸
    imgH: 0,
    imgX: 0,
    imgY: 0,
    w: 0, //裁剪框的尺寸
    h: 0,
    x: 0,
    y: 0,
    minW: 40, //裁剪框的最小尺寸
    minH: 20,
    maxW: 0, //裁剪框最大尺寸
    maxH: 0,
    previousX: 0, //手指移动记录上一个位置 
    previousY: 0,
    isLocation: 0, //手指的出手位置 0 不管 1 右下角白色的框框，可以拉伸 2 蓝色的框框可以移动
  },
  scaleDraw(x, y) { //拉伸
    let data = this.data;
    let previousX = data.previousX,
      previousY = data.previousY;
    if (x < data.x + data.minw) x = data.x + data.minW - 10; //可劲的往小缩，缩超了处理
    if (y < data.y + data.minH) y = data.y + data.minH - 10;
    let nowAcreage = data.w * data.h; //当前面积
    let scale = ((x - data.x) * (y - data.y)) / ((previousX - data.x) * (previousY - data.y)); //缩放的区域面积比
    let targetH = (Math.sqrt(nowAcreage * scale / 2)), //要缩放的目标尺寸,宽高比例2:1
      targetW = targetH * 2;
    if (x > previousX || y > previousY) { //右移，下移拉伸
      if (targetH > data.maxH) {
        targetH = data.maxH;
        targetW = data.maxW;
      }
      if (targetW + data.x > data.imgX + data.imgW || targetH + data.y > data.imgY + data.imgH) { //放大过程中，下边框或右边框超出图片边缘处理
        targetH = this.data.h;
        targetW = this.data.w;
      }
    }
    if (x < previousX || y < previousY) { //上移，左移缩小
      if (targetH < data.minH) {
        targetH = data.minH;
        targetW = data.minW;
      }
    }
    this.data.w = parseInt(targetW);
    this.data.h = parseInt(targetH);
    this.data.previousX = x;
    this.data.previousY = y;
    this.drawCanvas();
  },
  moveDraw(x, y) { //移动
    let data = this.data;
    let previousX = data.previousX,
      previousY = data.previousY;
    let moveX = data.x, //当前需要移动的位置
      moveY = data.y;
    if (x > previousX) { //右移
      moveX = data.x + x - previousX;
      moveX > data.imgX + data.imgW - data.w && (moveX = data.imgX + data.imgW - data.w);
    } else if (x < previousX) { //左移
      moveX = data.x - (previousX - x);
      moveX < data.imgX && (moveX = data.imgX);
    }
    if (y > previousY) { //下移
      moveY = data.y + y - previousY;
      moveY > data.imgY + data.imgH - data.h && (moveY = data.imgY + data.imgH - data.h);
    } else if (y < previousY) { //上移
      moveY = data.y - (previousY - y);
      moveY < data.imgY && (moveY = data.imgY);
    }
    this.data.x = moveX;
    this.data.y = moveY;
    this.data.previousX = x;
    this.data.previousY = y;
    this.drawCanvas();
  },
  startEvent(e) { //手指触摸开始
    let finger = e.touches[0]; //下手位置
    let x = finger.x,
      y = finger.y;
    let data = this.data;
    let scaleX = data.x + data.w - data.minH, //用来缩放的白块块的区域
      scaleY = data.y + data.h - data.minH,
      scaleW = data.minH,
      scaleH = data.minH;
    this.data.previousX = x;
    this.data.previousY = y;
    if (x >= scaleX && x <= scaleX + scaleW && y >= scaleY && y <= scaleY + scaleH) { //当前出手点位于右下角的白块块，做缩放动作
      this.data.isLocation = 1;
      return;
    }
    if (x >= data.x && x <= data.x + data.w && y >= data.y && y <= data.y + data.h) { //出手点位于裁剪框,做移动动作， 上面已经判断过缩放位置，不会走到这里
      this.data.isLocation = 2;
      return;
    }
  },
  moveEvent(e) { //手指触摸后移动
    let finger = e.touches[0]; //下手位置
    let x = finger.x,
      y = finger.y;
    let data = this.data;
    let isLocation = data.isLocation;
    if (x < data.imgX || x > data.imgX + data.imgW || y < data.imgY || y > data.imgY + data.imgH) return; //移动过程中出圈了
    if (isLocation === 1) { //拉伸
      this.scaleDraw(x, y);
    } else if (isLocation === 2) { //移动
      this.moveDraw(x, y);
    }
  },
  endEvent(e) { //手指触摸结束或者被打断
    this.data.isLocation = 0;
  },
  drawVisible() { //绘制裁剪框
    let data = this.data,
      ctx = data.ctx;
    let w = data.w,
      h = data.h,
      x = data.x,
      y = data.y;
    ctx.setFillStyle('#7c99d0');
    ctx.setGlobalAlpha(0.3);
    ctx.fillRect(x, y, w, h); //画带背景色的框框 
    ctx.setGlobalAlpha(1);
    ctx.setStrokeStyle('#fff');
    ctx.setGlobalAlpha(0.8);
    ctx.setLineDash([1, 5], 5); //虚线
    ctx.beginPath(); //画横向第一条虚线
    ctx.moveTo(x, y + (h / 3));
    ctx.lineTo(x + w, y + (h / 3));
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath(); //画横向第二条虚线
    ctx.moveTo(x, y + (h / 3 * 2));
    ctx.lineTo(x + w, y + (h / 3 * 2));
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath(); //画纵向向第一条虚线
    ctx.moveTo(x + (w / 3), y);
    ctx.lineTo(x + (w / 3), y + h);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath(); //画纵向向第二条虚线
    ctx.moveTo(x + (w / 3 * 2), y);
    ctx.lineTo(x + (w / 3 * 2), y + h);
    ctx.closePath();
    ctx.stroke();
    ctx.setGlobalAlpha(1); //画右下角的白块块
    ctx.setFillStyle('#fff');
    let minH = data.minH; //裁剪框的最小高度
    ctx.fillRect(x + w - minH, y + h - minH, minH, minH);
    ctx.setLineDash([0, 0], 0); //虚线
    ctx.strokeRect(x, y, w, h); //画白色边框

  },
  drawCanvas(isCut) { //绘制
    let data = this.data,
      ctx = isCut || data.ctx;
    ctx.clearRect(0, 0, data.imgW, data.imgH); //清除画布
    ctx.drawImage(data.image, data.imgX, data.imgY, data.imgW, data.imgH); //画照片
    isCut || this.drawVisible();
    ctx.draw();
  },
  initVisibleSize() { //初始化裁剪窗口的尺寸
    let data = this.data;
    let imgW = data.imgW,
      imgH = data.imgH,
      imgX = data.imgX,
      imgY = data.imgY;
    let w = 0,
      h = 0,
      x = 0,
      y = 0;
    if (imgW <= imgH) { //宽度小于等于高度，以宽度为基准
      w = imgW;
      h = w / 2;
    } else { //宽度大于高度，以高度为基准
      h = imgH;
      w = h * 2;
    }
    x = (data.contentW - w) / 2;
    y = (data.contentH - h) / 2;
    this.data.w = w;
    this.data.h = h;
    this.data.x = x;
    this.data.y = y;
    this.data.maxW = w;
    this.data.maxH = h;
    this.data.ctx = wx.createCanvasContext('myCanvas');
    this.drawCanvas();
    this.data.catCtx = wx.createCanvasContext('cutCanvas'); //创建要剪切的canvas
    this.drawCanvas(this.data.catCtx); //绘制图片，不带裁剪框
  },
  getContentSize() { //获取content区域宽高
    wx.createSelectorQuery().select('#content').boundingClientRect((res) => {
      this.data.contentW = res.width;
      this.data.contentH = res.height;
      this.setImageAndCanvasSize();
    }).exec();
  },
  setImageAndCanvasSize() { //设置图片的尺寸
    let data = this.data;
    let contentW = data.contentW, //图片可存放的最大区域尺寸
      contentH = data.contentH,
      imageW = data.imageW, //图片原始尺寸
      imageH = data.imageH;
    let scale = imageW / imageH; //图片宽高比例
    let imgW = 0;
    let imgH = 0;
    if (imageW >= imageH) { //图片宽度大于等于高度， 以宽度为基准
      if (imageW >= contentW) { //图片宽度大于容器尺寸
        imgW = contentW;
      } else {
        imgW = imageW;
      }
      imgH = parseInt(imgW / scale);
    } else { //图片高度大于宽度度， 以高度为基准
      if (imageH >= contentH) { //图片高度大于容器尺寸
        imgH = contentH;
      } else {
        imgH = imageH;
      }
      imgW = parseInt(imgH * scale);
    }
    this.data.imgW = imgW;
    this.data.imgH = imgH;
    this.data.imgX = (contentW - imgW) / 2;
    this.data.imgY = (contentH - imgH) / 2;
    this.initVisibleSize();
  },
  init() {
    let image = app.themeImage.path;
    this.data.themeImage = app.themeImage;
    wx.getImageInfo({ //获取图片信息
      src: image,
      success: (res) => {
        this.data.image = image;
        this.data.imageW = res.width;
        this.data.imageH = res.height;
        this.getContentSize();
      }
    })
  },
  success() { //完成按钮
    let data = this.data;
    wx.canvasToTempFilePath({
      x: data.x,
      y: data.y,
      width: data.w,
      height: data.h,
      quality: 1,
      canvasId: 'cutCanvas',
      success: (res) => {
        app.themeImage.cutImage = res.tempFilePath;
        this.cancel();
      }
    })
  },
  cancel() { //取消按钮
    wx.navigateBack({
      delta: 1
    })
  },
  onLoad: function(options) {},
  onReady: function() {
    this.init();
  },
  isEnEvent() {
    let isEn = wx.getStorageSync('isEn');
    let title = isEn ? 'Themes image' : '主题头图';
    wx.setNavigationBarTitle({
      title
    });
    this.setData({
      isEn
    })
  },
  onShow: function() {
    this.isEnEvent();
  },
  onHide: function() {},
  onUnload: function() {},
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh();
  },
  onReachBottom: function() {},
  onShareAppMessage: function() {
    return $common.share()
  }
})