const $common = require('../../../utils/common.js');
const app = getApp();
Page({
  data: {
    input: '',
    scoure: 0,
    btnFalg: true,
    list: [{
      id: 1,
      context: '很不错的老师',
      select: false
    }, {
      id: 2,
      context: '英语水平很高',
      select: false
    }, {
      id: 3,
      context: '很有趣的老师',
      select: false
    }, {
      id: 3,
      context: '中文说的很好',
      select: false
    }],
  },
  changeList(e) {
    let { index } = e.currentTarget.dataset
    let { list } = this.data
    let k = `list[${index}].select`
    this.setData({ [k]: !list[index].select })
  },
  bindScoure(e) { //评分
    this.setData({ scoure: parseInt(e.currentTarget.dataset.index + 1) })
  },
  bindInput(e) {
    this.data.input = e.detail.value;
  },
  getUserInfo(e) { //获取用户头像等信息
    let userInfo = e.detail.userInfo;
    if (!userInfo) return;
    $common.getUserInfo(userInfo, this.submit.bind(this));
  },
  submit() {
    if (!this.data.btnFalg) return; //阻止连点
    this.data.btnFalg = false;
    let { input, scoure, list } = this.data
    if (scoure <= 0) {
      $common.showModal('请给该外教打分');
      this.data.btnFalg = true;
      return;
    }
    let TeaLabel = []
    list.forEach((item) => { if (item.select) TeaLabel.push(encodeURI(item.context)) })
    if (TeaLabel.length <= 0 && input.trim().length <= 0) {
      $common.showModal('请填写外教介绍');
      this.data.btnFalg = true;
      return;
    }
    $common.request('POST', $common.config.GiveTeaAMark,
      {
        rew: {
          RewTeaId: this.data.RewTeaId,
          RewStuId: this.data.RewStuId,
          RewComment: input,
          RewScore: scoure,

        },
        TeaLabel
      },
      (res) => {
        if (res.data.res) {
          wx.showToast({ title: '提交成功', icon: 'success' })
          setTimeout(() => {
            this.data.btnFalg = true;
            wx.navigateBack({ delta: 1 })
          }, 1500);
        } else {
          this.data.btnFalg = true;
          switch (res.data.errType) {
            case 1: $common.showModal('参数错误'); break;
            case 2: $common.showModal('提交失败'); break;
          }
        }
      },
      (res) => {
        this.data.btnFalg = true;
      },
      (res) => { }
    )
  },

  onLoad: function (options) {
    let RewTeaId = options.RewTeaId ? options.RewTeaId : -1
    let RewStuId = options.RewStuId ? options.RewStuId : -1
    let IsVip = +options.IsVip || 0
    this.setData({ RewStuId, RewTeaId, IsVip })
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return $common.share()
  }
})