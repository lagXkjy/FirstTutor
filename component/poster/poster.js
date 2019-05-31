// component/poster/poster.js
const $common = require('../../utils/common.js');
const monthConvert = function (m) { //月份转换
  let data;
  switch (+m) {
    case 1:
      data = '一月';
      break;
    case 2:
      data = '二月';
      break;
    case 3:
      data = '三月';
      break;
    case 4:
      data = '四月';
      break;
    case 5:
      data = '五月';
      break;
    case 6:
      data = '六月';
      break;
    case 7:
      data = '七月';
      break;
    case 8:
      data = '八月';
      break;
    case 9:
      data = '九月';
      break;
    case 10:
      data = '十月';
      break;
    case 11:
      data = '十一月';
      break;
    case 12:
      data = '十二月';
      break;
    default:
      data = '一月';
  }
  return data;
}
const weekConvert = function (w) { //周转换
  let data;
  switch (+w) {
    case 1:
      data = '星期一';
      break;
    case 2:
      data = '星期二';
      break;
    case 3:
      data = '星期三';
      break;
    case 4:
      data = '星期四';
      break;
    case 5:
      data = '星期五';
      break;
    case 6:
      data = '星期六';
      break;
    case 0:
      data = '星期日';
      break;
    default:
      data = '星期一';
  }
  return data;
}
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    posterData: {
      type: Object,
      value: null,
      observer(e) {
        if (e) {
          wx.downloadFile({ //下载背景图
            url: this.data.srcClockInImage + e.PosterUrl,
            success: (res) => {
              if (res.statusCode === 200) {
                this.data.imageUrl = res.tempFilePath;
                wx.downloadFile({ //下载头像
                  url: e.UserAvaUrl,
                  success: (res) => {
                    if (res.statusCode === 200) {
                      this.data.headerImage = res.tempFilePath;
                      this.setData({
                        isShow: true
                      })
                      this.getCanvasSize();
                    }
                  }
                })
              }
            }
          })
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    srcClockInImage: $common.srcClockInImage,
    isShow: false,
    ctx: null, //canvas实例
    contentW: 0, //canvas的尺寸
    contentH: 0,
    imageH: 0, //图片的高度
    imageUrl: '/images/bg-all_02.jpg',
    pixelRatio: 1, //本设备像素比，解决生成的图片不清晰解决方案
    headerImage: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    startDraw() { //开始绘制
      let data = this.data;
      const ctx = wx.createCanvasContext('posterCanvas', this);
      ctx.setStrokeStyle('#fff'); //线条色
      ctx.setFillStyle('#fff'); //填充色
      ctx.fillRect(0, 0, data.contentW, data.contentH); //白色背景
      ctx.drawImage(data.imageUrl, 0, 0, data.contentW, data.contentH); //画图片
      ctx.setTextAlign('center'); //设置文字对其方式，center：整行文字的X轴基线位于所有文字的中心位置
      ctx.setTextBaseline('top'); //y轴对齐方式
      let nowDate = this.getNowDate(); //获取现在的时间
      //   draw月份
      ctx.setFontSize(14); //设置文字大小
      ctx.fillText(nowDate.m, data.contentW / 2, 40);
      //   draw天数
      ctx.setFontSize(22);
      ctx.fillText(nowDate.d, data.contentW / 2, 60 - 0.5); //还要加粗
      ctx.fillText(nowDate.d, data.contentW / 2 - 0.5, 60);
      ctx.fillText(nowDate.d, data.contentW / 2, 60);
      ctx.fillText(nowDate.d, data.contentW / 2, 60 + 0.5);
      ctx.fillText(nowDate.d, data.contentW / 2 + 0.5, 60); // 加粗结束
      let rectW = 64; //图片上方白框的宽度
      //  周，白框
      ctx.fillRect(data.contentW / 2 - rectW / 2, 95, rectW, 30);
      //  draw周
      ctx.setFontSize(14);
      ctx.setFillStyle('#565656');
      ctx.fillText(nowDate.w, data.contentW / 2, 100);
      //  线，白框
      ctx.setLineWidth(2); //设置线条宽度
      ctx.strokeRect(data.contentW / 2 - rectW / 2, 35, rectW, 90);
      //  draw二维码
      let codeW = (data.contentH - data.imageH) / 2; //二维码宽度
      let codeY = data.imageH + codeW / 2;
      // ctx.drawImage('/images/lian_03.jpg', data.contentW - codeW - 20, codeY, codeW, codeW);
      let headImage = 20; //头像宽度
      //  draw圆头像
      ctx.save(); //先保存状态，以便画完再用
      ctx.beginPath(); //开始绘制
      ctx.arc(20 + headImage / 2, codeY + headImage / 2, 10, 0, Math.PI * 2, false); //画圆
      ctx.clip(); //剪切
      ctx.drawImage(data.headerImage, 20, codeY, headImage, headImage); //头像
      ctx.restore(); //恢复
      //  姓名
      ctx.setTextAlign('left');
      ctx.setFillStyle('#4f4f4f');
      ctx.setFontSize(14);
      ctx.fillText(data.posterData.UserNickName, 20 + headImage + 5, codeY);
      // day
      let gifyW = 14; //礼包的宽度
      let gifyL = 23; //礼包左边距离
      ctx.drawImage('/images/calendar.png', gifyL, codeY + 25, gifyW, gifyW);
      ctx.setFillStyle('#999');
      ctx.setFontSize(14);
      ctx.fillText(`打卡第${data.posterData.Count}天`, gifyL + gifyW + 9, codeY + 24);
      // 礼包
      ctx.drawImage('/images/gift.png', gifyL, codeY + 46, gifyW, gifyW);
      ctx.setFillStyle('#999');
      ctx.setFontSize(14);
      let text = data.posterData.ActivityName;
      let surplusW = data.contentW - codeW - gifyW - gifyL - 60; //剩余可存放的宽度
      let showText = '';
      for (let i = 0, len = text.length; i < len; i++) {
        let textW = showText ? ctx.measureText(showText).width : 0; //礼包文字的宽度
        if (textW < surplusW) {
          showText += text[i];
        } else {
          showText += '...';
          break;
        }
      }
      ctx.fillText(showText, gifyL + gifyW + 9, codeY + 45);
      ctx.draw();
      this.data.ctx = ctx;
    },
    getCanvasSize() { //获取canvas宽高
      wx.createSelectorQuery().in(this).select('.canvas').boundingClientRect((res) => {
        this.data.contentW = res.width;
        this.data.contentH = res.height;
        this.data.imageH = res.height * 0.71; //图片的高度占canvas的71%
        this.startDraw();
      }).exec();
    },
    getNowDate() { //获取当前的时间
      let date = new Date(),
        m = date.getMonth() + 1,
        d = date.getDate(),
        w = date.getDay();
      m = monthConvert(m);
      w = weekConvert(w);
      return {
        m,
        d,
        w
      }
    },
    change() { //点击消失
      this.setData({
        isShow: false
      })
    },
    returnBubble() { }, //阻止默认事件
    saveImage() { //保存图片
      this.getPhoneInfo();
      let ctx = this.data.ctx;
      wx.canvasToTempFilePath({ //生成图片
        x: 0,
        y: 0,
        width: this.data.contentW,
        height: this.data.contentH,
        destWidth: this.data.contentW * this.data.pixelRatio,
        destHeight: this.data.contentH * this.data.pixelRatio,
        canvasId: 'posterCanvas',
        quality: 1,
        success: (res) => {
          console.log(res.tempFilePath);
          let path = res.tempFilePath;
          wx.saveImageToPhotosAlbum({ //保存图片到相册
            filePath: path,
            success: (res) => {
              this.change();
            },
            fail: (res) => { }
          })
        },
        fail: (res) => {
          console.log(res);
        }
      }, this);
    },
    getPhoneInfo() { //获取手机信息
      let info = wx.getSystemInfoSync();
      if (info) {
        this.getPhoneInfo = function () {
          this.data.pixelRatio = info.pixelRatio;
        }
        this.getPhoneInfo();
      }
    },
  },
  ready() {
    this.setData({
      isEn: wx.getStorageSync('isEn')
    })
  }
})