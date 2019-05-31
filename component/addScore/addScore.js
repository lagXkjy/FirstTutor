// component/addScore/addScore.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    scoreType: { //分数类型 1 点赞 2 评论 3 分享 4 打卡
      type: Number,
      value: 0,
      observer(e) {
        if (!e) return;
        let scoreText;
        let isEn = wx.getStorageSync('isEn');
        if (isEn) {
          switch (e) {
            case 1:
              scoreText = 'like';
              break;
            case 2:
              scoreText = 'comment';
              break;
            case 3:
              scoreText = 'share';
              break;
            case 4:
              scoreText = 'clock in';
              break;
          }
        } else {
          switch (e) {
            case 1:
              scoreText = '点赞';
              break;
            case 2:
              scoreText = '评论';
              break;
            case 3:
              scoreText = '分享';
              break;
            case 4:
              scoreText = '打卡';
              break;
          }
        }
        this.setData({
          scoreText,
          isEn
        })
      }
    },
    scoreNum: { //分数
      type: Number,
      value: 0,
      observer(e) {
        if (!e) return;
        this.setData({
          isShow: true
        })
        this.data.timer = setTimeout(() => {
          this.setData({
            isShow: false
          });
          this.data.scoreNum = 0;
          this.data.scoreType = 0;
          this.triggerEvent('showScoreCallback');
        }, 1000);
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
    isEn: wx.getStorageSync('isEn'),
    timer: null,
    scoreText: '点赞'
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})