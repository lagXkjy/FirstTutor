// pages/Home/CourseInformation/index.js
const $common = require('../../../utils/common.js');
Page({
  data: {
    srcForIdPhoto: $common.srcForIdPhoto,
    isPage: false, //页面是否显示
    FgtType: 1, //1 拼团 2 单独购买
    courId: null, //课程id
    teaId: null, //教师id
    tea: {}, //教师信息列表
    course: {}, //课程信息
    timeTables: [], //选择上课时间列表
    weekList: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    timeList: [], // 页面展示上课时间表
    fgtList: {}, //推荐
    orderBeDel: 0, //1 订单已删除  0 未删除
    vipPayPrice: {  //VIP底部显示的金额
      one: '0.00', //一对一
      many: '0.00' //一对多
    }
  },
  getUserInfo(e) {
    let userInfo = e.detail.userInfo;
    if (!userInfo) return;
    $common.getUserInfo(userInfo, $common.stuRegister.bind($common, this.onlineChart.bind(this)));
  },
  onlineChart() { //立即沟通
    let TeaUserId = this.data.tea.TeaUserId;
    wx.navigateTo({
      url: `/pages/New/onlineChart/index?userId=${TeaUserId}&returnPage=2`,
    })
  },
  SonTime(e) { //子组件选择时间触发该事件
    let timeList = e.detail.timeList
    this.data.timeList = timeList
    const { CorType, CorIsVipCourses, CorPrice } = this.data.course
    if (CorIsVipCourses === 1 && CorType === 1) { //VIP课程,一对一，可以多选，需要实时变化提交金额
      this.setData({ ['vipPayPrice.one']: (CorPrice * (timeList.length || 1)).toFixed(2) })
    }
  },
  orderDetail() { //查看购买详情
    let orderBeDel = parseInt(this.data.orderBeDel);
    if (orderBeDel === 1) {
      if (this.data.isEn) {
        $common.showModal('The order has been deleted.', false, false, 'Ok', 'Reminder');
      } else {
        $common.showModal('订单已删除');
      }
      return;
    }
    if (this.data.FgtType == 2) { //1 拼团 2 单独购买
      wx.navigateTo({
        url: '../../New/orderDetailsS/index?cogId=' + this.data.course.BeBuyCour,
      })
    } else {
      wx.navigateTo({
        url: '/pages/Home/SpellGroup/index?cogId=' + this.data.course.BeBuyCour,
      })
    }
  },
  judgeOk(orderType, groupType, manyTime) {
    let { course, timeList } = this.data
    let thisData = []
    for (let i = 0, len = timeList.length; i < len; i++) {
      if (timeList[i].timeType === 2) {
        thisData.push({
          index: i,
          time: timeList[i].timeName,
          TimId: timeList[i].TimId,
          TimAfw: timeList[i].TimAfw, //周几
          TimClaTime: timeList[i].TimClaTime,
          TimDateTime: timeList[i].TimDateTime,
          timeMD: timeList[i].timeMD
        })
      }
    }
    const { isEn } = this.data
    if (thisData.length <= 0) {
      if (isEn) {
        $common.showModal('Please select time slot.', false, false, 'Ok', 'Reminder')
      } else {
        $common.showModal('请选择时间段')
      }
      return
    }
    new Promise((resolve, reject) => {
      if (isEn) {
        $common.showModal('Please confirm whether you have fully communicated with the teacher about this course and order.', true, (res) => {
          resolve(res)
        }, 'Yes', 'Reminder', 'No');
      } else {
        $common.showModal('请确认是否与老师对本次课程与订单进行了充分沟通', true, (res) => {
          resolve(res)
        }, '是', '提示', '否');
      }
    })
      .then((res) => {
        if (res.confirm) {
          wx.navigateTo({ url: `../sureOrder/index?corId=${course.CorId}&cogId=-1&weekTime=${JSON.stringify(thisData)}&orderType=${orderType}&groupType=${groupType}&manyTime=${manyTime}` })
        }
      })
  },
  sureOrder() { //立即购买
    this.judgeOk(2, -1, this.data.course.CorIsVipCourses === 1 ? 1 : 0)
    // '../sureOrder/index?orderType=' + 2 + '&corId=' + course.CorId + '&groupType=' + -1 + '&cogId=' + -1 + '&weekTime=' + JSON.stringify(thisData)
    // url: '../sureOrder/index?corId=' + course.CorId + '&orderType=' + 2 + '&groupType=' + -1 + '&cogId=' + -1 + '&weekTime=' + JSON.stringify(thisData),
    // url: '../sureOrder/index?corId=' + course.CorId + '&orderType=' + 1 + '&groupType=' + 1 + '&cogId=' + -1 + '&weekTime=' + JSON.stringify(thisData),
  },
  alonePayment() { //单独购买
    this.judgeOk(2, -1, 0)
  },
  fightGroup() { //多人拼团
    this.judgeOk(1, 1, 0)
  },
  spellingRules() { //详细规则
    wx.navigateTo({ url: '/pages/static/SpellingRules/index' })
  },
  goHome() { //首页
    wx.switchTab({ url: '../Home/index' })
  },
  goJoinGroup(e) { //去参团
    let course = this.data.course;
    let fgtList = this.data.fgtList;
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../sureOrder/index?corId=' + course.CorId + '&orderType=' + 1 + '&groupType=' + 2 + '&cogId=' + fgtList[index].FgtId,
    })
  },
  getOpenCallback() {
    this.getCourseAndTeacherInfo();
    $common.studentRegister();
  },
  getCourseAndTeacherInfo() { //获取课程和教师信息
    const openId = wx.getStorageSync('openid')
    let { courId, teaId } = this.data
    if (!wx.getStorageSync('openid')) return $common.getOpenid(this.getOpenCallback.bind(this));
    wx.showLoading({ title: this.data.isEn ? 'Loading...' : '努力加载中...' })
    $common.request("POST", $common.config.GetCourseInfo, { courId, teaId, openId },
      (res) => {
        if (res.data.res) {
          let course = res.data.course;
          course.paymentPrice = 0; //单人购买需支付的价格
          course.paymentPriceS = 0; //拼团购买需支付的价格
          switch (course.CorLenOfCla) {
            case 1:
              course.courseTimeLong = 1; //1小时
              break;
            case 2:
              course.courseTimeLong = 1.5; //1.5小时
              break;
            case 3:
              course.courseTimeLong = 2; //2小时
              break;
          }
          course.CorBuyPrice = course.CorBuyPrice.toFixed(2) < 0.01 ? 0.01 : course.CorBuyPrice.toFixed(2); //保留两位小数
          course.CorPrice = course.CorPrice.toFixed(2) < 0.01 ? 0.01 : course.CorPrice.toFixed(2);
          course.CorGroupPrice = course.CorGroupPrice.toFixed(2) < 0.01 ? 0.01 : course.CorGroupPrice.toFixed(2);
          let tea = res.data.tea;
          // tea.TeaName = tea.TeaName ? tea.TeaName : tea.TeaNickName;
          // let num = course.CorPrice / 2 < 0.01 ? 0.01 : course.CorPrice / 2
          let one = 0
          let many = 0
          if (course.CorType === 1) { //一对一
            one = course.CorPrice
          } else { //一对多
            one = (course.CorPrice * course.CorType).toFixed(2)
            many = course.CorPrice
          }
          this.setData({
            course: course,
            tea: tea,
            orderBeDel: res.data.orderBeDel,
            FgtType: res.data.FgtType,
            isPage: true,
            vipPayPrice: { one, many }
          })
          if (course.CorType != 1) { //一对多页面
            $common.request("POST", $common.config.GetCorGroupInfos, { StuOpId: wx.getStorageSync('openid'), corId: this.data.courId, },
              (res) => {
                if (res.data.res) {
                  let data = res.data.fgtList;
                  if (data.length <= 0) return;
                  for (let i = 0, len = data.length; i < len; i++) {
                    data[i].countDown = this.timeStamp(data[i].FgtEndTime);
                  }
                  this.setData({ fgtList: data })
                }
              },
              (res) => { },
              (res) => { }
            )
          }
        } else {
          if (wx.getStorageSync('isEn')) {
            $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
          } else {
            $common.showModal('未知错误，请稍后重试');
          }
        }
      },
      (res) => {
        if (wx.getStorageSync('isEn')) {
          $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
        } else {
          $common.showModal('未知错误，请稍后重试');
        }
      },
      (res) => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      }
    );
  },
  timeStamp(time) { //时间戳转换为日期
    time = time.replace('/Date(', '').replace(')/', '');
    let date = new Date(parseInt(time)),
      y = date.getFullYear(),
      m = date.getMonth() + 1,
      d = date.getDate(),
      h = date.getHours(),
      f = date.getMinutes();
    m < 10 && (m = '0' + m);
    d < 10 && (d = '0' + d);
    h < 10 && (h = '0' + h);
    f < 10 && (f = '0' + f);
    return `${m}-${d} ${h}:${f}`;
  },
  getCourTime() { //根据课程ID获取课程的上课时间
    $common.request(
      "POST",
      $common.config.GetTimeTableInfos, {
        courId: this.data.courId,
        teaId: this.data.teaId
      },
      (res) => {
        if (res.data.res) {
          this.setData({
            timeTables: res.data.timeTables
          });
          // this.updateTimeList();
        } else {
          if (wx.getStorageSync('isEn')) {
            $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
          } else {
            $common.showModal('未知错误，请稍后重试');
          }
        }
      },
      (res) => {
        if (wx.getStorageSync('isEn')) {
          $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
        } else {
          $common.showModal('未知错误，请稍后重试');
        }
      },
      (res) => { }
    );
  },
  init() {
    this.getCourseAndTeacherInfo();
    this.getCourTime();
  },
  onLoad: function (options) {
    let courId = options.courId,
      teaId = options.teaId;
    this.setData({
      courId: courId,
      teaId: teaId
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
    let text = '';
    if (isEn) {
      text = 'Course information';
    } else {
      text = '课程信息';
    }
    wx.setNavigationBarTitle({
      title: text
    })
  },
  onShow: function () {
    this.isEnEvent();
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