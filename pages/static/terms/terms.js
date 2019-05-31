// pages/Home/SpellingRules/index.js
const $common = require('../../../utils/common.js')
Page({
  data: {
    pagesData: {},
  },
  getPagesData() {
    let arr = {
      title: '条款与条件',
      name: '上海翌师教育科技有限公司',
      context: [{
        item: '本条款与条件构成上海翌师教育科技有限公司（下称“FirstTutor”）和您之间的有效协议。请务必仔细阅读本条款与条件。'
      }, {
        item: 'FirstTutor小程序提供包括互联网信息发布与信息搜索等功能'
      }, {
        item: '您确认，您是具有完全民事权利能力和民事行为能力的自然人；若您为未成年人，您的父母或监护人已同意您使用我们的功能及您向我们提供信息。您自愿向FirstTutor提供个人信息，FirstTutor有权将该等信息以为您提供或改善功能之目的使用该等信息或分享给关联方及指定供应商或合伙伙伴。'
      }, {
        item: '您确认，FirstTutor仅提供平台，在用户之间实现对接；对于用户之间具体的线上和线下沟通等不负有义务，也不承担任何责任。FirstTutor将通过系统消息及向用户推送留言等方式与用户联系，用户同意接受来自FirstTutor的消息或留言。'
      }, {
        item: '您确认，您有义务维护FirstTutor账号的安全性，且操作应仅限于本人，并承担一切责任。如FirstTutor含有到其他网站的链接，FirstTutor不对那些网站的隐私保护措施负责；当用户登录时,请提高警惕。'
      }, {
        item: '您确认，您在FirstTutor提供的个人信息及交易信息准确无误，且不存在虚假交易，您上传的信息不得含有危害国家秘密或主权、危害民族团结、邪教、迷信、暴力、色情、赌博、恐怖活动以及其他非法的内容，并对其产生的一切纠纷独自承担法律责任。FirstTutor享有对平台的监督和纠正等权利，有权删除或屏蔽用户上传的非法及侵权信息。如用户以非法目的使用平台，存在被投诉等不良记录及其他侵犯FirstTutor或他人合法权益的行为的，FirstTutor有权取消您的信息，且您应承担法律责任。'
      }, {
        item: '您确认，FirstTutor对其程序及软件、其中的图文、标识等拥有版权及合法权利，并授予客户免费的、不可转让的、非独占的登陆和使用程序及软件的许可。客户不得复制、修改FirstTutor程序及软件或违法使用FirstTutor拥有版权的内容，也不得反向工程或试图提取FirstTutor程序及软件源代码。'
      }, {
        item: '您确认，FirstTutor不对不可抗力及基于网络特殊属性发生的黑客攻击、计算机病毒侵入、电信部门技术调整、腾信微信平台或相关系统的稳定性、用户将账号信息告知他人、与其他用户间或与任何第三人间的违约或侵权行为等FirstTutor无法控制的情况承担责任。用户应自行评估将联系方式告知其他平台用户的风险并单独对该等行为负责。'
      }, {
        item: '您同意，FirstTutor有权在依据法律和政府或司法机构指令、或者在您被投诉时经合理判断认为必要的情况下，单方披露您的个人信息和交易信息。'
      }, {
        item: '您同意，FirstTutor与您不存在任何合同关系，FirstTutor有权决定提供或不再提供该等平台或功能，有权随时单方面对本条款与条件进行修改，并在小程序内予以更新，您须及时审阅任何修改。如果您不同意更新的，应立即停止使用FirstTutor；若您继续登录或使用小程序的，表示您已接受修改并将遵循修改后的条款。'
      }, {
        item: '本条款与条件之执行及争议解决等均适用中华人共和国大陆法律。任何争议无法协商一致的，应提交至FirstTutor注册地所在人民法院以诉讼方式解决。'
      }, {
        item: 'FirstTutor保留对本条款与条件的最终解释权。'
      }
      ]
    };
    let arrEn = {
      title: 'TERMS AND CONDITIONS',
      context: [{
        item: 'This document (Terms) sets out the terms and conditions on which we provide our FirstTutor: WeChat Mini Program (Program) and the functions available through the Program (Functions) to you as a user of the WeChat Mini Program (User, you or your). By using the WeChat Mini Program or our Functions or registering with us, you are confirming that you agree to these Terms so please take the time to read and understand them.'
      }, {
        item: 'You promise to us that you are at least sixteen years of age and can (and will on request) provide electronic scanned copies of any references, or proof of qualifications and experience, as claimed in your profile.'
      }, {
        item: 'You promise that your phone number and other contact information provided to us or users (if applicable) are accurate and that you will update us with any changes to your contact information.'
      }, {
        item: 'Your use of the Program and its contents grants no rights to you in relation to: intellectual property rights (IP Rights) in the Program and its contents and in relation to our Functions, whether owned by us or by third parties or IP Rights in any User Content submitted to the Program by other Users.'
      }, {
        item: 'You agree and acknowledge that no contractual relationship shall exist between us and we shall not be liable for our provision or failure for provision of the Program or our Functions.'
      }, {
        item: 'You promise to compensate us for all (if any) claims, liabilities, costs and expenses (actual or consequential) that we may suffer, which arise out of or in connection with your use of the Program and / or the Functions, in particular in relation to:',
        list: [
          '(1)your breach of any provision of these Terms;',
          '(2)your violation of any law or the rights of a third party.',
        ]
      }, {
        item: 'You should solely be responsible for your own behaviors of providing contract information to other users and assessing the necessity and risks in providing the same. '
      }, {
        item: 'FirstTutor has the full authority to decide whether or not to provide the Program and/or Functions, to interpret these Terms and Condition, and is entitled to update these Terms and Conditions in its discretion from time to time. '
      }, {
        item: 'Any dispute shall be brought to the PRC court where FirstTutor is located if it cannot be resolved through friend negotiation and the governing law is PRC law.'
      },
      ]
    };
    this.setData({
      // pagesData: arrEn
      pagesData: this.data.isEn ? arrEn : arr
    })
  },

  onLoad: function (options) {
    let isEn = parseInt(options.isEn) === 1 ? true : false;
    this.setData({
      isEn: isEn
    });
    if (isEn) {
      wx.setNavigationBarTitle({
        title: 'Terms and conditions'
      })
    } else {
      wx.setNavigationBarTitle({
        title: 'FirstTutor服务协议'
      })
    }
    this.getPagesData();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },


  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return $common.share()
  }
})