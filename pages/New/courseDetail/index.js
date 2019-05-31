// pages/Home/CourseInformation/index.js
const $common = require('../../../utils/common.js');
Page({
  data: {
    srcForIdPhoto: $common.srcForIdPhoto,
    courId: null, //课程id
    teaId: null, //教师id
    listenCallbackNum: 0,
    tea: {}, //教师信息列表
    course: {}, //课程信息
    timeTables: [], //选择上课时间列表
    weekList: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    timeList: [], // 页面展示上课时间表 
    IsVip: 0, //是否为超级VIP
  },
  goHome() { //返回首页
    wx.switchTab({
      url: '../../Home/Home/index',
    })
  },
  getCourseAndTeacherInfo() { //获取课程和教师信息
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      $common.getOpenid(this.getCourseAndTeacherInfo.bind(this));
      return;
    }
    $common.request(
      "POST",
      $common.config.GetCourseInfo,
      {
        courId: this.data.courId,
        teaId: this.data.teaId,
        openId: wx.getStorageSync('openid')
      },
      (res) => {
        if (res.data.res) {
          let course = res.data.course;
          course.paymentPrice = 0; //单人购买需支付的价格
          course.paymentPriceS = 0; //拼团购买需支付的价格
          switch (course.CorLenOfCla) {
            case 1:
              course.courseTimeLong = 1; //1小时
              break;
            case 2:
              course.courseTimeLong = 1.5; //1.5小时
              break;
            case 3:
              course.courseTimeLong = 2; //2小时
              break;
          }
          course.CorPrice = course.CorPrice.toFixed(2) > 0.01 ? course.CorPrice.toFixed(2) : 0.01;
          let tea = res.data.tea;
          tea.TeaName = tea.TeaNickName;
          this.setData({
            course: course,
            tea: tea
          })
        } else {
          switch (res.data.errType) {
            case 1:
              //未知错误
              break;
            case 2:
              //课程不存在
              break;
          }
        }
      },
      (res) => {
        // $common.showModal('亲~网络不给力哦，请稍后重试');
      },
      (res) => {
        this.addListenCallbackNum();
        this.stopModal();
      }
    );
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
  getCourTime() { //根据课程ID获取课程的上课时间
    $common.request(
      "POST",
      $common.config.GetTimeTableInfos,
      {
        courId: this.data.courId,
        teaId: this.data.teaId
      },
      (res) => {
        if (res.data.res) {
          this.setData({
            timeTables: res.data.timeTables
          });
        } else {
          switch (res.data.errType) {
            case 1:
              //未知错误
              break;
            case 2:
              //未设置课程时间
              break;
          }
        }
      },
      (res) => {
        // $common.showModal('亲~网络不给力哦，请稍后重试');
      },
      (res) => {
        this.addListenCallbackNum();
        this.stopModal();
      }
    );
  },
  addListenCallbackNum() {
    let num = parseInt(this.data.listenCallbackNum);
    num++;
    this.setData({
      listenCallbackNum: num
    })
  },
  stopModal() { //停止页面的各种加载状态
    let num = parseInt(this.data.listenCallbackNum);
    if (num >= 2) { //本页面有两个接口
      wx.hideLoading();
      wx.stopPullDownRefresh();
      this.setData({
        listenCallbackNum: 0
      })
    }
  },
  init() {
    wx.showLoading({ title: 'Loading...' });
    this.getCourseAndTeacherInfo();
    this.getCourTime();
    this.setData({ isEn: wx.getStorageSync('isEn') })
  },
  onLoad: function (options) {
    let { CorId, teaId, CorCreateOn, IsVip } = options
    this.data.courId = CorId
    this.data.teaId = teaId
    this.setData({ CorCreateOn, IsVip: +IsVip })
    this.init();
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
    return $common.share()
  }
})