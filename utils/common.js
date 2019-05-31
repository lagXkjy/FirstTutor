/*
   本地存储 userInfo openid userType teacherStatusInfo
*/
// const myHttps = "wj.1-zhao.com";
const myHttps = "wjtest.1-zhao.cn"; //测试域名
const host = `https://${myHttps}`;
const webStock = `wss://${myHttps}/WebSocketServer.ashx`;
const QQMapWX = require('./qqmap-wx-jssdk.min.js');
const mapKey = new QQMapWX({
  key: '4WABZ-V2ARX-NLS45-T5Q7T-CETWK-KMB7C' // 必填
});
const MD5 = require('./md5.js');
// const phoneReg = /^1[34578]\d{9}$/; // 正则手机号码
const phoneReg = /^(1[3456789]|9[28])\d{9}$/; // 正则手机号码
const passportReg = /^1[45][0-9]{7}|G[0-9]{8}|P[0-9]{7}|S[0-9]{7,8}|D[0-9]+$/; //正则护照
const emailReg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,5}$/; //正则邮箱
const srcImg = `${host}/QualifImgs/`; //图片
const srcUploadImg = `${host}/ImgCatch/`; //上传图片 
const srcVideo = `${host}/QuaLifAudios/`; //视频
const srcActivity = `${host}/AtyImages/`; //活动
const srcActivityVideo = `${host}/ActVideos/`; //活动视频
const srcBanner = `${host}/BannerImgs/`; //轮播图
const srcPoster = `${host}/Content/Images/`; //海报
const srcForIdPhoto = `${host}/ForIdPhoto/`; //证件照
const srcShar = `${host}/Content/SharePic/`; //分享图片
const srcClockInImage = `${host}/SmallCardMultiMedia/Images/`; //打卡图片
const srcClockInVideo = `${host}/SmallCardMultiMedia/Video/`; //打卡视频
const srcClockInAudio = `${host}/SmallCardMultiMedia/Voice/`; //打卡音频
const srcClockInCatch = `${host}/ImgCatch/`; //上传文件未确定的
const chartImageUrl = `${host}/ChatMultiMedia/Images/`; //聊天，图片存放地址
const chartVoiceUrl = `${host}/ChatMultiMedia/voice/`; //聊天，语音存放地址

const config = {
  /*
    首页
   */
  //获取学生状态，注册学生
  RisStudent: `${host}/LittleProgram/Student/RisStudent`,
  //获取首页banner图片列表
  GetBannerImgs: `${host}/LittleProgram/SystemSetup/GetBannerImgs`,
  //获取首页最新活动
  GetLastestAtyInfo: `${host}/LittleProgram/Activity/GetLastestAtyInfo`,
  // 获取首页推荐外教
  GetRecomForTeas: `${host}/LittleProgram/ForeignTea/GetRecomForTeas`,
  //获取外教的详细信息
  GetForeignTeaInfo: `${host}/LittleProgram/ForeignTea/GetForeignTeaInfo`,
  //找外教-详情页，获取外交发布课程信息
  GetCourInfosByTeaId: `${host}/LittleProgram/Course/GetCourInfosByTeaId`,
  //找外教-详情页，获取某外教评论内容
  GetReviewInfoByTeaId: `${host}/LittleProgram/Review/GetReviewInfoByTeaId`,
  //课程信息，获取课程信息与外教信息(2018-03-29)
  GetCourseInfo: `${host}/LittleProgram/Course/GetCourseInfo`,
  //课程信息，根据课程ID获取课程的上课时间(2018-03-29)
  GetTimeTableInfos: `${host}/LittleProgram/TimeTable/GetTimeTableInfos`,
  //购买课程--订单填写页--获取订单信息（2018-03-30）
  GetOrderInfos: `${host}/LittleProgram/CorOpenGroup/GetOrderInfos`,
  //学生--提交订单(2018-04-03)
  PlaceAnOrder: `${host}/LittleProgram/CorOpenGroup/PlaceAnOrder`,
  // 学生--取消支付或者支付失败时调用(2018-04-03)
  AttendGroupFailed: `${host}/LittleProgram/CorOpenGroup/AttendGroupFailed`,
  // 学生--支付成功，模版消息发送（2018-04-03）
  PayMentSuccess: `${host}/LittleProgram/CorOpenGroup/PayMentSuccess`,
  // 购买成功后--生成海报(2018-04-04)
  GetPosterInfo: `${host}/LittleProgram/Poster/GetPosterInfo`,
  // 学生-查看团详情（2018-04-04）
  LookUpFigroupInfo: `${host}/LittleProgram/CorOpenGroup/LookUpFigroupInfo`,
  // 学生-删除订单（2018-04-08）
  DeleteOgoById: `${host}/LittleProgram/OpenGrpOrder/DeleteOgoById`,
  // 订单页--获取外教上课地址与手机号(2018-04-09)
  GetTeaAddressPhone: `${host}/LittleProgram/CorOpenGroup/GetTeaAddressPhone`,
  // 用户--更改用户类型（2018-04-23）
  ChangeUserType: `${host}/LittleProgram/UserInfo/ChangeUserType`,
  // 获取分享的图片
  GetSharePicName: `${host}/LittleProgram/SystemSetup/GetSharePicName`,
  /*
    找外教
   */
  //获取找外教中商圈信息
  GetTradingAreaInfos: `${host}/LittleProgram/TradingArea/GetTradingAreaInfos`,
  //找外教搜索页接口
  FindForeignTea: `${host}/LittleProgram/ForeignTea/FindForeignTea`,
  //获取标签信息 
  GetLabelInfos: `${host}/LittleProgram/SystemSetup/GetLabelInfos`,
  //获取获取区域城市信息
  GetCityInfos: `${host}/LittleProgram/SystemSetup/GetCityInfos`,
  //获取获取区域区信息 
  GetAreaInfos: `${host}/LittleProgram/SystemSetup/GetAreaInfos`,
  //找外教，按条件搜索外教信息
  FindForeignTeaNew: `${host}/LittleProgram/ForeignTea/FindForeignTeaNew`,
  /*
    活动
   */
  //学生--查看活动--活动列表页(2018-04-04)
  GetAtyInfoList: `${host}/LittleProgram/Activity/GetAtyInfoList`,
  //学生-查看活动详情(2018-04-04)
  GetAtyDesInfo: `${host}/LittleProgram/Activity/GetAtyDesInfo`,
  //学生--活动报名(2018-04-04)
  AtySignUp: `${host}/LittleProgram/Activity/AtySignUp`,
  //活动--取消活动付费（2018-04-23）
  CanCelPay: `${host}/LittleProgram/Activity/CanCelPay`,
  // 学生--活动支付成功，模版消息发送（2018-04-03）
  PayMentSuccessActivity: `${host}/LittleProgram/Activity/PayMentSuccess`,
  /*
    打卡
   */
  //打卡主界面
  GetSmallCardActivity: `${host}/LittleProgram/SmallCardActivity/GetSmallCardActivity`,
  //获取打卡活动 全部主题页面
  GetThemeList: `${host}/LittleProgram/SmallCardActivity/GetThemeList`,
  //获取活动详情信息
  GetSmallCardActivityInfo: `${host}/LittleProgram/SmallCardActivity/GetSmallCardActivityInfo`,
  //获取打卡活动 用户积分排名
  GetSmallCardUserRanking: `${host}/LittleProgram/SmallCardActivity/GetSmallCardUserRanking`,
  // 上传图片
  UpLoadImg: `${host}/LittleProgram/InsertSmallCard/UpLoadImg`,
  // 上传活动音频
  UploadVoice: `${host}/LittleProgram/InsertSmallCard/UploadVoice`,
  // 上传活动视频
  UploadVideo: `${host}/LittleProgram/InsertSmallCard/UploadVideo`,
  // 删除文件
  DelAtyFile: `${host}/LittleProgram/InsertSmallCard/DelAtyFile`,
  // 新建打卡活动
  InsertActivities: `${host}/LittleProgram/InsertSmallCard/InsertActivities`,
  // 打卡详情
  GetCurrentTheme: `${host}/LittleProgram/SmallCardJournal/GetCurrentTheme`,
  // 打卡详情ta
  GetTeaCurrentTheme: `${host}/LittleProgram/SmallCardJournal/GetTeaCurrentTheme`,
  // 添加打卡主题数据
  InsertTheme: `${host}/LittleProgram/InsertSmallCard/InsertTheme`,
  // 获取昨日概况统计数据
  GetYesterDayStatistics: `${host}/LittleProgram/SmallCardActivity/GetYesterDayStatistics`,
  // 获取全部统计数据  可按日期查询
  GetSmallCardStatistics: `${host}/LittleProgram/SmallCardActivity/GetSmallCardStatistics`,
  // 打卡活动成员管理
  GetSmallCardActivityUserList: `${host}/LittleProgram/SmallCardActivity/GetSmallCardActivityUserList`,
  // 发表日记
  InsertJournal: `${host}/LittleProgram/InsertSmallCard/InsertJournal`,
  // 详情页的日记列表
  GetSmallCardActivityDiary: `${host}/LittleProgram/SmallCardJournal/GetSmallCardActivity`,
  // 主题详情页，  获取某个主题的详情
  GetSmallCardThemeInfo: `${host}/LittleProgram/SmallCardTheme/GetSmallCardThemeInfo`,
  // 我的 ，  获取我的打卡日记列表
  GetUserSmallCardJournal: `${host}/LittleProgram/SmallCardJournal/GetUserSmallCardJournal`,
  // 主题详情， 打卡日记
  GetSmallCardThemeJournal: `${host}/LittleProgram/SmallCardTheme/GetSmallCardThemeJournal`,
  // 成员管理 ， 控制权限状态
  UpdateUserLimit: `${host}/LittleProgram/SmallCardActivity/UpdateUserLimit`,
  //点赞
  InsertFabulous: `${host}/LittleProgram/InsertSmallCard/InsertFabulous`,
  //取消点赞
  DeleteFabulous: `${host}/LittleProgram/InsertSmallCard/DeleteFabulous`,
  //评论别人
  InsertComment: `${host}/LittleProgram/InsertSmallCard/InsertComment`,
  //获取某人的打卡日记
  GetSmallCardJournalInfo: `${host}/LittleProgram/SmallCardTheme/GetSmallCardJournalInfo`,
  //打卡详情页，添加浏览记录
  InsertActivityParticipate: `${host}/LittleProgram/InsertSmallCard/InsertActivityParticipate`,
  //插入分享记录
  InsertShare: `${host}/LittleProgram/InsertSmallCard/InsertShare`,
  //修改活动， 获取活动信息
  GetActivitiesInfo: `${host}/LittleProgram/InsertSmallCard/GetActivitiesInfo`,
  //修改活动， 修改
  UpdateActivities: `${host}/LittleProgram/InsertSmallCard/UpdateActivities`,
  //海报
  GetPosterImageInfo: `${host}/LittleProgram/SmallCardActivity/GetPosterImageInfo`,
  //删除主题
  GetDateTheme: `${host}/LittleProgram/InsertSmallCard/GetDateTheme`,
  //修改主题，获取主题信息
  GetThemeInfo: `${host}/LittleProgram/InsertSmallCard/GetThemeInfo`,
  //修改主题，修改
  UpdateTheme: `${host}/LittleProgram/InsertSmallCard/UpdateTheme`,
  //删除打卡日记
  GetDeleteJournal: `${host}/LittleProgram/SmallCardJournal/GetDeleteJournal`,
  //删除活动
  GetDeleteActivity: `${host}/LittleProgram/SmallCardActivity/GetDeleteActivity`,
  // 打卡，  获取某个主题的详情
  GetThemeInfoClockIn: `${host}/LittleProgram/SmallCardTheme/GetThemeInfo`,

  /*
    我的
   */
  //获取用户Openid
  GetSaveUserOpenId: `${host}/LittleProgram/UserInfo/GetSaveUserOpenId`,
  //更新用户头像与昵称 （2018-05-02）
  UpdateAvaUrlNick: `${host}/LittleProgram/UserInfo/UpdateAvaUrlNick`,
  //获取国家信息
  GetCountryInfos: `${host}/LittleProgram/Nationality/GetCountryInfos`,
  //外教提交申请
  ApplyForForeEdu: `${host}/LittleProgram/ForeignTea/ApplyForForeEdu`,
  //获取外教状态信息 是否vip...
  GetForTeaStatus: `${host}/LittleProgram/ForeignTea/GetForTeaStatus`,
  //外教--我的课程，课程列表(2018-03 - 29)
  GetMyCourInfos: `${host}/LittleProgram/Course/GetMyCourInfos`,
  //外教-我的课程-发布新课程
  ReleaseCourse: `${host}/LittleProgram/Course/ReleaseCourse`,
  //我的-获取用户类型
  GetUserType: `${host}/LittleProgram/UserInfo/GetUserType`,
  //外教--我的--获取基本信息(2018-03-29)
  GetForTeaDetailInfo: `${host}/LittleProgram/ForeignTea/GetForTeaDetailInfo`,
  //外教，我的--上传文件(2018-03-30)
  UpLoadForTeaFile: `${host}/LittleProgram/FileOpera/UpLoadForTeaFile`,
  // 外教--我的--修改基本资料提交(2018-03-30)
  AlterForTeaBaseInfo: `${host}/LittleProgram/ForeignTea/AlterForTeaBaseInfo`,
  //外教基本资料修改--删除上传文件
  DeleteForTeaFile: `${host}/LittleProgram/FileOpera/DeleteForTeaFile`,
  //学生--查看课程详情--获取某课程拼团中的团订单(2018-03-30)
  GetCorGroupInfos: `${host}/LittleProgram/CorOpenGroup/GetCorGroupInfos`,
  //订单页--获取用户名与手机号(2018-03-30)
  GetUserNamePhone: `${host}/LittleProgram/Student/GetUserNamePhone`,
  //外教-删除课程信息
  DeleteCourse: `${host}/LittleProgram/Course/DeleteCourse`,
  //外教-修改课程-获取信息(2018-04-02)
  AlterCourseGet: `${host}/LittleProgram/Course/AlterCourseGet`,
  //外教-修改课程信息(2018-04-02)
  AlterCourse: `${host}/LittleProgram/Course/AlterCourse`,
  //学生-获取我的订单列表(2018-04-08)
  GetOrderList: `${host}/LittleProgram/OpenGrpOrder/GetOrderList`,
  //学生-我的-我报名的活动(2018-04-08)
  GetMySignUpAtyList: `${host}/LittleProgram/Activity/GetMySignUpAtyList`,
  //学生--我的--学习需求
  GetMyLearnNeeds: `${host}/LittleProgram/LearnNeeds/GetMyLearnNeeds`,
  //学生-删除我的需求(2018-04-09)
  DeleteMyLearnNeed: `${host}/LittleProgram/LearnNeeds/DeleteMyLearnNeed`,
  //学生-发布需求信息(2018-04-09)
  ReleaseMyLearnNeed: `${host}/LittleProgram/LearnNeeds/ReleaseMyLearnNeed`,
  //学生-我的-获取某需求信息以供修改(2018-04-09)
  GetMyLearnNeedInfo: `${host}/LittleProgram/LearnNeeds/GetMyLearnNeedInfo`,
  //学生--我的--修改需求(2018-04-09)
  AlterMyLearnNeedInfo: `${host}/LittleProgram/LearnNeeds/AlterMyLearnNeedInfo`,
  //学生--我的评论，评论列表(2018-04-09)
  GetMyAllRewInfos: `${host}/LittleProgram/Review/GetMyAllRewInfos`,
  //学生--发布一条新评论(2018-04-09)
  GiveTeaAMark: `${host}/LittleProgram/Review/GiveTeaAMark`,
  //学生--删除评论(2018-04-09)
  DeleteReview: `${host}/LittleProgram/Review/DeleteReview`,
  //外教--获取某课程拼团成功信息列表(2018-04-09)
  GetMyCorOrderList: `${host}/LittleProgram/OpenGrpOrder/GetMyCorOrderList`,
  //外教-拼团详情
  GetTeaOrderInfoList: `${host}/LittleProgram/OpenGrpOrder/GetTeaOrderInfoList`,
  //外教-我的--需求查看(2018-04-10)
  GetAllLearnNeeds: `${host}/LittleProgram/LearnNeeds/GetAllLearnNeeds`,
  // 外教-订单查看-获取外教发布课程被购买订单列表(2018-04-10)
  GetTeaCogInfoList: `${host}/LittleProgram/OpenGrpOrder/GetTeaCogInfoList`,
  // 外教--点评管理--点评信息获取(2018-04-10)
  GetAllRewAboutMe: `${host}/LittleProgram/Review/GetAllRewAboutMe`,
  // 获取与我相关的所有聊天记录(2018-04-12)
  GetChatMemRecord: `${host}/LittleProgram/ChatRecord/GetChatMemRecord`,
  // 获取两人聊天记录(2018-04-12)
  GetChatRecord: `${host}/LittleProgram/ChatRecord/GetChatRecord`,
  // 获取聊天双方头像（2018-04-12）
  GetUserInfo: `${host}/LittleProgram/UserInfo/GetUserInfo`,
  // 外教-获取某外教所有课程所占用的时间段列表(2018-04-17)
  GetAllTeaTimeTableInfo: `${host}/LittleProgram/TimeTable/GetAllTeaTimeTableInfo`,
  // 获取未读消息数量（2018-04-19）
  GetUnReadMsgCount: `${host}/LittleProgram/ChatRecord/GetUnReadMsgCount`,
  // 获取是否提醒vip外教更新课表（2019-02-21）
  GetTeachersSchedulesExpire: `${host}/LittleProgram/ChatRecord/GetTeachersSchedulesExpire`,
  // 外教--个人信息--未读订单数量（2018-04-20）
  GetNotCheckedOrderCount: `${host}/LittleProgram/CorOpenGroup/GetNotCheckedOrderCount`,
  // 获取帮助与反馈内容（2018-04-24）
  GetUserHelp: `${host}/LittleProgram/HelpAndFeedBack/GetUserHelp`,
  // 发表反馈信息（2018-04-24）
  PublishFeedBack: `${host}/LittleProgram/HelpAndFeedBack/PublishFeedBack`,
  // 外教--我的课程--关闭/打开课程（2018-04-25）
  ChangeCorSwitch: `${host}/LittleProgram/Course/ChangeCorSwitch`,
  //  获取用户头像与昵称 （2018-05-10）
  GetMyAvaName: `${host}/LittleProgram/UserInfo/GetMyAvaName`,
  //  模板消息绑定手机号
  PutStuPhoneNum: `${host}/LittleProgram/Student/PutStuPhoneNum`,
  //  查看学生是否已注册信息 
  GetStuRegis: `${host}/LittleProgram/Student/GetStuRegis`,
  //  学生信息注册
  StuRegis: `${host}/LittleProgram/Student/StuRegis`,
  //  获取学生注册时选择的区域信息 
  GetStuAreaSel: `${host}/LittleProgram/Student/GetStuAreaSel`,
  //  获取学生注册信息
  GetStuInfo: `${host}/LittleProgram/Student/GetStuInfo`,
  //  修改学生注册信息
  PutStuInfo: `${host}/LittleProgram/Student/PutStuInfo`,
  //  聊天，上传图片
  ChartUpLoadImg: `${host}/LittleProgram/ChatRecord/UpLoadImg`,
  //  聊天，上传音频
  ChartUpLoadVoice: `${host}/LittleProgram/ChatRecord/UploadVoice`,
  //  学生，课程完成
  CourseCompletion: `${host}/LittleProgram/CorOpenGroup/CourseCompletion`,
  //  外教，课程结束
  EndOfCourse: `${host}/LittleProgram/CorOpenGroup/EndOfCourse`,
  //  学生/外交，取消订单
  CancellationCourseOrders: `${host}/LittleProgram/CorOpenGroup/CancellationCourseOrders`,
}


module.exports = {
  webStock: webStock,
  config: config,
  passportReg: passportReg,
  phoneReg: phoneReg,
  emailReg: emailReg,
  srcImg: srcImg,
  srcUploadImg: srcUploadImg,
  srcVideo: srcVideo,
  srcActivity: srcActivity,
  srcBanner: srcBanner,
  srcPoster: srcPoster,
  srcForIdPhoto: srcForIdPhoto,
  srcActivityVideo: srcActivityVideo,
  srcShar: srcShar,
  srcClockInImage,
  srcClockInVideo,
  srcClockInAudio,
  srcClockInCatch,
  chartImageUrl,
  chartVoiceUrl,
  loading(isEn) {
    let text = isEn ? 'loading...' : '努力加载中...';
    wx.showLoading({
      title: text,
      mask: true
    })
  },
  stuRegister(callback) { //学生注册
    let isEn = wx.getStorageSync('isEn');
    if (isEn) {
      callback();
      return;
    } else {
      this.request(
        'POST',
        this.config.GetStuRegis, {
          openId: wx.getStorageSync('openid')
        },
        (res) => {
          if (res.data.res) {
            let register = +res.data.regis;
            if (register === 0) { //未注册,跳转到注册页面
              wx.navigateTo({
                url: '/pages/me/stuRegister/stuRegister',
              })
            } else { //已注册,处于外教身份下默认已注册
              callback();
            }
          } else {
            this.showModal('未知错误，请稍后重试');
          }
        },
        (res) => {
          this.showModal('网络不给力，请稍后重试');
        },
        (res) => { }
      )
    }
  },
  //翻译
  translate(query, complete, language) {
    // let appid = '2015063000000001', //官方示例，次数不限估计
    //   key = '12345678'
    let appid = '20180416000146782', //百度翻译appid
      key = 'i21sgz3p7ZDqfQiTq44D', //秘钥
      salt = (new Date).getTime(), //所需随机数
      // 要翻译的内容, 多个query可以用\n连接  如 query= 'apple\norange\nbanana\npear'
      from = 'auto', //源语言
      to = 'en', //译文语言
      sign = MD5(`${appid}${query}${salt}${key}`); //MD5加密后数据
    if (language) { //默认中文翻译成英文，language为true，英文翻译成中文
      to = 'zh';
    }
    wx.request({
      url: 'https://fanyi-api.baidu.com/api/trans/vip/translate',
      method: 'GET',
      header: {
        'content-type': 'application/json;charset=utf-8'
      },
      data: {
        q: query,
        appid: appid,
        salt: salt,
        from: from,
        to: to,
        sign: sign
      },
      complete: complete
    })
  },
  //请求数据
  request(method, url, data, success, fail, complete) {
    fail = typeof (fail) === 'function' ? fail : function () { };
    complete = typeof (complete) === 'function' ? complete : function () { };
    wx.request({
      url: url,
      data: data,
      method: method,
      header: {
        'content-type': 'application/json'
      },
      success: success,
      fail: fail,
      complete: complete
    })
  },
  //模态弹窗
  showModal(content, showCancel, success, confirmText, title, cancelText) {
    title = title ? title : '提示';
    showCancel = showCancel ? true : false;
    confirmText = confirmText ? confirmText : '确定';
    cancelText = cancelText ? cancelText : '取消';
    success = typeof (success) === 'function' ? success : function (res) { };
    wx.showModal({
      title: title,
      content: content,
      showCancel: showCancel,
      confirmText: confirmText,
      cancelText: cancelText,
      success: success
    });
  },
  //拍摄视频或从手机相册中选视频
  chooseVideo(success) {
    success = typeof (success) === 'function' ? success : function (res) { };
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      compressed: true,
      maxDuration: 60,
      success: success,
      complete: function (res) {

      }
    })
  },
  //从本地相册选择图片或使用相机拍照
  chooseImage(success, count) {
    count = parseInt(count) ? count : 9;
    success = typeof (success) === 'function' ? success : function (res) { };
    wx.chooseImage({
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      count: count,
      success: success,
    })
  },
  getAddress(address) { //调用腾讯地图api地址解析为坐标
    mapKey.geocoder({
      address: address,
      success: (res) => { //打开地图查看
        let data = res.result.location,
          w = data.lat,
          j = data.lng;
        wx.openLocation({
          latitude: w,
          longitude: j,
          name: address
        })
      },
      fail: (res) => { },
      complete: (res) => { }
    });
  },
  //获取openid
  getOpenid(callback) {
    callback = typeof (callback) === 'function' ? callback : function (res) { };
    let openid = wx.getStorageSync('openid');
    if (openid) {
      callback();
      return;
    }
    wx.login({
      complete: (res) => {
        if (res.code) {
          let code = res.code;
          wx.request({
            url: config.GetSaveUserOpenId,
            data: {
              code: code,
              userType: -1
            },
            header: {
              'content-type': 'application/json'
            },
            method: 'POST',
            success: (res) => {
              if (res.data.res) {
                //保存openid
                wx.setStorageSync('openid', res.data.openid);
                //保存用户类型
                let userType = res.data.userType && res.data.userType;
                wx.setStorageSync('userType', res.data.userType);
                callback();
              }
            }
          });
        }
      }
    })
  },
  //获取并更新用户头像等信息
  getUserInfo(userInfo, callback) {
    callback = typeof (callback) === 'function' ? callback : function (res) { };
    wx.setStorageSync('userInfo', userInfo);
    wx.request({
      url: config.UpdateAvaUrlNick,
      data: {
        openId: wx.getStorageSync('openid'),
        avaUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName,
        gender: userInfo.gender == 1 ? 1 : 0 //1男0女
      },
      header: {
        'content-type': 'application/json'
      },
      method: 'POST',
      success: (res) => {
        if (res.data.res) {
          callback();
        }
      }
    });
  },
  //学生注册
  studentRegister(callback = () => { }) {
    wx.request({
      url: config.RisStudent,
      method: 'POST',
      data: {
        openId: wx.getStorageSync('openid')
      },
      success: (res) => {
        if (res.data.rtnType === 2) return wx.reLaunch({ url: '/pages/me/prohibit/prohibit' })
        callback();
        // if (res.data.res) {
        //   switch (res.data.rtnType) {
        //     case 1:
        //       //注册成功
        //       break;
        //     case 2:
        //       //改账号被禁用,无法访问程序,
        //       break;
        //     case 3:
        //       //账户正常
        //       break;
        //   }
        // } else {
        //   switch (res.data.errType) {
        //     case 1:
        //       //发生异常
        //       break;
        //     case 2:
        //       //openId错误
        //       break;
        //     case 3:
        //       //未知错误
        //       break;
        //   }
        // }
      }
    });
  },
  //数组去重保留旧数据
  unique(arr, id) {
    let hash = {};
    return arr.reduce(function (item, target) {
      hash[target[id]] ? '' : hash[target[id]] = true && item.push(target);
      return item;
    }, []);
  },
  newUnique(array, arr, id, hash) { //数组去重
    for (let i = 0, len = arr.length; i < len; i++) {
      !hash[arr[i][id]] && (array.push(arr[i])) && (hash[arr[i][id]] = true);
    }
  },
  loading(type = 1) {
    let isEn = wx.getStorageSync('isEn');
    let title = '';
    if (isEn) {
      switch (+type) {
        case 1:
          title = 'Loading...';
          break;
        case 2:
          title = 'uploading...';
          break;
        case 3:
          title = 'deleteing...';
          break;
        default:
          title = 'Loading...';
      }
    } else {
      switch (+type) {
        case 1:
          title = '请求中...';
          break;
        case 2:
          title = '上传中...';
          break;
        case 3:
          title = '删除中...';
          break;
        default:
          title = '请求中...';
      }
    }
    wx.showLoading({
      title
    })
  },
  hide() {
    wx.hideLoading()
  },
  //时间戳转换为时间
  timeStamp(str) {
    let timeStamp = str.replace(/\D/g, '');
    let date = new Date(+timeStamp),
      y = date.getFullYear(),
      m = date.getMonth() + 1,
      d = date.getDate(),
      h = date.getHours(),
      mi = date.getMinutes(),
      s = date.getSeconds(),
      w = date.getDay();
    m < 10 && (m = '0' + m);
    d < 10 && (d = '0' + d);
    h < 10 && (h = '0' + h);
    mi < 10 && (mi = '0' + mi);
    s < 10 && (s = '0' + s);
    let obj = {
      y: y,
      m: m,
      d: d,
      h: h,
      mi: mi,
      s: s,
      w: w
    }
    return obj;
  },
  share(title = 'FirstTutor', path = '', imageUrl = '', success = () => { }) { //分享
    let src = ''
    if (path) { //有链接，需要跳转至固定位置，所有分享页面必须过登录页，跳转地址需要做处理
      const arr = path.split('?')
      let array = arr[1].split('&') //以数组的方式拿到所有的参数
      let obj = {}
      for (let i = 0, len = array.length; i < len; i++) {
        let demo = array[i].split('=')
        obj[demo[0]] = demo[1]
      }
      src = `loginTo=${arr[0]}&loginData=${JSON.stringify(obj)}`
    }
    path = `/pages/login/login?${src}`
    return { title, path, imageUrl, success }
  }

}