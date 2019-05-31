const $common = require('../../../utils/common.js');
const app = getApp();
Page({
  data: {
    pagesList: [{
        ZiLiao: 'Basic Information',
        Types: 'Imperfect',
        url: '../Abasic/index?status=1'
      },
      {
        ZiLiao: 'Tutor Introduction',
        Types: 'unfilled',
        url: '../Teachers/index?status=0'
      },
      {
        ZiLiao: 'Tutor Certificate',
        Types: 'Not uploaded',
        url: '../qualification/index'
      },
      {
        ZiLiao: 'Head Shot',
        Types: 'Not uploaded',
      },
      {
        ZiLiao: 'Teaching Video',
        Types: 'Not uploaded',
      },
    ],
    phone: '',
    btnFalg: true, //防止保存按钮连点
    cityList: [], //城市信息
    cityIndex: 0,
  },
  TeaClaArea() { //跳转到选择区域
    let index = this.data.cityIndex;
    let list = this.data.cityList;
    let TeaClaArea = app.globalData.teacherFor.TeaClaArea;
    wx.navigateTo({
      url: `/pages/New/area/index?canId=${list[index].CanId}`,
    })
  },
  changeCity(e) { //选择城市切换
    let index = +e.detail.value;
    if (index !== this.data.cityIndex) { //下标变了，清空标签内容
      app.globalData.teacherFor.TeaClaArea = []; //每次切换清空区域
      this.setData({
        areaText: '',
        cityIndex: index
      })
    }
    this.TeaClaArea();
  },
  getCityInfo() { //获取区域城市信息
    $common.request(
      'POST',
      $common.config.GetCityInfos,
      null,
      (res) => {
        if (res.data.res) {
          let data = res.data.data;
          let arr = [];
          for (let i = 0, len = data.length; i < len; i++) {
            arr.push(data[i].CanCityName);
          }
          $common.translate( //翻译
            arr.join('\n'),
            (res) => {
              let arrData = res.data.trans_result;
              if (arrData && arrData.length > 0) {
                for (let i = data.length - 1; i >= 0; i--) {
                  data[i].cityEn = arrData[i].dst
                }
              }
              let TeaAreaSelect = this.data.forTea.TeaAreaSelect;
              let index = 0;
              if (TeaAreaSelect && TeaAreaSelect.length > 0) {
                let id = TeaAreaSelect[0].AsCanId; //城市id
                for (let i = 0, len = data.length; i < len; i++) {
                  if (data[i].CanId === id) {
                    index = i;
                    break;
                  }
                }
              }
              this.setData({
                cityList: data,
                cityIndex: index
              });
            }
          )
        } else {
          $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
        }
      },
      (res) => {
        $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
      },
      (res) => {

      }
    )
  },
  bindPhone(e) { //电话
    let phone = e.detail.value;
    this.data.phone = phone;
    app.globalData.teacherFor.TeaPhone = phone;
  },
  submit() { //点击保存按钮
    if (!this.data.btnFalg) return;
    this.data.btnFalg = false;
    let teacherFor = app.globalData.teacherFor;
    let qualifs = [];
    let phone = this.data.phone;
    if (!teacherFor.TeaName || !teacherFor.TeaPassPortPhoto || !teacherFor.TeaVisaPhoto) {
      $common.showModal('Please fill in your brief introduction.', false, false, 'OK', 'Reminder');
      this.data.btnFalg = true;
      return;
    }
    //标签
    let TeaLabelSelect = teacherFor.TeaLabelSelect;
    if (TeaLabelSelect.length <= 0) {
      $common.showModal('Please fill in your brief introduction.', false, false, 'OK', 'Reminder');
      this.data.btnFalg = true;
      return;
    }
    let lableArr = [];
    for (let i = 0, len = TeaLabelSelect.length; i < len; i++) {
      lableArr.push(TeaLabelSelect[i].id || TeaLabelSelect[i].LcId)
    }
    let lable = lableArr.join(',');
    if (!teacherFor.TeaDescript) {
      $common.showModal('Please fill in the tutor introduction.', false, false, 'OK', 'Reminder');
      this.data.btnFalg = true;
      return;
    }
    // if (teacherFor.TeaQualif.length < 0) {
    //   $common.showModal('Please upload the tutor certificate picture.', false, false, 'OK', 'Reminder');
    //   return;
    // }
    if (!teacherFor.TeaIdPhoto) {
      // $common.showModal('请上传证件照');
      $common.showModal('Please upload the Head Shot.', false, false, 'OK', 'Reminder');
      this.data.btnFalg = true;
      return;
    }
    // if (!teacherFor.TeaAudio) {
    //   $common.showModal('请上传上课视频');
    //   return;
    // }
    if (teacherFor.TeaClaArea.length <= 0) {
      $common.showModal('Please select the acceptable teaching area.', false, false, 'OK', 'Reminder');
      this.data.btnFalg = true;
      return;
    }
    if (!$common.phoneReg.test(phone)) {
      $common.showModal('Please fill in the correct phone number.', false, false, 'OK', 'Reminder');
      this.data.btnFalg = true;
      return;
    }
    for (let i = 0, len = teacherFor.TeaQualif.length; i < len; i++) {
      qualifs.push(teacherFor.TeaQualif[i].QfsPicName);
    }
    let areaSel = [];
    let AsCanId = this.data.cityList[this.data.cityIndex].CanId; //城市id
    for (let i = 0, len = teacherFor.TeaClaArea.length; i < len; i++) {
      areaSel.push({
        AsCanId: AsCanId,
        AsAiId: teacherFor.TeaClaArea[i].id || teacherFor.TeaClaArea[i].AiId
      });
    }
    $common.request(
      'POST',
      $common.config.AlterForTeaBaseInfo, {
        forTea: {
          TeaId: teacherFor.TeaId,
          TeaName: teacherFor.TeaName,
          TeaGender: teacherFor.TeaGender,
          TeaAge: teacherFor.TeaAge,
          TeaPassPort: teacherFor.TeaPassPort,
          TeaWeChat: teacherFor.TeaWeChat,
          TeaUniversity: teacherFor.TeaUniversity,
          TeaNaLityId: teacherFor.TeaNaLityId,
          TeaAbstract: teacherFor.TeaAbstract,
          TeaDescript: teacherFor.TeaDescript,
          TeaIDPhoto: teacherFor.TeaIdPhoto,
          TeaAudio: teacherFor.TeaAudio,
          TeaClassArea: '',
          TeaPhone: teacherFor.TeaPhone,
          TeaLabelSelect: lable,
          TeaPassPortPhoto: teacherFor.TeaPassPortPhoto,
          TeaVisaPhoto: teacherFor.TeaVisaPhoto
        },
        areaSel: areaSel,
        qualifs: qualifs
      },
      (res) => {
        if (res.data.res) {
          let data = app.globalData.teacherFor.TeaQualif;
          for (let i = 0, len = data.length; i < len; i++) { //保存成功后，图片链接切换为外教链接地址
            data[i].QfsCreateOn = true;
          }
          app.globalData.teacherFor.TeaQualif = data;
          this.data.btnFalg = true;
          $common.showModal('Successfully Saved', false, false, 'OK', 'Reminder');
        } else {
          this.data.btnFalg = true;
          $common.showModal('Not Saved', false, false, 'OK', 'Reminder');
        }
      },
      (res) => {
        this.data.btnFalg = true;
      },
      (res) => {}
    )
  },
  jump(e) { // 跳转
    let url = e.currentTarget.dataset.url,
      index = e.currentTarget.dataset.index;
    if (index == 3) { //调用上传图片
      this.uploadPhoto();
      return;
    } else if (index == 4) { //调用上传视频
      this.uploadVideo();
      return;
    }
    wx.navigateTo({
      url: url,
    })
  },
  uploadPhoto() { //上传证件照
    $common.chooseImage(function(res) {
      if (res.tempFiles[0].size > 1048576) { // 1MB = 1024KB; 1KB = 1024B;
        $common.showModal('Please choose a picture less than 1MB.', false, false, 'OK', 'Reminder');
        return;
      }
      let image = res.tempFilePaths[0];
      wx.showLoading({
        title: 'uploading...'
      });
      wx.uploadFile({
        url: $common.config.UpLoadForTeaFile,
        filePath: image,
        name: 'file',
        formData: {
          fileType: 1
        },
        success: (res) => {
          let data = JSON.parse(res.data);
          if (data.res) {
            app.globalData.teacherFor.TeaIdPhoto = data.imgName;
            this.init();
          } else {
            $common.showModal('Upload Failed', false, false, 'OK', 'Reminder');
          }
        },
        fail: () => {
          $common.showModal('Unknown Error', false, false, 'OK', 'Reminder');
        },
        complete: (res) => {
          wx.hideLoading();
        }
      })
    }.bind(this), 1);
  },
  uploadVideo() { //上传上课视频
    $common.chooseVideo(function(res) {
      let url = res.tempFilePath; //文件路径
      wx.showLoading({
        title: 'uploading...'
      });
      wx.uploadFile({
        url: $common.config.UpLoadForTeaFile,
        filePath: url,
        name: 'file',
        formData: {
          fileType: 3
        },
        success: (res) => {
          let data = JSON.parse(res.data);
          if (data.res) {
            app.globalData.teacherFor.TeaAudio = data.vdoName;
            this.init();
          } else {
            $common.showModal('Upload Failed', false, false, 'OK', 'Reminder');
          }
        },
        fail: () => {
          $common.showModal('Unknown Error', false, false, 'OK', 'Reminder');
        },
        complete: (res) => {
          wx.hideLoading();
        }
      });
    }.bind(this));
  },
  getTeacherDetail() { //获取教师基本信息
    app.globalData.teacherFor = [];
    wx.showLoading({
      title: 'Loading...'
    });
    $common.request(
      "POST",
      $common.config.GetForTeaDetailInfo, {
        teaId: wx.getStorageSync('teacherStatusInfo').teaId,
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.forTea;
          data.TeaClaArea = data.TeaAreaSelect;
          data.TeaLabelSelect = data.TeaLabelSelect ? data.TeaLabelSelect: [];
          let TeaAreaSelect = data.TeaAreaSelect
          let arr = [];
          if (TeaAreaSelect && TeaAreaSelect.length > 0) {
            for (let i = 0, len = TeaAreaSelect.length; i < len; i++) {
              let id = TeaAreaSelect[i].AsAiId;
              arr.push({
                id: id,
                AiId: id
              });
            }
          }
          data.TeaClaArea = arr;
          this.setData({
            forTea: data
          })
          app.globalData.teacherFor = data;
          this.getCityInfo();
          this.init();
        } else {
          $common.showModal('Unknown Error', false, false, 'OK', 'Reminder');
        }
      },
      (res) => {
        $common.showModal('Unknown Error', false, false, 'OK', 'Reminder');
      },
      (res) => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      }
    )
  },
  init() {
    if (!app.globalData.teacherFor.TeaQualif) return;
    let teacherFor = app.globalData.teacherFor;
    let pagesList = this.data.pagesList;
    pagesList[0].Types = teacherFor.TeaName && teacherFor.TeaPassPortPhoto && teacherFor.TeaVisaPhoto ? 'Completed' : 'To be filled'; //基本资料
    pagesList[1].Types = teacherFor.TeaDescript ? 'Completed' : 'To be filled'; //教师介绍
    pagesList[2].Types = teacherFor.TeaQualif.length > 0 ? 'uploaded' : 'Not uploaded'; //教师资质
    pagesList[3].Types = teacherFor.TeaIdPhoto ? 'uploaded' : 'Not uploaded'; //证件照
    pagesList[4].Types = teacherFor.TeaAudio ? 'uploaded' : 'Not uploaded'; //上课视频
    this.setData({
      pagesList: pagesList,
      phone: teacherFor.TeaPhone,
      forTea: app.globalData.teacherFor
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.getTeacherDetail();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.init();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getTeacherDetail();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return $common.share()
  }
})