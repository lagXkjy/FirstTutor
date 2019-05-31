const $common = require('../../../utils/common.js');
const app = getApp();
Page({
  data: {
    userName: '', //姓名
    phone: '', //手机号
    sexData: [{ id: 0, zh: '女', en: 'woman' }, { id: 1, zh: '男', en: 'man' }],
    sexIndex: 0,
    age: 0, // 年龄
    countData: {}, //区域
    areaCache: {}, //城市
    wechat: '', //微信号
    englishLevel: require('../../../utils/static.js').englishLevel,
    englishLevelIndex: 0
  },
  setEn() { //设置引文版
    let isEn = wx.getStorageSync('isEn')
    if (isEn) {
      let { areaCache, countData } = this.data
      $common.translate(`${areaCache.zh}\n${countData.zh}`, (res) => {
        if (res.data.error_code) { //报错，用原文
          areaCache.en = areaCache.zh
          countData.en = countData.zh
        } else {
          let data = res.data.trans_result
          areaCache.en = data[0].dst
          countData.en = data[1].dst
          if (areaCache.id === 1) { // 用的一
            const areaShanghaiEn = require('../../../utils/static.js').areaShanghaiEn
            for (let i = 0, len = areaShanghaiEn.length; i < len; i++) {
              if (areaShanghaiEn[i].id === countData.id) {
                countData.en = areaShanghaiEn[i].area
                break
              }
            }
          }
        }
        this.setData({ areaCache, countData })
      })
    }
  },
  getAreaList() { //获取该城市的所有区
    let { areaCache, countData } = this.data
    $common.request('POST', $common.config.GetAreaInfos, { canId: areaCache.id },
      (res) => {
        if (res.data.res) {
          let data = res.data.data;
          for (let i = 0, len = data.length; i < len; i++) {
            if (countData.id === data[i].AiId) {
              countData.zh = data[i].AiName
              break
            }
          }
          this.setData({ countData })
          this.setEn()
        } else { }
      },
      (res) => { },
      (res) => { }
    )
  },
  getCityInfo() {    //获取所有的城市
    $common.request('POST', $common.config.GetCityInfos, null,
      (res) => {
        if (res.data.res) {
          let data = res.data.data;
          let { areaCache } = this.data
          for (let i = 0, len = data.length; i < len; i++) {
            if (areaCache.id === data[i].CanId) {
              areaCache.zh = data[i].CanCityName
              break
            }
          }
          this.setData({ areaCache });
          this.getAreaList();
        } else { }
      },
      (res) => { },
      (res) => { }
    );

  },
  init() {
    $common.request('POST', $common.config.GetStuInfo, { openId: this.data.openId },
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
            englishLevelIndex,
            PriceInterval: data.PriceInterval
          });
          this.data.areaCache.id = data.AreaSel.AsCanId;
          this.data.countData.id = data.AreaSel.AsAiId;
          this.getCityInfo()
        } else {
          // $common.showModal('未知错误，请稍后重试');
        }
      },
      (res) => {
        // $common.showModal('网络不给力，请稍后重试');
      },
      (res) => { }
    )
  },
  isEnEvent() {
    let isEn = wx.getStorageSync('isEn');
    wx.setNavigationBarTitle({ title: isEn ? 'Personal Info' : '个人信息', })
    this.setData({ isEn })
  },
  onLoad: function (options) {
    this.data.openId = options.openId || wx.getStorageSync('openid')
    this.isEnEvent()
    this.init()
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