const $common = require('../../../utils/common.js');
const app = getApp();
Page({
  data: {
    listData: [],
    isRegister: true, //由分享页面进来的，先判断是否注册过 
  },
  deleteDiary(e) { //删除日记
    let index = e.currentTarget.dataset.index;
    let listData = this.data.listData;
    listData.splice(index, 1);
    this.setData({
      listData
    });
  },
  init() {
    let isEn = wx.getStorageSync('isEn');
    $common.loading();
    $common.request(
      'POST',
      $common.config.GetSmallCardJournalInfo, {
        JournalID: this.data.JournalID,
        openId: wx.getStorageSync('openid')
      },
      (res) => {
        if (res.data.res) {
          this.setData({
            listData: res.data.Data.ThemeJournal
          })
        } else {
          if (isEn) {
            $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
          } else {
            $common.showModal('未知错误');
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
        $common.hide();
      }
    )
  },
  checkIsRegister(callback = () => { }) { //查看学生是否注册过
    let isEn = wx.getStorageSync('isEn');
    if (isEn) {
      callback();
    } else {
      $common.request(
        'POST',
        $common.config.GetStuRegis, {
          openId: wx.getStorageSync('openid')
        },
        (res) => {
          if (res.data.res) {
            let register = +res.data.regis;
            if (register === 0) { //未注册，去注册页注册
              let data = this.data;
              let url = `/pages/clockIn/themeDetails/themeDetails`;
              wx.redirectTo({  //带上详情页需要的参数，从那边直接跳过去
                url: `/pages/me/stuRegister/stuRegister?jumpUrl=${url}&jumpId=${data.JournalID}&jumpType=2`
              })
            } else { //已注册
              callback();
            }
          } else {
            $common.showModal('未知错误，请稍后重试');
          }
        },
        (res) => {
          $common.showModal('网络不给力，请稍后重试');
        },
        (res) => { }
      )
    }
  },
  onLoad: function (options) {
    this.data.once = true;
    this.data.JournalID = +options.JournalID;
    if (app.scene === 1007 || app.scene === 1008) {
      this.data.isRegister = false;
      $common.getOpenid($common.studentRegister.bind(this, this.checkIsRegister.bind(this, () => {
        this.data.isRegister = true;
        this.isEnEvent();
      })));
    } else {
      this.isEnEvent();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  isEnEvent() {
    let isEn = wx.getStorageSync('isEn');
    let title = isEn ? 'Diary of Clock in' : '打卡日记';
    wx.setNavigationBarTitle({
      title
    });
    this.setData({
      isEn
    });
    $common.getOpenid(this.init.bind(this));
  },

  onShow() {
    if (!this.data.isRegister) return;
    if (this.data.once) {
      this.data.once = false;
      return;
    }
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.init();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    this.data.pageStatus = 2;
    if (res.from === 'button') { // 来自页面内转发按钮
      return $common.share(
        'FirstTutor', `/pages/clockIn/thisRecord/thisRecord?JournalID=${res.target.dataset.journalid}`, '',
        () => {
          $common.request('POST',
            $common.config.InsertShare, {
              openid: wx.getStorageSync('openid'),
              ActivityID: this.data.ActivityID || 0,
              ThemeID: res.target.dataset.ThemeId,
              JournalID: res.target.dataset.journalid || 0
            },
            (res) => { if (res.data.res) this.setData({ scoreType: 3, scoreNum: +res.data.Integral }) }
          )
        }
      )
    } else {
      return $common.share()
    }
  }
})