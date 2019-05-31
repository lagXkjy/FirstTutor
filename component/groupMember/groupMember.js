/**
 * auther: guo
 * date: 2018-4-27
 * use: 团成员信息展示
 */
const $common = require('../../utils/common.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    memberInfo: {
      type: Object,
      value: {
        OdrName: '我饿容我耳',
        UserAvaUrl: "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJ6KgwJjhMHT3Qgnk3LmiaHict98bE5Ad1MIhNSDiauB8034UBUgEaiaiaIXnKeUicKkosfOQ22SPgVASzA/0",
        OdrPhone: "13262453221"
      }
    },
    isHead: {
      type: Boolean,
      value: true
    },
    isChat: {
      type: Boolean,
      value: false
    }
  },
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    callPhone() { //打电话
      let phone = this.data.memberInfo.OdrPhone;
      wx.makePhoneCall({
        phoneNumber: phone
      })
    },
    getUserInfo(e) {
      let userInfo = e.detail.userInfo;
      if (!userInfo) return;
      $common.getUserInfo(userInfo, $common.stuRegister.bind($common, this.callChat.bind(this)));
    },
    callChat() { //在线沟通
      let userId = this.data.memberInfo.UserId;
      wx.navigateTo({
        url: `/pages/New/onlineChart/index?userId=${userId}`,
      })
    },
  },
  attached() {
    this.setData({
      isEn: wx.getStorageSync('isEn')
    })
  }
})