// pages/Home/activity/index.js
const $common = require('../../../utils/common.js');
Page({
  data: {
    isEn: false,
    srcActivity: $common.srcActivity,
    pageIndex: 1,
    pageSize: 5,
    atyList: [],
    isOver: false,
  },
  activityDetail(e) {
    let index = e.currentTarget.dataset.index,
      atyList = this.data.atyList;
    wx.navigateTo({
      url: `/pages/New/activityDetail/index?isSign=1&atyId=${atyList[index].AtyId}`,
    })
  },
  timeStamp(time) { //时间戳转换为日期
    time = time.replace("/Date(", '').replace(')/', '');
    let now = Date.parse(new Date());
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
    return {
      isEnd: time - now > 0 ? true : false, //true 活动未结束 false活动已结束
      time: `${y}-${m}-${d} ${h}:${f}`
    }
  },
  getOpenIdCallback() { //防止用户首页拒绝授权，在此授权后再次调用注册
    this.init();
    $common.studentRegister();
  },
  init(isReach) {
    let isOver = this.data.isOver
    if (isOver) return
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      $common.getOpenid(this.getOpenIdCallback.bind(this, isReach)); //获取用户信息及openid；
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
      $common.config.GetAtyInfoList,
      {
        openId: wx.getStorageSync('openid'),
        pageIndex: pageIndex,
        pageSize: pageSize,
      },
      (res) => {
        if (res.data.res) {
          let atyList = isReach ? this.data.atyList : [];
          let data = res.data.atyList;
          if (data.length >= pageSize) {
            this.data.pageIndex++;
            isOver = false
          } else {
            isOver = true
          }
          for (let i = 0, len = data.length; i < len; i++) {
            data[i].showTime = this.timeStamp(data[i].AtyEndTime); //时间戳转换为时间
            atyList.push(data[i]);
          }
          let hash = {};
          let newArr = atyList.reduce(function (item, next) {//数组依据AtyId去重
            hash[next.AtyId] ? '' : hash[next.AtyId] = true && item.push(next);
            return item
          }, []);
          this.setData({
            atyList: newArr,
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
    let text = isEn ? "Activity" : "活动";
    wx.setNavigationBarTitle({
      title: text
    })
  },
  onShow: function () {
    $common.getOpenid(this.isEnEvent.bind(this));
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
