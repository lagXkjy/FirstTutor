/**
 * 需求查看
 */
const $common = require('../../../utils/common.js');
const $static = require('../../../utils/static.js');
const $translate = require('../../../utils/translate.js');
Page({
  data: {
    addressData: $static.areaShanghaiEn,
    nedId: -1,
    lnd: {},
  },
  onlineChart() { //立即沟通
    let userId = this.data.lnd.UserId;
    wx.navigateTo({
      url: `/pages/New/onlineChart/index?userId=${userId}`,
    })
  },
  complateAddress(res) { //区域
    let addressData = this.data.addressData;
    let data;
    for (let i = 0, len = addressData.length; i < len; i++) {
      if (addressData[i].id === res) {
        data = addressData[i].area;
        break;
      }
    }
    return data;
  },
  init() {
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      $common.getOpenid(this.init.bind(this));
      return;
    }
    wx.showLoading({
      title: 'Loading...'
    });
    $common.request(
      'POST',
      $common.config.GetMyLearnNeedInfo, {
        nedId: this.data.nedId,
        teaOpenId: wx.getStorageSync('openid')
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.lnd;
          data.time = $translate.translateTimeEn(data.NedClaTime);
          data.week = $translate.translateWeekEn(data.NedCorAfw);
          data.address = this.complateAddress(data.NedClaArea); //要兼容之前发布的需求，这玩意还不能删
          if (data.NedAreaSelect.AsCanId > 0) { //改版后的
            $common.request(
              'POST',
              $common.config.GetAreaInfos, {
                canId: data.NedAreaSelect.AsCanId
              },
              (res) => {
                let area = res.data.data;
                let location = {};
                for (let i = 0, len = area.length; i < len; i++) {
                  if (area[i].AiId === data.NedAreaSelect.AsAiId) {
                    location = area[i];
                  }
                }
                // 翻译一下
                $common.translate(location.AiName, (res) => {
                  let trans_result = res.data.trans_result;
                  if (trans_result && trans_result.length > 0) { //翻译成功了
                    trans_result[0] && trans_result[0].dst && (data.address = trans_result[0].dst);
                  } else { //没有返回东西，报错了,显示原文
                  }
                  this.setData({
                    lnd: data
                  })
                });
              }
            )
          } else {
            this.setData({
              lnd: data
            })
          }
        } else {
          $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
        }
      },
      (res) => {
        $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
      },
      (res) => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      }
    )
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.data.nedId = options.nedId;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.init();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    //只有外教可查看
    if(!wx.getStorageSync('isEn')) return wx.switchTab({ url: '/pages/Home/Home/index' })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.init();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return $common.share('FirstTutor', `/pages/New/seeDetail/index?nedId=${this.data.nedId}`)
  }
})