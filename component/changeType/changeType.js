/**
 * auther: guo
 * date: 2018-4-24
 * use: 全局切换中英文
 */
const $common = require('../../utils/common.js');
Component({
  properties: {
    isEn: {
      type: Boolean
    }
  },
  data: {
    // isEn: wx.getStorageSync('isEn'),
    falg: true,
  },
  methods: {
    userInfo(res) { //获取个人信息
      let userInfo = res.detail.userInfo;
      if (!userInfo) return;
      let falg = this.data.falg;
      if (!falg) return; //阻止连点
      this.data.falg = false;
      let openid = wx.getStorageSync('openid');
      if (!openid) { //没有openid
        $common.getOpenid($common.getUserInfo.bind(this, userInfo, this.stuOrTea.bind(this)));
      } else { //有openid
        $common.getUserInfo(userInfo, this.stuOrTea.bind(this));
      }
    },
    stuOrTea() { //判断是切换为老师或学生
      let isEn = this.data.isEn;
      if (!isEn) { //现处学生状态，需要切换为外教
        this.getForTeaStatus();
      } else { //现处外教状态，需要切换为学生
        this.changeType(1, this.changeSuccess.bind(this));
      }
    },
    changeSuccess() { //切换成功后执行的函数
      let isEn = this.data.isEn;
      this.setData({
        isEn: !isEn
      })
      this.changeTabBar();
      wx.setStorageSync('isEn', !isEn);
      this.triggerEvent('isEnEvent', null);
      this.data.falg = true;
    },
    changeTabBar() { //切换底部文字
      let isEn = this.data.isEn;
      if (!isEn) { //显示中文
        wx.setTabBarItem({
          index: 0,
          text: '首页',
        });
        wx.setTabBarItem({
          index: 1,
          text: '找外教',
        });
        wx.setTabBarItem({
          index: 2,
          text: '活动',
        })
        wx.setTabBarItem({
          index: 3,
          text: '打卡',
        })
        wx.setTabBarItem({
          index: 4,
          text: '我',
        })
      } else { //显示英文
        wx.setTabBarItem({
          index: 0,
          text: 'Home',
        });
        wx.setTabBarItem({
          index: 1,
          text: 'Find Student',
        });
        wx.setTabBarItem({
          index: 2,
          text: 'Activity',
        })
        wx.setTabBarItem({
          index: 3,
          text: 'Clock in',
        })
        wx.setTabBarItem({
          index: 4,
          text: 'Me',
        })
      }
    },
    getForTeaStatus() { //获取外教信息
      $common.request(
        'POST',
        $common.config.GetForTeaStatus, {
          openId: wx.getStorageSync('openid')
        },
        (res) => {
          if (res.data.res) {
            wx.setStorageSync("teacherStatusInfo", res.data);
            let teaId = res.data.teaId;
            if (teaId == 0) { //该用户尚未注册为外教
              this.data.falg = true;
              wx.navigateTo({
                url: '/pages/me/register/register',
              })
            } else { //该用户注册过外教
              let teaBeDel = res.data.teaBeDel;
              if (teaBeDel == 1) { //该用户已被删除，重新注册
                this.data.falg = true;
                wx.navigateTo({
                  url: '/pages/me/register/register',
                })
              } else { //该用户未被删除
                let teaFirstReaCourse = res.data.TeaFirstReaCourse;
                if (teaFirstReaCourse == 0 && res.data.teaToe == 0) { //没有发布过课程，去注册成功页面
                  this.data.falg = true;
                  wx.navigateTo({
                    url: '/pages/me/registerSuccess/registerSuccess',
                  })
                } else { //用户有发布过课程，切换为外教
                  this.changeType(2, this.changeSuccess.bind(this));
                }
              }
            }
          } else {
            $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
            this.data.falg = true;
          }
        },
        (res) => {
          $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
          this.data.falg = true;
        }
      )
    },
    changeType(userType, callback) { //切换状态
      $common.request(
        'POST',
        $common.config.ChangeUserType, {
          openId: wx.getStorageSync('openid'),
          userType: userType
        },
        (res) => {
          if (res.data.res) {
            callback();
          } else {
            if (userType === 1) {
              $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
            } else if (userType === 2) {
              $common.showModal('未知错误');
            }
            this.data.falg = true;
          }
        },
        (res) => {
          if (userType === 1) {
            $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
          } else if (userType === 2) {
            $common.showModal('未知错误');
          }
          this.data.falg = true;
        }
      )
    },
  },
  attached() {
    this.setData({
      isEn: wx.getStorageSync('isEn')
    })
    this.changeTabBar();
  },
})