// pages/login/login.js
const $common = require('../../utils/common.js');
Page({
  data: {
    options: null,
  },
  toURL() {
    let { options } = this.data
    let url = '/pages/Home/Home/index'
    if (options.loginTo) { //是分享出去的页面，需要跳转至指定页面
      let obj = JSON.parse(options.loginData)
      let data = ''
      for (let k in obj) data += `${k}=${obj[k]}&`
      url = `${options.loginTo}?${data}`
    }
    wx.reLaunch({ url })
  },
  getUserInfo(e) {
    let userInfo = e.detail.userInfo
    if (!userInfo) return
    $common.getOpenid(() => {
      $common.getUserInfo(userInfo, () => {
        $common.studentRegister(() => {
          wx.setStorageSync('isgetInfo', true) //获取过openid，获取过头像，注册过,一条龙
          this.toURL()
        })
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.options = options
    if (wx.getStorageSync('isgetInfo')) return this.toURL()
    $common.getOpenid()
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