//订单详情，外教
const $common = require('../../../utils/common.js');
const translate = require('../../../utils/translate.js');
Page({
  data: {
    cogId: -1,
    MemList: [],
    cog: {},
    course: {}
  },
  onlineChart(e) { //立即沟通
    let index = e.currentTarget.dataset.index;
    let userId = this.data.MemList[index].UserId;
    wx.navigateTo({
      url: `/pages/New/onlineChart/index?userId=${userId}`,
    })
  },
  callPhone(e) { //打电话
    let phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  lookAddress() { //查看地图
    let address = this.data.teaAddress;
    $common.getAddress(address);
  },
  timeStamp(time) { //时间戳转换为日期
    time = time.replace("/Date(", '').replace(')/', '');
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
    return `${y}-${m}-${d} ${h}:${f}`;
  },
  init() {
    wx.showLoading({ title: 'Loading...' });
    $common.request(
      'POST',
      $common.config.GetTeaOrderInfoList,
      {
        cogId: this.data.cogId
      },
      (res) => {
        if (res.data.res) {
          let MemList = res.data.MemList,
            cog = res.data.cog,
            course = res.data.course;
          switch (course.CorLenOfCla) {
            case 1:
              course.courseTimeLong = 1;
              break;
            case 2:
              course.courseTimeLong = 1.5;
              break;
            case 3:
              course.courseTimeLong = 2;
              break;
          }
          let memData = [];
          for (let i = 0, len = MemList.length; i < len; i++) {
            MemList[i].orderCreatTime = this.timeStamp(MemList[i].OdrCreateOn);
            MemList[i].orderBuyTime = this.timeStamp(MemList[i].OdrBuyDate);
            if (MemList[i].OdrIsHead) {
              memData.unshift(MemList[i]);
            } else {
              memData.push(MemList[i]);
            }
          }
          cog.courseStartTime = this.timeStamp(cog.FgtOpenTime);
          cog.courseEndTime = this.timeStamp(cog.FgtEndTime);
          let timeArr = memData[0].TimStr;
          if(course.CorIsVipCourses === 1){ //vip课程
            memData[0].timeStr = `${timeArr[2]}/${translate.translateTimeEn(timeArr[1])}`;
          }else{
            memData[0].timeStr = `${translate.translateWeekEn(timeArr[0])}/${translate.translateTimeEn(timeArr[1])}`;
          }
         
          this.setData({
            MemList: memData,
            cog: cog,
            course: course
          })
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
  onLoad: function (options) {
    let cogId = options.cogId ? options.cogId : -1;
    this.setData({
      cogId: cogId
    })
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