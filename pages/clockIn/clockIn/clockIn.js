const $common = require('../../../utils/common.js');
const app = getApp();
Page({
  data: {
    srcClockInImage: $common.srcClockInImage,
    pageIndex: 1,
    pageSize: 10,
    isAuthority: 0, //是否有新建打卡的资格 0 无 1 有
    pageCount: -1, //数据总行数
    listData: [],
    isOver: false,
  },
  createClockIn() { //新建打卡活动
    wx.navigateTo({
      url: '/pages/clockIn/createNew/createNew',
    })
  },
  toDetails(e) { //跳转到打卡详情页
    let isEn = wx.getStorageSync('isEn');
    let index = e.currentTarget.dataset.index;
    if (isEn) { //教师不需要注册
      let listData = this.data.listData;
      wx.navigateTo({
        url: `/pages/clockIn/details/details?ActivityID=${listData[index].Id}&isAdministrator=${listData[index].isAdministrator}`,
      })
    } else { //学生需要注册
      this.checkIsRegister(index);
    }
  },
  checkIsRegister(index) { //查看学生是否注册过
    $common.request(
      'POST',
      $common.config.GetStuRegis, {
        openId: wx.getStorageSync('openid')
      },
      (res) => {
        if (res.data.res) {
          let listData = this.data.listData;
          let register = +res.data.regis;
          if (register === 0) { //未注册，去注册页注册
            wx.navigateTo({  //带上详情页需要的参数，从那边直接跳过去
              url: `/pages/me/stuRegister/stuRegister?card=1&ActivityID=${listData[index].Id}&isAdministrator=${listData[index].isAdministrator}`
            })
          } else { //已注册,跳转到详情页
            wx.navigateTo({
              url: `/pages/clockIn/details/details?ActivityID=${listData[index].Id}&isAdministrator=${listData[index].isAdministrator}`,
            })
          }
        } else {
          $common.showModal('未知错误，请稍后重试');
        }
      },
      (res) => {
        $common.showModal('网络不给力，请稍后重试');
      },
      (res) => { }
    )
  },
  getData() { //获取本页面数据
    let { isOver, pageSize} = this.data.isOver
    if (isOver) return
    let isEn = wx.getStorageSync('isEn');
    let pageCount = this.data.pageCount;
    let listData = this.data.listData;
    // if (pageCount !== -1 && pageCount <= listData.length) return;
    $common.loading();
    $common.request(
      'POST',
      $common.config.GetSmallCardActivity, {
        openId: wx.getStorageSync('openid'),
        PageIndex: this.data.pageIndex,
        PageSize: pageSize,
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.Data;
          if (data.length >= pageSize) {
            this.data.pageIndex++;
            isOver = false;
          } else {
            isOver = true;
          }
          listData = listData.concat(data.ListData);
          listData = $common.unique(listData, 'Id');
          this.setData({
            isAuthority: data.isAuthority,
            listData: listData,
            isOver
          });
          this.data.pageCount = data.PageCount;
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
  onLoad: function (options) {

  },
  onReady: function () {

  },
  isEnEvent() {
    let isEn = wx.getStorageSync('isEn');
    let title = isEn ? 'Clock in' : '打卡';
    wx.setNavigationBarTitle({
      title
    });
    this.setData({
      isEn
    })
  },
  onShow: function () {
    this.isEnEvent();
    this.setData({
      pageIndex: 1,
      pageSize: 10,
      pageCount: -1, //数据总行数
      listData: []
    })
    this.getData();
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
    this.setData({
      pageIndex: 1,
      pageSize: 10,
      pageCount: -1, //数据总行数
      listData: []
    })
    this.getData();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return $common.share()
  }
})