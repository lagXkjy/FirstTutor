// component/voice/voice.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    path: { //音乐播放地址
      type: String,
      value: '',
      observer(e) {
        if (e) {
          if(!this.data.srcOnce) return;
          this.data.srcOnce = false;
          let innerAudio = wx.createInnerAudioContext();
          innerAudio.src = e;
          innerAudio.obeyMuteSwitch = false;
          //由于只能在播放的时候才能获取到音频总长度，音频生成后先播放一次
          //用计时器，在真机上获取不到
          let once = true;
          innerAudio.onCanplay(() => { //监听音频达到可播放状态
            if (once) {
              innerAudio.volume = 0;
              innerAudio.offCanplay(); //音频加载成功后停止监听
              setTimeout(() => {
                innerAudio.play();
              }, 100);
            }
          });
          innerAudio.onPlay((res) => { //播放
            if (once) return;
            this.setData({
              isPlay: !this.data.isPlay
            })
          });
          innerAudio.onPause((res) => { //暂停
            this.setData({
              isPlay: !this.data.isPlay
            });
          });
          innerAudio.onStop((res) => { //停止
            this.setData({
              isPlay: false
            });
            innerAudio.volume = 1;
            once = false;
          });
          innerAudio.onEnded((res) => { //播放自然播放结束
            let allLong = parseInt(innerAudio.duration) * 1000; //音频总长度
            this.changeDevelop(0, allLong);
            this.setData({
              isPlay: false
            });
          });
          innerAudio.onError((res) => { //音频播放错误事件
            this.setData({
              isPlay: false
            });
          });
          innerAudio.onTimeUpdate(() => { //监听进度
            //不取整进度条和时间都不稳定
            let allLong = parseInt(innerAudio.duration) * 1000; //音频总长度
            let nowLong = parseInt(innerAudio.currentTime) * 1000; //当前进度
            if (once) {
              innerAudio.stop();
              let d = allLong;
              let m = Math.floor(d / 1000 / 60 % 60),
                s = Math.floor(d / 1000 % 60);
              m < 10 && (m = '0' + m);
              s < 10 && (s = '0' + s);
              this.setData({
                start: `${m}:${s}`,
              })
              return;
            }
            this.changeDevelop(nowLong, allLong);
          });
          this.data.innerAudio = innerAudio;
        }
      }
    },
    isStop: { //是否停止
      type: Boolean,
      value: false,
      observer(e) {
        if (e) this.musicStop();
      }
    },
    stopPlay: { //停止播放事件
      type: Boolean,
      value: false,
      observer(e) {
        if (e) this.musicStop();
      }
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    start: '00:00',
    isPlay: false, //是否播放
    srcOnce: true,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    changeDevelop(nowLong, allLong) {
      nowLong > allLong && (nowLong = allLong); //有进度超过总时间，我是怎么算的
      let d = allLong - nowLong;
      let m = Math.floor(d / 1000 / 60 % 60),
        s = Math.floor(d / 1000 % 60);
      m < 10 && (m = '0' + m);
      s < 10 && (s = '0' + s);
      this.setData({
        start: `${m}:${s}`,
      })
    },
    changePlay() { //音乐播放或暂停
      let innerAudio = this.data.innerAudio;
      if (this.data.isPlay) { //正在播放
        innerAudio && innerAudio.pause && innerAudio.pause();
      } else { //已暂停
        innerAudio && innerAudio.play && innerAudio.play();
      }
    },
    musicStop() { //音乐播放停止
      let innerAudio = this.data.innerAudio;
      innerAudio && innerAudio.stop && innerAudio.stop();
    },
  },
  ready() { },
})