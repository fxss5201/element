export default {
  name: 'ElRow',

  componentName: 'ElRow',  // 在 ELCol 中做判断用

  props: {
    tag: {
      type: String,
      default: 'div'
    },
    gutter: Number,
    type: String,
    justify: {
      type: String,
      default: 'start'
    },
    align: {
      type: String,
      default: 'top'
    }
  },

  computed: {
    style() {
      const ret = {};

      if (this.gutter) {
        // 如果分栏间隔存在，则 row 的左右两侧使用 margin 预留分栏间隔的一半，方便 col 布局
        ret.marginLeft = `-${this.gutter / 2}px`;
        ret.marginRight = ret.marginLeft;
      }

      return ret;
    }
  },

  render(h) {
    // 根据不同的设置值，添加对用的 class 父类， col 依据父类增加相应样式
    // $slots.default，请查看此处：https://cn.vuejs.org/v2/api/#vm-slots
    return h(this.tag, {
      class: [
        'el-row',
        this.justify !== 'start' ? `is-justify-${this.justify}` : '',
        this.align !== 'top' ? `is-align-${this.align}` : '',
        { 'el-row--flex': this.type === 'flex' }
      ],
      style: this.style
    }, this.$slots.default);
  }
};
