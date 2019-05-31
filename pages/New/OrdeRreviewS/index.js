const $common = require('../../../utils/common.js');
Page({
  data: {
    srcForIdPhoto: $common.srcForIdPhoto,
    teaList: [],
    pageIndex: 1,
    pageSize: 5,
  },
  bindDelete(e) { //删除点评
    let index = e.currentTarget.dataset.index,
      teaList = this.data.teaList;
    $common.showModal('确定删除?', true, (res) => {
      if (res.confirm) {
        $common.request(
          'POST',
          $common.config.DeleteReview,
          {
            rewId: teaList[index].RewId
          },
          (res) => {
            if (res.data.res) {
              // this.init();
              teaList[index].RewId = 0;
              this.setData({
                teaList: teaList
              })
            } else {
              switch (res.data.errType) {
                case 1:
                  $common.showModal('参数错误');
                  break;
                case 2:
                  $common.showModal('删除失败');
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
  releaseRemark(e) { //立即点评
    let index = e.currentTarget.dataset.index,
      teaList = this.data.teaList;
    wx.navigateTo({
      url: `../releaseRemark/index?RewTeaId=${teaList[index].TeaId}&RewStuId=${teaList[index].StuId}&IsVip=${teaList[index].IsVip}`,
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
      $common.config.GetMyAllRewInfos,
      {
        openId: wx.getStorageSync('openid'),
      },
      (res) => {
        if (res.data.res) {
          let teaList = isReach ? this.data.teaList : [];
          let data = res.data.teaList;
          if (data.length >= pageSize) {
            pageIndex++;
          }
          for (let i = 0, len = data.length; i < len; i++) {
            data[i].TeaName = data[i].TeaNickName;
            teaList.push(data[i]);
          }
          let hash = {};
          let newArr = teaList.reduce(function (item, next) {//数组依据RewId去重
            hash[next.TeaId] ? '' : hash[next.TeaId] = true && item.push(next);
            return item
          }, []);
          this.setData({
            teaList: newArr,
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
            case 3:
              $common.showModal('未知错误');
              break;
            case 4:
              $common.showModal('获取信息失败');
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
    this.init(this);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return $common.share()
  }
})