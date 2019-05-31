const $common = require('../../../utils/common.js');
const app = getApp();
Page({
  data: {
    srcClockInImage: $common.srcClockInImage,
    srcClockInVideo: $common.srcClockInVideo,
    srcClockInAudio: $common.srcClockInAudio,
    themeInfo: null,
    pageIndex: 1,
    pageSize: 10,
    pageCount: -1,
    listData: [],
    type: 1, //1 每日打卡 2 闯关
    isInit: true, //一开始默认显示去打卡，且不能点的按钮
    IsCompleted: false, //是否打过卡
    IsCanSmallCard: false, //是否可以打卡
    isRegister: true, //由分享页面进来的，先判断是否注册过 
    isOver: false,
  },
  longpress(e) { //复制文本
    let data = decodeURIComponent(this.data.themeInfo.infoArr[e.currentTarget.dataset.index].text);
    wx.setClipboardData({ data });
  },
  deleteDiary(e) { //删除日记
    let index = e.currentTarget.dataset.index;
    let listData = this.data.listData;
    listData.splice(index, 1);
    this.setData({
      listData
    });
  },
  checkImage(e) { //点击看大图
    let index = e.currentTarget.dataset.index;
    let indexs = e.currentTarget.dataset.indexs;
    let infoArr = this.data.themeInfo.infoArr;
    let current = infoArr[index].images[indexs];
    let urls = [];
    for (let i = 0, len = infoArr.length; i < len; i++) {
      for (let j = 0, l = infoArr[i].images.length; j < l; j++) {
        urls.push(`${this.data.srcClockInImage}${infoArr[i].images[j]}`);
      }
    }
    wx.previewImage({
      current, // 当前显示图片的http链接
      urls // 需要预览的图片http链接列表
    })
  },
  init() {
    let isEn = wx.getStorageSync('isEn');
    $common.loading();
    $common.request(
      'POST',
      $common.config.GetSmallCardThemeInfo, {
        ThemeId: this.data.ThemeId,
        openid: wx.getStorageSync('openid')
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.ThemeMode;
          // data.themeImages = data.ThemeInfoImg.split('|');
          // if (!data.themeImages[0]) data.themeImages = [];
          let type = 2;
          if (data.ThemeDate) { //每日打卡
            type = 1;
            let d = $common.timeStamp(data.ThemeDate);
            data.showTime = `${d.y}-${d.m}-${d.d}`;
          }
          let text = JSON.parse(data.ThemeInfoText);
          let images = data.ThemeInfoImg.split(',');
          let audio = data.ThemeInfoVoice.split(',');
          let video = data.ThemeInfoVideo.split(',');
          let infoArr = [];
          for (let i = 0; i < 3; i++) {
            infoArr.push({
              text: text[i],
              images: images[i] && images[i].split('|')[0] ? images[i].split('|') : [],
              audio: audio[i],
              video: video[i],
            })
          }
          data.infoArr = infoArr;
          this.setData({
            themeInfo: data,
            type,
            IsCanSmallCard: res.data.IsCanSmallCard
          });
          this.addHistory();
          this.getData();
        } else {
          if (isEn) {
            $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
          } else {
            $common.showModal('未知错误');
          }
        }
      },
      (res) => {
        if (isEn) {
          $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
        } else {
          $common.showModal('亲~网络不给力哦，请稍后重试');
        }
      },
      (res) => {
        // $common.hide();
      }
    )
  },
  getData() { //获取日记
    let { isOver } = this.data
    if (isOver) return;
    let isEn = wx.getStorageSync('isEn');
    let listData = this.data.listData;
    let pageCount = this.data.pageCount;
    if (pageCount !== -1 && pageCount <= listData.length) return;
    if (this.data.diaryFlag) return;
    this.data.diaryFlag = true;
    $common.loading();
    $common.request(
      'POST',
      $common.config.GetSmallCardThemeJournal, {
        ThemeId: this.data.ThemeId,
        openId: wx.getStorageSync('openid'),
        PageIndex: this.data.pageIndex,
        PageSize: this.data.pageSize
      },
      (res) => {
        if (res.data.res) {
          let arr = res.data.Data.ThemeJournal;
          if (arr.length >= this.data.pageSize) {
            this.data.pageIndex++;
            isOver = false
          } else {
            isOver = true
          }
          listData = listData.concat(arr);
          let IsCompleted = res.data.Data.IsCompleted;
          this.setData({
            listData,
            IsCompleted,
            isInit: false,
            isOver
          });
          this.data.pageCount = res.data.PageCount;
        } else {
          if (isEn) {
            $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
          } else {
            $common.showModal('未知错误');
          }
        }
      },
      (res) => {
        if (isEn) {
          $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
        } else {
          $common.showModal('亲~网络不给力哦，请稍后重试');
        }
      },
      (res) => {
        this.data.diaryFlag = false;
        $common.hide();
      }
    )
  },
  toPublishDiary() { //去打卡
    if (!this.data.IsCanSmallCard) { //一天3次或者其他, 不能打卡
      let isEn = wx.getStorageSync('isEn');
      if (isEn) {
        $common.showModal('Clock-in 3 times in one day is available, please keep on tomorrow.', false, false, 'OK', 'Prompt');
      } else {
        $common.showModal('一天只可补打卡3次，请明天继续加油！');
      }
      return;
    }
    let themeInfo = this.data.themeInfo;
    app.clockInStatus = false;
    wx.navigateTo({
      url: `/pages/clockIn/publishDiary/publishDiary?ActivityID=${themeInfo.SmallCardActivityID}&ThemeId=${themeInfo.Id}`,
    })
  },
  addHistory() { //添加浏览记录
    $common.request(
      'POST',
      $common.config.InsertActivityParticipate, {
        openId: wx.getStorageSync('openid'),
        RelationId: this.data.themeInfo.Id,
        ParticipateType: 2
      },
      (res) => { },
      (res) => { },
      (Res) => { }
    )
  },
  checkIsRegister(callback = () => { }) { //查看学生是否注册过
    let isEn = wx.getStorageSync('isEn');
    if (isEn) {
      callback();
    } else {
      $common.request(
        'POST',
        $common.config.GetStuRegis, {
          openId: wx.getStorageSync('openid')
        },
        (res) => {
          if (res.data.res) {
            let register = +res.data.regis;
            if (register === 0) { //未注册，去注册页注册
              let data = this.data;
              let url = `/pages/clockIn/themeDetails/themeDetails`;
              wx.redirectTo({  //带上详情页需要的参数，从那边直接跳过去
                url: `/pages/me/stuRegister/stuRegister?jumpUrl=${url}&jumpId=${data.ThemeId}&jumpType=1`
              })
            } else { //已注册
              callback();
            }
          } else {
            $common.showModal('未知错误，请稍后重试');
          }
        },
        (res) => {
          $common.showModal('网络不给力，请稍后重试');
        },
        (res) => { }
      )
    }
  },
  onLoad: function (options) {
    this.data.once = true;
    this.data.ThemeId = +options.ThemeId;
    if (app.scene === 1007 || app.scene === 1008) {
      this.data.isRegister = false;
      $common.getOpenid($common.studentRegister.bind(this, this.checkIsRegister.bind(this, () => {
        this.data.isRegister = true;
        this.isEnEvent();
      })));
    } else {
      this.isEnEvent();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  isEnEvent() {
    let isEn = wx.getStorageSync('isEn');
    let title = isEn ? 'Theme Details' : '主题详情';
    wx.setNavigationBarTitle({
      title
    });
    this.setData({
      isEn
    });
    this.data.pageIndex = 1;
    this.data.pageCount = -1;
    this.data.listData = [];
    this.data.isOver = false
    $common.getOpenid(this.init.bind(this));
  },
  onShow() {
    this.setData({
      isInit: true
    })
    if (!this.data.isRegister) return;
    if (this.data.once) {
      this.data.once = false;
      return;
    }
    this.isEnEvent();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      IsCanSmallCard: false
    })
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
    this.isEnEvent();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    this.data.pageStatus = 2;
    return $common.share(
      'FirstTutor',
      res.target.dataset.journalid ? `/pages/clockIn/thisRecord/thisRecord?JournalID=${res.target.dataset.journalid}`
        : `/pages/clockIn/themeDetails/themeDetails?ThemeId=${this.data.ThemeId}`, '',
      () => {
        $common.request('POST',
          $common.config.InsertShare, {
            openid: wx.getStorageSync('openid'),
            ActivityID: this.data.ActivityID || 0,
            ThemeID: this.data.ThemeId,
            JournalID: res.target.dataset.journalid || 0
          },
          (res) => { if (res.data.res) this.setData({ scoreType: 3, scoreNum: +res.data.Integral }) }
        )
      }
    )
  }
})