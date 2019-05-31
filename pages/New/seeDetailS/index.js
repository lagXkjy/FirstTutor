const $common = require('../../../utils/common.js');
Page({
  data: {
    nedId: -1,
    status: 1, //1 发布需求， 2 修改需求
    weekList: ['一', '二', '三', '四', '五', '六', '日'],
    weekIndex: 0,
    timeList: ['上午', '下午1', '下午2', '晚上'],
    timeIndex: 0,
    pariceList: [
      [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
      [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000],
    ],
    priceIndex: [1, 2],
    address: '',
    course: '',
    other: '',
    userName: '',
    phone: '',
    age: '',
    sexData: [{
      id: 0,
      data: '女',
    }, {
      id: 1,
      data: '男'
    }],
    sexIndex: 0,
    StuId: -1,
    btnFalg: true,
    countList: [], //所在区域
    countIndex: [0, 0],
    areaCache: {}, //所有城市的缓存
    areaStop: null, //区域切换，函数防抖
    AsCanId: 1, //注册的时候选择的城市
    AsAiId: 1, //注册的时候选择的区域
  },
  changeColumn(e) { //区域某一列变化
    let num = e.detail.column;
    let value = e.detail.value;
    if (num === 0) { //城市切换
      clearTimeout(this.data.areaStop);
      let countList = this.data.countList;
      countList[1] = [];
      this.setData({
        countList: countList,
        countIndex: [value, 0]
      });
      this.data.areaStop = setTimeout(() => {
        this.getAreaList();
      }, 500);
    } else { //区域切换
      let countIndex = this.data.countIndex;
      countIndex[1] = value;
      this.setData({
        countIndex: countIndex
      });
    }
  },
  getAreaList(AsAiId) { //获取该城市的所有区
    let vm = this.data;
    let id = vm.countList[0][vm.countIndex[0]].CanId; //当前城市id
    let areaCache = this.data.areaCache;
    if (areaCache[id]) { //缓存里有该城市区域信息
      let countList = vm.countList;
      countList[1] = areaCache[id];
      this.setData({
        countList: countList
      });
      return;
    }
    $common.request(
      'POST',
      $common.config.GetAreaInfos, {
        canId: id
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.data;
          areaCache[id] = data;
          this.data.areaCache = areaCache;
          let countList = vm.countList;
          countList[1] = data;
          if (AsAiId) { //同步注册和修改时的地区
            let countIndex = this.data.countIndex;
            for (let i = 0, len = data.length; i < len; i++) {
              if (AsAiId === data[i].AiId) {
                countIndex[1] = i;
                break;
              }
            }
            this.setData({
              countIndex: countIndex
            });
          }
          this.setData({
            countList: countList
          });
        } else {}
      },
      (res) => {},
      (res) => {}
    )
  },
  getCityInfo() { //获取城市信息
    $common.request(
      'POST',
      $common.config.GetCityInfos,
      null,
      (res) => {
        if (res.data.res) {
          let data = res.data.data;
          for (let i = 0, len = data.length; i < len; i++) {
            data[i].AiName = data[i].CanCityName;
          }
          this.setData({
            countList: [data, []]
          });
          this.init();
        } else {}
      },
      (res) => {},
      (res) => {}
    )
  },
  getRegArea() { //获取注册的时候选择的城市
    $common.request(
      'POST',
      $common.config.GetStuAreaSel, {
        openId: wx.getStorageSync('openid')
      },
      (res) => {
        let AsCanId = res.data.areaSel.AsCanId;
        let AsAiId = false;
        if (AsCanId != 0) {
          let countList = this.data.countList;
          let countIndex = this.data.countIndex;
          AsAiId = res.data.areaSel.AsAiId;
          for (let i = 0, len = countList[0].length; i < len; i++) {
            if (AsCanId === countList[0][i].CanId) {
              countIndex[0] = i;
              break;
            }
          }
          this.setData({
            countList: countList,
            countIndex: countIndex
          });
        }
        this.getAreaList(AsAiId);
      },
      (res) => {},
      (res) => {}
    )
  },
  stuTemplateMessage() { //模板消息
    wx.navigateTo({
      url: '/pages/me/stuTemplateMessage/stuTemplateMessage',
    })
  },
  bindName(e) { //姓名
    this.data.userName = e.detail.value;
  },
  bindPhone(e) { //手机号
    this.data.phone = e.detail.value;
  },
  bindWeekChange(e) { //星期
    this.setData({
      weekIndex: parseInt(e.detail.value)
    })
  },
  bindTimeChange(e) { //时间段
    this.setData({
      timeIndex: parseInt(e.detail.value)
    })
  },
  bindPriceChange(e) { //费用
    let data = e.detail.value;
    if (data[0] >= data[1]) {
      $common.showModal('请选择正确的费用区间');
      return;
    }
    this.setData({
      priceIndex: e.detail.value
    })
  },
  bindAddress(e) { //地址
    this.setData({
      address: e.detail.value
    })
  },
  bindSexChange(e) { //性别
    this.setData({
      sexIndex: parseInt(e.detail.value)
    })
  },
  bindAge(e) { //年龄
    this.data.age = e.detail.value
  },
  bindCourse(e) { //课程
    this.setData({
      course: e.detail.value
    })
  },
  bindOther(e) { //其他要求
    this.setData({
      other: e.detail.value
    })
  },
  submit() { //提交需求
    if (!this.data.btnFalg) return;
    this.data.btnFalg = false;
    let week = parseInt(this.data.weekIndex) + 1,
      time = parseInt(this.data.timeIndex) + 1,
      minPrice = this.data.pariceList[0][this.data.priceIndex[0]],
      maxPrice = this.data.pariceList[1][this.data.priceIndex[1]],
      address = this.data.address,
      course = this.data.course,
      other = this.data.other;
    let userName = this.data.userName,
      phone = this.data.phone,
      sexData = this.data.sexData,
      sexIndex = this.data.sexIndex,
      age = this.data.age;
    if (userName.trim().length <= 0) {
      $common.showModal('请填写姓名');
      this.data.btnFalg = true;
      return;
    }
    if (!$common.phoneReg.test(phone)) {
      $common.showModal('请填写正确的手机号');
      this.data.btnFalg = true;
      return;
    }
    if (address.trim().length <= 0) {
      $common.showModal('请填写上课地址');
      this.data.btnFalg = true;
      return;
    }

    if (isNaN(parseInt(age)) || parseInt(age) < 0) {
      $common.showModal('请填写正确的年龄');
      this.data.btnFalg = true;
      return;
    }
    if (course.trim().length <= 0) {
      $common.showModal('请填写学习课程');
      this.data.btnFalg = true;
      return;
    }
    let status = this.data.status;
    let student = {
      StuName: userName,
      StuGender: sexData[sexIndex].id,
      StuAge: age,
      StuPhone: phone,
      StuId: this.data.StuId
    }
    let countList = this.data.countList;
    let countIndex = this.data.countIndex;
    let areaSel = {
      AsCanId: countList[0][countIndex[0]].CanId,
      AsAiId: countList[1][countIndex[1]].AiId
    }
    if (status === 1) { //发布需求
      this.saveData(course, address, week, minPrice, maxPrice, other, time, student, areaSel);
    } else if (status === 2) { //修改需求
      this.reviseData(course, address, week, minPrice, maxPrice, other, time, student, areaSel);
    }
  },
  reviseData(NedCorName, NedAddress, NedCorAfw, NedMinPrice, NedMaxPrice, NedOther, NedClaTime, stuInfo, areaSel) { //修改需求
    $common.request(
      'POST',
      $common.config.AlterMyLearnNeedInfo, {
        lnd: {
          NedId: this.data.nedId,
          NedCorName: NedCorName, //学习课程
          NedAddress: NedAddress, //学习地址
          NedCorAfw: NedCorAfw, //上课时间（周几）
          NedMinPrice: NedMinPrice, //最低价格
          NedMaxPrice: NedMaxPrice, //最高价格
          NedOther: NedOther, //其他要求
          NedClaTime: NedClaTime, //上课时间段（1 上午，2 下午1，3 下午2，4 晚上）
          NedClaArea: 1, //所在区域
        },
        areaSel: areaSel,
        stuInfo: stuInfo
      },
      (res) => {
        if (res.data.res) {
          wx.showToast({
            title: '修改成功',
            icon: 'success',
          })
          setTimeout(() => {
            this.data.btnFalg = true;
            wx.navigateBack({
              delta: 1
            })
          }, 1500);
        } else {
          this.data.btnFalg = true;
          switch (res.data.errType) {
            case 1:
              $common.showModal('参数不正确');
              break;
            case 2:
              $common.showModal('修改失败');
              break;
          }
        }
      },
      (res) => {
        this.data.btnFalg = true;
      },
      (res) => {}
    )
  },
  saveData(NedCorName, NedAddress, NedCorAfw, NedMinPrice, NedMaxPrice, NedOther, NedClaTime, student, areaSel) { //发布需求
    $common.request(
      'POST',
      $common.config.ReleaseMyLearnNeed, {
        openId: wx.getStorageSync('openid'),
        lnd: {
          NedCorName: NedCorName, //学习课程
          NedAddress: NedAddress, //学习地址
          NedCorAfw: NedCorAfw, //上课时间（周几）
          NedMinPrice: NedMinPrice, //最低价格
          NedMaxPrice: NedMaxPrice, //最高价格
          NedOther: NedOther, //其他要求
          NedClaTime: NedClaTime, //上课时间段（1 上午，2 下午1，3 下午2，4 晚上）
          NedClaArea: 1, //所在区域
        },
        areaSel: areaSel,
        student: student
      },
      (res) => {
        if (res.data.res) {
          wx.showToast({
            title: '添加成功',
            icon: 'success',
          })
          setTimeout(() => {
            this.data.btnFalg = true;
            wx.navigateBack({
              delta: 1
            })
          }, 1500);
        } else {
          this.data.btnFalg = true;
          switch (res.data.errType) {
            case 1:
              $common.showModal('参数不正确');
              break;
            case 2:
              $common.showModal('未知错误');
              break;
            case 3:
              $common.showModal('未知错误');
              break;
            case 4:
              $common.showModal('添加失败');
              break;
          }
        }
      },
      (res) => {
        this.data.btnFalg = true;
      },
      (res) => {

      }
    )
  },
  init() {
    let status = this.data.status;
    if (status === 1) { //发布需求
      wx.stopPullDownRefresh();
      this.getRegArea();
      return;
    }
    wx.showLoading({
      title: '努力加载中...'
    });
    $common.request(
      'POST',
      $common.config.GetMyLearnNeedInfo, {
        nedId: this.data.nedId
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.lnd;
          let pariceList = this.data.pariceList[0],
            minIndex = 0,
            maxIndex = 0;
          for (let i = 0, len = pariceList.length; i < len; i++) {
            (pariceList[i] == data.NedMinPrice) && (minIndex = i);
            (pariceList[i] == data.NedMaxPrice) && (maxIndex = i);
          }
          let student = res.data.stuInfo;
          let userName = student.StuName,
            phone = student.StuPhone,
            StuId = student.StuId,
            age = student.StuAge,
            sexIndex = student.StuGender;
          let AsCanId = data.NedAreaSelect.AsCanId;
          let AsAiId = data.NedAreaSelect.AsAiId;
          let countList = this.data.countList;
          let countIndex = this.data.countIndex;
          for (let i = 0, len = countList[0].length; i < len; i++) {
            if (countList[0][i].CanId === AsCanId) {
              countIndex[0] = i;
              break;
            }
          }
          this.setData({
            address: data.NedAddress,
            course: data.NedCorName,
            other: data.NedOther,
            weekIndex: parseInt(data.NedCorAfw) - 1,
            timeIndex: parseInt(data.NedClaTime) - 1,
            priceIndex: [minIndex, maxIndex],
            userName: userName,
            phone: phone,
            StuId: StuId,
            age: age,
            sexIndex: sexIndex,
            countIndex: countIndex
          });
          this.getAreaList(AsAiId);
        } else {
          switch (res.data.errType) {
            case 1:
              $common.showModal('参数不正确');
              break;
            case 1:
              $common.showModal('未知错误');
              break;
          }
        }
      },
      (res) => {

      },
      (res) => {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      }
    )
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let status = options.status ? parseInt(options.status) : 1;
    let nedId = options.nedId ? options.nedId : -1;
    this.setData({
      status: status,
      nedId: nedId
    });
    switch (status) {
      case 1:
        wx.setNavigationBarTitle({
          title: '需求查看'
        })
        break;
      case 2:
        wx.setNavigationBarTitle({
          title: '需求修改'
        })
        break;
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.getCityInfo();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getCityInfo();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return $common.share()
  }
})