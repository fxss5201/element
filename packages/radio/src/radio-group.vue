<template>
  <div
    class="el-radio-group"
    role="radiogroup"
    @keydown="handleKeydown"
  >
    <slot></slot>
  </div>
</template>
<script>
  import Emitter from 'element-ui/src/mixins/emitter';
  // Object.freeze : https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
  const keyCode = Object.freeze({
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40
  });
  export default {
    name: 'ElRadioGroup',

    componentName: 'ElRadioGroup',

    inject: {
      elFormItem: {
        default: ''
      }
    },

    mixins: [Emitter],

    props: {
      value: {},
      size: String,
      fill: String,
      textColor: String,
      disabled: Boolean
    },

    computed: {
      _elFormItemSize() {
        // 返回 formItem 设置的 size
        return (this.elFormItem || {}).elFormItemSize;
      },
      radioGroupSize() {
        // 关于 radioGroupSize 的优先级：radioGroupSize > elFormItemSize > $ELEMENT.size
        return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
      }
    },

    created() {
      // 监听组件的 handleChange 事件，并对外触发 change 事件
      this.$on('handleChange', value => {
        this.$emit('change', value);
      });
    },
    mounted() {
      // 当 radioGroup 没有默认选项时，第一个可以选中 Tab 导航
      const radios = this.$el.querySelectorAll('[type=radio]');
      const firstLabel = this.$el.querySelectorAll('[role=radio]')[0];
      if (![].some.call(radios, radio => radio.checked) && firstLabel) {
        firstLabel.tabIndex = 0;
      }
    },
    methods: {
      handleKeydown(e) { // 左右上下按键 可以在radio组内切换不同选项
        const target = e.target;
        const className = target.nodeName === 'INPUT' ? '[type=radio]' : '[role=radio]'; // 判断事件触发的元素得出相应的值
        const radios = this.$el.querySelectorAll(className);
        const length = radios.length;
        const index = [].indexOf.call(radios, target);
        const roleRadios = this.$el.querySelectorAll('[role=radio]');
        switch (e.keyCode) {
          case keyCode.LEFT:
          case keyCode.UP:
            e.stopPropagation();
            e.preventDefault();
            if (index === 0) {
              roleRadios[length - 1].click();
              roleRadios[length - 1].focus();
            } else {
              roleRadios[index - 1].click();
              roleRadios[index - 1].focus();
            }
            break;
          case keyCode.RIGHT:
          case keyCode.DOWN:
            if (index === (length - 1)) {
              e.stopPropagation();
              e.preventDefault();
              roleRadios[0].click();
              roleRadios[0].focus();
            } else {
              roleRadios[index + 1].click();
              roleRadios[index + 1].focus();
            }
            break;
          default:
            break;
        }
      }
    },
    watch: {
      value(value) {
        // value 改变的时候，触发 formItem 的 el.form.change 事件（用于规则检测）
        this.dispatch('ElFormItem', 'el.form.change', [this.value]);
      }
    }
  };
</script>

