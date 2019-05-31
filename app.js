/***
 *      ┌─┐       ┌─┐
 *   ┌──┘ ┴───────┘ ┴──┐
 *   │                 │
 *   │       ───       │
 *   │  ─┬┘       └┬─  │
 *   │                 │
 *   │       ─┴─       │
 *   │                 │
 *   └───┐         ┌───┘
 *       │         │
 *       │         │
 *       │         │
 *       │         └──────────────┐
 *       │                        │
 *       │                        ├─┐
 *       │                        ┌─┘
 *       │                        │
 *       └─┐  ┐  ┌───────┬──┐  ┌──┘
 *         │ ─┤ ─┤       │ ─┤ ─┤
 *         └──┴──┘       └──┴──┘
 *                神兽保佑
 *               代码无BUG!
 */
App({
  onLaunch(e) {
    this.scene = e.scene; //设置场景值
  },
  onShow() {
    const $common = require('./utils/common.js')
    //目的，判断是否为禁用用户
    if (wx.getStorageSync('openid')) $common.studentRegister()
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调,里面好像没啥用
    });
    updateManager.onUpdateReady((res) => {
      updateManager.applyUpdate();
    });
  },
  themeImage: { //选择的主题头图
    path: '',
    size: '', //选择的图片的大小
    cutImage: '', //剪裁的图片路径
  },
  scene: 1001, //打开小程序时的场景值
  CommentList: null, //打卡，日记评论数据
  clockInStatus: false, //是否打卡成功
  globalData: {
    userInfo: null,
    /*
       教师发布课程
     */
    releaseCourse: {
      courseIntroduce: '', //课程介绍
      courseTime: [], //上课时间段
      courseTypeIndex: 0, //课程类型下标,
      courseName: '', //课程名称
      courseAllPrice: '', //课程价格
      courseDurationIndex: 0, //课程时长下标
    },
    /*
       教师基本资料
     */
    teacherFor: {
      TeaAbstract: "", //简介
      TeaAge: "", //外教年龄
      TeaAudio: "", //外教上课视频 
      TeaClaArea: [], //上课区域
      TeaDescript: "", //外教描述
      TeaGender: 1, //外教性别
      TeaId: 5, //外教id
      TeaIdPhoto: "",
      TeaNaLityId: 1, //国籍id
      TeaName: "", //外教姓名
      TeaNation: "", //国籍
      TeaPhone: "", //电话
      TeaQualif: [],
      TeaLabelSelect: [], //选择的标签
      /*
      {
        QfsCreateOn: '', //资质添加时间
        QfsPicName: '', //资质图片链接
        QfsId: 1,
        QfsTeaId: 1
      }
       */
      TeaUniversity: "", //外教大学
      TeaWeChat: "", //外教微信
      TeaPassPortPhoto: '',  //护照照片
      TeaVisaPhoto: '', //签证照片
    },
    //qualifs: [], //教师资质图片名称列表

  }
})