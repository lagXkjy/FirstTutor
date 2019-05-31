const $common = require('../../../utils/common.js');
const $static = require('../../../utils/static.js');
Page({
  data: {
    srcForIdPhoto: $common.srcForIdPhoto,
    addressData: $static.areaShanghaiEn,
    input: '', //课程名/学生名
    listData: [],
    modalArr: [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000], //价格区间模板数组
    priceList: [], //价格区间
    priceIndex: [0, 0],
    isPrice: false,
    isPriceAll: false,
    pageIndex: 1, //分页
    pageSize: 15, //每页多少数据
    hash: {},
    hashEn: {},
    pageIndexEn: 1,
    pageSizeEn: 15,
    pageListEn: [],
    stop: null, //函数防抖
    flage: true, //函数节流
    nationList: [], //国家 2018-07-13
    nationIndex: 0,
    lableList: [], //标签
    lableIndex: 0,
    countList: [], //区域
    countIndex: [0, 0],
    areaCache: { //所有城市的缓存
      "-1": [{
        AiId: -1,
        AiName: '不限'
      }]
    },
    areaStop: null, //区域切换，函数防抖
    isOverZ: false,
    isOverE: false,
  },
  changeColumn(e) { //区域某一列变化
    let num = e.detail.column;
    let value = e.detail.value;
    if (num === 0) { //城市切换
      clearTimeout(this.data.areaStop);
      let countList = this.data.countList;
      countList[1] = [{
        AiId: -1,
        AiName: '不限'
      }];
      this.setData({
        countList: countList
      })
      this.data.areaStop = setTimeout(() => {
        this.data.countIndex = [value, 0];
        this.getAreaList();
      }, 500);
    } else { //区域切换
      let countIndex = this.data.countIndex;
      countIndex[1] = value;
      this.data.countIndex = countIndex;
    }
  },
  changeCount(e) { //切换区域
    let value = e.detail.value;
    value[1] = value[1] || 0;
    this.setData({
      countIndex: value,
      listData: []
    });
    this.data.isOverZ = false;
    this.getListData();
  },
  getAreaList() { //获取该城市的所有区
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
          data.unshift({
            AiId: -1,
            AiName: '不限'
          });
          areaCache[id] = data;
          this.data.areaCache = areaCache;
          let countList = vm.countList;
          countList[1] = data;
          this.setData({
            countList: countList
          });
        } else { }
      },
      (res) => { },
      (res) => { }
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
          data.unshift({
            CanId: -1,
            AiName: '不限'
          });
          this.setData({
            countList: [data, [{
              AiId: -1,
              AiName: '不限'
            }]]
          });
          this.getAreaList();
        } else { }
      },
      (res) => { },
      (res) => {
        this.data.isOverZ = false;
        this.getListData();
      }
    )
  },
  changeLable(e) { //标签切换
    this.data.pageIndex = 1;
    this.setData({
      lableIndex: +e.detail.value,
      listData: []
    });
    this.data.isOverZ = false;
    this.getListData();
  },
  getLable() { //获取标签列表
    $common.request(
      'POST',
      $common.config.GetLabelInfos, null,
      (res) => {
        if (res.data.res) {
          let data = res.data.data;
          data.unshift({
            LcId: -1,
            LcTitle: '全部'
          });
          this.setData({
            lableList: data
          });
        } else { }
      },
      (res) => { },
      (res) => {
        this.getCityInfo();
      }
    )
  },
  changeNation(e) { //国籍切换
    this.data.pageIndex = 1;
    this.setData({
      nationIndex: +e.detail.value,
      listData: []
    });
    this.data.isOverZ = false;
    this.getListData();
  },
  getCountryInfo() { //获取国籍信息
    $common.request("POST",
      $common.config.GetCountryInfos,
      null,
      (res) => {
        if (res.data.res) {
          let data = res.data.nationList;
          data.unshift({
            NalId: -1,
            NalName: '不限'
          })
          this.setData({
            nationList: data
          })
        } else { }
      },
      (res) => { },
      (res) => {
        this.getLable();
      }
    );
  },
  teacherInfo(e) { //跳转外教信息
    let index = e.currentTarget.dataset.index,
      listData = this.data.listData;
    wx.navigateTo({
      url: '../teachersInformation/index?data=' + listData[index].TeaId,
    });
  },
  bindInput(e) { //课程名称
    this.data.input = e.detail.value.trim();
    this.setData({
      listData: []
    });
    clearTimeout(this.data.stop);
    this.data.stop = setTimeout(() => {
      let isEn = this.data.isEn;
      if (isEn) {
        this.data.isOverE = false;
        this.getListDataEn();
      } else {
        this.data.isOverZ = false;
        this.getListData();
      }
    }, 500);
  },
  bindPriceChange(e) { //价格区间
    let value = e.detail.value;
    let isPriceAll = false;
    let min = Number(value[0]),
      max = Number(value[1]);
    if (min === 0 && max === 0) {
      isPriceAll = true;
    } else if (min >= max) {
      $common.showModal('请选择正确的价格区间');
      return;
    }
    this.setData({
      priceIndex: [min, max],
      isPrice: true,
      isPriceAll: isPriceAll,
      listData: []
    });
    this.data.isOverZ = false;
    this.getListData();
  },
  searchClick() { //点击搜索
    let isEn = this.data.isEn;
    this.setData({
      listData: []
    });
    if (isEn) {
      this.data.isOverE = false;
      this.getListDataEn();
    } else {
      this.data.isOverZ = false;
      this.getListData();
    }
  },
  getListData(isReach) { //获取找外教页面list
    let isEn = wx.getStorageSync('isEn')
    if (isEn) return;
    let isOverZ = this.data.isOverZ;
    if (isOverZ) return
    let vm = this.data;
    let pageIndex = 1,
      pageSize = vm.pageSize,
      hash = {};
    if (isReach) {
      pageIndex = vm.pageIndex;
      hash = vm.hash;
    }
    let input = vm.input, //搜索关键字
      priceList = vm.priceList,
      priceIndex = vm.priceIndex,
      minPrice = priceList[0][priceIndex[0]] || -1, //价格区间
      maxPrice = priceList[1][priceIndex[1]] || -1,
      nalId = vm.nationList[vm.nationIndex].NalId, //国籍id
      lsInfo = { //标签
        LcId: vm.lableList[vm.lableIndex].LcId,
        LcTitle: vm.lableList[vm.lableIndex].LcTitle
      },
      asInfo = { //城市区域
        AsCanId: vm.countList[0][vm.countIndex[0]].CanId,
        AsAiId: vm.countList[1][vm.countIndex[1]].AiId,
      };
    $common.loading();
    $common.request(
      'POST',
      $common.config.FindForeignTeaNew, {
        seaK: input,
        nalId: nalId,
        lsInfo: lsInfo,
        asInfo: asInfo,
        minPrice: minPrice,
        maxPrice: maxPrice,
        pageIndex: pageIndex,
        pageSize: pageSize,
      },
      (res) => {
        if (res.data.res) {
          let data = res.data.teaList;
          let listData = [];
          if (data.length >= pageSize) {
            this.data.pageIndex++
            isOverZ = false;
          } else {
            isOverZ = true;
          }
          if (data.length > 0) {
            isReach && (listData = this.data.listData);
            $common.newUnique(listData, data, 'TeaId', hash); //去重
            this.data.hash = hash;
            this.setData({ listData });
          }
          this.setData({ isOverZ });
        } else {
          $common.showModal('未知错误，请稍后重试');
        }
        wx.hideLoading();
      },
      (res) => {
        wx.hideLoading();
        $common.showModal('亲~网络不给力哦，请稍后重试');
      },
      (res) => {
        this.data.flage = true;
      }
    )
  },
  initPriceInterval() { //初始化价格区间
    let modalArr = this.data.modalArr,
      arr1 = [],
      arr2 = [];
    for (let i = 0, len = modalArr.length; i < len; i++) {
      arr1.push(modalArr[i]);
      arr2.push(modalArr[i]);
    }
    this.setData({
      priceList: [arr1, arr2],
      priceIndex: [-1, -1],
    });
    this.getCountryInfo();
  },
  getIsVip(callback) { //获取外教是否为vip
    $common.request(
      "POST",
      $common.config.GetForTeaStatus, {
        openId: wx.getStorageSync('openid')
      },
      (res) => {
        if (res.data.res) {
          let teaToe = res.data.teaToe === 1 ? true : false; //1审核通过
          this.setData({
            teaToe: teaToe
          });
          teaToe = null;
          callback();
        }
      },
      (res) => { },
      (res) => { }
    );
  },
  getListDataEn(isReach) { //获取找学生页面list
    if (!this.data.teaToe) return; //该外教审核不通过
    let isOverE = this.data.isOverE;
    if (isOverE) return;
    let pageIndexEn = 1,
      pageSizeEn = this.data.pageSizeEn,
      hashEn = {};
    if (isReach) {
      pageIndexEn = this.data.pageIndexEn;
      hashEn = this.data.hashEn;
    }
    wx.showLoading({
      title: 'Loading...'
    });
    setTimeout(() => {
      $common.request(
        "POST",
        $common.config.GetAllLearnNeeds, {
          pageIndex: pageIndexEn,
          pageSize: pageSizeEn,
          searchKey: this.data.input
        },
        (res) => {
          if (res.data.res) {
            let data = res.data.lnList;
            if (data.length >= pageSizeEn) {
              this.data.pageIndexEn++;
              isOverE = false;
            } else {
              isOverE = true;
            }
            let pageListEn = [];
            let addressData = this.data.addressData;
            isReach && (pageListEn = this.data.pageListEn);
            let locationArr = []; //待翻译数组
            for (let i = 0, len = data.length; i < len; i++) {
              switch (data[i].NedClaTime) {
                case 1:
                  data[i].time = 'AM';
                  break;
                case 2:
                  data[i].time = 'PM1';
                  break;
                case 3:
                  data[i].time = 'PM2';
                  break;
                case 4:
                  data[i].time = 'PM3';
                  break;
              }
              switch (parseInt(data[i].NedCorAfw)) {
                case 1:
                  data[i].week = 'Monday';
                  break;
                case 2:
                  data[i].week = 'Tuesday';
                  break;
                case 3:
                  data[i].week = 'Wednesday';
                  break;
                case 4:
                  data[i].week = 'Thursday';
                  break;
                case 5:
                  data[i].week = 'Friday';
                  break;
                case 6:
                  data[i].week = 'Saturday';
                  break;
                case 7:
                  data[i].week = 'Sunday';
                  break;
              }
              for (let j = 0, l = addressData.length; j < l; j++) {
                if (addressData[j].id === data[i].NedClaArea) {
                  data[i].address = addressData[j].area;
                }
              }
              locationArr.push(data[i].NedClaAreaSel.CanAreaName);
            }
            // 翻译一下
            $common.translate(locationArr.join('\n'), (res) => {
              let trans_result = res.data.trans_result;
              if (trans_result && trans_result.length > 0) { //翻译成功了
                for (let i = 0, len = data.length; i < len; i++) {
                  trans_result[i] && trans_result[i].dst && (data[i].address = trans_result[i].dst);
                }
              } else { //没有返回东西，报错了,显示原文
              }
              $common.newUnique(pageListEn, data, 'NedId', hashEn);
              this.data.hashEn = hashEn;
              this.setData({ pageListEn })
            });
            this.setData({ isOverE })
          } else {
            $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
          }
          wx.hideLoading();
        },
        (res) => {
          wx.hideLoading();
          $common.showModal('Unknown Error', false, false, 'OK', 'Prompt');
        },
        (res) => {
          this.data.flage = true;
        }
      )
    }, 300);
  },
  seeDetail(e) { //立即沟通详情
    let index = e.currentTarget.dataset.index,
      lnList = this.data.pageListEn;
    wx.navigateTo({
      url: `/pages/New/seeDetail/index?nedId=${lnList[index].NedId}`,
    });
  },
  onlineChart(e) { //立即沟通
    let index = e.currentTarget.dataset.index,
      lnList = this.data.pageListEn,
      userId = lnList[index].StuUserId;
    wx.navigateTo({
      url: `/pages/New/onlineChart/index?userId=${userId}`,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) { },
  onReady: function () {
    this.initPriceInterval();
  },
  isEnEvent(res) { //判断当前显示中英文
    let isEn = wx.getStorageSync('isEn');
    this.setData({
      isEn: isEn
    });
    if (isEn) { //找学生
      wx.setNavigationBarTitle({
        title: 'Find Student'
      })
      this.getIsVip(this.getListDataEn);
    } else { //找外教
      wx.setNavigationBarTitle({
        title: '找外教'
      })
    }
  },
  onShow: function () {
    this.data.pageIndex = 1;
    this.data.pageIndexEn = 1;
    $common.getOpenid(this.isEnEvent.bind(this));
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () { },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () { },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
    let isEn = this.data.isEn;
    if (isEn) { //找学生
      this.data.pageIndexEn = 1;
      this.data.isOverE = false;
      this.getListDataEn();
    } else { //找外教
      // this.setData({
      //   input: '',
      //   areaIndex: 0,
      //   tradIndex: 0,
      //   timeIndex: 0,
      // priceIndex: [0, 0],
      // isPriceAll: true
      // })
      this.getListData();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.flage) return;
    this.data.flage = false;
    let isEn = this.data.isEn;
    if (isEn) { //找学生
      this.getListDataEn(true);
    } else { //找外教
      this.getListData(true);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return $common.share()
  }
})