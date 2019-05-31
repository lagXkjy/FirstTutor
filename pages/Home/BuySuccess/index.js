// pages/Home/BuySuccess/index.js
const $common = require('../../../utils/common.js');
Page({
  data: {
    srcPoster: $common.srcPoster,
    poster: {}, //海报信息
    isPoster: false, //海报 显隐
    orderType: 1, //订单类型类型：1. 团购  2. 单独购
    cogId: -1, //团id 例 35
    groupType: 1, //团类型：1. 开团  2. 参团
    teaAddress: '', //外教地址
    teaPhone: '', //外教联系方式
  },
  callPhone(e) { //打电话
    let phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },
  lookAddress() { //查看地图
    let address = this.data.teaAddress;
    $common.getAddress(address);
  },
  goHome() { //返回首页
    wx.switchTab({
      url: '/pages/Home/Home/index',
    })
  },
  bindShowPoster() { //生成海报
    this.setData({
      isPoster: true
    })
  },
  getPoster() {  //获取海报
    // wx.showLoading({ title: '努力加载中...' });
    $common.request(
      'POST',
      $common.config.GetPosterInfo,
      {},
      (res) => {
        if (res.data.res) {
          let poster = res.data.poster;
          this.setData({
            poster: poster,
          })
        } else {
          // $common.showModal('未知错误');
        }
      },
      (res) => {
        // $common.showModal('亲~网络不给力哦，请稍后重试');
      },
      (res) => {
        // wx.hideLoading();
        wx.stopPullDownRefresh();
      }
    )
  },
  bindIsPoster() { //海报隐藏
    this.setData({
      isPoster: false
    })
  },
  savePoster() { //保存海报到相册
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) { //没有授权
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: (res) => {
              this.saveImage();
            },
            fail: (res) => {
              let isEn = wx.getStorageSync('isEn');
              let text = isEn ? "Whether or not authorized?" : "是否授权保存到相册？"
              $common.showModal(text, true, (res) => {
                if (res.confirm) {
                  wx.openSetting({
                    success: (res) => {
                      if (!res.authSetting['scope.writePhotosAlbum']) return;
                      this.saveImage();
                    }
                  })
                }
              })
            }
          })
        } else {
          this.saveImage();
        }
      }
    })
  },
  saveImage() { //保存图片
    let isEn = wx.getStorageSync(isEn);
    let srcPoster = this.data.srcPoster,
      url = this.data.poster.PstImgName;
    let filePath = `${srcPoster}${url}`;
    wx.downloadFile({  //保存图片必须先下载
      url: filePath,
      success: (res) => {
        if (res.statusCode === 200) {
          let saveSrc = res.tempFilePath;
          wx.saveImageToPhotosAlbum({
            filePath: saveSrc,
            success: (res) => {
              this.setData({ //海报隐藏
                isPoster: false
              })
              let text = isEn ? "success" : "保存成功";
              wx.showToast({
                title: text,
                icon: 'success',
                duration: 2000
              })
            },
            fail: (res) => {
              let text = isEn ? "failure" : "保存失败";
              wx.showToast({
                title: text,
                icon: 'none',
                duration: 2000
              })
            },
            complete: (res) => {
            }
          })
        }
      },
      fail: (res) => {
        $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
      }
    })
  },
  spellGroup() {  // 查看拼团信息
    wx.navigateTo({
      url: '../SpellGroup/index?cogId=' + this.data.cogId
    })
  },
  getTeacherPhone() {  //获取外教联系方式
    $common.request(
      'POST',
      $common.config.GetTeaAddressPhone,
      {
        cogId: this.data.cogId
      },
      (res) => {
        if (res.data.res) {
          this.setData({
            teaAddress: res.data.teaAddress,
            teaPhone: res.data.teaPhone
          })
        } else {
          switch (res.data.errType) {
            case 1:
              //参数错误
              break;
            case 2:
              //未知错误
              break;
          }
        }
      },
      (res) => {

      },
      (res) => {
      }
    )
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.orderType) {
      let orderType = parseInt(options.orderType); //订单类型类型：1. 团购  2. 单独购
      this.setData({
        orderType: orderType
      })
    }
    if (options.cogId) {
      let cogId = parseInt(options.cogId); //团id
      this.setData({
        cogId: cogId
      })
    }
    if (options.groupType) {
      let groupType = parseInt(options.groupType); //团类型：1. 开团  2. 参团
      this.setData({
        groupType: groupType
      })
    }
    // this.setData({
    //   orderType: 1,
    //   cogId: 25,
    //   groupType: 1
    // })
    this.getPoster();
    this.getTeacherPhone();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  isEnEvent(res) { //判断当前显示中英文
    let isEn = wx.getStorageSync('isEn');
    this.setData({
      isEn: isEn
    });
    let text = isEn ? "Buy success" : "购买成功";
    wx.setNavigationBarTitle({
      title: text
    })
  },
  onShow: function () {
    this.isEnEvent();
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
    this.getPoster();
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