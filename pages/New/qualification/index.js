// pages/New/qualification/index.js
const $common = require('../../../utils/common.js');
const app = getApp();
Page({
  data: {
    imageList: [],
    imageCount: 5,
    srcImg: $common.srcImg,
    srcUploadImg: $common.srcUploadImg,
  },
  deleteImg(e) { //删除图片
    let index = e.currentTarget.dataset.index,
      imageList = this.data.imageList;
    let thisData = imageList[index];
    $common.showModal('Sure to delete?', true, (res) => {
      if (res.cancel) return;
      if (thisData.QfsCreateOn) { //保存到数据库的图片，调用接口删除
        $common.request(
          "POST",
          $common.config.DeleteForTeaFile,
          {
            fileType: 2,
            fileName: thisData.QfsPicName,
          },
          (res) => {
            if (res.data.res) {
              imageList.splice(index, 1);
              this.setData({
                imageList: imageList,
                imageCount: 5 - imageList.length
              })
              let arr = [];
              for (let i = 0, len = imageList.length; i < len; i++) {
                arr.push(imageList[i]);
              }
              app.globalData.teacherFor.TeaQualif = arr;
            }
          },
          (res) => {

          },
          (res) => {
          }
        )
      } else { //并未保存过，直接本地删除
        imageList.splice(index, 1);
        this.setData({
          imageList: imageList,
          imageCount: 5 - imageList.length
        })
        let arr = [];
        for (let i = 0, len = imageList.length; i < len; i++) {
          arr.push(imageList[i]);
        }
        app.globalData.teacherFor.TeaQualif = arr;
      }
    }, 'OK', 'Reminder', 'NO')
  },
  bindImage() { //选择照片
    let imageList = this.data.imageList,
      imageCount = this.data.imageCount;
    if (imageCount <= 0) return;
    $common.chooseImage((res) => {
      let url = res.tempFilePaths;
      for (let i = 0, len = url.length; i < len; i++) {
        imageList.push({
          QfsPicName: url[i],
          sqlUpload: false, //未上传过
        })
      }
      imageCount = 5 - imageList.length;
      this.setData({
        imageList: imageList,
        imageCount: imageCount
      });
    }, imageCount);
  },
  submit() {  //保存按钮
    let imageList = this.data.imageList;
    if (imageList.length <= 0) {
      $common.showModal('Please upload the tutor certificate picture.', false, false, 'OK', 'Reminder');
      return;
    }
    wx.showLoading({ title: 'uploading...' });
    let data = {
      url: imageList,
      i: 0,
      len: imageList.length,
      arr: []
    }
    this.uploadFun(data);
  },
  uploadFun(data) {
    if (data.i > data.len-1) { //上传完了
      wx.hideLoading();
      let imageData = data.arr;
      let thisArr = [];
      for (let i = 0, len = imageData.length; i < len; i++ ){
        thisArr.push(imageData[i]);
      }
      app.globalData.teacherFor.TeaQualif = thisArr;
      wx.navigateBack({
        delta: 1
      })
      return;
    }
    if (data.url[data.i].QfsCreateOn) { //从数据库拿到的，不上传
      data.arr.push(data.url[data.i]);
      data.i++;
      this.uploadFun(data);
      return;
    }
    if (data.url[data.i].sqlUpload) { //上传过的，不上传
      data.arr.push(data.url[data.i]);
      data.i++;
      this.uploadFun(data);
      return;
    }
    wx.uploadFile({
      url: $common.config.UpLoadForTeaFile,
      filePath: data.url[data.i].QfsPicName,
      name: 'file',
      formData: {
        fileType: 2
      },
      success: (res) => {
        let resData = JSON.parse(res.data);
        if (resData.res) {
          data.arr.push({
            QfsPicName: resData.imgNames[0],
            sqlUpload: true   //上传过了
          });
        } else { }
      },
      fail: () => {
      },
      complete: (res) => {
        data.i++;
        this.uploadFun(data);
      }
    })
  },
  init() {
    let TeaQualif = app.globalData.teacherFor.TeaQualif;
    let imageList = [];
    for (let i = 0, len = TeaQualif.length; i < len; i++) {
      imageList.push(TeaQualif[i]);
    }
    this.setData({
      imageCount: 5 - imageList.length,
      imageList: imageList
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.init();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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