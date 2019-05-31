/**
 * author: guo
 * date: 2018-4-25
 * use: 学生课程信息样式
 */
Component({
  properties: {
    course: {
      type: Object,
      observer(res){
      }
    }
  },
  data: {
    isEn: false,
  },
  methods: {

  },
  attached() {
    this.setData({
      isEn: wx.getStorageSync('isEn')
    })
  }
})
