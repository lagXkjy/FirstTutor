// pages/New/index/index.js
const app = getApp();
const $common = require('../../../utils/common.js');
Page({
  data: {
    srcForIdPhoto: $common.srcForIdPhoto,
    notCNum: 0, //订单未读
    unReadC: 0, //未读消息，大于0，有
    msgCourse: false, //课表提醒
    userInfo: {},
    userType: 1, //1 学生 2 导师 0 未知,
    vip: false, //是否vip,
    teaId: -1, //外教id
    teacherList: [{
        id: 1,
        isShow: true,
        url: '/images/LI_03.png',
        title: "Basic Information",
        luJin: '../basic/basic'
      },
      {
        id: 2,
        isShow: true,
        url: '/images/LI_06.png',
        title: "Course Management",
        luJin: '../CourseManagement/index'
      },
      {
        id: 3,
        isShow: false,
        url: '/images/LI_08.png',
        title: "Requirement Check",
        luJin: '../NeedSee/index'
      },
      {
        id: 4,
        isShow: true,
        url: '/images/LI_10.png',
        title: "Order Check",
        luJin: '../OrderCheck/index'
      },
      {
        id: 5,
        isShow: true,
        url: '/images/LI_12.png',
        title: "Comment Review",
        luJin: '../OrdeRreview/index'
      },
      {
        id: 6,
        isShow: true,
        url: '/images/LI_14.png',
        title: "Activity Notification",
        luJin: '../activity/index'
      },
      {
        id: 7,
        isShow: true,
        url: '/images/LI_16.png',
        title: "Your Messages",
        luJin: '../Online/index'
      },
      {
        id: 8,
        isShow: true,
        url: '/images/problem.png',
        title: "Help and Feedback",
        luJin: '/pages/me/help/help'
      }, {
        id: 9,
        isShow: true,
        url: '/images/message.png',
        title: "Set WeChat Reminder Message",
        luJin: '/pages/static/templateMessage/templateMessage'
      },{
        id: 10,
        isShow: true,
        url: '/images/clock3.png',
        title: "My clock in diary",
        luJin: '/pages/clockIn/myClockInDiary/myClockInDiary'
      },{
        id: 11,
        isShow: true,
        url: '/images/clause.png',
        title: "Terms and Conditions",
        luJin: '/pages/static/terms/terms?isEn=1'
      }
    ],
    //学生
    studentList: [{
        url: '/images/LI_03.png',
        title: "个人基本信息",
        luJin: '/pages/me/stuRegister/stuRegister'
      }, {
        url: '/images/LI_10.png',
        title: " 我的订单",
        luJin: '../OrderCheckS/index'
      },
      {
        url: '/images/LI_06.png',
        title: " 学习需求",
        luJin: '../NeedSeeS/index'
      },
      {
        url: '/images/LI_14.png',
        title: " 我报名的活动",
        luJin: '../activity/index'
      },
      {
        url: '/images/LI_12.png',
        title: " 我的点评",
        luJin: '../OrdeRreviewS/index'
      },
      {
        url: '/images/LI_16.png',
        title: " 在线沟通",
        luJin: '../Online/index'
      }, {
        url: '/images/problem.png',
        title: "帮助与反馈",
        luJin: '/pages/me/help/help'
      }, {
        url: '/images/message.png',
        title: "模板消息设置",
        luJin: '/pages/me/stuTemplateMessage/stuTemplateMessage'
      }, {
        url: '/images/clause.png',
        title: "条款与条件",
        luJin: '/pages/static/terms/terms'
      }, {
        url: '/images/clock3.png',
        title: "我的打卡日记",
        luJin: '/pages/clockIn/myClockInDiary/myClockInDiary'
      }
    ],
    UserAvaUrl: '',
    TeaIdPhoto: '',
    UserNickName: ''
  },
  loading() {
    let isEn = wx.getStorageSync('isEn');
    let text = isEn ? "Loading..." : "努力加载中...";
    return text;
  },
  getIsVip(callback) { //获取外教是否为vip
    $common.request(
      "POST",
      $common.config.GetForTeaStatus, {
        openId: wx.getStorageSync('openid')
      },
      (res) => {
        if (res.data.res) {
          wx.setStorageSync("teacherStatusInfo", res.data);
          let vip = res.data.teaAddV ? res.data.teaAddV : false; //vip才能查看需求
          let teacherList = this.data.teacherList;
          teacherList[2].isShow = vip ? true : false;
          let teaToe = res.data.teaToe === 1 ? true : false;
          this.setData({
            vip: vip,
            teaToe: teaToe,
            teacherList: teacherList,
            teaId: res.data.teaId
          });
          wx.setStorageSync('IsVip', res.data.IsVip) //是否为超级VIP
        }
      },
      (res) => {},
      (res) => {
        this.getMsgOrderCount();
      }
    );
  },
  init() {
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      $common.getOpenid(this.getMyStatus.bind(this));
      return;
    }
    let isEn = wx.getStorageSync('isEn');
    if (isEn) { //外教
      wx.setNavigationBarTitle({
        title: 'Me',
      })
      this.getIsVip();
    } else { //用户身份不是外教,调用注册，防止首页不接收授权
      $common.studentRegister();
      wx.setNavigationBarTitle({
        title: '我',
      })
    }
    return;
    wx.showLoading({
      title: this.loading()
    });
    this.getMyStatus();
  },
  getMyStatus() { //获取我的用户类型
    $common.request(
      "POST",
      $common.config.GetUserType, {
        openId: wx.getStorageSync('openid')
      },
      (res) => {
        if (res.data.res) {
          let userType = res.data.userType;
          this.setData({
            userInfo: wx.getStorageSync('userInfo'),
            userType: userType,
          });
          if (parseInt(userType) !== 2) { //用户身份不是外教,调用注册，防止首页不接收授权
            $common.studentRegister();
            wx.setNavigationBarTitle({
              title: '我',
            })
          } else { //用户是外教，调用是否是vip//切换为英文
            wx.setNavigationBarTitle({
              title: 'Me',
            })
            this.getIsVip();
          }
        } else {}
      },
      (res) => {
        // $common.showModal('亲~网络不给力哦，请稍后重试');
      },
      (res) => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      }
    )
  },
  getUserInfo(e) { //获取用户头像等信息
    let url = e.currentTarget.dataset.url;
    let userInfo = e.detail.userInfo;
    if (!userInfo) return;
    $common.getUserInfo(userInfo, this.jump.bind(this, url));
  },
  jump(url) { // 跳转
    wx.navigateTo({
      url: url,
    })
  },
  getMsgCount() { //获取未读消息数量
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      return;
    }
    $common.request(
      'POST',
      $common.config.GetUnReadMsgCount, {
        openId: openid
      },
      (res) => {
        if (res.data.res) {
          this.setData({
            unReadC: parseInt(res.data.unReadC)
          })
        } else {

        }
      },
      (res) => {

      },
      (res) => {}
    )
  },
  getMsgCourse() { //vip外教是否需要更新课表
    let openId = wx.getStorageSync('openid');
    if (!openId) return;
    $common.request( 'POST',
      $common.config.GetTeachersSchedulesExpire, {  openId  },
      (res) => {
        if (res.data.res) {
          this.setData({  msgCourse: res.data.IsScheduleExpires  })
        }
      },
      (res) => {},
      (res) => {}
    )
  },
  getMsgOrderCount() { //获取订单未读消息
    let teaId = this.data.teaId;
    if (teaId === -1) return;
    $common.request(
      'POST',
      $common.config.GetNotCheckedOrderCount, {
        teaId: teaId
      },
      (res) => {
        if (res.data.res) {
          this.setData({
            notCNum: parseInt(res.data.notCNum)
          })
        } else {

        }
      },
      (res) => {

      },
      (res) => {}
    )
  },
  getImgAndName() {
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      $common.getOpenid(this.getImgAndName.bind(this));
      return;
    }
    $common.request(
      "POST",
      $common.config.GetMyAvaName, {
        openId: openid
      },
      (res) => {
        if (res.data.res) {
          let data = res.data;
          this.setData({
            UserAvaUrl: data.UserAvaUrl ? data.UserAvaUrl : '',
            TeaIdPhoto: data.TeaIdPhoto ? data.TeaIdPhoto : '',
            UserNickName: data.UserNickName
          })
        }
      },
      (res) => {},
      (res) => {}
    )
  },
  onLoad: function(options) {

  },
  onReady: function() {

  },
  isEnEvent(e) {
    let isEn = wx.getStorageSync('isEn');
    this.setData({
      openid: wx.getStorageSync('openid'),
      isEn: isEn
    })
    this.getImgAndName();
    this.init();
    this.getMsgCount();
    if (isEn) {
      this.getMsgOrderCount();
      this.getMsgCourse()
    }
  },
  onShow: function() {
    $common.getOpenid(this.isEnEvent.bind(this));
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
    this.init();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return $common.share()
  }
})