// 订单详情，学生
const $common = require('../../../utils/common.js');
const translate = require('../../../utils/translate.js');
Page({
  data: {
    srcForIdPhoto: $common.srcForIdPhoto,
    cog: {}, //团信息
    course: {}, //课程信息
    mem: {}, //团成员信息
    teacher: {}, //外教信息
    showMem: {}, //当前页面显示成员信息
    teaAddress: '', //外教地址
    teaPhone: '', //外教联系方式
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
  init() {
    let isEn = wx.getStorageSync('isEn');
    wx.showLoading({ title: isEn ? 'Loading...' : '努力加载中...' })
    $common.request("POST", $common.config.LookUpFigroupInfo,
      { cogId: this.data.cogId, openId: wx.getStorageSync('openid') },
      (res) => {
        if (res.data.res) {
          let course = res.data.course;
          switch (course.CorLenOfCla) {
            case 1: course.courseTimeLong = 1; break;
            case 2: course.courseTimeLong = 1.5; break;
            case 3: course.courseTimeLong = 2; break;
          }
          let cog = res.data.cog;
          let mem = res.data.mem;
          let showMem;
          for (let i = 0, len = mem.length; i < len; i++) {
            if (mem[i].ViewOrder) {
              showMem = mem[i];
            }
          }
          showMem.orderTime = this.timeStamp(showMem.OdrCreateOn);//下单时间;
          showMem.buyTime = this.timeStamp(showMem.OdrBuyDate); //支付时间
          showMem.groupSuccessTime = this.timeStamp(showMem.OdrFgtSuccessTime);//拼团成功时间
          let TimStr = showMem.TimStr;
          let timeStr = ''
          if (course.CorIsVipCourses === 1) { //vip课程
            if (isEn) {
              timeStr = `${TimStr[2]}/${translate.translateTimeEn(TimStr[1])}`;
            } else {
              timeStr = `${TimStr[2]}/${translate.translateTime(TimStr[1])}`;
            }
          } else { //非vip课程
            if (isEn) {
              timeStr = `${translate.translateWeekEn(TimStr[0])}/${translate.translateTimeEn(TimStr[1])}`;
            } else {
              timeStr = `${translate.translateWeek(TimStr[0])}/${translate.translateTime(TimStr[1])}`;
            }
          }
          showMem.timeStr = timeStr
          course.CorPrice = course.CorPrice.toFixed(2) < 0.01 ? 0.01 : course.CorPrice.toFixed(2);
          let teacher = res.data.teacher;
          // teacher.TeaName = teacher.TeaNickName;
          this.setData({ course, teacher: res.data.teacher, cog, mem, showMem })
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
  deleteOrder() { //删除订单
    let isEn = wx.getStorageSync('isEn');
    $common.request(
      'POST',
      $common.config.DeleteOgoById,
      {
        odrId: this.data.showMem.OdrId
      },
      (res) => {
        if (res.data.res) {
          let text = isEn ? 'Delete the success' : '删除成功';
          $common.showModal(text, false, (res) => {
            if (res.confirm) {
              wx.redirectTo({
                url: '../../Home/teachersInformation/index?data=' + this.data.teacher.TeaId,
              })
            }
          });
        } else {
          if (isEn) {
            $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
          } else {
            $common.showModal('未知错误');
          }
        }
      },
      (res) => {

      },
      (res) => {
      }
    )
  },
  timeStamp(time) { //时间戳转换为日期
    let str1 = time.replace("/Date(", ''),
      thisTime = str1.replace(')/', '');
    let date = new Date(parseInt(thisTime)),
      y = date.getFullYear(),
      m = date.getMonth() + 1,
      d = date.getDate(),
      h = date.getHours(),
      f = date.getMinutes();
    m < 10 && (m = '0' + m);
    d < 10 && (d = '0' + d);
    h < 10 && (h = '0' + h);
    f < 10 && (f = '0' + f);
    return `${y}-${m}-${d} ${h}:${f}`;
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ cogId: options.cogId })
    $common.getOpenid(this.init)
    this.getTeacherPhone();
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
      text = 'Order Details';
    } else {
      text = '订单详情';
    }
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