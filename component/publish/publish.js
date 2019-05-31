const $common = require('../../utils/common.js');
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    themeInfoData: { //修改主题，传递数据
      type: Object,
      value: null,
      observer(info) {
        let text = JSON.parse(info.text);
        let images = info.images.split(',');
        let audio = info.audio.split(',');
        let video = info.video.split(',');
        let listData = [];
        for (let i = 0; i < 3; i++) {
          let arr = images[i].split('|');
          if (arr[0]) {
            for (let j = 0, l = arr.length; j < l; j++) {
              arr[j] = {
                isRevise: true,
                url: arr[j]
              }
            }
          } else {
            arr = [];
          }
          if(text[i] || arr.length > 0 || audio[i] || video[i]){
            listData.push({
              text: decodeURIComponent(text[i]),
              images: arr,
              audio: audio[i],
              video: video[i],
              audioIsShow: audio[i] ? true : false, //录音框是否显示
              timer: null, //计时器
              timeNum: 0, //初始时间
              showTime: '00:00', //显示的时间
              isAudioDelete: false, //录音删除或停止
            })
          }
        }
        this.setData({
          listData,
          reviseAudio: true,
          reviseVideo: true
        })
      }
    },
    placeholder: { // textarea的placeholder
      type: String,
      value: ''
    },
    stopPlay: { //是否停止录音或播放
      type: Boolean,
      value: false,
      observer(e) {
        if (e) this.audioComplate();
      }
    },
    isImage: { //是否显示图片
      type: Boolean,
      value: true,
    },
    isVideo: { //是否显示视频
      type: Boolean,
      value: true,
    },
    showAdd: { //是否显示添加按钮
      type: Boolean,
      value: false,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    srcClockInCatch: $common.srcClockInCatch,
    srcClockInImage: $common.srcClockInImage,
    srcClockInVideo: $common.srcClockInVideo,
    srcClockInAudio: $common.srcClockInAudio,
    isEn: wx.getStorageSync('isEn'),
    listData: [{
      text: '',
      video: '',
      videoImage: '',
      images: [],
      audio: '',
      audioIsShow: false, //录音框是否显示
      timer: null, //计时器
      timeNum: 0, //初始时间
      showTime: '00:00', //显示的时间
      isAudioDelete: false, //录音删除或停止
    }],
    // text: '',
    // video: '',
    // videoImage: '',
    maxImageNum: 4, //选择图片的最大数量
    // images: [],
    // audio: '',
    record: null, //全局唯一录音实例
    // audioIsShow: false, //录音框是否显示
    // timer: null, //计时器
    // timeNum: 0, //初始时间
    // showTime: '00:00', //显示的时间
    // isAudioDelete: false, //录音删除或停止
    reviseAudio: false, //页面进来是否用来修改音频, false 临时路径  true 正式路径
    reviseVideo: false, //页面进来是否用来修改视频, false 临时路径  true 正式路径
  },

  /**
   * 组件的方法列表
   */
  methods: {
    addList() { //添加数组长度
      let listData = this.data.listData;
      listData.push({
        text: '',
        video: '',
        videoImage: '',
        images: [],
        audio: '',
        audioIsShow: false, //录音框是否显示
        timer: null, //计时器
        timeNum: 0, //初始时间
        showTime: '00:00', //显示的时间
        isAudioDelete: false, //录音删除或停止
      });
      this.setData({
        listData
      })
    },
    uploadFile(url, filePath, callback, formData = {}, uploadType = 0) { //上传文件的函数
      $common.loading(2);
      wx.uploadFile({
        url,
        filePath,
        name: 'file',
        formData,
        success: (res) => {
          let data = JSON.parse(res.data);
          if (data.res) { //上传成功
            if (uploadType === 3) { //上传完视频，视频路径变为临时路径
              this.setData({
                reviseVideo: false
              })
            }
            if (uploadType === 2) { //上传完音频，视频路径变为临时路径
              this.setData({
                reviseAudio: false
              })
            }
            callback(data.msg);
          } else { //上传失败
            if (this.data.isEn) {
              $common.showModal('Upload Failed', false, false, 'OK', 'Reminder');
            } else {
              $common.showModal('上传失败');
            }
          }
        },
        fail: (res) => {
          if (this.data.isEn) {
            $common.showModal('Unknown Error', false, false, 'OK', 'Reminder');
          } else {
            $common.showModal('未知错误');
          }
        },
        complete: (res) => {
          $common.hide();
        }
      })
    },
    deleteFile(FileName, FileType, callback = () => { }) { //专门删临时文件的函数
      $common.loading(3);
      $common.request(
        'POST',
        $common.config.DelAtyFile, {
          FileName,
          Type: 0,
          FileType,
        },
        (res) => {
          if (res.data.res) {
            callback();
          } else {
            if (this.data.isEn) {
              $common.showModal('Delete failed', false, false, 'OK', 'Reminder');
            } else {
              $common.showModal('删除失败');
            }
          }
        },
        (res) => {
          if (this.data.isEn) {
            $common.showModal('Unknown Error', false, false, 'OK', 'Reminder');
          } else {
            $common.showModal('未知错误');
          }
        },
        (res) => {
          wx.hideLoading();
        }
      )
    },
    inputEvent(e) { //textarea文本框
      let value = e.detail.value;
      let indexs = e.currentTarget.dataset.indexs;
      this.data.listData[indexs].text = value;
      clearTimeout(this.data.inputTimer);
      this.data.inputTimer = setTimeout(() => {
        this.syncData();
      }, 500);
    },
    chooseImage(e) { //选择图片
      let indexs = e.currentTarget.dataset.indexs;
      let listData = this.data.listData;
      let images = listData[indexs].images;
      this.pageHide();
      let length = images.length;
      let maxImageNum = this.data.maxImageNum;
      if (length >= maxImageNum) return;
      $common.chooseImage((res) => {
        let arr = res.tempFilePaths;
        this.uploadImages(arr, (array) => { //上传图片成功后回调处理
          for (let i = 0, len = array.length; i < len; i++) {
            images.push({
              url: array[i]
            });
          }
          this.setData({
            listData
          });
          this.syncData();
        });
      }, maxImageNum - length);
    },
    uploadImages(arr, callback) { //上传图片
      let i = 0;
      let array = [];
      $common.loading(2);
      const upload = () => { //递归
        if (i >= arr.length) { //全部上传完成
          callback(array);
          wx.hideLoading();
          return;
        }
        wx.uploadFile({
          url: $common.config.UpLoadImg,
          filePath: arr[i],
          name: 'file',
          formData: {
            Type: 0
          },
          success: (res) => {
            let data = JSON.parse(res.data);
            if (data.res) { //上传成功
              array.push(data.msg);
            } else { //上传失败
              wx.showToast({
                title: 'fail',
                duration: 500
              })
            }
          },
          fail: (res) => {
            wx.showToast({
              title: 'fail',
              duration: 500
            })
          },
          complete: (res) => {
            i++;
            upload();
          }
        })
      }
      upload();
    },
    deleteImage(e) { //删除图片
      let index = e.currentTarget.dataset.index;
      let indexs = e.currentTarget.dataset.indexs;
      let listData = this.data.listData;
      let images = listData[indexs].images;
      this.deleteFile(images[index].url, 0, () => {
        images.splice(index, 1);
        this.setData({
          listData
        });
        this.syncData();
      });
    },
    startRecord(e) { //开始录音
      let indexs = e.currentTarget.dataset.indexs;
      let listData = this.data.listData;
      this.audioComplate(); //录音是全局唯一的，开启一个，就先停止另一个
      this.setData({
        isEn: wx.getStorageSync('isEn')
      })
      wx.authorize({
        scope: 'scope.record',
        complete: res => {
          wx.getSetting({
            success: res => {
              if (!res.authSetting['scope.record']) { //未授权

              } else { //已授权
                let record = wx.getRecorderManager(); //获取全局唯一的录音器
                let options = {
                  duration: 600000, //最大时长10分钟
                  format: 'mp3',
                  audioSource: 'auto'
                };
                listData[indexs].isAudioDelete = false;
                record.indexs = indexs;
                record.start(options);
                record.onStart(() => { //开始录音回调
                  listData[indexs].audio = '';
                  this.setData({
                    listData
                  })
                  listData[indexs].timeNum = 0;
                  this.timerEvent();
                });
                record.onStop((res) => { //停止录音回调
                  clearTimeout(listData[indexs].timer);
                  //isAudioDelete 删除录音   or   录音完成
                  // res.tempFilePath
                  if (listData[indexs].isAudioDelete) { //删除录音 
                    listData[indexs].audio = '';
                    this.setData({
                      listData
                    });
                    this.syncData(); //删除录音和新增录音数据都在这里进行
                  } else {
                    this.uploadFile($common.config.UploadVoice, res.tempFilePath, (audio) => {
                      listData[indexs].audio = audio;
                      this.setData({
                        listData
                      });
                      this.syncData(); //删除录音和新增录音数据都在这里进行
                    }, undefined, 2);
                  }
                })
                this.data.record = record;
                listData[indexs].audioIsShow = true;
                this.setData({
                  listData
                })
              }
            }
          })
        }
      });
    },
    uploadAudio(audioPath, callback) { //上传音频
      $common.loading(2);
      wx.uploadFile({
        url: $common.config.UploadVoice,
        filePath: audioPath,
        name: 'file',
        formData: {},
        success: (res) => {
          let data = JSON.parse(res.data);
          if (data.res) { //上传成功
            callback(data.msg);
          } else { //上传失败
            if (this.data.isEn) {
              $common.showModal('Upload Failed', false, false, 'OK', 'Reminder');
            } else {
              $common.showModal('上传失败');
            }
          }
        },
        fail: (res) => {
          if (this.data.isEn) {
            $common.showModal('Unknown Error', false, false, 'OK', 'Reminder');
          } else {
            $common.showModal('未知错误');
          }
        },
        complete: (res) => {
          $common.hide();
        }
      })
    },
    timerEvent() { //显示录音时间
      let indexs = this.data.record.indexs;
      let listData = this.data.listData;
      let timeNum = listData[indexs].timeNum;
      listData[indexs].timer = setTimeout((res) => {
        timeNum += 1000;
        let m = Math.floor(timeNum / 1000 / 60 % 60),
          s = Math.floor(timeNum / 1000 % 60);
        m < 10 && (m = '0' + m);
        s < 10 && (s = '0' + s);
        listData[indexs].timeNum = timeNum;
        listData[indexs].showTime = `${m}:${s}`;
        this.setData({
          listData
        })
        this.timerEvent();
      }, 1000);
    },
    audioComplate() { //录音结束
      let record = this.data.record;
      record && record.stop && record.stop();
    },
    audioDelete(e) { //删除录音
      let indexs = e.currentTarget.dataset.indexs;
      let listData = this.data.listData;
      listData[indexs].isAudioDelete = true; //删
      this.audioComplate();
      listData[indexs].timeNum = 0;
      listData[indexs].audio && this.deleteFile(listData[indexs].audio, 2); //音频已经上传成功，删除服务器里的文件
      listData[indexs].audioIsShow = false;
      listData[indexs].showTime = '00:00';
      listData[indexs].audio = '';
      this.setData({ listData });
      this.syncData();
    },
    chooseVideo(e) { //选择视频
      let indexs = e.currentTarget.dataset.indexs;
      let listData = this.data.listData;
      this.pageHide();
      $common.chooseVideo((res) => {
        this.uploadFile($common.config.UploadVideo, res.tempFilePath, (video) => {
          listData[indexs].video = video;
          this.setData({
            listData,
          });
          this.syncData();
        }, undefined, 3);
      });
    },
    deleteVideo(e) { //删除视频
      let indexs = e.currentTarget.dataset.indexs;
      let listData = this.data.listData;
      this.deleteFile(listData[indexs].video, 1, () => {
        listData[indexs].video = '';
        listData[indexs].videoImage = '';
        this.setData({
          listData
        });
        this.syncData();
      });
    },
    syncData() { //将该组件的数据同步到父组件
      let data = this.data;
      let listData = data.listData;
      let text = [];
      let images = [];
      let audio = [];
      let video = [];
      for (let i = 0; i < 3; i++) {
        let string = listData[i] && listData[i].text ? listData[i].text.replace(/"/g, "'").replace(/\\/g, '/') : '';
        text.push(encodeURIComponent(string));
        let imageArr = [];
        if (listData[i]) {
          for (let j = 0, l = listData[i].images.length; j < l; j++) {
            imageArr.push(listData[i].images[j].url);
          }
        }
        images.push(imageArr.length > 0 ? imageArr.join('|') : '');
        audio.push(listData[i] && listData[i].audio ? listData[i].audio : '');
        video.push(listData[i] && listData[i].video ? listData[i].video : '');
      }
      let obj = {
        text,
        images,
        audio,
        video,
      }
      this.triggerEvent('syncData', obj);
    },
    pageHide() {
      this.triggerEvent('pageHide');
    }
  },
  ready(){
    this.setData({
      isEn: wx.getStorageSync('isEn')
    })
  }
})