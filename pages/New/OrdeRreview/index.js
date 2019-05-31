/**
 * 点评管理
 */
const $common = require('../../../utils/common.js');
Page({
  data: {
    pagesData: [],
    pageIndex: 1,
    pageSize: 5,
    rewList: [],
    isOver: false,
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
  init(isReach) {
    let { isOver } = this.data
    if (isOver) return
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      $common.getOpenid(this.init.bind(this, isReach));
      return;
    }
    isReach = isReach ? true : false;
    let teaId = wx.getStorageSync('teacherStatusInfo').teaId;
    let pageIndex = isReach ? this.data.pageIndex : 1,
      pageSize = this.data.pageSize;
    let rewList = isReach ? this.data.rewList : [];//上拉加载push，下拉刷新，重新获取
    wx.showLoading({ title: 'Loading...' });
    $common.request(
      "POST",
      $common.config.GetAllRewAboutMe,
      {
        openId: wx.getStorageSync('openid'),
        pageIndex: pageIndex,
        pageSize: pageSize
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.rewList;
          if (data.length >= pageSize) {
            this.data.pageIndex++;
            isOver = false
          }else{
            isOver = true
          }
          let translate = []; //翻译
          for (let i = 0, len = data.length; i < len; i++) {
            data[i].showTime = this.timeStamp(data[i].RewCreateOn);
            translate.push(data[i].RewComment);
          }
          for (let i = 0, len = data.length; i < len; i++) {
            rewList.push(data[i]);
          }
          let hash = {};
          let newArr = rewList.reduce(function (item, next) {//数组依据RewId去重
            hash[next.RewId] ? '' : hash[next.RewId] = true && item.push(next);
            return item
          }, []);
          this.setData({
            rewList: newArr,
            isOver
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
    this.init(true);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return $common.share()
  }
})