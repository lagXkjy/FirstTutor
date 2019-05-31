const $common = require('../../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listData: [],
    pageIndex: 1,
    pageSize: 5,
    pageCount: -1,
    isOver: false,
  },
  deleteDiary(e) { //删除日记
    let index = e.currentTarget.dataset.index;
    let listData = this.data.listData;
    listData.splice(index, 1);
    this.setData({
      listData
    });
  },
  init() {
    let { isOver, pageSize, listData, pageCount } = this.data
    if (isOver) return
    let isEn = wx.getStorageSync('isEn');
    if (pageCount !== -1 && pageCount <= listData.length) return;
    $common.loading();
    $common.request(
      'POST',
      $common.config.GetUserSmallCardJournal, {
        openId: wx.getStorageSync('openid'),
        PageIndex: this.data.pageIndex,
        PageSize: pageSize
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.Data;
          let arr = data.UserJournal;
          if (arr.length >= pageSize) {
            this.data.pageIndex++;
            isOver = false
          } else {
            isOver = true
          }
          listData = listData.concat(arr);
          this.setData({
            listData,
            isOver
          })
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  isEnEvent() {
    let isEn = wx.getStorageSync('isEn');
    let title = isEn ? 'My clock in diary' : '我的打卡日记';
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
      listData: [],
      pageIndex: 1,
      pageSize: 5,
      pageCount: -1,
      isOver: false
    });
    this.init();
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
    this.init();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    this.data.pageStatus = 2;
    if (res.from === 'button') { // 来自页面内转发按钮
      return $common.share(
        'FirstTutor',
        `/pages/clockIn/thisRecord/thisRecord?JournalID=${res.target.dataset.journalid}`,
        '',
        () => {
          $common.request('POST', $common.config.InsertShare, {
            openid: wx.getStorageSync('openid'),
            ActivityID: this.data.ActivityID || 0,
            ThemeID: res.target.dataset.ThemeId,
            JournalID: res.target.dataset.journalid || 0
          },
            (res) => { if (res.data.res) this.setData({ scoreType: 3, scoreNum: +res.data.Integral }) }
          )
        }
      )
    } else {
      return $common.share()
    }
  }
})