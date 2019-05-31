/**
 * 活动详情
 */
const $common = require('../../../utils/common.js');
const WxParse = require('../../../wxParse/wxParse.js'); //字符串转换为微信页面
Page({
  data: {
    status: 0, //1 活动已结束 0 活动未结束
    isSign: 0, // 1 立即报名活动 0 我的活动查看
    srcActivity: $common.srcActivity,
    srcActivityVideo: $common.srcActivityVideo,
    atyId: -1, //活动id
    atyInfo: {}, //页面信息
    atyImgs: [], //轮播图
    alreadySignUp: 0, //是否已经报名 0 否，大于0 是
  },
  openLoc() { //查看地址所在位置
    let address = this.data.atyInfo.AtyAddress;
    $common.getAddress(address);
  },
  activitySign() {
    let alreadySignUp = this.data.alreadySignUp;
    if (alreadySignUp > 0) return;
    let AtyPrice = this.data.atyInfo.AtyPrice;
    wx.navigateTo({
      url: `/pages/Home/activitySign/index?atyId=${this.data.atyId}&price=${AtyPrice}`,
    })
  },
  timeStamp(time) { //时间戳转换为日期
    let date = new Date(parseInt(time)),
      y = date.getFullYear(),
      m = date.getMonth() + 1,
      d = date.getDate(),
      h = date.getHours(),
      f = date.getMinutes();
    m < 10 && (m = '0' + m);
    d < 10 && (d = '0' + d);
    h < 10 && (h = '0' + h);
    f < 10 && (f = '0' + f);
    return `${m}-${d} ${h}:${f}`;
  },
  judgeOld(time) { //判断活动是否过期
    let Sstr1 = time.replace("/Date(", ''),
      Stime = Sstr1.replace(')/', '');
    let timestamp = Date.parse(new Date());
    let status = Stime - timestamp > 0 ? 0 : 1;
    return status;
  },
  init() {
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      $common.getOpenid(this.init.bind(this));
      return;
    }
    let isEn = wx.getStorageSync('isEn');
    let text = isEn ? 'Loading...' : '努力加载中...';
    wx.showLoading({ title: text });
    $common.request(
      'POST',
      $common.config.GetAtyDesInfo,
      {
        atyId: this.data.atyId,
        openId: wx.getStorageSync('openid')
      },
      (res) => {
        if (res.data.res) {
          let atyInfo = res.data.atyInfo;
          let Sstr = atyInfo.AtyStartTime,
            Sstr1 = Sstr.replace("/Date(", ''),
            Stime = Sstr1.replace(')/', '');
          atyInfo.startTime = this.timeStamp(Stime);
          let Estr = atyInfo.AtyEndTime,
            Estr1 = Estr.replace("/Date(", ''),
            Etime = Estr1.replace(')/', '');
          atyInfo.endTime = this.timeStamp(Etime);
          WxParse.wxParse('article', 'html', atyInfo.AtyDescript, this, 5);
          let status = this.judgeOld(atyInfo.AtyEndTime);
          this.setData({
            atyInfo: atyInfo,
            atyImgs: res.data.atyImgs,
            status: status,
            alreadySignUp: res.data.alreadySignUp
          })
        } else {
          if (isEn) {
            $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
          } else {
            $common.showModal('未知错误');
          }
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
  onLoad: function (options) {
    let atyId;
    if (options.atyId) {
      atyId = options.atyId;
    }
    this.setData({
      isSign: parseInt(options.isSign),
      atyId: atyId
    })
    this.init();
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
    let text = isEn ? "Activity Details" : "活动详情";
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
    this.init();
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
    return $common.share('FirstTutor', `/pages/New/activityDetail/index?atyId=${this.data.atyId}&isSign=${this.data.isSign}`)
  }
})