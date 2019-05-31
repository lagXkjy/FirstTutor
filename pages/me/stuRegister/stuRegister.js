const $common = require('../../../utils/common.js');
const app = getApp();
Page({
  data: {
    userName: '', //姓名
    phone: '', //手机号
    sexData: [{
      id: 0,
      text: '女'
    }, {
      id: 1,
      text: '男'
    }],
    sexIndex: 0,
    age: 0, // 年龄
    countList: [], //区域
    countIndex: [0, 0],
    areaCache: { //所有城市的缓存
      "-1": [{
        AiId: -1,
        AiName: '不限'
      }]
    },
    areaStop: null, //区域切换，函数防抖
    flag: true, //节流
    wechat: '', //微信号
    englishLevel: require('../../../utils/static.js').englishLevel,
    englishLevelIndex: 0
  },
  bindName(e) { //姓名
    this.data.userName = e.detail.value;
  },
  bindPhone(e) { //手机号
    this.data.phone = e.detail.value;
  },
  bindSexChange(e) { //性别
    this.setData({
      sexIndex: +e.detail.value
    })
  },
  bindAge(e) { //年龄
    this.data.age = e.detail.value;
  },
  bindWechat(e) { //微信号
    this.data.wechat = e.detail.value;
  },
  bindEnglishLevel(e) { //英文水平
    this.setData({ englishLevelIndex: +e.detail.value })
  },
  changeColumn(e) { //区域某一列变化
    let num = e.detail.column;
    let value = e.detail.value;
    if (num === 0) { //城市切换
      clearTimeout(this.data.areaStop);
      let countList = this.data.countList;
      countList[1] = [];
      this.setData({
        countList: countList,
        countIndex: [value, 0]
      })
      this.data.areaStop = setTimeout(() => {
        this.getAreaList();
      }, 500);
    } else { //区域切换
      let countIndex = this.data.countIndex;
      countIndex[1] = value;
      this.setData({
        countIndex: countIndex
      });
    }
  },
  getAreaList() { //获取该城市的所有区
    let vm = this.data;
    let id = vm.countList[0][vm.countIndex[0]].CanId; //当前城市id
    let areaCache = this.data.areaCache;
    if (areaCache[id]) { //缓存里有该城市区域信息
      let countList = vm.countList;
      countList[1] = areaCache[id];
      this.setData({
        countList: countList
      });
      return;
    }
    $common.request(
      'POST',
      $common.config.GetAreaInfos, {
        canId: id
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.data;
          areaCache[id] = data;
          this.data.areaCache = areaCache;
          let countList = vm.countList;
          countList[1] = data;
          this.setData({
            countList: countList
          });
          if (vm.isRegister && !vm.isFirst) { //修改
            vm.isFirst = true;
            let AsAiId = vm.AsAiId;
            let countIndex = vm.countIndex;
            for (let i = 0, len = data.length; i < len; i++) {
              if (data[i].AiId === AsAiId) {
                countIndex[1] = i;
              }
            }
            this.setData({
              countIndex: countIndex
            })
          }
        } else { }
      },
      (res) => { },
      (res) => { }
    )
  },
  init() {
    $common.request( //获取所有的城市
      'POST',
      $common.config.GetCityInfos,
      null,
      (res) => {
        if (res.data.res) {
          let data = res.data.data;
          let vm = this.data;
          for (let i = 0, len = data.length; i < len; i++) {
            data[i].AiName = data[i].CanCityName;
            if (vm.isRegister && vm.AsCanId == data[i].CanId) { //修改信息
              this.setData({
                countIndex: [i, 0]
              })
            }
          }
          this.setData({
            countList: [data, []]
          });
          this.getAreaList();
        } else { }
      },
      (res) => {
        this.init();
      },
      (res) => { }
    );
  },
  stuTemplateMessage() { //模板消息
    wx.navigateTo({
      url: '/pages/me/stuTemplateMessage/stuTemplateMessage',
    })
  },
  getOpenId() {
    let vm = this.data;
    if (!vm.flag) return;
    vm.flag = false;
    let userName = vm.userName;
    if (userName.trim().length <= 0) {
      $common.showModal('请填写姓名');
      vm.flag = true;
      return;
    }
    let phone = vm.phone;
    if (!$common.phoneReg.test(phone)) {
      $common.showModal('请填写正确的手机号');
      vm.flag = true;
      return;
    }
    let age = +vm.age;
    if (age <= 0) {
      $common.showModal('请填写正确的年龄');
      vm.flag = true;
      return;
    }
    let wechat = vm.wechat;
    if (wechat.trim().length <= 0) {
      $common.showModal('请填写微信号');
      vm.flag = true;
      return;
    }
    $common.getOpenid(this.submit.bind(this));
  },
  submit() {
    let vm = this.data;
    let userName = vm.userName;
    let phone = vm.phone;
    let age = +vm.age;
    let countList = vm.countList;
    let countIndex = vm.countIndex;
    let asInfo = {
      AsCanId: countList[0][countIndex[0]].CanId,
      AsAiId: countList[1][countIndex[1]].AiId,
    }
    let sexData = vm.sexData;
    let sexIndex = vm.sexIndex;
    let stuG = sexData[sexIndex].id;
    let wechat = vm.wechat;
    let { englishLevel, englishLevelIndex } = this.data
    $common.loading();
    $common.request(
      'POST', //isRegister == true   修改个人信息
      vm.isRegister ? $common.config.PutStuInfo : $common.config.StuRegis, {
        openId: wx.getStorageSync('openid'),
        asInfo: asInfo,
        stuP: phone,
        stuN: userName,
        stuG: stuG,
        stuA: age,
        wc: wechat,
        card: vm.card,  //由打卡的时候过来注册的
        StuEnglishLevel: englishLevel[englishLevelIndex].en
      },
      (res) => {
        if (res.data.res) { //注册或修改成功
          app.scene = 1001; //恢复场景值
          if (this.data.jumpUrl) { //需要跳转到，1 打卡详情页，或者 2 打卡日记页
            let options = this.data.jumpType === 1 ? 'ThemeId' : 'JournalID';
            wx.redirectTo({
              url: `${this.data.jumpUrl}?${options}=${this.data.jumpId}`
            })
          } else {
            if (vm.card && !vm.isRegister) { //由打卡过来，并且是注册成功
              wx.redirectTo({
                url: `/pages/clockIn/details/details?ActivityID=${vm.ActivityID}&isAdministrator=${vm.isAdministrator}`
              })
            } else {
              wx.navigateBack({
                delta: 1
              });
            }
          }
        } else {
          $common.showModal('未知错误');
        }
      },
      (res) => {
        $common.showModal('网络不给力，请稍后重试');
      },
      (res) => {
        vm.flag = true;
        wx.hideLoading();
      }
    )
  },
  checkIsRegister() { //查看学生是否注册过
    $common.request(
      'POST',
      $common.config.GetStuRegis, {
        openId: wx.getStorageSync('openid')
      },
      (res) => {
        if (res.data.res) {
          let register = +res.data.regis;
          if (register === 0) { //未注册
            this.init();
          } else { //已注册
            wx.setNavigationBarTitle({
              title: '个人信息'
            });
            this.setData({
              isRegister: true
            })
            this.getRegisterInfo();
          }
        } else {
          $common.showModal('未知错误，请稍后重试');
        }
      },
      (res) => {
        $common.showModal('网络不给力，请稍后重试');
      },
      (res) => {

      }
    )
  },
  getRegisterInfo() { //获取学生的注册信息
    $common.request(
      'POST',
      $common.config.GetStuInfo, {
        openId: wx.getStorageSync('openid')
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.stuInfo;
          let { englishLevel } = this.data
          let englishLevelIndex = 0
          for (let i = 0, len = englishLevel.length; i < len; i++) {
            if (data.StuEnglishLevel === englishLevel[i].en) {
              englishLevelIndex = i
              break
            }
          }
          this.setData({
            age: data.StuA,
            userName: data.StuN,
            phone: data.StuP,
            sexIndex: data.StuG,
            wechat: data.StuWc,
            englishLevelIndex
          });
          this.data.AsCanId = data.AreaSel.AsCanId;
          this.data.AsAiId = data.AreaSel.AsAiId;
          this.init();
        } else {
          $common.showModal('未知错误，请稍后重试');
        }
      },
      (res) => {
        $common.showModal('网络不给力，请稍后重试');
      },
      (res) => {

      }
    )
  },
  onLoad: function (options) {
    this.data.jumpUrl = options.jumpUrl || false;
    this.data.jumpId = options.jumpId || false;
    this.data.jumpType = +options.jumpType || 0;
    this.setData({
      card: options.card || options.jumpUrl ? 1 : 0 //1 由打卡过来注册的，0 随便
    });
    this.data.ActivityID = options.ActivityID;  //跳转到打卡主题详情所需
    this.data.isAdministrator = options.isAdministrator;

    this.checkIsRegister();
  },
  onReady: function () { },
  onShow: function () { },

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