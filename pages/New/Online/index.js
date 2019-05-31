/**
 * 在线沟通列表
 */
const $common = require('../../../utils/common.js');
Page({
  data: {
    srcForIdPhoto: $common.srcForIdPhoto,
    infoList: [],
    pageSize: 10,
    pageIndex: 1,
    isOver: false
  },
  getUserInfo(e) { //获取用户头像等信息
    let index = e.currentTarget.dataset.index;
    let userInfo = e.detail.userInfo;
    if (!userInfo) return;
    $common.getUserInfo(userInfo, $common.stuRegister.bind($common, this.onlineChart.bind(this, index)));
  },
  onlineChart(index) { //进入到聊天页面
    let infoList = this.data.infoList;
    wx.navigateTo({
      url: `/pages/New/onlineChart/index?userId=${infoList[index].UserId}`,
    })
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
  removeDuplicate(thisArr, thisId) { //去重
    let hash = {};
    let newArr = thisArr.reduce(function (item, target, index) {
      hash[target[thisId]] ? item[hash[target[thisId]].nowIndex] = target : hash[target[thisId]] = {
        nowIndex: item.push(target) && index
      }
      return item;
    }, []);
    return newArr;
  },
  getPageList(isReach) { //获取页面数据
    let { isOver } = this.data
    if (isOver) return
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      $common.getOpenid(this.getPageList.bind(this, isReach));
      return;
    }
    isReach = isReach ? true : false;
    let pageIndex = isReach ? this.data.pageIndex : 1,
      pageSize = this.data.pageSize;
    let infoList = isReach ? this.data.infoList : [];
    let isEn = wx.getStorageSync('isEn');
    let text = isEn ? 'Lodaing...' : '努力加载中...';
    wx.showLoading({
      title: text
    });
    $common.request(
      'POST',
      $common.config.GetChatMemRecord, {
        openId: wx.getStorageSync('openid'),
        pageIndex: pageIndex,
        pageSize: pageSize
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.infoList;
          if (data.length >= pageSize) {
            this.data.pageIndex++
            isOver = false
          } else {
            isOver = true
          }
          for (let i = 0, len = data.length; i < len; i++) {
            data[i].showTime = this.timeStamp(data[i].LastestTime);
            infoList.push(data[i]);
          }
          this.setData({
            infoList: this.removeDuplicate(infoList, 'UserId'),
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

  onLoad: function (options) { },

  onReady: function () {

  },

  isEnEvent(res) { //判断当前显示中英文
    let isEn = wx.getStorageSync('isEn');
    this.setData({
      isEn: isEn
    });
    let text = isEn ? "Your Messages" : "在线沟通";
    wx.setNavigationBarTitle({
      title: text
    })
  },
  onShow: function () {
    this.isEnEvent();
    this.getPageList();
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
    this.getPageList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getPageList(true);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return $common.share()
  }
})