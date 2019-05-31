const $common = require('../../utils/common.js');
Component({
  properties: {
    chatImage: { //聊天图片
      type: String,
      value: ''
    },
    photoUrl: { //图片头部链接
      type: String,
      value: $common.srcForIdPhoto,
    },
    isPrice: { //是否显示金额
      type: Boolean,
      value: false
    },
    isEn: {
      type: null,
      value: false
    },
    infoList: { //传入组件的数据
      type: Object,
      observer(obj) {
        // let isFirst = this.data.isFirst;
        // if (!isFirst) {
        //   this.data.isFirst = true;
        //   let image = obj.TeaIDPhoto ? `${$common.srcForIdPhoto}${obj.TeaIDPhoto}` : obj.TeaAvaUrl;
        //   obj.image = image;
        //   this.setData({
        //     dataList: obj
        //   })
        // }
      }
      // value: {
      //   TeaId: 7,
      //   TeaName: '孟军辉',
      //   TeaNaLityId: 1,
      //   TeaAddV: 1,
      //   TeaAbstract: '好',
      //   TeaAvaUrl: 'https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJ6KgwJjhMHT3Qgnk3LmiaHict98bE5Ad1MIhNSDiauB8034UBUgEaiaiaIXnKeUicKkosfOQ22SPgVASzA/0',
      //   RewScore: 5,
      //   TeaSortNum: 6,
      //   TeaIDPhoto: '20180419103902518411.jpg'
      // },
    }
  },
  data: {

  },
  methods: {
    lookYouImage() { //点击查看头像
      let data = this.data.infoList,
        url = this.data.photoUrl,
        image = data.TeaIDPhoto ? url + data.TeaIDPhoto : data.TeaAvaUrl;
      wx.previewImage({
        urls: [image],
      })
    },
    getUserInfo(e) {
      let userInfo = e.detail.userInfo;
      if (!userInfo) return;
      $common.getUserInfo(userInfo, $common.stuRegister.bind($common, this.chat.bind(this)));
    },
    chat() { //进入聊天界面
      let userId = this.data.infoList.TeaUserId;
      wx.navigateTo({
        url: `/pages/New/onlineChart/index?userId=${userId}`,
      })
    },
  }
})