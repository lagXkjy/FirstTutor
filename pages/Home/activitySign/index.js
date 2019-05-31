/**
 * 活动立即报名
 */
const $common = require('../../../utils/common.js');
Page({
  data: {
    userName: '',
    phone: '',
    remark: '',
    atyId: -1, //活动id
    price: 0.01,
    btnFalg: true
  },
  bindUserName(e) { //姓名
    this.data.userName = e.detail.value;
  },
  bindPhone(e) { //手机号
    this.data.phone = e.detail.value;
  },
  bindRemark(e) { //备注
    this.data.remark = e.detail.value;
  },
  getUserInfo(e) { //获取用户头像等信息
    let userInfo = e.detail.userInfo;
    if (!userInfo) return;
    $common.getUserInfo(userInfo, this.submit.bind(this));
  },
  submit() { //立即报名
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      $common.getOpenid(this.submit.bind(this));
      return;
    }
    let btnFalg = this.data.btnFalg;
    if (!btnFalg) return;
    this.data.btnFalg = false;
    let userName = this.data.userName,
      phone = this.data.phone,
      remark = this.data.remark;
    let isEn = wx.getStorageSync('isEn');
    if (userName.trim().length <= 0) {
      if (isEn) {
        $common.showModal('Please fill in your name.', false, false, 'Ok', 'Reminder');
      } else {
        $common.showModal('请输入姓名');
      }
      this.data.btnFalg = true;
      return;
    }
    if (!$common.phoneReg.test(phone)) {
      if (isEn) {
        $common.showModal('Please fill in the correct phone number.', false, false, 'Ok', 'Reminder');
      } else {
        $common.showModal('请输入正确的手机号');
      }
      this.data.btnFalg = true;
      return;
    }
    $common.request(
      'POST',
      $common.config.AtySignUp,
      {
        atyId: this.data.atyId,
        openId: wx.getStorageSync('openid'),
        stuName: userName,
        stuPhone: phone,
        Remark: remark
      },
      (res) => {
        if (res.data.res) {
          let paras = res.data.paras;
          let adrId = res.data.adrId;
          let suId = res.data.suId;
          if (paras) { //要付钱
            wx.requestPayment({
              'timeStamp': paras.timeStamp,
              'nonceStr': paras.nonceStr,
              'package': paras.package,
              'signType': 'MD5',
              'paySign': paras.paySign,
              'success': (res) => {
                $common.request(
                  'POST',
                  $common.config.PayMentSuccessActivity,
                  {
                    atyId: this.data.atyId,
                    openId: wx.getStorageSync('openid'),
                    pagePath: `pages/Home/Success/index?status=1`
                  },
                  (res) => {

                  },
                  (res) => {

                  },
                  (res) => {
                    this.data.btnFalg = true;
                    wx.navigateTo({ //跳转到报名成功页面
                      url: '/pages/Home/Success/index?status=1',
                    })
                  }
                )
              },
              'fail': (res) => {
                $common.request(
                  'POST',
                  $common.config.CanCelPay,
                  {
                    suId: suId,
                    adrId: adrId,
                    atyId: this.data.atyId
                  },
                  (res) => { },
                  (res) => { },
                  (res) => {
                    this.data.btnFalg = true;
                  }
                )
              }
            })
          } else { //免费
            this.data.btnFalg = true;
            wx.navigateTo({ //跳转到报名成功页面
              url: '/pages/Home/Success/index?status=1',
            })
          }
        } else {
          this.data.btnFalg = true;
          switch (res.data.errType) {
            case 3:
              if (isEn) {
                $common.showModal('The enrollment is full.', false, false, 'Ok', 'Reminder');
              } else {
                $common.showModal('报名人数已满');
              }
              break;
            case 6:
              if (isEn) {
                $common.showModal('Already signed up.', false, false, 'Ok', 'Reminder');
              } else {
                $common.showModal('已报名');
              }
              break;
            default:
              if (isEn) {
                $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
              } else {
                $common.showModal('未知错误');
              }
          }
        }
      },
      (res) => {
        if (isEn) {
          $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
        } else {
          $common.showModal('未知错误');
        }
        this.data.btnFalg = true;
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
    this.setData({
      atyId: options.atyId,
      price: options.price
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  isEnEvent(res) { //判断当前显示中英文
    let isEn = wx.getStorageSync('isEn');
    this.setData({
      isEn: isEn
    });
    let text = isEn ? "Activity Details" : "活动详情";
    wx.setNavigationBarTitle({
      title: text
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return $common.share()
  }
})