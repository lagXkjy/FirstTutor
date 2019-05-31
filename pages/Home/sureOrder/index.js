const $common = require('../../../utils/common.js');
const $translate = require('../../../utils/translate.js');
Page({
  //页面分为两种情况，1，单独购买 = 团长购买 2，团员购买
  data: {
    srcForIdPhoto: $common.srcForIdPhoto,
    isPage: false,
    // startCourseTime: '', //上课时间
    courseAddress: '', //上课 地址
    studentName: '', //姓名
    studentPhone: '', //手机号
    // timeList: [], //选择上课时间
    timeListData: ['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'],
    // timeIndex: -1,
    manyTime: 0, //长串选择时间 0 不显示 1 显示
    cogId: '', //团id 当groupType为2时必填
    corId: '', //购买的课程 id
    groupType: '', //团类型：1. 开团  2. 参团， 当orderType为1时必填
    orderType: '', //下单类型：1. 团购  2. 单独购
    PayPrice: '', //付款价格
    course: {}, //课程信息
    teacher: {}, //教师信息
    corOpenG: {}, //拼团信息
    // weekTime: '', //上课时间段
    weekTimeData: [], //上课时间段数据
    isCheck: false,
    btnFalg: true,
  },
  terms() { //查看协议
    wx.navigateTo({ url: '/pages/static/terms/terms?isEn=0' })
  },
  checkChange() { //协议选中
    this.data.isCheck = !this.data.isCheck;
  },
  initCourseTimeLong() { //初始话上课时间数据
    let { weekTimeData, timeListData, course } = this.data
    for (let i = 0, len = weekTimeData.length; i < len; i++) {
      let timeList = []
      switch (weekTimeData[i].TimClaTime) {
        case 1:
          switch (course.CorLenOfCla) {
            case 1: timeList = timeListData.slice(0, 5); break;
            case 2: timeList = timeListData.slice(0, 4); break;
            case 3: timeList = timeListData.slice(0, 3); break;
          }
          break;
        case 2:
          switch (course.CorLenOfCla) {
            case 1: timeList = timeListData.slice(6, 11); break;
            case 2: timeList = timeListData.slice(6, 10); break;
            case 3: timeList = timeListData.slice(6, 9); break;
          }
          break;
        case 3:
          switch (course.CorLenOfCla) {
            case 1: timeList = timeListData.slice(12, 17); break;
            case 2: timeList = timeListData.slice(12, 16); break;
            case 3: timeList = timeListData.slice(12, 15); break;
          }
          break;
        case 4:
          switch (course.CorLenOfCla) {
            case 1: timeList = timeListData.slice(18, 23); break;
            case 2: timeList = timeListData.slice(18, 22); break;
            case 3: timeList = timeListData.slice(18, 21); break;
          }
          break;
      }
      weekTimeData[i].timeList = timeList
      weekTimeData[i].timeIndex = -1
      weekTimeData[i].startCourseTime = weekTimeData[i].startCourseTime || ''
    }
    this.setData({ weekTimeData })
  },
  initCourseTimeData() { //初始化上课时间段数据
    let weekTimeData = this.data.weekTimeData
    let isEn = wx.getStorageSync('isEn')
    for (let i = 0, len = weekTimeData.length; i < len; i++) {
      if (weekTimeData[i].TimDateTime) { //VIP课程
        let time = isEn ? $translate.translateTimeEn(weekTimeData[i].TimClaTime) : $translate.translateTime(weekTimeData[i].TimClaTime)
        weekTimeData[i].weekTime = `${weekTimeData[i].timeMD}/${time}`
      } else {//普通课程
        let week, time
        if (isEn) {
          week = $translate.translateWeekEn(weekTimeData[i].TimAfw);
          time = $translate.translateTimeEn(weekTimeData[i].TimClaTime);
        } else {
          week = $translate.translateWeek(weekTimeData[i].TimAfw);
          time = $translate.translateTime(weekTimeData[i].TimClaTime);
        }
        weekTimeData[i].weekTime = `${week}/${time}`
      }
    }
    this.data.weekTimeData = weekTimeData
  },
  bindStudentName(e) { //姓名
    this.setData({
      studentName: e.detail.value
    })
  },
  bindStudentPhone(e) { //手机
    this.setData({
      studentPhone: e.detail.value
    })
  },
  bindTimeChange(e) { //上课时间切换
    let index = +e.currentTarget.dataset.index
    let timeIndex = +e.detail.value
    let { timeListData, weekTimeData, course } = this.data
    let n = 0;
    for (let i = 0, len = timeListData.length; i < len; i++) {
      if (weekTimeData[index].timeList[timeIndex] === timeListData[i]) {
        n = i;
        break;
      }
    }
    let startCourseTime = `${weekTimeData[index].timeList[timeIndex]}-${timeListData[n + parseInt(course.CorLenOfCla) + 1]}`;
    const a = `weekTimeData[${index}].timeIndex`
    const b = `weekTimeData[${index}].startCourseTime`
    this.setData({ [a]: timeIndex, [b]: startCourseTime })
  },
  bindCourseAddress(e) { //上课地址
    this.data.courseAddress = e.detail.value
  },
  getUserInfo(e) { //获取用户头像等信息
    let userInfo = e.detail.userInfo;
    if (!userInfo) return;
    $common.getUserInfo(userInfo, this.submitOrder.bind(this));
  },
  submitOrder() { //提交订单
    if (!this.data.btnFalg) return;
    this.data.btnFalg = false;
    let { studentName, studentPhone, weekTimeData, courseAddress } = this.data
    let corStartTime = []
    let TimId = []
    let timeFlag = true
    for (let i = 0, len = weekTimeData.length; i < len; i++) {
      corStartTime.push(weekTimeData[i].startCourseTime)
      TimId.push(weekTimeData[i].TimId)
      if (!weekTimeData[i].startCourseTime) timeFlag = false
    }
    let isEn = wx.getStorageSync('isEn');
    if (studentName.trim().length <= 0) {
      if (isEn) {
        $common.showModal('Please fill in your name.', false, false, 'Ok', 'Reminder');
      } else {
        $common.showModal('请输入姓名');
      }
      this.data.btnFalg = true;
      return;
    }
    if (!$common.phoneReg.test(studentPhone)) {
      if (isEn) {
        $common.showModal('Please fill in the correct phone number.', false, false, 'Ok', 'Reminder');
      } else {
        $common.showModal('请输入正确的手机号');
      }
      this.data.btnFalg = true;
      return;
    }
    if (!timeFlag) {
      if (isEn) {
        $common.showModal('Please select time slot.', false, false, 'Ok', 'Reminder');
      } else {
        $common.showModal('请选择上课时间');
      }
      this.data.btnFalg = true;
      return;
    }
    if (!this.data.isCheck) {
      if (isEn) {
        $common.showModal('Please read and agree to "The FirstTutor service agreement"', false, false, 'Ok', 'Reminder');
      } else {
        $common.showModal('请阅读并同意《FirstTutor服务协议》');
      }
      this.data.btnFalg = true;
      return;
    }
    let { orderType, course, cogId, groupType, PayPrice } = this.data
    $common.request('POST', $common.config.PlaceAnOrder,
      {
        openId: wx.getStorageSync('openid'),
        courId: course.CorId, //购买课程ID
        cogMemNum: orderType == 2 ? 1 : course.CorType, //可参团人数（一对一与单独购买为1，团购时为2/3）
        TimId,
        pName: studentName, //姓名
        pPhone: studentPhone, //手机
        corStartTime, //上课时间
        corAddress: courseAddress || '线下协商', //上课地址(默认线下协商)
        payPrice: PayPrice, //支付金额
        orderType, //订单类型类型：1. 团购  2. 单独购
        groupType, //团类型：1. 开团  2. 参团， 当orderType为1时必填
        cogId,// 团ID：当groupType为2时必填
      },
      (res) => {
        if (res.data.res) {
          let cogId = res.data.cogId
          let paras = res.data.paras;
          wx.requestPayment({
            'timeStamp': paras.timeStamp,
            'nonceStr': paras.nonceStr,
            'package': paras.package,
            'signType': 'MD5',
            'paySign': paras.paySign,
            'success': (res) => { //支付成功
              /*
              单买: 跳转订单详情
              拼团: 跳转拼团页
               */
              let pagePath = ''; //用户收到的模板消息链接
              if (orderType == 1) {//订单类型类型：1. 团购  2. 单独购
                pagePath = 'pages/Home/SpellGroup/index?cogId=' + cogId[0];
              } else if (orderType == 2) {
                pagePath = 'pages/New/orderDetailsS/index?cogId=' + cogId[0];
              }
              //发送模板消息
              $common.request('POST', $common.config.PayMentSuccess,
                { cogId, openId: wx.getStorageSync('openid'), pagePath },
                (res) => {
                  wx.redirectTo({
                    url: '../BuySuccess/index?orderType=' + orderType + '&cogId=' + cogId[0] + '&groupType=' + groupType,
                  })
                },
                (res) => { },
                (res) => { this.data.btnFalg = true },
              )
            },
            'fail': (res) => { //支付失败
              $common.request('POST', $common.config.AttendGroupFailed,
                { cogId, openId: wx.getStorageSync('openid') },
                (res) => { },
                (res) => { },
                (res) => { this.data.btnFalg = true },
              )
            }
          })
        } else {
          this.data.btnFalg = true;
          let isEn = wx.getStorageSync('isEn');
          switch (res.data.errType) {
            case 3:
              if (isEn) {
                $common.showModal('It\'s been preempted by others.', false, false, 'Ok', 'Reminder');
              } else {
                $common.showModal('该课程该时间段已被他人抢占先机啦~');
              }
              break;
            case 7:
              if (isEn) {
                $common.showModal('The group is over.', false, false, 'Ok', 'Reminder');
              } else {
                $common.showModal('该团已经结束');
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
        let isEn = wx.getStorageSync('isEn');
        if (isEn) {
          $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
        } else {
          $common.showModal('未知错误');
        }
        this.data.btnFalg = true;
      },
      (res) => { }
    );
  },
  getNameAndPhone() { //获取姓名和手机号
    $common.request('POST', $common.config.GetUserNamePhone,
      { openId: wx.getStorageSync('openid') },
      (res) => {
        if (res.data.res) {
          let data = res.data.nameP;
          this.setData({ studentName: data[0], studentPhone: data[1], courseAddress: data[2] || '' })
        }
      }
    )
  },
  getOrderInfo() { //获取订单信息
    let isEn = wx.getStorageSync('isEn');
    wx.showLoading({ title: isEn ? 'Loading...' : '努力加载中...' })
    let { corId, orderType, groupType, cogId } = this.data
    $common.request("POST", $common.config.GetOrderInfos,
      { corId, orderType, groupType, cogId },
      (res) => {
        if (res.data.res) {
          let course = res.data.course;
          course.CorPrice = course.CorPrice.toFixed(2) < 0.01 ? 0.01 : course.CorPrice.toFixed(2);
          switch (course.CorLenOfCla) {
            case 1: course.courseTimeLong = 1; break
            case 2: course.courseTimeLong = 1.5; break
            case 3: course.courseTimeLong = 2; break
          }
          if (res.data.corOpenG) { //参团信息
            let corOpenG = res.data.corOpenG;
            let weekArr = corOpenG.TimeFie;
            let isEn = wx.getStorageSync('isEn');
            let week = ''
            if (course.CorIsVipCourses) { //vip课程
              week = weekArr[2]
            } else {
              week = isEn ? $translate.translateWeekEn(weekArr[0]) : $translate.translateWeek(weekArr[0])
            }
            let time = isEn ? $translate.translateTimeEn(weekArr[1]) : $translate.translateTime(weekArr[1])
            this.setData({
              weekTimeData: [{
                TimId: corOpenG.TimId,
                weekTime: `${week}/${time}`,
                startCourseTime: corOpenG.TimeStart,
                courseAddress: corOpenG.Address
              }]
            })
          }
          let PayPrice = 0.01
          if (course.CorIsVipCourses) { //vip课程
            let { weekTimeData } = this.data
            let CorType = course.CorType // 课程类型（1 一对一 2 一对二 3 一对三）
            if (CorType === 1) { //可以多选
              PayPrice = (course.CorPrice * 100 * (weekTimeData.length || 1) / 100).toFixed(2)
            } else {
              PayPrice = course.CorPrice
            }
          } else { //非vip课程
            PayPrice = res.data.PayPrice.toFixed(2) < 0.01 ? 0.01 : res.data.PayPrice.toFixed(2)
          }
          let teacher = res.data.teacher;
          // teacher.TeaName = teacher.TeaNickName
          this.setData({ PayPrice, course, teacher, isPage: true })
          this.initCourseTimeLong();
        } else {
          if (isEn) {
            $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
          } else {
            $common.showModal('未知错误 ');
          }
        }
      },
      (res) => {
        if (isEn) {
          $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
        } else {
          $common.showModal('未知错误 ');
        }
      },
      (res) => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      }
    )
  },
  getOpenCallback() {
    this.getNameAndPhone();
    this.getOrderInfo();
    $common.studentRegister();
  },
  init() {
    let openid = wx.getStorageSync('openid')
    if (!openid) return $common.getOpenid(this.getOpenCallback.bind(this))
    this.getNameAndPhone()
    this.getOrderInfo()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { cogId, corId, groupType, orderType, weekTime, manyTime } = options
    weekTime = weekTime ? JSON.parse(weekTime) : []
    this.setData({ cogId, corId, groupType, orderType, weekTimeData: weekTime, manyTime: manyTime || 0 })
    if (weekTime.length > 0) this.initCourseTimeData() //初始化上课时间段
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.isEnEvent();
    this.init();
  },
  isEnEvent(res) { //判断当前显示中英文
    let isEn = wx.getStorageSync('isEn')
    this.setData({ isEn })
    wx.setNavigationBarTitle({ title: isEn ? 'Make sure the order' : '确认订单' })
  },
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
    return $common.share()
  }
})
