const $common = require('../../../utils/common.js');
const app = getApp();
Page({
  data: {
    srcClockInImage: $common.srcClockInImage,
    srcClockInVideo: $common.srcClockInVideo,
    srcClockInAudio: $common.srcClockInAudio,
    ThemeId: -1, //主题id
    ActivityID: -1, //活动id
    info: {
      text: '',
      images: [],
      audio: '',
      video: '',
    },
    isDetail: false, //显示详情
    isFixed: false,
    flag: true,
  },
  longpress(e) { //复制文本
    let data = decodeURIComponent(this.data.themeInfo.infoArr[e.currentTarget.dataset.index].text);
    wx.setClipboardData({ data });
  },
  getThemeInfoH(callback) { //获取详情区域的高度
    let phoneH = this.data.phoneH; //手机可用区域的高度
    wx.createSelectorQuery().select('#theme-info').boundingClientRect((res) => { //获取初始的高度
      let lastH = res.height;
      callback();
      let timer = setInterval(() => { //实时监听获取高度
        wx.createSelectorQuery().select('#theme-info').boundingClientRect((res) => {
          let nowH = res.height;
          if (nowH > lastH) { //高度变了，渲染完成了？
            clearInterval(timer);
            this.setData({
              isFixed: nowH >= phoneH ? true : false
            });
            this.getThemeInfoH = function (callback) {
              callback();
            }
          }
        }).exec();
      }, 100);
    }).exec();
  },
  changeDetail() { //切换显示详情
    this.getThemeInfoH(() => {
      this.setData({
        isDetail: !this.data.isDetail
      })
    });
  },
  checkImage(e) { //点击看大图
    let index = e.currentTarget.dataset.index;
    let indexs = e.currentTarget.dataset.indexs;
    let infoArr = this.data.themeInfo.infoArr;
    let current = infoArr[index].images[indexs];
    let urls = [];
    for (let i = 0, len = infoArr.length; i < len; i++) {
      for(let j = 0, l = infoArr[i].images.length; j < l; j++){
        urls.push(`${this.data.srcClockInImage}${infoArr[i].images[j]}`);
      }
    }
    wx.previewImage({
      current, // 当前显示图片的http链接
      urls // 需要预览的图片http链接列表
    })
  },
  getThemeDetail() { //获取主题的详情
    $common.request(
      'POST',
      $common.config.GetThemeInfo, {
        ThemeId: this.data.ThemeId
      },
      (res) => {
        if (res.data.res) {
          let themeInfo = res.data.Data;
          // themeInfo.themeImages = themeInfo.ThemeInfoImg.split('|');
          // if (!themeInfo.themeImages[0]) themeInfo.themeImages = [];
          if (themeInfo.ThemeDate) { //每日打卡
            let d = $common.timeStamp(themeInfo.ThemeDate);
            themeInfo.showTime = `${d.y}-${d.m}-${d.d}`;
          }
          let text = JSON.parse(themeInfo.ThemeInfoText);
          let images = themeInfo.ThemeInfoImg.split(',');
          let audio = themeInfo.ThemeInfoVoice.split(',');
          let video = themeInfo.ThemeInfoVideo.split(',');
          let infoArr = [];
          for (let i = 0; i < 3; i++) {
            infoArr.push({
              text: text[i],
              images: images[i] && images[i].split('|')[0] ? images[i].split('|') : [],
              audio: audio[i],
              video: video[i],
            })
          }
          themeInfo.infoArr = infoArr;
          this.setData({
            themeInfo,
            phoneH: wx.getSystemInfoSync().windowHeight
          })
        }
      },
      (res) => { },
      (res) => { }
    )
  },
  syncData(e) {
    this.data.info = e.detail;
  },
  cancel() { //取消
    wx.navigateBack({
      delta: 1
    });
  },
  userInfo(res) {
    let userInfo = res.detail.userInfo;
    if (!userInfo) return;
    $common.getUserInfo(userInfo, this.publish.bind(this));
  },
  publish() { //发表日记
    if (app.clockInStatus) return; //已经打卡成功了
    if (!this.data.flag) return;
    this.data.flag = false;
    let isEn = wx.getStorageSync('isEn');
    let info = this.data.info;
    if (info.text[0] || info.images[0] || info.audio[0] || info.video[0]) {

    } else {
      if (isEn) {
        $common.showModal('Tell us about your gains and thinks today.', false, false, 'OK', 'Prompt');
      } else {
        $common.showModal('说说今天的感想和收获吧');
      }
      this.data.flag = true;
      return;
    }
    // if (info.text.trim().length > 0 || info.images.length > 0 || info.audio || info.video) {

    // } else {
    //   if (isEn) {
    //     $common.showModal('Tell us about your gains and thinks today.', false, false, 'OK', 'Prompt');
    //   } else {
    //     $common.showModal('说说今天的感想和收获吧');
    //   }
    //   return;
    // }
    $common.loading();
    $common.request(
      'POST',
      $common.config.InsertJournal, {
        openId: wx.getStorageSync('openid'),
        SmallCardActiviID: this.data.ActivityID,
        SmallCardThemeID: this.data.ThemeId,
        JournalInfoText: info.text[0],
        JournalInfoImg: info.images[0],
        JournalInfoVoice: info.audio[0],
        JournalInfoVideo: info.video[0],
      },
      (res) => {
        if (res.data.res) {
          app.clockInStatus = true;
          this.setData({
            scoreType: 4,
            scoreNum: +res.data.Integral
          })
        } else {
          if (res.data.errType === 4) {
            if (isEn) {
              $common.showModal('You have no jurisdiction.', false, false, 'OK', 'Prompt');
            } else {
              $common.showModal('你被限制发表日记');
            }
          } else {
            if (isEn) {
              $common.showModal('Published failure.', false, false, 'OK', 'Prompt');
            } else {
              $common.showModal('发表失败');
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
        $common.hide();
      }
    )
  },
  showScoreCallback() {
    this.cancel();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.ThemeId = +options.ThemeId;
    this.data.ActivityID = +options.ActivityID;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getThemeDetail();
  },

  isEnEvent() {
    let isEn = wx.getStorageSync('isEn');
    let title = isEn ? 'Post' : '发表日记';
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

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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
    return $common.share('FirstTutor', 
    `/pages/clockIn/details/details?ActivityID=${this.data.ActivityID}&isAdministrator=0`)
  }
})