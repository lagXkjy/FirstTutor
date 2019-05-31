// pages/Home/SpellingRules/index.js
const $common = require('../../../utils/common.js')
Page({
  data: {
    pagesData: [],
  },
  getPagesData() {
    let arr = [{
      title: '一、拼团有效期：',
      context: ['拼团有效期是自开团之时起72小时内。']
    }, {
      title: '二、拼团成功：',
      context: ['拼团有效期内，支付用户达到参团人数，则拼团成功。']
    }, {
      title: '三、拼团失败：',
      context: [
        '拼团有效期后，未达成响应参团人数，则拼团失败。',
        '拼团失败的订单，系统会在1-7个工作日内处理退款，系统处理后1-10个工作日内原路退回至原支付账户中。']
    }, {
      title: '四、等待成团中如何退款？',
      context: ['拼团有效期内, 无法退款，拼团有效期过后，若未达到规定的参团人数，则拼团失败，系统会自动退款。']
    }];
    let arrEn = [{
      title: '1.Group Buying Period of Validity',
      context: ['Period of validity means 72 hours starts from the beginning of group buying.']
    }, {
      title: '2.Group Buying Effective',
      context: ['During the group buying period of validity, the number of customers who pay for the group buying reaches the required number of the group, the group buying is effective.']
    }, {
      title: '3.Group buying Fail',
      context: [
        'After the group buying period of validity, the number of customers who pay for the group buying has not reached the required number of the group, the group buying fails.',
        'For that group buying order, the system will handle the refund in 1-7 work days. The money will be paid back in 1-10 work days to the previous account.']
    }, {
      title: '4.How to get refund during the group buying',
      context: ['During the group buying period of validity, any refund can’t be processed. After the group buying period of validity, the number of customers who pay for the group buying has not reached the required number of the group, the system will handle the refund automatically.']
    }];
    this.setData({
      pagesData: this.data.isEn ? arrEn : arr
    })
  },

  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  isEnEvent(res) { //判断当前显示中英文
    let isEn = wx.getStorageSync('isEn');
    this.setData({
      isEn: isEn
    });
    let text = isEn ? "Group Buying Rules" : "拼团规则";
    wx.setNavigationBarTitle({
      title: text
    })
    this.getPagesData();
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