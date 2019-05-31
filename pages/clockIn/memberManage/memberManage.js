const $common = require('../../../utils/common.js');
Page({
  data: {
    ActivityID: -1,
    input: '',
    listData: [],
    pageIndex: 1,
    pageSize: 10,
    pageCount: -1,
    isOver: false
  },
  changeAuthority(e) { //切换状态
    let isEn = wx.getStorageSync('isEn');
    let index = e.currentTarget.dataset.index;
    let listData = this.data.listData;
    $common.loading();
    $common.request(
      'POST',
      $common.config.UpdateUserLimit, {
        StuId: listData[index].StuUserId,
        type: listData[index].SmallCardLimit
      },
      (res) => {
        if (res.data.res) {
          if (listData[index].SmallCardLimit === 0) {
            listData[index].SmallCardLimit = 1;
          } else {
            listData[index].SmallCardLimit = 0;
          }
          this.setData({
            listData
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
  inputchange(e) {
    this.data.input = e.detail;
    this.setData({
      listData: []
    });
    this.data.pageIndex = 1;
    this.data.pageCount = -1;
    this.getData();
  },
  getData() { //获取数据
    let { isOver } = this.data
    if(isOver) return
    let isEn = wx.getStorageSync('isEn');
    let listData = this.data.listData;
    let pageCount = this.data.pageCount;
    if (pageCount !== -1 && listData.length >= pageCount) return;
    $common.loading();
    $common.request(
      'POST',
      $common.config.GetSmallCardActivityUserList, {
        ActivityID: this.data.ActivityID,
        Seach: this.data.input,
        PageIndex: this.data.pageIndex,
        PageSize: this.data.pageSize
      },
      (res) => {
        if (res.data.res) {
          let arr = res.data.Data.UserList;
          if(arr.length >= this.data.pageSize){
            this.data.pageIndex++;
            isOver = false
          }else{
            isOver = true
          }
          for (let i = 0, len = arr.length; i < len; i++) {
            let d = $common.timeStamp(arr[i].ParticipateDate);
            arr[i].showTime = `${d.y}-${d.m}-${d.d}`;
          }
          listData = listData.concat(arr);
          this.setData({
            listData,
            isOver
          })
          this.data.pageCount = res.data.Data.PageCount;
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
    this.data.ActivityID = +options.ActivityID;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.getData();
  },

  isEnEvent() {
    let isEn = wx.getStorageSync('isEn');
    let title = isEn ? 'Member management' : '成员管理';
    wx.setNavigationBarTitle({
      title
    });
    this.setData({
      isEn
    })
  },
  onShow: function() {
    this.isEnEvent();
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