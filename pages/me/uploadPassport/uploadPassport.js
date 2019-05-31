// pages/me/uploadPassport/uploadPassport.js
const $common = require('../../../utils/common.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: `FirstTutor is legally obligated to collect, archive and confirm the tutors' personal identity (including Passport and Visa), contact + information according to China's <E-Commence Law> Chapter 2, Item 27th. All the information will be kept confidential in FirstTutor.`,
    TeaPassPortPhoto: '',
    TeaVisaPhoto: '',
    srcForIdPhoto: $common.srcUploadImg
  },
  submit() {
    let { TeaPassPortPhoto, TeaVisaPhoto } = this.data
    if (!TeaPassPortPhoto) return $common.showModal('Please upload passport homepage', false, false, 'OK', 'Reminder')
    if (!TeaVisaPhoto) return $common.showModal('Please upload visa page', false, false, 'OK', 'Reminder')
    wx.navigateBack({ delta: 1 })
  },
  chooseImage(e) {
    const key = e.currentTarget.dataset.key
    $common.chooseImage((res) => {
      console.log(res)
      if (res.tempFiles[0].size > 1048576) { // 1MB = 1024KB; 1KB = 1024B;
        $common.showModal('Please choose a picture less than 1MB.', false, false, 'OK', 'Reminder')
        return
      }
      const filePath = res.tempFilePaths[0]
      wx.showLoading({ title: 'uploading...', mask: true })
      wx.uploadFile({
        url: $common.config.UpLoadForTeaFile,
        filePath, name: 'file',
        formData: { fileType: 1 },
        success: (res) => {
          let data = JSON.parse(res.data);
          if (data.res) {
            app.globalData.teacherFor[key] = data.imgName
            this.setData({ [key]: data.imgName })
          } else {
            $common.showModal('Upload Failed', false, false, 'OK', 'Reminder');
          }
        },
        fail: () => { $common.showModal('Unknown Error', false, false, 'OK', 'Reminder') },
        complete: (res) => { wx.hideLoading() }
      })
    }, 1)
  },
  init() {
    let { TeaPassPortPhoto, TeaVisaPhoto } = getApp().globalData.teacherFor
    this.setData({ TeaPassPortPhoto, TeaVisaPhoto })
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
    this.init()
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

  }
})