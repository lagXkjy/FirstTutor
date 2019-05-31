// pages/New/NeedSee/index.js
const $common = require('../../../utils/common.js');
Page({
  data: {
    pageIndex: 1,
    pageSize: 5,
    LnList: [],
  },
  checkDemand(e) { //查看需求
    let index = e.currentTarget.dataset.index,
      LnList = this.data.LnList;
    wx.navigateTo({
      url: '/pages/me/checkDemand/checkDemand?nedId=' + LnList[index].NedId,
    })
  },
  seeDetail(e) { //修改需求
    let index = e.currentTarget.dataset.index,
      LnList = this.data.LnList;
    wx.navigateTo({
      url: '../seeDetailS/index?status=2&nedId=' + LnList[index].NedId,
    })
  },
  bindDelete(e) { //删除
    let index = e.currentTarget.dataset.index,
      LnList = this.data.LnList;
    $common.showModal('确定删除?', true, (res) => {
      if (res.confirm) {
        $common.request(
          'POST',
          $common.config.DeleteMyLearnNeed,
          {
            nedId: LnList[index].NedId
          },
          (res) => {
            if (res.data.res) {
              LnList.splice(index, 1);
              this.setData({
                LnList: LnList
              })
            } else {
              switch (res.data.errType) {
                case 1:
                  $common.showModal('参数错误');
                  break;
                case 2:
                  $common.showModal('未知错误');
                  break;
              }
            }
          },
          (res) => {

          },
          (res) => {
          }
        )

      }
    });
  },
  seeDetailS() { //发布需求
    wx.navigateTo({
      url: '../seeDetailS/index?status=1',
    })
  },
  init(isReach) {
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      $common.getOpenid(this.init.bind(this, isReach));
      return;
    }
    isReach = isReach ? true : false;
    let pageIndex = isReach ? this.data.pageIndex : 1,
      pageSize = this.data.pageSize;
    wx.showLoading({ title: '努力加载中...' });
    $common.request(
      'POST',
      $common.config.GetMyLearnNeeds,
      {
        openId: wx.getStorageSync('openid'),
        pageIndex: pageIndex,
        pageSize: pageSize,
      },
      (res) => {
        if (res.data.res) {
          let LnList = isReach ? this.data.LnList : [];
          let data = res.data.LnList;
          if (data.length >= pageSize) {
            pageIndex++;
          }
          for (let i = 0, len = data.length; i < len; i++) {
            switch (data[i].NedClaTime) {
              case 1:
                data[i].timeStage = '上午';
                break;
              case 2:
                data[i].timeStage = '下午1';
                break;
              case 3:
                data[i].timeStage = '下午2';
                break;
              case 4:
                data[i].timeStage = '晚上';
                break;
            }
            LnList.push(data[i]);
          }
          let hash = {};
          let newArr = LnList.reduce(function (item, next) {//数组依据NedId去重
            hash[next.NedId] ? '' : hash[next.NedId] = true && item.push(next);
            return item
          }, []);
          this.setData({
            LnList: newArr,
            pageIndex: pageIndex
          })
        } else {
          switch (res.data.errType) {
            case 1:
              $common.showModal('参数有误');
              break;
            case 2:
              $common.showModal('未知错误');
              break;
          }
        }
      },
      (res) => {

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