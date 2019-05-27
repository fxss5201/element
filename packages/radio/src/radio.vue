<template>
  <label
    class="el-radio"
    :class="[
      border && radioSize ? 'el-radio--' + radioSize : '',
      { 'is-disabled': isDisabled },
      { 'is-focus': focus },
      { 'is-bordered': border },
      { 'is-checked': model === label }
    ]"
    role="radio"
    :aria-checked="model === label"
    :aria-disabled="isDisabled"
    :tabindex="tabIndex"
    @keydown.space.stop.prevent="model = isDisabled ? model : label"
  >
    <span class="el-radio__input"
      :class="{
        'is-disabled': isDisabled,
        'is-checked': model === label
      }"
    >
      <span class="el-radio__inner"></span>
      <input
        class="el-radio__original"
        :value="label"
        type="radio"
        aria-hidden="true"
        v-model="model"
        @focus="focus = true"
        @blur="focus = false"
        @change="handleChange"
        :name="name"
        :disabled="isDisabled"
        tabindex="-1"
      >
    </span>
    <span class="el-radio__label" @keydown.stop>
      <slot></slot>
      <template v-if="!$slots.default">{{label}}</template>
    </span>
  </label>
</template>
<script>
  import Emitter from 'element-ui/src/mixins/emitter';

  export default {
    name: 'ElRadio',

    mixins: [Emitter],

    inject: {
      elForm: {
        default: ''
      },

      elFormItem: {
        default: ''
      }
    },

    componentName: 'ElRadio',

    props: {
      value: {},
      label: {},
      disabled: Boolean,
      name: String,
      border: Boolean,
      size: String
    },

    data() {
      return {
        focus: false
      };
    },
    computed: {
      isGroup() { // 检查父元素是否是 radioGroup
        let parent = this.$parent;
        while (parent) {
          if (parent.$options.componentName !== 'ElRadioGroup') {
            parent = parent.$parent;
          } else {
            this._radioGroup = parent;
            return true;
          }
        }
        return false;
      },
      model: {
        get() {
          // 如果父组件是 radioGroup ，则 model 返回值 radioGroup.value ，否则是 this.value
          return this.isGroup ? this._radioGroup.value : this.value;
        },
        set(val) {
          // model的设置值：如果父组件是 radioGroup ，则触发 radioGroup 的 input 事件，否则触发 radio 的 input 事件
          if (this.isGroup) {
            this.dispatch('ElRadioGroup', 'input', [val]);
          } else {
            this.$emit('input', val);
          }
        }
      },
      _elFormItemSize() {
        return (this.elFormItem || {}).elFormItemSize;
      },
      radioSize() {
        // 关于 radio 的 size 的优先级：首先判断当前组件的父组件是否是 radioGroup
        // 如果是的话：radioGroupSize > elFormItemSize > $ELEMENT.size
        // 如果不是的话，也就是 radio : radioSize > elFormItemSize > $ELEMENT.size
        const temRadioSize = this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
        return this.isGroup
          ? this._radioGroup.radioGroupSize || temRadioSize
          : temRadioSize;
      },
      isDisabled() {
        // 关于 radio 的 disabled 的优先级：首先判断当前组件的父组件是否是 radioGroup
        // 如果是的话：radioGroup.disabled > radio.disabled > form.disabled
        // 如果不是的话，也就是 radio : radio.disabled > form.disabled
        return this.isGroup
          ? this._radioGroup.disabled || this.disabled || (this.elForm || {}).disabled
          : this.disabled || (this.elForm || {}).disabled;
      },
      tabIndex() {
        return (this.isDisabled || (this.isGroup && this.model !== this.label)) ? -1 : 0;
      }
    },

    methods: {
      handleChange() {
        this.$nextTick(() => {
          // 触发 radio 的 change 事件
          this.$emit('change', this.model);
          // 触发 radioGroup 的 handleChange 事件
          this.isGroup && this.dispatch('ElRadioGroup', 'handleChange', this.model);
        });
      }
    }
  };
</script>
