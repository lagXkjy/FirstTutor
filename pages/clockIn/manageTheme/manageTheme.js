const $common = require('../../../utils/common.js');
Page({
  data: {
    srcClockInImage: $common.srcClockInImage,
    pageIndex: 1,
    pageSize: 10,
    pageCount: -1,
    input: '',
    listData: [],
    ActivityID: 0,
    isOver: false,
  },
  toCreateNewTheme() { //跳转到新建打卡主题页
    let data = this.data;
    let listData = data.listData;
    wx.navigateTo({
      url: `/pages/clockIn/createNewTheme/createNewTheme?type=${data.type}&checkPoint=${this.data.themeInfo.MaxCheckpoint}&ActivityID=${data.ActivityID}`,
    })
  },
  reviseTheme(e) { //修改主题
    let index = e.currentTarget.dataset.index;
    let listData = this.data.listData;
    wx.navigateTo({
      url: `/pages/clockIn/createNewTheme/createNewTheme?ThemeId=${listData[index].Id}&type=${this.data.type}`,
    })
  },
  deleteThemeEvent(e) { //删除主题
    let isEn = wx.getStorageSync('isEn');
    if (isEn) {
      $common.showModal('Confirm the deletion?', true, (res) => {
        if (res.confirm) {
          this.deleteTheme(e);
        }
      }, 'OK', 'Reminder', 'NO')
    } else {
      $common.showModal('确认删除？', true, (res) => {
        if (res.confirm) {
          this.deleteTheme(e);
        }
      })
    }
  },
  deleteTheme(e) { //删除主题
    let index = e.currentTarget.dataset.index;
    let listData = this.data.listData;
    $common.request(
      'POST',
      $common.config.GetDateTheme, {
        ThemeId: listData[index].Id
      },
      (res) => {
        if (res.data.res) {
          listData.splice(index, 1);
          this.setData({
            listData
          })
        } else {
          if (isEn) {
            $common.showModal('Delete failure', false, false, 'Ok', 'Reminder');
          } else {
            $common.showModal('删除失败');
          }
        }
      },
      (res) => {
        if (isEn) {
          $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
        } else {
          $common.showModal('亲~网络不给力哦，请稍后重试');
        }
      },
      (res) => {

      }
    )
  },
  toThemeDetails(e) { //跳转到主题详情
    let index = e.currentTarget.dataset.index;
    let listData = this.data.listData;
    wx.navigateTo({
      url: `/pages/clockIn/themeDetails/themeDetails?ThemeId=${listData[index].Id}`,
    })
  },
  inputEvent(e) {
    this.data.input = e.detail;
    this.data.pageIndex = 1;
    this.data.pageCount = -1;
    this.data.listData = [];
    this.getData();
  },
  getData() { //获取数据
    let { isOver } = this.data
    if(isOver) return
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
        UserType: 1, //0 学生，1老师
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.Data;
          let arr = data.ThemeList;
          if (data.ActivityType === 1) { //每日打卡模式
            for (let i = 0, len = arr.length; i < len; i++) {
              let date = $common.timeStamp(arr[i].ThemeDate);
              arr[i].showTime = `${date.y}-${date.m}-${date.d}`;
            }
          }
          if(arr.length >= this.data.pageSize){
            this.data.pageIndex++;
            isOver = false
          }else{
            isOver = true
          }
          listData = listData.concat(arr);
          data.ThemeList = null;
          this.setData({
            themeInfo: data,
            listData,
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.data.ActivityID = options.ActivityID;
    this.data.type = +options.type;
    this.data.checkPoint = options.checkPoint;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },
  isEnEvent() {
    let isEn = wx.getStorageSync('isEn');
    let title = isEn ? 'Manage Theme' : '管理打卡主题';
    wx.setNavigationBarTitle({
      title
    });
    this.setData({
      isEn
    })
  },
  onShow: function() {
    this.isEnEvent();
    this.setData({
      pageIndex: 1,
      pageSize: 10,
      pageCount: -1,
      input: '',
      listData: [],
      isOver:false
    })
    this.getData();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.getData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return $common.share()
  }
})