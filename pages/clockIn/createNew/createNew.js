const $common = require('../../../utils/common.js');
Page({
  data: {
    srcClockInCatch: $common.srcClockInCatch,
    srcClockInImage: $common.srcClockInImage,
    activeName: '',
    headImage: '',
    clockInType: 0,
    info: {
      text: [],
      images: [],
      audio: [],
      video: [],
    },
    flag: true, //防止连点
  },
  inputEvent(e) { //打卡名称
    this.data.activeName = e.detail.value
  },
  chooseHeadImage() { //选择活动头图
    $common.chooseImage((res) => {
      let headImage = res.tempFilePaths[0];
      wx.showLoading({
        title: 'uploading...',
      })
      wx.uploadFile({
        url: $common.config.UpLoadImg,
        filePath: headImage,
        name: 'file',
        formData: {
          Type: 1
        },
        success: (res) => {
          let data = JSON.parse(res.data);
          if (data.res) { //上传成功
            this.setData({
              headImageR: '',
              headImage: {
                url: data.msg
              }
            })
          } else { //上传失败
            $common.showModal('Upload Failed', false, false, 'OK', 'Reminder');
          }
        },
        fail: (res) => {
          $common.showModal('Unknown Error', false, false, 'OK', 'Reminder');
        },
        complete: (res) => {
          $common.hide();
        }
      })
    }, 1);
  },
  radioCheck(e) { //选择打卡类型
    this.setData({
      clockInType: +e.currentTarget.dataset.index
    });
  },
  syncData(e) { //同步组件数据
    this.data.info = e.detail;
  },
  toDetail() { //创建成功后跳转到详情页
    if (!this.data.flag) return;
    this.data.flag = false;
    let isEn = wx.getStorageSync('isEn');
    let ActivityName = this.data.activeName,
      ActivityHeadImage = this.data.headImage,
      ActivityType = this.data.clockInType + 1;
    if (ActivityName.trim().length <= 0) {
      if (isEn) {
        $common.showModal('Please fill in the name of the activity.', false, false, 'OK', 'Reminder');
      } else {
        $common.showModal('请填写活动名称');
      }
      this.data.flag = true;
      return;
    }
    if (!ActivityHeadImage.url) {
      if (isEn) {
        $common.showModal('Please upload the activity diagram.', false, false, 'OK', 'Reminder');
      } else {
        $common.showModal('请上传活动头图');
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
        $common.showModal('Please add activity content.', false, false, 'OK', 'Reminder');
      } else {
        $common.showModal('请添加活动内容');
      }
      this.data.flag = true;
      return;
    }
    $common.request(
      'POST',
      $common.config.InsertActivities, {
        ActivityName,
        ActivityHeadImage: ActivityHeadImage.url,
        ActivityType,
        ActivityInfoText: info.text,
        ActivityInfoImg: info.images,
        ActivityInfoVoice: info.audio,
        ActivityInfoVideo: info.video,
        openId: wx.getStorageSync('openid')
      },
      (res) => {
        if (res.data.res) { //创建成功
          wx.redirectTo({
            url: `/pages/clockIn/details/details?ActivityID=${res.data.Id}&isAdministrator=1&isNewCreate=1`, //创建后默认是管理员
          })
        } else {
          if (isEn) {
            $common.showModal('Add failure', false, false, 'Ok', 'Reminder');
          } else {
            $common.showModal('添加失败');
          }
        }
      },
      (res) => {
        if (isEn) {
          $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
        } else {
          $common.showModal('未知错误');
        }
      },
      (res) => {
        this.data.flag = true;
      }
    )
  },
  reverse() { //修改活动
    if (!this.data.flag) return;
    this.data.flag = false;
    let isEn = wx.getStorageSync('isEn');
    let ActivityName = this.data.activeName,
      ActivityHeadImage = this.data.headImage,
      ActivityType = this.data.clockInType + 1;
    if (ActivityName.trim().length <= 0) {
      if (isEn) {
        $common.showModal('Please fill in the name of the activity.', false, false, 'OK', 'Reminder');
      } else {
        $common.showModal('请填写活动名称');
      }
      this.data.flag = true;
      return;
    }
    if (!ActivityHeadImage.url) {
      if (isEn) {
        $common.showModal('Please upload Title Image.', false, false, 'OK', 'Reminder');
      } else {
        $common.showModal('请上传活动头图');
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
        $common.showModal('Please add activity content.', false, false, 'OK', 'Reminder');
      } else {
        $common.showModal('请添加活动内容');
      }
      this.data.flag = true;
      return;
    }
    $common.request(
      'POST',
      $common.config.UpdateActivities, {
        ActivityID: this.data.ActivityID,
        ActivityHeadImage: ActivityHeadImage.url,
        ActivityInfoImg: info.images,
        ActivityInfoText: info.text,
        ActivityInfoVideo: info.video,
        ActivityInfoVoice: info.audio,
        ActivityName,
        openId: wx.getStorageSync('openid')
      },
      (res) => {
        if (res.data.res) { //修改成功
          wx.navigateBack({
            delta: 1
          })
          // wx.redirectTo({
          //   url: `/pages/clockIn/details/details?ActivityID=${res.data.Id}&isAdministrator=1&isNewCreate=1`, //创建后默认是管理员
          // })
        } else {
          if (isEn) {
            $common.showModal('Modify the failure', false, false, 'Ok', 'Reminder');
          } else {
            $common.showModal('修改失败');
          }
        }
      },
      (res) => {
        if (isEn) {
          $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
        } else {
          $common.showModal('未知错误');
        }
      },
      (res) => {
        this.data.flag = true;
      }
    )
  },
  stopPlay() { //页面隐藏或卸载后停止录音和播放
    this.setData({
      stopPlay: true
    })
  },
  getActivityData() { //修改活动信息前，获取活动信息
    $common.request(
      'POST',
      $common.config.GetActivitiesInfo, {
        ActivityID: this.data.ActivityID
      },
      (res) => {
        if (res.data.res) {
          let options = res.data.Data;
          let themeInfoData = {
            text: options.ActivityInfoText,
            images: options.ActivityInfoImg,
            audio: options.ActivityInfoVoice,
            video: options.ActivityInfoVideo
          }
          this.setData({
            activeName: options.ActivityName,
            headImage: {
              url: options.ActivityHeadImage,
              isRevise: true
            },
            clockInType: +options.ActivityType - 1,
            themeInfoData,
          });
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
  onLoad: function (options) {
    if (options.ActivityID) { //修改
      this.data.ActivityID = +options.ActivityID;
      this.setData({
        pageStatus: true
      })
      this.getActivityData();
    }
  },
  onReady: function () {

  },

  isEnEvent() {
    let isEn = wx.getStorageSync('isEn');
    let pageStatus = this.data.pageStatus;
    let title = isEn ? pageStatus ? 'modify Activity' : 'New Clock in Activity' : pageStatus ? '修改打卡活动' : '新建打卡活动';
    wx.setNavigationBarTitle({
      title
    });
    this.setData({
      isEn
    })
  },
  onShow: function () {
    this.isEnEvent();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.stopPlay();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.stopPlay();
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