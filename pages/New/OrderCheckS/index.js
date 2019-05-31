// pages/New/OrderCheck/index.js
const $common = require('../../../utils/common.js');
Page({
  data: {
    srcForIdPhoto: $common.srcForIdPhoto,
    pageIndex: 1,
    pageSize: 5,
    infoList: [], //页面数据
    isOver: false,
    currentDate: new Date().getTime()
  },
  courseComplete(e) { //课程完成
    let index = e.currentTarget.dataset.index
    let infoList = this.data.infoList
    $common.request('POST', $common.config.CourseCompletion,
      { cogId: infoList[index].FgtId, StuOpId: wx.getStorageSync('openid') },
      res => {
        if (!res.data.res) {
          //-1非vip 1参数有误 2异常报错 3课程已完成 4课程已取消 5 课程已提现
          if (res.data.errType !== 3) return $common.showModal('提交失败')
        }
        let k = `infoList[${index}].IsCourseBtn`
        this.setData({ [k]: false })
        wx.navigateTo({ url: `../releaseRemark/index?RewTeaId=${res.data.TeaId}&RewStuId=${res.data.StuId}&IsVip=1` })
      },
      res => { $common.showModal('提交失败') },
      res => { }
    )
  },
  cancelOrder(e) { //取消订单
    $common.showModal('取消订单前，请确认是否与该课程外教进行了沟通并得到确认；', true, (res) => {
      if (res.confirm) {
        let index = e.currentTarget.dataset.index
        let infoList = this.data.infoList
        $common.request('POST', $common.config.CancellationCourseOrders,
          { cogId: infoList[index].FgtId, OpenId: wx.getStorageSync('openid') },
          res => {
            //-1非vip 1参数有误 2异常报错 3已超时不能取消
            if (!res.data.res) return $common.showModal('提交失败')
            let k = `infoList[${index}].IsCancel`
            let k2 = `infoList[${index}].FgtCourseCancel`
            this.setData({ [k]: false, [k2]: 1 })
          },
          res => { $common.showModal('提交失败') },
          res => { }
        )
      }
    })
  },
  orderDelete(e) { //删除订单
    let index = e.currentTarget.dataset.index,
      infoList = this.data.infoList;
    $common.showModal('确定删除该订单？', true, (res) => {
      if (res.confirm) {
        $common.request(
          'POST',
          $common.config.DeleteOgoById,
          {
            odrId: infoList[index].OdrId
          },
          (res) => {
            if (res.data.res) {
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              })
              infoList.splice(index, 1);
              this.setData({
                infoList: infoList
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
                  $common.showModal('订单不存在');
                  break;
                case 4:
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
  SOrderDetail(e) { //查看详情
    let index = e.currentTarget.dataset.index,
      infoList = this.data.infoList;
    wx.navigateTo({
      url: '../orderDetailsS/index?cogId=' + infoList[index].FgtId,
    })
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
    let pageIndex = isReach ? this.data.pageIndex : 1,
      pageSize = this.data.pageSize;
    wx.showLoading({ title: '努力加载中...' });
    $common.request(
      'POST',
      $common.config.GetOrderList,
      {
        openId: wx.getStorageSync('openid'),
        pageIndex: pageIndex,
        pageSize: pageSize,
      },
      (res) => {
        if (res.data.res) {
          let infoList = isReach ? this.data.infoList : [];
          let data = res.data.infoList;
          if (data.length >= pageSize) {
            this.data.pageIndex++;
            isOver = false
          } else {
            isOver = true;
          }
          for (let i = 0, len = data.length; i < len; i++) {
            let price = parseFloat(data[i].CourseInfo.CorPrice);
            data[i].CourseInfo.CorPrice = price.toFixed(2) < 0.01 ? 0.01 : price.toFixed(2);
            switch (data[i].CourseInfo.CorLenOfCla) {
              case 1:
                data[i].CourseInfo.courseTimeLong = 1;
                break;
              case 2:
                data[i].CourseInfo.courseTimeLong = 1.5;
                break;
              case 3:
                data[i].CourseInfo.courseTimeLong = 2;
                break;
            }
            let status = data[i].FgtType;
            if (status == 1) {
              data[i].CourseInfo.CorType = 2;
              data[i].CourseInfo.BuyCount = data[i].FgtAttCount;
            } else {
              data[i].CourseInfo.CorType = 1;
              data[i].CourseInfo.BuyCount = data[i].CourseInfo.CorBuyCount;
            }
            data[i].CourseInfo.CorClaNum = data[i].FgtMemNum;
            infoList.push(data[i]);
          }
          let hash = {};
          let newArr = infoList.reduce(function (item, next) {//数组依据FgtId去重
            hash[next.FgtId] ? '' : hash[next.FgtId] = true && item.push(next);
            return item
          }, []);
          this.setData({
            infoList: newArr,
            isOver
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
  onLoad: function (options) {

  },
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
  onShareAppMessage: function (res) {
    return $common.share('FirstTutor', res.from === 'button' ? `/pages/Home/SpellGroup/index?cogId=${this.data.infoList[res.target.dataset.index].FgtId}` : '')
  }
})