const $common = require('../../../utils/common.js');
const app = getApp();
Page({
  data: {
    pageStatus: 0, //页面状态，0 正常连接第一次进入，1 查看图片
    isNewCreate: 0, //是否是新创建的
    tabIndex: 1,
    srcForIdPhoto: $common.srcForIdPhoto,
    srcClockInImage: $common.srcClockInImage,
    srcClockInVideo: $common.srcClockInVideo,
    srcClockInAudio: $common.srcClockInAudio,
    info: null,
    pageIndex: 1,
    pageSize: 10,
    pageCount: -1,
    rakingInfo: {}, //排名信息
    rakingList: [], //排名列表
    isOverR: false,
    isInvite: false, //邀请层
    ActivityID: -1, //活动id
    isAdministrator: 0, //是否是管理员身份， 0 否 1 是
    themeInfo: {}, //该活动的信息
    dirayList: [], //日记数据
    dirayListId: null, //去评论，保存该评论下标
    isOverD: false,
    pageIndexD: 1,
    pageSizeD: 5,
    pageCountD: -1,
    isGetInfo: true, //初次进入页面发请求太多了，不想改了
    isRegister: true, //由分享页面进来的，先判断是否注册过 
  },
  deleteDiary(e) { //删除日记
    let index = e.currentTarget.dataset.index;
    let dirayList = this.data.dirayList;
    dirayList.splice(index, 1);
    this.setData({
      dirayList
    });
    this.getTeaInfo();
  },
  inviteCancel() { //邀请层，点击取消
    this.setData({
      isNewCreate: false
    })
  },
  toPublishDiary() { //去打卡
    let data = this.data;
    this.data.pageStatus = 4;
    app.clockInStatus = false;
    wx.navigateTo({
      url: `/pages/clockIn/publishDiary/publishDiary?ActivityID=${data.ActivityID}&ThemeId=${data.themeInfo.ThemeId}`,
    })
  },
  reviseTheme() { //修改主题
    let themeInfo = this.data.themeInfo;
    this.data.pageStatus = 0;
    wx.navigateTo({
      url: `/pages/clockIn/createNewTheme/createNewTheme?ThemeId=${themeInfo.ThemeId}&type=${themeInfo.ActivityType}`,
    })
  },
  toCreateNewTheme() { //跳转到新建打卡主题页
    let themeInfo = this.data.themeInfo;
    this.data.pageStatus = 0;
    wx.navigateTo({
      url: `/pages/clockIn/createNewTheme/createNewTheme?type=${themeInfo.ActivityType}&checkPoint=${themeInfo.MaxCheckpoint}&ActivityID=${this.data.ActivityID}`,
    })
  },
  tabChange(e) { //tab切换
    let index = +e.currentTarget.dataset.index;
    this.setData({
      tabIndex: index
    });
    switch (index) {
      case 0:
        this.getDiaryInfo();
        break;
      case 1:
        this.getTeaInfo();
        break;
      case 2:
        this.rakingInfo();
        break;
    }
  },
  toCheckAllTheme() { //点击全部主题
    // 0 成员 1 管理员
    let path = this.data.isAdministrator ? 'manageTheme/manageTheme' : 'checkAllTheme/checkAllTheme';
    let themeInfo = this.data.themeInfo;
    this.data.pageStatus = 0;
    wx.navigateTo({
      url: `/pages/clockIn/${path}?ActivityID=${this.data.ActivityID}&type=${themeInfo.ActivityType}&checkPoint=${themeInfo.MaxCheckpoint}`,
    })
  },
  toDataManage() { //点击管理后台
    let data = this.data;
    this.data.pageStatus = 0;
    let obj = {
      title: data.themeInfo.ActivityName,
      image: data.themeInfo.UserAvaUrl,
      name: data.themeInfo.TeaName
    }
    wx.navigateTo({
      url: `/pages/clockIn/dataManage/dataManage?ActivityID=${data.ActivityID}&title=${obj.title}&image=${obj.image}&name=${obj.name}`,
    })
  },
  toTeacherInfo() {
    wx.navigateTo({
      url: `/pages/Home/teachersInformation/index?data=${this.data.info.TeaId}`,
    });
    this.data.pageStatus = 0;
  },
  getDiaryInfo() { //获取日记
    let { isOverD } = this.data
    if (isOverD) return
    let isEn = wx.getStorageSync('isEn');
    let dirayList = this.data.dirayList;
    let pageCountD = this.data.pageCountD;
    if (pageCountD !== -1 && dirayList.length >= pageCountD) return;
    if (this.data.diaryFlag) return;
    this.data.diaryFlag = true;
    $common.loading();
    $common.request(
      'POST',
      $common.config.GetSmallCardActivityDiary, {
        ActivityID: this.data.ActivityID,
        PageIndex: this.data.pageIndexD,
        PageSize: this.data.pageSizeD,
        openId: wx.getStorageSync('openid')
      },
      (res) => {
        if (res.data.res) {
          let arr = res.data.Data.ListData;
          if (arr.length >= this.data.pageSizeD) {
            this.data.pageIndexD++;
            isOverD = false
          } else {
            isOverD = true
          }
          let array = dirayList.concat(arr);
          this.setData({
            dirayList: $common.unique(array, 'Id'),
            isOverD
          })
          this.data.pageCountD = res.data.Data.PageCount;
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
  getTeaInfo(isReady) { //获取外教信息 及 活动详情
    // if (this.data.info) return; //上次已经拿到该数据
    if (!this.data.isGetInfo) return;
    this.data.isGetInfo = false;
    let isEn = wx.getStorageSync('isEn');
    $common.loading();
    $common.request(
      'POST',
      $common.config.GetSmallCardActivityInfo, {
        openId: wx.getStorageSync('openid'),
        ActivityID: this.data.ActivityID
      },
      (res) => {
        if (res.data.res) {
          let info = res.data.Data;
          let text = JSON.parse(info.ActivityInfoText);
          let image = info.ActivityInfoImg.split(',');
          let audio = info.ActivityInfoVoice.split(',');
          let video = info.ActivityInfoVideo.split(',');
          let infoArr = [];
          for (let i = 0; i < 3; i++) {
            infoArr.push({
              text: text[i],
              image: image[i] && image[i].split('|')[0] ? image[i].split('|') : [],
              audio: audio[i],
              video: video[i],
            })
          }
          info.TeaLabelSelect = JSON.parse(info.TeaLabelSelect);
          info.infoArr = infoArr;
          this.setData({
            info
          });
          if (isReady) { //只此一次
            let obj = {
              currentTarget: {
                dataset: {
                  index: 0
                }
              }
            }
            if (this.data.isAdministrator) { //进来是管理员显示详情，否则显示日记
              obj.currentTarget.dataset.index = 1;
              this.tabChange(obj);
            } else {
              this.tabChange(obj);
            }
          }
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
        this.data.isGetInfo = true;
        $common.hide();
      }
    )
  },
  rakingInfo(isTrue) { //获取排名信息
    if (isTrue && this.data.tabIndex === 2) { //由本页面跳转打卡等等，回到本页面，且当前显示排名
      this.setData({
        rakingList: []
      });
      this.data.pageIndex = 1;
    }
    let { isOverR } = this.data
    if (isOverR) return
    let pageCount = this.data.pageCount;
    let rakingList = this.data.rakingList;
    if (pageCount !== -1 && rakingList.length >= pageCount) return;
    let isEn = wx.getStorageSync('isEn');
    $common.loading();
    $common.request(
      'POST',
      $common.config.GetSmallCardUserRanking, {
        openId: wx.getStorageSync('openid'),
        ActivityID: this.data.ActivityID,
        PageSize: this.data.pageSize,
        PageIndex: this.data.pageIndex,
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.Data;
          if (data.UserRankingList.length >= this.data.pageIndex) {
            this.data.pageIndex++;
            isOverR = false
          } else {
            isOverR = true
          }
          rakingList = rakingList.concat(data.UserRankingList);
          this.setData({
            rakingInfo: data,
            rakingList,
            isOverR
          });
          this.data.pageCount = data.PageCount;
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
        $common.hide();
      }
    )
  },
  getClockInInfo() { //获取打卡详细信息
    $common.loading();
    let isEn = wx.getStorageSync('isEn');
    $common.request(
      'POST',
      this.data.isAdministrator ? $common.config.GetTeaCurrentTheme : $common.config.GetCurrentTheme, { //管理端和用户端是不同的接口
        ActivityID: this.data.ActivityID,
        openId: wx.getStorageSync('openid')
      },
      (res) => {
        if (res.data.res) {
          let themeInfo = res.data.Dat;
          if (themeInfo.ActivityType === 1) {
            let date = $common.timeStamp(`${themeInfo.Checkpoint}000`);
            themeInfo.showTime = `${date.y}-${date.m}-${date.d}`;
          }
          this.setData({
            themeInfo,
            isAdministrator: res.data.Dat.isAdministrator
          })
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
        $common.hide();
      }
    )
  },
  init() {
    this.getTeaInfo(true);
    this.addHistory();
  },
  addHistory() { //添加浏览记录
    $common.request(
      'POST',
      $common.config.InsertActivityParticipate, {
        openId: wx.getStorageSync('openid'),
        RelationId: this.data.ActivityID,
        ParticipateType: 1
      },
      (res) => { },
      (res) => { },
      (Res) => { }
    )
  },
  checkImage(e) { //预览图片
    if (e.detail) { //本页面预览图片
      let index = e.currentTarget.dataset.index;
      let indexs = e.currentTarget.dataset.indexs;
      let infoArr = this.data.info.infoArr;
      let current = infoArr[index].image[indexs];
      let urls = [];
      for (let i = 0, len = infoArr.length; i < len; i++) {
        for (let j = 0, l = infoArr[i].image.length; j < l; j++) {
          urls.push(`${this.data.srcClockInImage}${infoArr[i].image[j]}`);
        }
        // urls.push(`${this.data.srcClockInImage}${arr[i]}`);
      }
      wx.previewImage({
        current, // 当前显示图片的http链接
        urls // 需要预览的图片http链接列表
      })
    }
    this.data.pageStatus = 1;
  },
  syncPraiseData(e) { //同步点赞数据
    let index = e.currentTarget.dataset.index;
    let dirayList = this.data.dirayList;
    let obj = e.detail;
    dirayList[index].IsFabulous = obj.IsFabulous;
    dirayList[index].FabulousList = obj.FabulousList;
    this.data.dirayList = dirayList;
  },
  syncComment(e) { //点击评论
    let index = e.currentTarget.dataset.index;
    let dirayList = this.data.dirayList
    this.data.dirayListId = dirayList[index].Id
    app.CommentList = null;
    this.data.pageStatus = 3;
  },
  syncCommentData() { //同步评论数据
    if (!app.CommentList) return;
    let { dirayList, dirayListId } = this.data
    let index = -1
    for (let i = 0, len = dirayList.length; i < len; i++) {
      if (dirayList[i].Id === dirayListId) {
        index = i
        break
      }
    }
    if (index === -1) return app.CommentList = null;
    let key = `dirayList[${index}].CommentList`
    this.setData({ [key]: app.CommentList })
    app.CommentList = null;
    this.data.dirayListId = null;
  },
  getPosterData() { //获取海报数据
    if (!app.clockInStatus) return;
    $common.loading();
    let isEn = wx.getStorageSync('isEn');
    $common.request(
      'POST',
      $common.config.GetPosterImageInfo, {
        ActivityID: this.data.ActivityID,
        openId: wx.getStorageSync('openid')
      },
      (res) => {
        if (res.data.res) {
          this.setData({
            posterData: res.data.Data
          })
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
        $common.hide();
      }
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
              wx.redirectTo({  //带上详情页需要的参数，从那边直接跳过去
                url: `/pages/me/stuRegister/stuRegister?card=1&ActivityID=${data.ActivityID}&isAdministrator=${data.isAdministrator}`
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
    let isNewCreate = +options.isNewCreate || 0;
    this.setData({
      isAdministrator: +options.isAdministrator,
      isNewCreate,
      ActivityID: +options.ActivityID
    });
    if (app.scene === 1007 || app.scene === 1008) {
      this.data.isRegister = false;
      $common.getOpenid($common.studentRegister.bind(this, this.checkIsRegister.bind(this, () => {
        this.data.isRegister = true;
        this.init();
        this.isEnEvent();
        this.checkStatus();
      })));
    } else {
      $common.getOpenid(() => {
        this.init();
      })
    }
  },
  onReady: function () {

  },
  checkStatus() { //根据本页隐藏状态判断显示后处理方式
    let pageStatus = this.data.pageStatus;
    switch (pageStatus) {
      case 0: //正常链接进入
        this.getClockInInfo();
        this.getTeaInfo();
        // 从主题详情页也可以打卡，人家要刷新，我tm的搞什么性能
        this.setData({
          dirayList: [], //日记数据
          pageIndexD: 1,
          pageSizeD: 5,
          pageCountD: -1,
          isOverD: false,
          isOverR: false
        });
        this.getDiaryInfo();
        break;
      case 1: //查看图片
        break;
      case 2: //分享
        this.rakingInfo(true);
        break;
      case 3: //评论
        this.syncCommentData();
        break;
      case 4: //打卡
        this.setData({
          dirayList: [], //日记数据
          pageIndexD: 1,
          pageSizeD: 5,
          pageCountD: -1,
          isOverD: false,
          isOverR: false
        });
        this.getClockInInfo();
        this.getDiaryInfo();
        this.rakingInfo(true);
        this.getPosterData();
        break;
    }
  },
  isEnEvent() {
    let isEn = wx.getStorageSync('isEn');
    let title = isEn ? 'Details of Clock in' : '打卡详情';
    wx.setNavigationBarTitle({
      title
    });
    this.setData({
      isEn
    });
  },
  onShow() {
    if (!this.data.isRegister) return;
    $common.getOpenid(() => {
      this.isEnEvent();
      this.checkStatus();
    });
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
    this.getClockInInfo();
    let tabIndex = this.data.tabIndex;
    if (tabIndex === 0) { //日记
      this.setData({
        dirayList: [], //日记数据
        pageIndexD: 1,
        pageSizeD: 5,
        pageCountD: -1,
        isOverD: false
      });
      this.getDiaryInfo();
    } else if (tabIndex === 1) { //详情
      this.getTeaInfo();
    } else if (tabIndex === 2) { //排名
      this.setData({
        pageIndex: 1,
        pageSize: 10,
        pageCount: -1,
        rakingList: [], //排名列表
        isOverR: false
      });
      this.rakingInfo();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let tabIndex = this.data.tabIndex;
    if (tabIndex === 0) { //日记
      this.getDiaryInfo();
    } else if (tabIndex === 2) { //排名
      this.rakingInfo();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    this.data.pageStatus = 2;
    let share = res.target && res.target.dataset && res.target.dataset.share;
    let path = res.from === 'button' ? `/pages/clockIn/thisRecord/thisRecord?JournalID=${res.target.dataset.journalid}` :
      `/pages/clockIn/details/details?ActivityID=${this.data.ActivityID}&isAdministrator=${this.data.isAdministrator}`;
    if (share) path = `/pages/clockIn/details/details?ActivityID=${this.data.ActivityID}&isAdministrator=${this.data.isAdministrator}`;
    return $common.share(
      'FirstTutor', path, '',
      () => {
        $common.request('POST', $common.config.InsertShare, {
          openid: wx.getStorageSync('openid'),
          ActivityID: this.data.ActivityID || 0,
          ThemeID: res.target.dataset.ThemeId || this.data.themeInfo.ThemeId,
          JournalID: res.target.dataset.journalid || 0
        },
          (res) => { if (res.data.res) this.setData({ scoreType: 3, scoreNum: +res.data.Integral }) }
        )
      }
    )
  }
})