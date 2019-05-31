/**
 * 需求列表
 */
const $common = require('../../../utils/common.js');
const $static = require('../../../utils/static.js');
const $translate = require('../../../utils/translate.js');
Page({
  data: {
    lnList: [],
    pageIndex: 1,
    pageSize: 5,
    addressData: $static.areaShanghaiEn
  },
  seeDetail(e) { //立即沟通
    let index = e.currentTarget.dataset.index,
      lnList = this.data.lnList;
    wx.navigateTo({
      url: `../seeDetail/index?nedId=${lnList[index].NedId}`,
    })
  },
  init(isReach) {
    isReach = isReach ? true : false;
    let teaId = wx.getStorageSync('teacherStatusInfo').teaId;
    let pageIndex = isReach ? this.data.pageIndex : 1,
      pageSize = this.data.pageSize;
    let lnList = isReach ? this.data.lnList : []; //上拉加载push，下拉刷新，重新获取
    wx.showLoading({
      title: 'Loading...'
    });
    $common.request(
      "POST",
      $common.config.GetAllLearnNeeds, {
        pageIndex: pageIndex,
        pageSize: pageSize
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.lnList;
          let addressData = this.data.addressData;
          if (data.length >= pageSize) {
            pageIndex++;
          }
          let locationArr = []; //待翻译数组
          for (let i = 0, len = data.length; i < len; i++) {
            data[i].time = $translate.translateTimeEn(data[i].NedClaTime);
            data[i].week = $translate.translateWeekEn(parseInt(data[i].NedCorAfw));
            for (let j = 0, l = addressData.length; j < l; j++) {
              if (addressData[j].id === data[i].NedClaArea) {
                data[i].address = addressData[j].area
              }
            }
            locationArr.push(data[i].NedClaAreaSel.CanAreaName);
          }
          // 翻译一下
          $common.translate(locationArr.join('\n'), (res) => {
            let trans_result = res.data.trans_result;
            if (trans_result && trans_result.length > 0) { //翻译成功了
              for (let i = 0, len = data.length; i < len; i++) {
                trans_result[i] && trans_result[i].dst && (data[i].address = trans_result[i].dst);
              }
            } else { //没有返回东西，报错了,显示原文
            }
            for (let i = 0, len = data.length; i < len; i++) {
              lnList.push(data[i]);
            }
            let hash = {};
            let newArr = lnList.reduce(function(item, next) { //数组依据NedId去重
              hash[next.NedId] ? '' : hash[next.NedId] = true && item.push(next);
              return item
            }, []);
            this.setData({
              lnList: newArr,
              pageIndex: pageIndex,
            })
          });


        } else {
          $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
        }
      },
      (res) => {
        $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
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
  onLoad: function(options) {
    this.init();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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
    this.init();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.init(true);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return $common.share()
  }
})