const $common = require('../../../utils/common.js');
const app = getApp();
Page({
  data: {
    srcClockInCatch: $common.srcClockInCatch,
    srcClockInImage: $common.srcClockInImage,
    headerImage: '', //主题头图
    inputTitle: '',
    startTime: '', //开始时间
    endTime: '', //结束时间
    chooseTime: '', //当前选择的时间
    info: {
      text: [],
      images: [],
      audio: [],
      video: [],
    },
    pageStatus: 0, //页面隐藏由来，0 删除 1 选择图片或视频
    flag: true, //防止连点
  },
  chooseImage() { //选择图片
    $common.chooseImage((res) => {
      app.themeImage = res.tempFiles[0];
      wx.navigateTo({
        url: '/pages/clockIn/cutOut/cutOut',
      })
    }, 1);
  },
  headerImageDelete() { //删除主题头图
    this.deleteImage(this.data.headerImage.url, () => {
      this.setData({
        headerImage: ''
      });
      app.themeImage.cutImage = '';
    });
  },
  inputEvent(e) { //标题
    this.data.inputTitle = e.detail.value;
  },
  syncHeaderImage() { //同步头部图片
    // if (this.data.pageStatus === 1) return; //下面选择图片或视频隐藏了
    let headerImage = app.themeImage.cutImage || '';
    if (headerImage) this.uploadImage(headerImage, (headerImage) => {
      this.setData({
        headerImage: {
          url: headerImage
        }
      })
    });
  },
  syncData(e) { //同步数据
    if (e) this.data.info = e.detail;
  },
  uploadImage(filePath, callback) { //上传图片
    $common.loading(2);
    wx.uploadFile({
      url: $common.config.UpLoadImg,
      filePath,
      name: 'file',
      formData: {
        Type: 0
      },
      success: (res) => {
        let data = JSON.parse(res.data);
        if (data.res) { //上传成功
          callback(data.msg);
        } else { //上传失败
          wx.showToast({
            title: 'fail',
            duration: 500
          })
        }
      },
      fail: (res) => {
        wx.showToast({
          title: 'fail',
          duration: 500
        })
      },
      complete: (res) => {
        $common.hide();
      }
    })
  },
  deleteImage(FileName, callback) { //删除图片
    $common.loading(3);
    $common.request(
      'POST',
      $common.config.DelAtyFile, {
        FileName,
        Type: 0,
        FileType: 0,
      },
      (res) => {
        if (res.data.res) {
          callback();
        } else {
          if (this.data.isEn) {
            $common.showModal('Delete failed', false, false, 'OK', 'Reminder');
          } else {
            $common.showModal('删除失败');
          }
        }
      },
      (res) => {
        if (this.data.isEn) {
          $common.showModal('Unknown Error', false, false, 'OK', 'Reminder');
        } else {
          $common.showModal('未知错误');
        }
      },
      (res) => {
        wx.hideLoading();
      }
    )
  },
  stopBubble() { }, //阻止冒泡
  getNowDate() { //获取现在的时间，提供于日期选择器
    this.setData({
      startTime: this.setTime(-365),
      endTime: this.setTime(365),
      chooseTime: this.setTime(),
    })
  },
  setTime(n) { //设置时间
    let date = new Date();
    if (n) date.setDate(date.getDate() + n);
    let Y = date.getFullYear(),
      M = date.getMonth() + 1,
      D = date.getDate();
    return `${Y}-${M}-${D}`;
  },
  submit() { //提交
    if (!this.data.flag) return;
    this.data.flag = false;
    let data = this.data;
    let isEn = wx.getStorageSync('isEn');
    let ThemeHeadImg = data.headerImage;
    if (!ThemeHeadImg.url) {
      if (isEn) {
        $common.showModal('Please upload the header.', false, false, 'OK', 'Prompt');
      } else {
        $common.showModal('请上传活动头图');
      }
      this.data.flag = true;
      return;
    }
    let ThemeName = this.data.inputTitle;
    if (ThemeName.trim().length <= 0) {
      if (isEn) {
        $common.showModal('Please fill in the title.', false, false, 'OK', 'Prompt');
      } else {
        $common.showModal('请填写标题');
      }
      this.data.flag = true;
      return;
    }
    let info = this.data.info;
    let infoFlag = false;
    for (let i = 0; i < 3; i++) {
      if (info.text[i] || info.images[i] || info.audio[i] || info.video[i]) {
        infoFlag = true;
        break;
      }
    }
    if (!infoFlag) {
      if (isEn) {
        $common.showModal('Please add theme content.', false, false, 'OK', 'Prompt');
      } else {
        $common.showModal('请添加主题内容');
      }
      this.data.flag = true;
      return;
    }
    $common.request(
      'POST',
      $common.config.InsertTheme, {
        SmallCardActivityID: +this.data.ActivityID,
        ThemeCheckpoint: this.data.type === 2 ? this.data.checkPoint : null,
        ThemeDate: this.data.type === 1 ? this.data.chooseTime : null,
        ThemeHeadImg: ThemeHeadImg.url,
        ThemeName,
        ThemeInfoText: info.text,
        ThemeInfoImg: info.images,
        ThemeInfoVoice: info.audio,
        ThemeInfoVideo: info.video,
      },
      (res) => {
        if (res.data.res) {
          wx.navigateBack({
            delta: 1
          })
        } else {
          if (res.data.errType === 4) {
            if (isEn) {
              $common.showModal('The punch date already exists.', false, false, 'OK', 'Prompt');
            } else {
              $common.showModal('打卡日期已存在');
            }
          } else {
            if (isEn) {
              $common.showModal('Add failure.', false, false, 'OK', 'Prompt');
            } else {
              $common.showModal('添加失败');
            }
          }
        }
      },
      (res) => {
        if (isEn) {
          $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
        } else {
          $common.showModal('亲~网络不给力哦，请稍后重试');
        }
      },
      (res) => {
        this.data.flag = true;
      }
    )
  },
  reverse() { //修改主题
    if (!this.data.flag) return;
    this.data.flag = false;
    let data = this.data;
    let isEn = wx.getStorageSync('isEn');
    let ThemeHeadImg = data.headerImage;
    if (!ThemeHeadImg.url) {
      if (isEn) {
        $common.showModal('Please upload Themes image.', false, false, 'OK', 'Prompt');
      } else {
        $common.showModal('请上传活动头图');
      }
      this.data.flag = true;
      return;
    }
    let ThemeName = this.data.inputTitle;
    if (ThemeName.trim().length <= 0) {
      if (isEn) {
        $common.showModal('Please fill in the title.', false, false, 'OK', 'Prompt');
      } else {
        $common.showModal('请填写标题');
      }
      this.data.flag = true;
      return;
    }
    let info = this.data.info;
    let infoFlag = false;
    for (let i = 0; i < 3; i++) {
      if (info.text[i] || info.images[i] || info.audio[i] || info.video[i]) {
        infoFlag = true;
        break;
      }
    }
    if (!infoFlag) {
      if (isEn) {
        $common.showModal('Please add theme content.', false, false, 'OK', 'Prompt');
      } else {
        $common.showModal('请添加主题内容');
      }
      this.data.flag = true;
      return;
    }
    $common.request(
      'POST',
      $common.config.UpdateTheme, {
        ThemeID: this.data.ThemeId,
        ThemeHeadImg: ThemeHeadImg.url,
        ThemeDate: this.data.type === 1 ? this.data.chooseTime : null,
        ThemeInfoImg: info.images,
        ThemeInfoText: info.text,
        ThemeInfoVoice: info.audio,
        ThemeInfoVideo: info.video,
        ThemeName,
      },
      (res) => {
        if (res.data.res) {
          wx.navigateBack({
            delta: 1
          })
        } else {
          if (res.data.errType === 4) {
            if (isEn) {
              $common.showModal('The punch date already exists.', false, false, 'OK', 'Prompt');
            } else {
              $common.showModal('打卡日期已存在');
            }
          } else {
            if (isEn) {
              $common.showModal('Failure to modify.', false, false, 'OK', 'Prompt');
            } else {
              $common.showModal('修改失败');
            }
          }
        }
      },
      (res) => {
        if (isEn) {
          $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
        } else {
          $common.showModal('亲~网络不给力哦，请稍后重试');
        }
      },
      (res) => {
        this.data.flag = true;
      }
    )
  },
  timeChange(e) { //日期选择器
    this.setData({
      chooseTime: e.detail.value
    })
  },
  getThemeData() { //获取主题信息
    $common.request(
      'POST',
      $common.config.GetThemeInfo, {
        ThemeId: this.data.ThemeId
      },
      (res) => {
        if (res.data.res) {
          let options = res.data.Data;
          let data = this.data;
          let themeInfoData = {
            text: options.ThemeInfoText,
            images: options.ThemeInfoImg,
            audio: options.ThemeInfoVoice,
            video: options.ThemeInfoVideo,
          }
          let d = options.ThemeDate && $common.timeStamp(options.ThemeDate);
          this.setData({
            headerImage: {
              url: options.ThemeHeadImg,
              isRevise: true
            },
            checkPoint: +options.ThemeCheckpoint,
            inputTitle: options.ThemeName,
            chooseTime: options.ThemeDate ? `${d.y}-${d.m}-${d.d}` : '',
            themeInfoData
          })
          this.data.info = { //修改的时候，若什么内容都没有改发请求的情况，需要提前中转为所需格式
            text: JSON.parse(themeInfoData.text),
            images: themeInfoData.images.split(','),
            audio: themeInfoData.audio.split(','),
            video: themeInfoData.video.split(',')
          };
        } else {
          if (isEn) {
            $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
          } else {
            $common.showModal('未知错误');
          }
        }
      },
      (res) => {
        if (isEn) {
          $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
        } else {
          $common.showModal('亲~网络不给力哦，请稍后重试');
        }
      },
      (res) => {

      }
    )
  },
  pageHide() { //页面隐藏原因
    this.data.pageStatus = 1; //选择图片或视频
  },
  onLoad: function (options) {
    let type = +options.type; // 1 每日打卡 2 闯关模式
    this.setData({
      type,
    });
    if (options.ThemeId) { //修改
      this.setData({
        ThemeId: +options.ThemeId
      })
      this.getThemeData();
      return;
    }
    if (type === 2) {
      this.setData({
        checkPoint: +options.checkPoint + 1
      })
    }
    this.data.ActivityID = options.ActivityID;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log(this.data.ThemeId)
    // this.getNowDate();
    if(this.data.ThemeId){
      this.setData({
        startTime: this.setTime(-365),
        endTime: this.setTime(365)
      })
    }else{
      this.setData({
        startTime: this.setTime(-365),
        endTime: this.setTime(365),
        chooseTime: this.setTime(),
      })
    }
  },

  isEnEvent() {
    let isEn = wx.getStorageSync('isEn');
    let ThemeId = this.data.ThemeId;
    let title = isEn ? !ThemeId ? 'Post New Theme' : 'Modified the Theme' : !ThemeId ? '新建打卡主题' : '修改打卡主题';
    wx.setNavigationBarTitle({
      title
    });
    this.setData({
      isEn
    })
  },
  onShow: function () {
    this.isEnEvent();
    this.syncHeaderImage();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    app.themeImage.cutImage = '';
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return $common.share()
  }
})