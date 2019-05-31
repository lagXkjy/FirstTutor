// component/vipTimeSlot/vipTimeSlot.js
let setDate = (i) => {
  const currentDate = new Date()
  const currentTime = currentDate.getTime()
  currentDate.setDate(currentDate.getDate() + i)
  let year = currentDate.getFullYear()
  let month = currentDate.getMonth() + 1
  let day = currentDate.getDate()
  let time = `${year}-${month}-${day} 0:0:0`
  if (month < 10) month = `0${month}`
  if (day < 10) day = `0${day}`
  return {
    year, month, day,
    isToday: currentTime === currentDate.getTime(),
    TimDateTime: `/Date(${Date.parse(new Date(time)) || Date.parse(new Date(time.replace(/-/g, '/')))})/`
  }
}
const todayisNo = (children) => {//判断今天哪些不能选
  let day = new Date().getHours()
  let arr = [9, 12, 15, 18]
  let index = -1
  for (let i = 0, len = arr.length; i < len; i++) {
    if (day <= arr[i]) {
      index = i
      break
    }
  }
  if (index !== -1) { for (let i = 0; i < index; i++) { children[i].isExpire = true } }
  return children
}
const getList = (isEn, isStu = false) => {
  let arr = []
  const timeType = isStu ? 0 : 1 //0不可选 1可选 2选中 3已被购买，不能选
  for (let i = 0; i < 28; i++) { //未来四周
    let children = [
      { timeType, timeName: isEn ? 'AM' : '上午', TimClaTime: 1, },
      { timeType, timeName: isEn ? 'PM1' : '下午1', TimClaTime: 2, },
      { timeType, timeName: isEn ? 'PM2' : '下午2', TimClaTime: 3, },
      { timeType, timeName: isEn ? 'PM3' : '晚上', TimClaTime: 4, }]
    if (i === 0) { children = todayisNo(children) }
    arr.push({ ...setDate(i), children })
  }
  return arr
}
Component({
  properties: {
    timeTables: {
      type: null,
      observer(res) {
        let arr = res[0]
        if (arr.length <= 0) return //拿到的是默认值，不管
        let list = getList(wx.getStorageSync('isEn'), true)
        /**
         * TimClaTime  //上午 下午1 下午2 晚上
         * TimDateTime  //日期
         */
        /**
         * 判断哪些可以选
         */
        for (let i = 0, len = arr.length; i < len; i++) {
          let timeStape = ('' + arr[i].TimDateTime).replace(/\D/g, '')
          let currentDate = new Date().getTime()
          if (timeStape < currentDate - 86400000) continue //不处理一下，返回值数组越来越长，这谁招架得住   
          let date = new Date(+timeStape)
          let year = date.getFullYear()
          let month = date.getMonth() + 1
          let day = date.getDate()
          if (month < 10) month = `0${month}`
          if (day < 10) day = `0${day}`
          for (let j = 0, le = list.length; j < le; j++) {
            let children = list[j].children
            for (let k = 0, l = children.length; k < l; k++) {
              if (list[j].year === year && list[j].month === month && list[j].day === day && children[k].TimClaTime === arr[i].TimClaTime) { //匹配成功，该项可选
                children[k].timeType = 1
                if (children[k].isExpire) { children[k].timeType = 0 } //今天的这个时间段已经过了
                children[k].TimId = arr[i].TimId
                if (arr[i].IsChoice) { //已经被购买了,变个颜色
                  children[k].timeType = 3
                }
              }
            }
          }
        }
        this.setData({ list })
        this.returnData()
      }
    },
    timeNoTables: {
      type: null,
      observer(res) {//页面把数据传过来触发，哪些课程不能选
        if (res === -1) return //第一次传的默认值，不管他
        /**
         * 判断哪些时间段不能选
         */
        let list = getList(wx.getStorageSync('isEn'))
        for (let i = 0, len = res.length; i < len; i++) {
          if (!res[i].TimDateTime) continue   //该事件段没有明确表明日期，不管
          let timeStape = ('' + res[i].TimDateTime).replace(/\D/g, '')
          let currentDate = new Date().getTime()
          if (timeStape < currentDate - 86400000) continue //不处理一下，返回值数组越来越长，这谁招架得住   
          for (let j = 0, le = list.length; j < le; j++) {
            if (res[i].TimDateTime !== list[j].TimDateTime) continue   //时间不一样，下一个
            let children = list[j].children
            for (let k = 0, l = children.length; k < l; k++) {
              if (res[i].TimClaTime === children[k].TimClaTime) { //匹配成功,该项不可选
                children[k].timeType = 0
              }
            }
          }
        }
        /**
         * 判断哪些时间段已选
         */
        let app = getApp()
        let courseTime = app.globalData.releaseCourse.courseTime
        for (let i = 0, len = courseTime.length; i < len; i++) {
          if (!courseTime[i].TimDateTime) continue //该事件段没有明确表明日期，不管
          for (let j = 0, le = list.length; j < le; j++) {
            if (courseTime[i].TimDateTime !== list[j].TimDateTime) continue   //时间不一样，下一个
            let children = list[j].children
            for (let k = 0, l = children.length; k < l; k++) {
              if (courseTime[i].TimClaTime === children[k].TimClaTime) { //匹配成功,该项已被选
                children[k].timeType = 2
              }
            }
          }
        }
        this.setData({ list })
        this.returnData()
      }
    },
    isRadio: { //是否为单选
      type: Boolean,
      value: false,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    isEn: wx.getStorageSync('isEn'),
    list: [],
    listIndex: 0,
    headLeft: 1,
    hScrollW: 0,
    weekLeft: 1,
    wScrollW: 0,
    flag: false,
    indexItem: 0,
  },
  ready() {
    // this.setData({ headLeft: 0, weekLeft: 0 }) //组件加载完成后，动一下，调用组件自带方法获取两个滚动条的宽度
  },
  /**
   * 组件的方法列表
   */
  methods: {
    reduce() {
      let { indexItem } = this.data
      if (indexItem === 0) return
      indexItem -= 7
      this.setData({ indexItem })
    },
    add() {
      let { indexItem } = this.data
      if (indexItem === 21) return
      indexItem += 7
      this.setData({ indexItem })
    },
    _selectTime(e) { //选择时间
      let { index, v, timetype } = e.currentTarget.dataset
      if (timetype === 0 || timetype === 3) return //不能选的，不做操作
      let { list, isRadio } = this.data
      if (isRadio) { //单选
        for (let i = 0, len = list.length; i < len; i++) {
          let children = list[i].children
          for (let j = 0, le = children.length; j < le; j++) {
            if (children[j].timeType !== 0 && children[j].timeType !== 3) {
              children[j].timeType = 1
            }
          }
        }
        list[index].children[v].timeType = 2
        this.setData({ list })
      } else { //多选
        let str = `list[${index}].children[${v}].timeType`
        let type = list[index].children[v].timeType === 1 ? 2 : 1
        this.setData({ [str]: type })
      }
      this.returnData()
    },
    returnData() { //向父组件返回选中的数据
      let timer = null
      this.returnData = () => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          let { list } = this.data
          let timeList = []
          for (let i = 0, len = list.length; i < len; i++) {
            let children = list[i].children
            for (let j = 0, le = children.length; j < le; j++) {
              if (children[j].timeType === 2) {
                timeList.push({ TimDateTime: list[i].TimDateTime, TimClaTime: children[j].TimClaTime, timeType: children[j].timeType, TimId: children[j].TimId, timeMD: `${list[i].month}-${list[i].day}` })
              }
            }
          }
          this.triggerEvent('SonTime', { timeList })  //将数据返回给父组件
        }, 300)
      }
      this.returnData()
    },
    clickHead(e) {
      this.setData({ listIndex: +e.currentTarget.dataset.index })
    },
    compute(scale, isHead) {
      //isHead true 上动，改下
      let { hScrollW, wScrollW } = this.data
      this.setData({ [isHead ? 'weekLeft' : 'headLeft']: (isHead ? wScrollW : hScrollW) * scale })
      setTimeout(() => { this.data.flag = false }, 100)
    },
    headerScroll(e) {
      let timer = null
      this.headerScroll = (e) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          const { scrollLeft, scrollWidth } = e.detail
          this.data.hScrollW = scrollWidth
          if (this.data.flag) return
          this.data.flag = true
          this.compute(scrollLeft / scrollWidth, true)
        }, 60)
      }
      this.headerScroll(e)
    },
    weekScroll(e) {
      let timer = null
      this.weekScroll = (e) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          const { scrollLeft, scrollWidth } = e.detail
          this.data.wScrollW = scrollWidth
          if (this.data.flag) return
          this.data.flag = true
          this.compute(scrollLeft / scrollWidth, false)
        }, 80)
      }
      this.weekScroll(e)
    }
  }
})
