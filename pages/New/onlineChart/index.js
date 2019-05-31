/**
 * 在线沟通
 */
const $common = require('../../../utils/common.js');
// async await 所需
const regeneratorRuntime = require('../../../utils/regenerator-runtime/runtime')
let _socket = null;//websocket实例
let _msgQueue = []  //需要发送消息的队列
let pageIsUnload = true   //页面是否未被销毁
Page({
  data: {
    intervalTime: 300000, //间隔时间 5分钟
    paddingTop: 0,
    srcForIdPhoto: $common.srcForIdPhoto,
    chartImageUrl: $common.chartImageUrl,
    value: '', //聊天框的初始内容
    myImage: '',
    youImage: '',
    pageIndex: 1,
    pageSize: 7,
    listData: [],
    userId: -1,
    newDataCount: 0, //自己发送与接收数据之和
    tarTeaId: '',
    isLayer: false, //复制，翻译
    layerH: 0, //初始高度 
    isTop: true, //上下三角
    copyIndex: 0, //需要复制或翻译的下标
    isOver: false, //列表是否请求道最后一条了
    record: null, //全局唯一录音实例
    isRecord: false, //是否进入录音模式
    recordIsNormal: true, //录音状态是否正常
    audioObject: {}, //语音实例集，为保证同一时间只能有一个音频播放
    audioPrevId: null, //上一个播放的音频id
    pageHidenType: 1, // 页面隐藏时的类型，1正常 2选相片
    IsVip: 0, //当前聊天，是否其中一人是Vip，可以双方可以 发送语音和图片
    isTape: false, //录音效果
  },
  audioCreate(e) { //待音频为可播放状态，收集所有实例
    this.data.audioObject[e.detail.key] = e.detail.value
  },
  stopAudio(e) {
    let { audioPrevId, audioObject } = this.data
    if (e.detail === audioPrevId) return //点的是同一个
    audioPrevId && audioObject[audioPrevId].stop()
    this.data.audioPrevId = e.detail
  },
  recordStart() { //录音开始
    let record = this.data.record = wx.getRecorderManager()
    let startTime = 0
    let endTime = 0
    record.onStart(() => { //开始录音回调
      this.setData({ isTape: true })
      startTime = new Date().getTime()
      this.data.recordIsNormal = true
    })
    record.onStop((res) => { //停止录音回调
      this.setData({ isTape: false })
      endTime = new Date().getTime()
      const duration = endTime - startTime // res.duration 音频时长，录音器返回的和播放时获取的不符，自己搞
      this.uploadFile(1003, res.tempFilePath, duration)
    })
    record.onError((res) => { //录音错误事件回调
      this.setData({ isTape: false })
      this.data.recordIsNormal = false
    })
    record.start({ duration: 600000, format: 'mp3' })
  },
  recordEnd() { //录音结束
    this.data.record.stop()
  },
  recordCancel() { //按下事件被打断，如来电提醒，弹窗
    this.data.recordIsNormal = false
    this.data.record.stop()
  },
  uploadFile(MessageType, filePath, duration = '') { //上传文件 1002 图片 1003 音频
    if (!this.data.recordIsNormal) return //录音出错等等情况，不上传，不提交
    wx.showLoading({ title: '上传中' })
    wx.uploadFile({
      url: MessageType === 1003 ? $common.config.ChartUpLoadVoice : $common.config.ChartUpLoadImg, filePath, name: 'file', formData: {},
      success: res => {
        let data = JSON.parse(res.data)
        const CrdChatMsg = duration ? `${data.msg}|${duration}` : data.msg
        if (data.res) this.sendMessage({ CrdChatMsg, MessageType })
      },
      complete: wx.hideLoading
    })
  },
  changeVoice() { //切换语音或文字, //语音需要授权
    let { isRecord } = this.data
    if (!isRecord) {
      wx.authorize({
        scope: 'scope.record', complete: () => wx.getSetting({
          success: res => { if (res.authSetting['scope.record']) this.setData({ isRecord: true }) }
        })
      })
    } else {
      this.setData({ isRecord: false })
    }
  },
  chooseImage() { //从相册里选图片
    this.data.pageHidenType = 2
    $common.chooseImage((res) => {
      const imageList = res.tempFilePaths
      for (let i = 0, len = imageList.length; i < len; i++) this.uploadFile(1002, imageList[i])
    })
  },
  sendMessage(obj) { //发送消息  MessageType 1001 文字 1002 图片 1003 语音 1004 视频
    console.log('处理前', obj)
    obj.CrdReceOpId = this.data.userId
    let newDataCount = this.data.newDataCount;
    newDataCount++;
    let listData = this.data.listData;
    let lastData = listData[listData.length - 1];
    let myDate = this.getMyDate()
    let timeStamp = myDate.timeStamp
    listData.push({
      CrdId: timeStamp, //暂用时间戳代替唯一id
      CrdBeMySelf: 1,
      // CrdChatMsg: value,
      ...obj,
      timeStamp,
      showTime: myDate.showTime,
      isTime: listData.length > 0 ? timeStamp - lastData.timeStamp >= this.data.intervalTime ? true : false : false
    });
    let object = {}
    if (obj.MessageType === 1001) { //文字发送后需要清空输入框内容
      object = { value: '', newDataCount, listData }
    } else {
      object = { newDataCount, listData }
    }
    this.setData(object)
    this.myPageScroll()
    console.log('处理后', obj)
    //添加数据到事件队列
    _msgQueue.push(() => _socket.send({ data: JSON.stringify(obj), complete(e) { console.log(e) } }))
    this.loopSendMsg()
  },
  move() { //隐藏层
    this.setData({ isLayer: false })
  },
  copy() { //复制
    let index = this.data.copyIndex;
    let listData = this.data.listData;
    let data = listData[index];
    let context = data.CrdChatMsg;
    let isEn = this.data.isEn;
    wx.setClipboardData({
      data: context,
      success: () => wx.showToast({ title: isEn ? 'success' : '成功', icon: 'success', duration: 1000 }),
      fail: () => wx.showToast({ title: isEn ? 'fail' : '失败', icon: 'none', duration: 1000 }),
      complete: () => this.move()
    })
  },
  longpress(e) { //长按
    let index = e.currentTarget.dataset.index;
    let listData = this.data.listData;
    this.data.copyIndex = index;
    let query = wx.createSelectorQuery().selectAll('.core').boundingClientRect().exec((res) => {
      let node = res[0][index];
      let isTime = listData[index].isTime;
      let top = node.top; //该top是该元素相对于屏幕顶端的距离
      let height = node.height;
      let layerH = 0;
      let isTop = true;
      if (top < 50) { //当前元素距离顶部的距离小于100，三角形在上面
        isTop = false;
        layerH = top + height + 5;
      } else { //三角形在下面
        isTop = true;
        layerH = isTime ? top - 50 + 40 : top - 50;
      }
      this.setData({ isLayer: true, layerH, isTop })
    });
  },
  translate() { //翻译
    let index = this.data.copyIndex;
    let listData = this.data.listData;
    let data = listData[index];
    let context = data.CrdChatMsg;
    let isEn = this.data.isEn;
    let language = isEn ? false : true;
    $common.translate(context,
      (res) => {
        this.move()
        if (!res.data.error_code) { //没报错
          $common.showModal(res.data.trans_result[0].dst, false, false, isEn ? 'confirm' : '确定', isEn ? 'translate' : '翻译')
        }
      },
      language
    )
  },
  courseInfo() { //跳转到课程信息
    let { OtherOpenId, tarTeaId, returnPage, tarUserType } = this.data
    if (returnPage) { //由课程信息和支付页面跳过来的又要跳回去
      wx.navigateBack({ delta: returnPage })
    } else {
      if (tarTeaId <= 0 || tarUserType == 1) {//对方不是老师,查看学生的基本信息
        wx.navigateTo({ url: `/pages/New/stuInfo/stuInfo?openId=${OtherOpenId}` })
      } else {  //查看老师信息
        wx.navigateTo({ url: `/pages/Home/teachersInformation/index?data=${tarTeaId}` })
      }
    }
  },
  removeDuplicate(thisArr, thisId) { //去重
    let hash = {};
    let newArr = thisArr.reduce(function (item, target, index) {
      hash[target[thisId]] ? item[hash[target[thisId]].nowIndex] = target : hash[target[thisId]] = {
        nowIndex: item.push(target) && index
      }
      return item;
    }, []);
    return newArr;
  },
  confirm(e) { //点击右下角 发送 按钮
    console.log('点击发送', e)
    let value = e.detail.value;
    if (value.trim().length <= 0) return;
    this.sendMessage({ CrdChatMsg: value, MessageType: 1001 })
  },
  myPageScroll() {
    setTimeout(() => { // 使页面滚动到底部
      wx.createSelectorQuery().select('#wrap').boundingClientRect(function (rect) { wx.pageScrollTo({ scrollTop: rect.bottom }) }).exec();
    }, 500);
  },
  getImage() { //获取头像
    $common.request('POST',
      $common.config.GetUserInfo, { openId: wx.getStorageSync('openid'), userId: this.data.userId },
      (res) => {
        if (res.data.res) {
          let data = res.data;
          let myImage = data.curIdPhoto ? data.curIdPhoto : data.curAvaUrl,
            myType = data.curIdPhoto ? 2 : 1,
            youImage = data.tarIdPhoto ? data.tarIdPhoto : data.tarAvaUrl,
            youType = data.tarIdPhoto ? 2 : 1,
            tarTeaId = data.tarTeaId,
            tarUserType = data.tarUserType,
            OtherOpenId = data.OtherOpenId;
          wx.setNavigationBarTitle({ //显示昵称或姓名
            title: data.tarUserType == 1 ? data.tarUserNick : data.tarUserName ? data.tarUserName : data.tarUserNick
          })
          this.setData({ myImage, myType, youImage, youType, tarTeaId, tarUserType, IsVip: +data.IsVip, OtherOpenId })
        }
      }
    )
  },
  timeStamp(time) { //时间戳转换为日期
    time = ('' + time).replace(/\D/g, '');
    let date = new Date(+time),
      y = date.getFullYear(),
      m = date.getMonth() + 1,
      d = date.getDate(),
      h = date.getHours(),
      f = date.getMinutes();
    let msec = Date.parse(new Date(+time));
    m < 10 && (m = '0' + m);
    d < 10 && (d = '0' + d);
    h < 10 && (h = '0' + h);
    f < 10 && (f = '0' + f);
    return {
      timeWhile: `${y}-${m}-${d} ${h}:${f}`,
      msec: msec
    }
  },
  getChat(isReach) { //获取聊天记录
    let { pageIndex, pageSize, newDataCount, userId, isOver } = this.data
    if (isOver) return wx.stopPullDownRefresh(); //到底了，不管了
    wx.showLoading({ title: wx.getStorageSync('isEn') ? 'Loading...' : '努力加载中...' });
    $common.request('POST',
      $common.config.GetChatRecord, { openId: wx.getStorageSync('openid'), userId, pageIndex, pageSize, newDataCount },
      (res) => {
        if (res.data.res) {
          let data = res.data.infoList;
          if (data.length >= pageSize) {
            this.data.pageIndex++;
            isOver = false
          } else {
            isOver = true
          }
          let listData = isReach ? this.data.listData : [];
          for (let i = 0, len = data.length; i < len; i++) {
            let date = this.timeStamp(data[i].CrdSendTime);
            data[i].showTime = date.timeWhile;
            data[i].timeStamp = date.msec;
            listData.unshift(data[i]);
          }
          listData = this.removeDuplicate(listData, 'CrdId'); //数组依据CrdId去重
          for (let i = listData.length - 1; i >= 0; i--) {
            let one = listData[i].timeStamp;
            let two = listData[i - 1] ? listData[i - 1].timeStamp : 0;
            //对话时距超过5分钟显示时间 
            listData[i].isTime = one - two >= this.data.intervalTime ? true : false;
          }
          this.setData({ listData, isOver })
          if (isReach) return;
          this.myPageScroll();
        } else {
          // switch (res.data.errType) {
          //   case 1:
          //     //参数错误
          //     break;
          //   case 2:
          //     //userId不正确
          //     break;
          //   case 3:
          //     //获取记录失败
          //     break;
          //   case 4:
          //     //更改消息状态失败
          //     break;
          // }
        }
      },
      (res) => { },
      (res) => {
        console.log('获取聊天记录', res)
        wx.hideLoading();
        wx.stopPullDownRefresh();
      }
    )
  },
  async init() {
    this.getImage();
    await this.getChat();
    this.linkSocket()
  },
  getMyDate(num) {
    let date = num ? new Date(+num) : new Date()
    let y = date.getFullYear(),
      m = date.getMonth() + 1,
      d = date.getDate(),
      h = date.getHours(),
      f = date.getMinutes();
    m < 10 && (m = '0' + m);
    d < 10 && (d = '0' + d);
    h < 10 && (h = '0' + h);
    f < 10 && (f = '0' + f);
    return { timeStamp: date.getTime(), showTime: `${y}-${m}-${d} ${h}:${f}` }
  },
  // beforeSendMessage() { //发送消息前的准备工作
  //   this.loopSendMsg()
  //   // if (_socket.readyState === 1) { //处于连接状态
  //   //   this.loopSendMsg()
  //   // } else {  //中途未知错误，导致连接失败无法发送消息
  //   //   new Promise((resolve) => {
  //   //     try { this.linkSocket(resolve) } catch (err) { }
  //   //   }).then(res => res())
  //   // }
  // },
  async loopSendMsg() { //轮询执行队列里的事件
    console.log('轮询事件', _msgQueue)
    for (let i = 0; i < _msgQueue.length; i++) {
      await _msgQueue[i]()
      _msgQueue.shift() //执行完成后删除该事件
      i--
    }
  },
  reconnect() { //断线重连
    let timer = null
    let isLink = false //是否成功连接
    let n = 0  //重连次数
    this.reconnect = () => {
      console.log('重连函数', pageIsUnload, isLink)
      if (!pageIsUnload) return //页面接下来要被销毁，无需重连
      if (isLink) return
      isLink = true
      clearTimeout(timer)
      if (n < 30) {
        timer = setTimeout(() => {
          console.log('因...  启动重连')
          this.linkSocket()
          isLink = false
        }, 5000)
        n++
      }
    }
    this.reconnect()
  },
  heartCheck() { //心跳检测
    let timeout = 10000
    let timeObj = null  //发送消息确认是否连接正常
    let serverTimeObj = null //当链接无缘无故断开时，断开连接，会自动重新连接
    this.heartCheck = () => {
      clearTimeout(serverTimeObj)
      clearTimeout(timeObj)
      timeObj = setTimeout(() => {
        console.log('发送密钥')
        //发送固定密钥
        _socket.send({ data: 'K1f8Wn1iB3KuHaKHqskGeqiwHfCPv5Km' })
        serverTimeObj = setTimeout(_socket.close, timeout)
      }, timeout)
    }
    this.heartCheck()
  },
  async linkSocket(callback = () => { }) {
    console.log('开始建立连接')
    let openid = wx.getStorageSync('openid');
    //建立连接
    _socket = await wx.connectSocket({
      url: `${$common.webStock}?userId=${openid}&tarUserId=${this.data.userId}`
    });
    _socket.onOpen(() => {
      console.log('WebSocket连接打开')
      this.loopSendMsg()
      this.heartCheck()
    })
    _socket.onError((res) => {
      console.log('WebSocket连接打开失败')
      this.reconnect()
    })
    _socket.onClose((res) => {
      console.log('WebSocket 已关闭！')
      this.reconnect()
    })
    _socket.onMessage((res) => { //接收数据
      console.log('接收数据', res.data)
      if (res.data === '心跳成功！') return this.heartCheck()
      let data = JSON.parse(res.data);
      if (data.CrdReceOpId != this.data.userId) return; //不是正在和你说话的人，不鸟他
      let newDataCount = this.data.newDataCount;
      newDataCount++;
      let listData = this.data.listData;
      let myDate = this.getMyDate(+data.CrdCreateOn)
      let lastData = listData[listData.length - 1];
      listData.push({
        CrdBeMySelf: 0,
        // CrdChatMsg: data.CrdChatMsg,
        ...data,
        // CrdId: new Date().getTime(), //暂用时间戳代替唯一id
        showTime: myDate.showTime,
        timeStamp: data.CrdCreateOn,
        isTime: listData.length > 0 ? data.CrdCreateOn - lastData.timeStamp >= this.data.intervalTime ? true : false : false
      });
      this.setData({ newDataCount, listData })
      this.myPageScroll()
    });
  },
  onLoad: function (options) {
    this.data.userId = options.userId;
    this.data.returnPage = options.returnPage ? +options.returnPage : false;
    pageIsUnload = true
  },
  onReady: function () { },
  isEnEvent(res) { //判断当前显示中英文
    let isEn = wx.getStorageSync('isEn');
    this.setData({ isEn });
    let query = wx.createSelectorQuery();
    setTimeout(() => { //直接执行竟然获取不到
      if (isEn) {
        query.select('#warnE').fields({ size: true }, res => { this.setData({ paddingTop: res.height }) }).exec()
      } else {
        query.select('#warnZ').fields({ size: true }, res => { this.setData({ paddingTop: res.height }) }).exec()
      }
    }, 500);
  },
  onShow: function () {
    let { pageHidenType } = this.data
    if (pageHidenType === 1) {
      this.data.pageIndex = 1
      this.isEnEvent();
      this.init();
    } else if (pageHidenType === 2) {
      this.data.pageHidenType = 1
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    _socket.close && _socket.close()
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    pageIsUnload = false
    _socket.close && _socket.close()
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getChat(true);
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () { },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return $common.share()
  }
})