const $common = require('../../../utils/common.js');
Page({
  data: {
    info: null,
    ActivityID: -1,
    yesData: null, //昨日概况,
    startTime: '',
    endTime: '',
    timeData: null, //数据详情
  },
  deleteEvent() { //删除活动事件
    let isEn = wx.getStorageSync('isEn');
    if (isEn) {
      $common.showModal('Confirm the deletion?', true, (res) => {
        if (res.confirm) {
          this.delete();
        }
      }, 'OK', 'Reminder', 'NO')
    } else {
      $common.showModal('确认删除？', true, (res) => {
        if (res.confirm) {
          this.delete();
        }
      })
    }
  },
  delete() { //删除活动
    let isEn = wx.getStorageSync('isEn');
    $common.loading();
    $common.request(
      'POST',
      $common.config.GetDeleteActivity,
      {
        ActivityID: this.data.ActivityID
      },
      (res) => {
        if (res.data.res) {
          wx.navigateBack({
            delta: 2
          })
        } else {
          if (isEn) {
            $common.showModal('Delete failure', false, false, 'OK', 'Prompt');
          } else {
            $common.showModal('删除失败');
          }
        }
      },
      (res) => {
        if (isEn) {
          $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
        } else {
          $common.showModal('亲~网络不给力哦，请稍后重试');
        }
      },
      (res) => {
        $common.hide();
      }
    )
  },
  toCreateNew() { //编辑活动
    wx.navigateTo({
      url: `/pages/clockIn/createNew/createNew?ActivityID=${this.data.ActivityID}`,
    })
  },
  toMemberManage() { //点击成员管理
    wx.navigateTo({
      url: `/pages/clockIn/memberManage/memberManage?ActivityID=${this.data.ActivityID}`,
    })
  },
  changeStart(e) { //开始时间切换
    this.setData({
      startTime: e.detail.value
    })
    this.getTimeData();
  },
  changeEnd(e) { //结束时间
    this.setData({
      endTime: e.detail.value
    })
    this.getTimeData();
  },
  setTime() { //设置最迟时间
    let date = new Date();
    let mD = $common.timeStamp('' + date.getTime());
    date.setDate(date.getDate() - 1);
    let nD = $common.timeStamp('' + date.getTime());
    let d = new Date();
    d.setDate(date.getDate() - 366);
    let b = $common.timeStamp('' + d.getTime());
    this.setData({
      binTime: `${b.y}-${b.m}-${b.d}`,
      minTime: `${nD.y}-${nD.m}-${nD.d}`,
      startTime: `${nD.y}-${nD.m}-${nD.d}`,
      maxTime: `${mD.y}-${mD.m}-${mD.d}`,
      endTime: `${mD.y}-${mD.m}-${mD.d}`,
    })
  },
  getYesterDayData() { //获取昨日概况数据
    let isEn = wx.getStorageSync('isEn');
    $common.loading();
    $common.request(
      'POST',
      $common.config.GetYesterDayStatistics, {
        ActivityID: this.data.ActivityID
      },
      (res) => {
        if (res.data.res) {
          let yesData = res.data.Data.Satistics;
          let dd = new Date();
          dd.setDate(dd.getDate() - 1);
          let date = $common.timeStamp('' + dd.getTime());
          yesData.showTime = `${date.y}-${date.m}-${date.d}`;
          this.setData({
            yesData
          })
        } else {
          if (isEn) {
            $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
          } else {
            $common.showModal('未知错误');
          }
        }
      },
      (res) => {
        if (isEn) {
          $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
        } else {
          $common.showModal('亲~网络不给力哦，请稍后重试');
        }
      },
      (res) => {
        $common.hide();
      }
    )
  },
  getTimeData() { //根据时间获取数据
    let isEn = wx.getStorageSync('isEn');
    $common.loading();
    $common.request(
      'POST',
      $common.config.GetSmallCardStatistics, {
        ActivityID: this.data.ActivityID,
        StartTime: this.data.startTime,
        EndTime: this.data.endTime
      },
      (res) => {
        if (res.data.res) {
          let timeData = res.data.Data;
          this.setData({
            timeData
          })
        } else {
          if (isEn) {
            $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
          } else {
            $common.showModal('未知错误');
          }
        }
      },
      (res) => {
        if (isEn) {
          $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
        } else {
          $common.showModal('亲~网络不给力哦，请稍后重试');
        }
      },
      (res) => {
        $common.hide();
      }
    )
  },
  init() {
    this.setTime();
    this.getYesterDayData();
    this.getTimeData();
  },
  onLoad: function (options) {
    this.setData({
      ActivityID: +options.ActivityID,
      info: {
        title: options.title,
        image: options.image,
        name: options.name,
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.init();
  },

  isEnEvent() {
    let isEn = wx.getStorageSync('isEn');
    let title = isEn ? 'Clock In Management' : '打卡管理';
    wx.setNavigationBarTitle({
      title
    });
    this.setData({
      isEn
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