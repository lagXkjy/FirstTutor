  /**
   * 组件的属性列表
   */
  const $common = require('../../utils/common.js');
  Component({
    properties: {
      obj: {
        type: Object,
        value: null,
        observer(obj) {
          let arr = obj.JournalInfoImg.split('|');
          if (!arr[0]) arr = [];
          obj.imagesArr = arr;
          let isEn = wx.getStorageSync('isEn');
          let nD = new Date().getTime(); //当前时间
          let cD = obj.JournalCreate.replace(/\D/g, ''); //打卡的时间
          let D = nD - cD; //时间差
          let d = Math.floor(D / 1000 / 60 / 60 / 24), //计算剩余的天数
            h = Math.floor(D / 1000 / 60 / 60 % 24), //计算剩余的小时数
            m = Math.floor(D / 1000 / 60 % 60); //计算剩余的分钟数
          let showDate;
          if (isEn) {
            if (d) {
              showDate = `${d} days ago`;
            } else if (h) {
              showDate = `${h} hours ago`;
            } else {
              if (m <= 2) {
                showDate = `just now`;
              } else {
                showDate = `${m} minutes ago`;
              }
            }
          } else {
            if (d) {
              showDate = `${d}天前`;
            } else if (h) {
              showDate = `${h}小时前`;
            } else {
              if (m <= 2) {
                showDate = `刚刚`;
              } else {
                showDate = `${m}分钟前`;
              }
            }
          }
          let themeD = $common.timeStamp(obj.ThemeDate);
          obj.themeTime = `${themeD.y}-${themeD.m}-${themeD.d}`;
          obj.showDate = showDate;
          this.setData({
            obj
          })
        }
      },
      isAdministrator: { //是否是管理员
        type: null,
        value: 0
      },
      activityId: { //打卡活动id
        type: Number,
        value: 1
      },
      isCheck: { //是否可以点击查看别人的打卡记录
        type: Boolean,
        value: false,
      },
      showActivity: { //是否显示活动
        type: Boolean,
        value: false
      }
    },

    /**
     * 组件的初始数据
     */
    data: {
      srcClockInImage: $common.srcClockInImage,
      srcClockInVideo: $common.srcClockInVideo,
      srcClockInAudio: $common.srcClockInAudio,
      commentIndex: 3, //显示评论的条数
      isEn: false
    },

    /**
     * 组件的方法列表
     */
    methods: {
      toActivityDetails() { //跳转到活动详情页
        let obj = this.data.obj;
        wx.navigateTo({
          url: `/pages/clockIn/details/details?ActivityID=${obj.SmallCardActiviID}&isAdministrator=0`
        })
      },
      checkImage(e) { //查看图片
        let index = e.currentTarget.dataset.index;
        let arr = this.data.obj.imagesArr;
        let data = this.data;
        let urls = [];
        for (let i = 0, len = arr.length; i < len; i++) {
          urls.push(`${data.srcClockInImage}${arr[i]}`);
        }
        wx.previewImage({
          current: urls[index], // 当前显示图片的http链接
          urls // 需要预览的图片http链接列表
        })
        this.triggerEvent('checkImage');
      },
      changePraise() { //判断点赞或取消点赞
        let IsFabulous = this.data.obj.IsFabulous;
        if (IsFabulous) { //已点赞，取消点赞
          this.cancelPraise();
        } else { //未点赞，去点赞
          this.praise();
        }
      },
      cancelPraise() { //取消点赞
        let isEn = wx.getStorageSync('isEn');
        let data = this.data;
        $common.loading();
        $common.request(
          'POST',
          $common.config.DeleteFabulous, {
            openId: wx.getStorageSync('openid'),
            SmallCardJournalID: data.obj.Id,
          },
          (res) => {
            if (res.data.res) {
              let obj = this.data.obj;
              obj.IsFabulous = false;
              obj.FabulousList = res.data.Data
              this.setData({
                obj
              });
              this.syncPraiseData();
            } else {
              if (isEn) {
                $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
              } else {
                $common.showModal('未知错误');
              }
            }
          },
          (res) => {
            if (isEn) {
              $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
            } else {
              $common.showModal('亲~网络不给力哦，请稍后重试');
            }
          },
          (res) => {
            $common.hide();
          }
        )
      },
      praise() { //点赞接口
        let isEn = wx.getStorageSync('isEn');
        let data = this.data;
        $common.loading();
        $common.request(
          'POST',
          $common.config.InsertFabulous, {
            openId: wx.getStorageSync('openid'),
            SmallCardActiviID: data.activityId,
            SmallCardJournalID: data.obj.Id,
            SmallCardThemeID: data.obj.ThemeId
          },
          (res) => {
            if (res.data.res) {
              let obj = this.data.obj;
              obj.IsFabulous = true;
              obj.FabulousList = res.data.Data
              this.setData({
                scoreType: 1,
                scoreNum: +res.data.Integral,
                obj
              });
              this.syncPraiseData();
            } else {
              if (res.data.errType === 5) { //用户已经点过赞了
              } else {
                if(res.data.errType === 4){
                  if (isEn) {
                    $common.showModal('You have no jurisdiction.', false, false, 'OK', 'Prompt');
                  } else {
                    $common.showModal('暂无权限');
                  }
                }else{
                  if (isEn) {
                    $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
                  } else {
                    $common.showModal('未知错误');
                  }
                }
                
              }
            }
          },
          (res) => {
            if (isEn) {
              $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
            } else {
              $common.showModal('亲~网络不给力哦，请稍后重试');
            }
          },
          (res) => {
            $common.hide();
          }
        )
      },
      deleteEvent() { //删除本条打卡日记
        let isEn = wx.getStorageSync('isEn');
        if (isEn) {
          $common.showModal('Confirm the deletion?', true, (res) => {
            if (res.confirm) {
              this.delete();
            }
          }, 'OK', 'Reminder', 'NO')
        } else {
          $common.showModal('确认删除？', true, (res) => {
            if (res.confirm) {
              this.delete();
            }
          })
        }
      },
      delete() {
        let isEn = wx.getStorageSync('isEn');
        $common.request(
          'POST',
          $common.config.GetDeleteJournal, {
            JournalID: this.data.obj.Id
          },
          (res) => {
            if (res.data.res) {
              this.triggerEvent('deleteDiary');
            } else {
              if (isEn) {
                $common.showModal('Delete failure', false, false, 'Ok', 'Reminder');
              } else {
                $common.showModal('删除失败');
              }
            }
          },
          (res) => {
            if (isEn) {
              $common.showModal('Unknown Error', false, false, 'Ok', 'Reminder');
            } else {
              $common.showModal('亲~网络不给力哦，请稍后重试');
            }
          },
          (res) => {

          }
        )
      },
      syncPraiseData() { //同步点赞数据
        let data = this.data.obj;
        let obj = {
          IsFabulous: data.IsFabulous,
          FabulousList: data.FabulousList
        }
        this.triggerEvent('syncPraiseData', obj);
      },
      checkMore() { //点击查看更多
        let commentIndex = this.data.commentIndex;
        commentIndex += 3;
        this.setData({
          commentIndex
        })
      },
      toComment() { //跳转到评论页
        let obj = this.data.obj;
        this.triggerEvent('syncComment');
        wx.navigateTo({
          url: `/pages/clockIn/comment/comment?SmallCardJournalID=${obj.Id}&SmallCardThemeID=${obj.ThemeId}&SmallCardActiviID=${this.data.activityId}`,
        })
      },
      check() { //查看别人的打卡记录
        if (!this.data.isCheck) return;
        wx.navigateTo({
          url: `/pages/clockIn/thisRecord/thisRecord?JournalID=${this.data.obj.Id}`,
        })
      },
    },
    ready(){
      this.setData({
        isEn: wx.getStorageSync('isEn')
      })
    }
  })