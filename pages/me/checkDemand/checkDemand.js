const $common = require('../../../utils/common.js');
Page({
  data: {
    timeList: ['上午', '下午1', '下午2', '晚上'],
    weekList: ['一', '二', '三', '四', '五', '六', '日'],
  },
  getAreaList(id) { //获取该城市的所有区
    $common.request(
      'POST',
      $common.config.GetAreaInfos, {
        canId: id
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.data;
          let NedAreaSelect = this.data.lnd.NedAreaSelect;
          let AsAiId = NedAreaSelect.AsAiId;
          for (let i = 0, len = data.length; i < len; i++) {
            if (AsAiId === data[i].AiId) {
              NedAreaSelect.area = data[i].AiName;
              this.setData({
                "lnd.NedAreaSelect": NedAreaSelect
              })
              return;
            }
          }
        } else {}
      },
      (res) => {},
      (res) => {}
    )
  },
  getCityInfo() { //获取城市信息
    $common.request(
      'POST',
      $common.config.GetCityInfos,
      null,
      (res) => {
        if (res.data.res) {
          let data = res.data.data;
          let NedAreaSelect = this.data.lnd.NedAreaSelect;
          let AsCanId = NedAreaSelect.AsCanId;
          let AsAiId = NedAreaSelect.AsAiId;
          for (let i = 0, len = data.length; i < len; i++) {
            if (data[i].CanId === AsCanId) {
              NedAreaSelect.city = data[i].CanCityName;
              break;
            }
          }
          this.setData({
            "lnd.NedAreaSelect": NedAreaSelect
          })
          this.getAreaList(AsCanId);
        } else {}
      },
      (res) => {},
      (res) => {}
    )
  },
  init() {
    wx.showLoading({
      title: '努力加载中...'
    });
    $common.request(
      'POST',
      $common.config.GetMyLearnNeedInfo, {
        nedId: this.data.nedId
      },
      (res) => {
        if (res.data.res) {
          let lnd = res.data.lnd;
          let stuInfo = res.data.stuInfo;
          this.setData({
            lnd: lnd,
            stuInfo: stuInfo
          });
          this.getCityInfo();
        } else {
          switch (res.data.errType) {
            case 1:
              $common.showModal('参数不正确');
              break;
            case 1:
              $common.showModal('未知错误');
              break;
          }
        }
      },
      (res) => {

      },
      (res) => {
        wx.hideLoading();

      }
    )
  },
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
    wx.stopPullDownRefresh();
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
    return $common.share()
  }
})