/**
 * 我报名的活动
 */
const $common = require('../../../utils/common.js');
Page({
  data: {
    srcActivity: $common.srcActivity,
    pageIndex: 1,
    pageSize: 10,
    atyInfos: [], //页面数据
    isOver: false,
  },
  timeStamp(time) { //时间戳转换为日期
    let str1 = time.replace("/Date(", ''),
      thisTime = str1.replace(')/', '');
    let date = new Date(parseInt(thisTime)),
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
  activityStatus(startTime, endTime) { //判断活动状态
    startTime = startTime.replace("/Date(", '').replace(')/', '');
    endTime = endTime.replace("/Date(", '').replace(')/', '');
    let now = Date.parse(new Date()); //当前时间
    if (now - startTime >= 0) {
      if (now - endTime <= 0) {//活动进行中
        return 2;
      } else { //活动已结束
        return 3;
      }
    } else { //活动未开始
      return 1;
    }
  },

  activityDetail(e) {  // 活动详情
    let index = e.currentTarget.dataset.index,
      atyInfos = this.data.atyInfos;
    wx.navigateTo({
      url: '../activityDetail/index?isSign=0&atyId=' + atyInfos[index].AtyId,
    })
  },
  init(isReach) {
    let { isOver } = this.data
    if (isOver) return
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      $common.getOpenid(this.init.bind(this, isReach));
      return;
    }
    isReach = isReach ? true : false;
    let isEn = wx.getStorageSync('isEn');
    let text = isEn ? 'Loading...' : '努力加载中...';
    wx.showLoading({ title: text });
    let pageIndex = isReach ? this.data.pageIndex : 1,
      pageSize = this.data.pageSize;
    $common.request(
      'POST',
      $common.config.GetMySignUpAtyList,
      {
        openId: wx.getStorageSync('openid'),
        pageIndex: pageIndex,
        pageSize: pageSize
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.atyInfos;
          let atyInfos = isReach ? this.data.atyInfos : [];
          if (data.length >= pageSize) {
            this.datapageIndex++;
            isOver = false
          } else {
            isOver = true
          }
          for (let i = 0, len = data.length; i < len; i++) {
            data[i].whatTime = this.timeStamp(data[i].AtyEndTime);
            data[i].status = this.activityStatus(data[i].AtyStartTime, data[i].AtyEndTime);
            atyInfos.push(data[i]);
          }
          let hash = {};
          let newArr = atyInfos.reduce(function (item, next) {//数组依据FgtId去重
            hash[next.AtyId] ? '' : hash[next.AtyId] = true && item.push(next);
            return item
          }, []);
          this.setData({
            atyInfos: newArr,
            isOver
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
        if (isEn) {
          $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
        } else {
          $common.showModal('未知错误');
        }
      },
      (res) => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      }
    )
  },
  onLoad: function (options) {
    this.init();
  },


  onReady: function () {
  },

  isEnEvent(res) { //判断当前显示中英文
    let isEn = wx.getStorageSync('isEn');
    this.setData({
      isEn: isEn
    });
    let text = isEn ? "Activity Signed Up" : "我报名的活动";
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
    this.init(true);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return $common.share()
  }
})