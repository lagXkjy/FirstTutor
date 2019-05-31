// component/search/search.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    placeholder: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    value: '',
    timer: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    inputEvent(e) {
      let value = e.detail.value;
      clearTimeout(this.data.timer);
      this.data.timer = setTimeout(() => {
        this.data.value = value;
        this.triggerEvent('searchInput', value);
      }, 500);
    }
  }
})