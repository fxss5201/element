<template>
  <label
    class="el-radio-button"
    :class="[
      size ? 'el-radio-button--' + size : '',
      { 'is-active': value === label },
      { 'is-disabled': isDisabled },
      { 'is-focus': focus }
    ]"
    role="radio"
    :aria-checked="value === label"
    :aria-disabled="isDisabled"
    :tabindex="tabIndex"
    @keydown.space.stop.prevent="value = isDisabled ? value : label"
  >
    <input
      class="el-radio-button__orig-radio"
      :value="label"
      type="radio"
      v-model="value"
      :name="name"
      @change="handleChange"
      :disabled="isDisabled"
      tabindex="-1"
      @focus="focus = true"
      @blur="focus = false"
    >
    <span
      class="el-radio-button__inner"
      :style="value === label ? activeStyle : null"
      @keydown.stop>
      <slot></slot>
      <template v-if="!$slots.default">{{label}}</template>
    </span>
  </label>
</template>
<script>
  import Emitter from 'element-ui/src/mixins/emitter';

  export default {
    name: 'ElRadioButton',

    mixins: [Emitter],

    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },

    props: {
      label: {},
      disabled: Boolean,
      name: String
    },
    data() {
      return {
        focus: false
      };
    },
    computed: {
      value: {
        get() {
          // value 直接获取 radioGroup 的 value 值
          return this._radioGroup.value;
        },
        set(value) {
          // 设置 value 值的时候直接触发 radioGroup 的 input 方法
          this._radioGroup.$emit('input', value);
        }
      },
      _radioGroup() {
        // 获取最近的 radioGroup 组件
        let parent = this.$parent;
        while (parent) {
          if (parent.$options.componentName !== 'ElRadioGroup') {
            parent = parent.$parent;
          } else {
            return parent;
          }
        }
        return false;
      },
      activeStyle() {
        // 如果有设置的颜色，则使用设置的颜色，否则使用默认的 scss 设置的颜色
        return {
          backgroundColor: this._radioGroup.fill || '',
          borderColor: this._radioGroup.fill || '',
          boxShadow: this._radioGroup.fill ? `-1px 0 0 0 ${this._radioGroup.fill}` : '',
          color: this._radioGroup.textColor || ''
        };
      },
      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      size() {
        // 关于 radioButtonSize 的优先级：radioGroupSize > elFormItemSize > $ELEMENT.size
        return this._radioGroup.radioGroupSize || this._elFormItemSize || (this.$ELEMENT || {}).size;
      },
      isDisabled() {
        // 关于 radioButton.disabled 的优先级：radioButton.disabled > radioGroup.disabled > elForm.disabled
        return this.disabled || this._radioGroup.disabled || (this.elForm || {}).disabled;
      },
      tabIndex() {
        return (this.isDisabled || (this._radioGroup && this.value !== this.label)) ? -1 : 0;
      }
    },

    methods: {
      handleChange() {
        this.$nextTick(() => {
          // 触发 radioGroup 的 handleChange 事件
          this.dispatch('ElRadioGroup', 'handleChange', this.value);
        });
      }
    }
  };
</script>
