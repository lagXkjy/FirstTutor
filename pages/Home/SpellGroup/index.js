// pages/Home/SpellGroup/index.js
const $common = require('../../../utils/common.js');
Page({
  data: {
    srcForIdPhoto: $common.srcForIdPhoto,
    isOverdue: false, //拼团是否过期
    isShowPage: false, //整个页面是否显示
    isJoin: false, //true 本人有购买此课程
    countDown: "00:00:00",
    leftTime: '0', //倒计时时间戳
    cogId: -1, //团id
    course: {}, //课程信息
    teacher: {}, //外教信息
    cog: {}, //团信息
    mem: [], //团成员信息
    teaAddress: '', //外教地址
    teaPhone: '', //外教联系方式
    sharePic: '', //要分享的图片链接
    picIntro: '', //要分享的文案
    srcShar: $common.srcShar,
  },
  callPhone(e) { //打电话
    let phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  lookAddress() { //查看地图
    let address = this.data.teaAddress;
    $common.getAddress(address);
  },
  countDown() { // 倒计时
    let leftTime = parseInt(this.data.leftTime);
    leftTime -= 1000;
    let day = parseInt(leftTime / 1000 / 60 / 60 / 24, 10), //计算剩余的天数
      hour = parseInt(leftTime / 1000 / 60 / 60 % 24, 10), //计算剩余的小时
      minute = parseInt(leftTime / 1000 / 60 % 60, 10),//计算剩余的分钟
      second = parseInt(leftTime / 1000 % 60, 10);//计算剩余的秒数
    day < 10 && (day = '0' + day);
    hour < 10 && (hour = '0' + hour);
    minute < 10 && (minute = '0' + minute);
    second < 10 && (second = '0' + second);
    setTimeout(() => {
      this.setData({
        countDown: `${hour}:${minute}:${second}`,
        leftTime: leftTime
      })
      if (leftTime <= 0) {
        this.setData({
          countDown: `00:00:00`,
          isOverdue: true
        })
        return;
      }
      this.countDown();
    }, 1000);
  },
  goHome() { //返回首页
    wx.switchTab({
      url: '../Home/index',
    })
  },
  getPageInfo() { //获取页面信息
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      $common.getOpenid(this.getPageInfo.bind(this));
      return;
    }
    let isEn = wx.getStorageSync('isEn');
    let text = isEn ? "Loading..." : "努力加载中...";
    wx.showLoading({ title: text });
    $common.request(
      'POST',
      $common.config.LookUpFigroupInfo,
      {
        cogId: this.data.cogId
      },
      (res) => {
        if (res.data.res) {
          let course = res.data.course;
          switch (course.CorLenOfCla) {
            case 1:
              course.courseTimeLong = 1;
              break;
            case 2:
              course.courseTimeLong = 1.5;
              break;
            case 3:
              course.courseTimeLong = 2;
              break;
          }
          let cog = res.data.cog,
            leftTime = cog.RemainingTime;
          let mem = res.data.mem;
          let openid = wx.getStorageSync('openid');
          let isJoin = false;
          for (let i = 0, len = mem.length; i < len; i++) {
            if (mem[i].OdrOpenId == openid) {
              isJoin = true; //有参加过此团
              break;
            }
          }
          let memData = [];
          for (let i = 0, len = mem.length; i < len; i++) {
            if (mem[i].OdrIsHead) {
              memData.unshift(mem[i]);
            } else {
              memData.push(mem[i]);
            }
          }
          course.CorPrice = course.CorPrice.toFixed(2) < 0.01 ? 0.01 : course.CorPrice.toFixed(2);
          course.CorClaNum = course.CorType;
          let teacher = res.data.teacher;
          // teacher.TeaName = teacher.TeaNickName;
          this.setData({
            course: course,
            teacher: teacher,
            cog: cog,
            mem: memData,
            leftTime: leftTime,
            isJoin: isJoin,
            isShowPage: true
          });
          if (cog.FgtStatus == 1) {
            this.countDown();
          }
        } else {
          if (isEn) {
            $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
          } else {
            $common.showModal('未知错误');
          }
        }
      },
      (res) => {
        if (isEn) {
          $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
        } else {
          $common.showModal('未知错误');
        }
      },
      (res) => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      }
    )
  },
  meToC() { //我来参团
    wx.redirectTo({
      url: '../sureOrder/index?corId=' + this.data.course.CorId + '&orderType=' + 1 + '&groupType=' + 2 + '&cogId=' + this.data.cogId,
    })
  },
  meTo() { //我也来凑热闹开个团
    wx.redirectTo({
      url: '../CourseInformation/index?courId=' + this.data.course.CorId + '&teaId=' + this.data.teacher.TeaId
    })
  },
  getTeacherPhone() {  //获取外教联系方式
    $common.request(
      'POST',
      $common.config.GetTeaAddressPhone,
      {
        cogId: this.data.cogId
      },
      (res) => {
        if (res.data.res) {
          this.setData({
            teaAddress: res.data.teaAddress,
            teaPhone: res.data.teaPhone
          })
        } else {
          switch (res.data.errType) {
            case 1:
              //参数错误
              break;
            case 2:
              //未知错误
              break;
          }
        }
      },
      (res) => {

      },
      (res) => {
      }
    )
  },
  init() {
    this.getPageInfo();
    this.getTeacherPhone();
  },
  getSharePicName() { //获取要分享的图片
    $common.request(
      "POST",
      $common.config.GetSharePicName,
      {},
      (res) => {
        if (res.data.res) {
          this.setData({
            sharePic: res.data.sharePic,
            picIntro: res.data.picIntro
          })
        }
      },
      (res) => {

      },
      (res) => {
        console.log(res);
      }
    )
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let cogId = parseInt(options.cogId);
    this.setData({ cogId })
    this.init();
    this.getSharePicName();
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
    let text = isEn ? "Group" : "拼团";
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
    this.init();
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
    const data = this.data
    let OdrName = data.mem[0].OdrName
    let sharePic = data.sharePic
    return $common.share(
      `${OdrName || '你的小伙伴'}${data.picIntro || '邀请你去拼团!'}`,
      `/pages/Home/SpellGroup/index?cogId=${data.cogId}`,
      sharePic ? `${$common.srcShar}${sharePic}` : ''
    )
  }
})
