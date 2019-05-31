// component/music/music.js
Component({
  properties: {
    stopPlay: { //停止播放事件
      type: Boolean,
      value: false,
      observer(e) {
        if (e) this.musicStop();
      }
    },
    myType: { //播放器颜色样式, 1 红色的
      type: null,
      value: 0,
    },
    isStop: { //是否停止
      type: Boolean,
      value: false,
      observer(e) {
        if (e) this.musicStop();
      }
    },
    showDelete: { //是否显示删除按钮
      type: Boolean,
      value: false
    },
    path: { //音乐播放地址
      type: String,
      value: '',
      observer(e) {
        if (e) {
          if (!this.data.srcOnce) return;
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
            //妈的，播放进度结束的时候和总长度不符合
            let allLong = parseInt(innerAudio.duration) * 1000; //音频总长度
            let nowLong = parseInt(innerAudio.currentTime) * 1000; //当前进度
            nowLong = allLong;
            this.changeDevelop(nowLong, allLong);
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
            let nowLong = once ? 1 : parseInt(innerAudio.currentTime) * 1000; //当前进度
            if (once) {
              innerAudio.stop();
              let Am = Math.floor(allLong / 1000 / 60 % 60),
                As = Math.floor(allLong / 1000 % 60);
              Am < 10 && (Am = '0' + Am);
              As < 10 && (As = '0' + As);
              this.setData({
                end: `${Am}:${As}`,
              })
              return;
            }
            this.changeDevelop(nowLong, allLong);
          });
          this.data.innerAudio = innerAudio;
        }
      }
    }
  },
  data: {
    develop: 0,
    start: '00:00',
    end: '00:00',
    isPlay: false, //是否播放
    srcOnce: true,
  },
  methods: {
    changeDevelop(nowLong, allLong) {
      nowLong > allLong && (nowLong = allLong); //有进度超过总时间，我是怎么算的
      let Nm = Math.floor(nowLong / 1000 / 60 % 60),
        Ns = Math.floor(nowLong / 1000 % 60);
      Nm < 10 && (Nm = '0' + Nm);
      Ns < 10 && (Ns = '0' + Ns);
      let Am = Math.floor(allLong / 1000 / 60 % 60),
        As = Math.floor(allLong / 1000 % 60);
      Am < 10 && (Am = '0' + Am);
      As < 10 && (As = '0' + As);
      this.setData({
        start: `${Nm}:${Ns}`,
        end: `${Am}:${As}`,
        develop: (nowLong * 100 / allLong).toFixed(2)
      })
    },
    musicPlay() { //音乐播放或暂停
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
    deleteMusic() {
      this.musicStop();
      this.triggerEvent('audioDelete');
    },
  }
})