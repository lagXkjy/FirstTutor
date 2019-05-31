const $common = require('../../../utils/common.js');
Page({
  data: {
    isEn: false, //显示中英文
    srcForIdPhoto: $common.srcForIdPhoto,
    srcActivity: $common.srcActivity,
    srcBanner: $common.srcBanner,
    banList: [],
    activity: {},
    pageIndex: 1, // 第几页
    pageSize: 10, // 本页面默认给十条
    listData: [],
    isOver: false,
  },
  jumpPath(e) { //banner跳转链接
    let index = e.currentTarget.dataset.index;
    let path = this.data.banList[index].BanGoToPath;
    if (path.indexOf('https') !== -1) { //跳转到公众号文章
      wx.navigateTo({
        url: `/pages/static/webView/webView?path=${path}`,
      });
      return;
    }
    let tabBar = ['/pages/Home/foreignTeacher/index', '/pages/Home/foreignTeacher/index', '/pages/Home/activity/index', '/pages/New/index/index']; //tabBar链接
    if (path) {
      let ispath = false;
      for (let i = 0, len = tabBar.length; i < len; i++) {
        if (tabBar[i].indexOf(path) !== -1) { //需要跳转到tab页
          ispath = true;
          break;
        }
      }
      if (ispath) {
        wx.switchTab({
          url: path,
        })
      } else {
        wx.navigateTo({
          url: path,
        })
      }
    }
  },
  getBannerData() { //获取轮播图数据
    $common.request(
      "POST",
      $common.config.GetBannerImgs,
      null,
      (res) => {
        if (res.data.res) {
          let banList = res.data.banList;
          this.setData({
            banList: banList
          })
          banList = null;
        } else { }
      },
      (res) => { },
      (res) => {
        this.getActivity();
      }
    );
  },
  getActivity() { //获取最新活动
    $common.request(
      "POST",
      $common.config.GetLastestAtyInfo,
      null,
      (res) => {
        if (res.data.res) {
          this.setData({
            activity: res.data.activity
          })
        } else { }
      },
      (res) => { },
      (res) => {
        this.getListData();
      }
    );
  },
  getListData() { //推荐外教
    let pageIndex = this.data.pageIndex,
      pageSize = this.data.pageSize;
    $common.request(
      "POST",
      $common.config.GetRecomForTeas, {
        pageIndex: pageIndex,
        pageSize: pageSize
      },
      (res) => {
        if (res.data.res) {
          let teaList = res.data.teaList;
          this.setData({
            listData: teaList,
            isOver: true
          });
        } else { }
      },
      (res) => { },
      (res) => {
        wx.hideLoading();
      }
    );
  },
  teacherInfo(e) { //跳转外教信息
    let index = e.currentTarget.dataset.index,
      listData = this.data.listData;
    wx.navigateTo({
      url: '../teachersInformation/index?data=' + listData[index].TeaId,
    });
    index = null;
    listData = null;
  },
  activityDetail() { //跳转到活动详情
    let AtyId = this.data.activity.AtyId;
    if (!AtyId) return;
    wx.navigateTo({
      url: '../../New/activityDetail/index?isSign=1&atyId=' + AtyId,
    });
    AtyId = null;
  },
  init() { //进入页面初始化
    let isEn = wx.getStorageSync('isEn');
    let text = "";
    if (isEn) {
      text = 'Loading...';
    } else {
      text = '努力加载中...';
    }
    wx.showLoading({
      title: text
    });
    isEn = null;
    text = null;
    this.getBannerData();
  },
  onLoad(options) { },
  onReady() {
    this.init();
    $common.getOpenid($common.studentRegister); //获取openid并注册
  },
  isEnEvent(res) { //判断当前显示中英文
    this.setData({
      isEn: wx.getStorageSync('isEn')
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
    this.init();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function (res) { },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return $common.share()
  }
})