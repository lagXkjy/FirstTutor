const $common = require('../../../utils/common.js');
/**
 * 成员查看全部主题
 */
Page({
  data: {
    srcClockInImage: $common.srcClockInImage,
    pageIndex: 1,
    pageSize: 10,
    pageCount: -1,
    input: '',
    listData: [],
    Checkpoint: 0, //当前关卡
    nowData: null, //当前关卡的数据
    isOver: false,
  },
  toThemeDetails(e) { //跳转主题详情
    let index = e.currentTarget.dataset.index;
    let listData = this.data.listData;
    if (this.data.Checkpoint < listData[index].ThemeCheckpoint) return; //尚未解锁，就别进去填麻烦了
    wx.navigateTo({
      url: `/pages/clockIn/themeDetails/themeDetails?ThemeId=${listData[index].Id}`,
    })
  },
  inputEvent(e) {
    this.data.pageIndex = 1;
    this.data.pageCount = -1;
    this.setData({
      listData: [],
      input: e.detail
    })
    this.getData();
  },
  getData() { //获取数据
    let { isOver } = this.data
    if (isOver) return
    let isEn = wx.getStorageSync('isEn');
    let pageCount = this.data.pageCount;
    let listData = this.data.listData;
    let input = this.data.input;
    if (pageCount !== -1 && pageCount <= listData.length) return;
    $common.loading();
    $common.request(
      'POST',
      $common.config.GetThemeList, {
        openId: wx.getStorageSync('openid'),
        ActivityID: +this.data.ActivityID,
        PageSize: this.data.pageSize,
        PageIndex: this.data.pageIndex,
        Search: input,
        UserType: 0, //0 学生，1老师
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.Data;
          let arr = data.ThemeList;
          let Checkpoint;
          let nowData = null;
          if (arr.length >= this.data.pageSize) {
            this.data.pageIndex++;
            isOver = false
          } else {
            isOver = true
          }
          if (data.ActivityType === 1) { //每日打卡模式
            for (let i = 0, len = arr.length; i < len; i++) {
              let date = $common.timeStamp(arr[i].ThemeDate);
              arr[i].showTime = `${date.y}-${date.m}-${date.d}`;
            }
          } else if (data.ActivityType === 2) { //闯关模式
            Checkpoint = data.Checkpoint;
            for (let i = 0, len = arr.length; i < len; i++) {
              if (arr[i].ThemeCheckpoint === Checkpoint) {
                nowData = arr[i];
                nowData.index = i;
                break;
              }
            }
          }
          listData = listData.concat(arr);
          data.ThemeList = null;
          this.setData({
            themeInfo: data,
            listData,
            Checkpoint,
            nowData,
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
    this.data.ActivityID = options.ActivityID;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getData();
  },
  isEnEvent() {
    let isEn = wx.getStorageSync('isEn');
    let title = isEn ? 'Whole Theme' : '全部主题';
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
    this.getData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return $common.share()
  }
})