const $common = require('../../../utils/common.js');
Page({
  data: {
    phone: '',
  },
  input(e) {
    this.data.phone = e.detail.value;
  },
  submit() {
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      $common.getOpenid(this.submit.bind(this));
    }
    let phone = this.data.phone;
    console.log(phone);
    if (!$common.phoneReg.test(phone)) {
      $common.showModal('请填写正确的手机号');
      return;
    }
    $common.request(
      'POST',
      $common.config.PutStuPhoneNum,
      {
        openId: wx.getStorageSync('openid'),
        phone: phone
      },
      (res) => {
        if (res.data.res) {
          $common.showModal('绑定成功');
        } else {
          $common.showModal('未知错误');
        }
      },
      (res) => {
        $common.showModal('未知错误');
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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