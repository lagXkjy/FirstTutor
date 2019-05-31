/**
 * 意见反馈
 */
const $common = require('../../../utils/common.js');
Page({
  data: {
    input: '',
    userName: '',
    phone: '',
    btnFalg: true,
  },
  bindUserName(e) { //姓名
    this.data.userName = e.detail.value;
  },
  bindPhone(e) { //电话
    this.data.phone = e.detail.value;
  },
  bindInput(e) {
    this.data.input = e.detail.value;
  },
  submit() {
    if (!this.data.btnFalg) return;
    this.data.btnFalg = false;
    let input = this.data.input,
      userName = this.data.userName,
      phone = this.data.phone;
    let isEn = wx.getStorageSync('isEn');
    if (userName.trim().length <= 0) {
      if (isEn) {
        $common.showModal('Please fill in your name', false, false, 'Ok', 'Reminder');
      } else {
        $common.showModal('请填写您的姓名');
      }
      this.data.btnFalg = true;
      return;
    }
    if (!$common.phoneReg.test(phone)) {
      if (isEn) {
        $common.showModal('Please fill in the correct phone number', false, false, 'Ok', 'Reminder');
      } else {
        $common.showModal('请填写正确的手机号');
      }
      this.data.btnFalg = true;
      return;
    }
    if (input.trim().length <= 0) {
      if (isEn) {
        $common.showModal('Please fill in the comments', false, false, 'Ok', 'Reminder');
      } else {
        $common.showModal('请填写您的反馈意见');
      }
      this.data.btnFalg = true;
      return;
    }
    $common.request(
      'POST',
      $common.config.PublishFeedBack,
      {
        fbkC: {
          FbkPhone: phone,
          FbkCon: input,
          FbkName: userName
        },
        openId: wx.getStorageSync('openid')
      },
      (res) => {
        if (res.data.res) {
          wx.showToast({
            title: 'success',
            icon: 'success',
          })
          setTimeout(() => {
            this.data.btnFalg = true;
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
        } else {
          this.data.btnFalg = true;
          //1 参数不正确 2 未知错误
          if (isEn) {
            $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
          } else {
            $common.showModal('未知错误');
          }
        }
      },
      (res) => {
        this.data.btnFalg = true;
      },
      (res) => {
      }
    )
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  isEnEvent() {
    let isEn = wx.getStorageSync('isEn');
    this.setData({
      isEn: isEn
    })
    let text = isEn ? "Feedback" : "意见反馈";
    wx.setNavigationBarTitle({
      title: text
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
    return $common.share()
  }
})