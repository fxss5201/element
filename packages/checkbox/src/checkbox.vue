<template>
  <label
    class="el-checkbox"
    :class="[
      border && checkboxSize ? 'el-checkbox--' + checkboxSize : '',
      { 'is-disabled': isDisabled },
      { 'is-bordered': border },
      { 'is-checked': isChecked }
    ]"
    role="checkbox"
    :aria-checked="indeterminate ? 'mixed': isChecked"
    :aria-disabled="isDisabled"
    :id="id"
  >
    <span class="el-checkbox__input"
      :class="{
        'is-disabled': isDisabled,
        'is-checked': isChecked,
        'is-indeterminate': indeterminate,
        'is-focus': focus
      }"
       aria-checked="mixed"
    >
      <span class="el-checkbox__inner"></span>
      <input
        v-if="trueLabel || falseLabel"
        class="el-checkbox__original"
        type="checkbox"
        aria-hidden="true"
        :name="name"
        :disabled="isDisabled"
        :true-value="trueLabel"
        :false-value="falseLabel"
        v-model="model"
        @change="handleChange"
        @focus="focus = true"
        @blur="focus = false">
      <input
        v-else
        class="el-checkbox__original"
        type="checkbox"
        aria-hidden="true"
        :disabled="isDisabled"
        :value="label"
        :name="name"
        v-model="model"
        @change="handleChange"
        @focus="focus = true"
        @blur="focus = false">
    </span>
    <span class="el-checkbox__label" v-if="$slots.default || label">
      <slot></slot>
      <template v-if="!$slots.default">{{label}}</template>
    </span>
  </label>
</template>
<script>
  import Emitter from 'element-ui/src/mixins/emitter';

  export default {
    name: 'ElCheckbox',

    mixins: [Emitter],

    inject: {
      elForm: {
        default: ''
      },
      elFormItem: {
        default: ''
      }
    },

    componentName: 'ElCheckbox',

    data() {
      return {
        selfModel: false,
        focus: false,
        isLimitExceeded: false // 限制是否可以选中，在数量的限制时使用
      };
    },

    computed: {
      model: {
        get() { // 首先判断其父组件是否是 checkboxGroup ，如果是的话返回 checkboxGroup 的 value ，如果不是的话判断当前组件的 value 是否是 undefined ，否的话返回当前组件的 value ，否则返回 false
          return this.isGroup
            ? this.store : this.value !== undefined
              ? this.value : this.selfModel;
        },

        set(val) { // 需要先判断其父组件是否是 checkboxGroup
          if (this.isGroup) {
            this.isLimitExceeded = false;
            (this._checkboxGroup.min !== undefined &&
              val.length < this._checkboxGroup.min &&
              (this.isLimitExceeded = true));

            (this._checkboxGroup.max !== undefined &&
              val.length > this._checkboxGroup.max &&
              (this.isLimitExceeded = true));
            // 当存在最小/最大个数的限制时，当前选中个数在最小和最大数之间的时候才会触发 checkboxGroup 的 input 事件
            this.isLimitExceeded === false &&
            this.dispatch('ElCheckboxGroup', 'input', [val]);
          } else {
            this.$emit('input', val);
            this.selfModel = val;
          }
        }
      },

      isChecked() { // 判断是否选中
        if ({}.toString.call(this.model) === '[object Boolean]') { // 如果是 true/false ，直接返回 true/false
          return this.model;
        } else if (Array.isArray(this.model)) { // 如果是 数组 ，查看数组中是否包含当前 label
          return this.model.indexOf(this.label) > -1;
        } else if (this.model !== null && this.model !== undefined) { // 如果既不是 null 也不是 undefined ，则和指定的 trueLabel 比较
          return this.model === this.trueLabel;
        }
      },

      isGroup() { // 判断其父组件是否是 checkboxGroup
        let parent = this.$parent;
        while (parent) {
          if (parent.$options.componentName !== 'ElCheckboxGroup') {
            parent = parent.$parent;
          } else {
            this._checkboxGroup = parent;
            return true;
          }
        }
        return false;
      },

      store() { // 父组件 checkboxGroup 的 value
        return this._checkboxGroup ? this._checkboxGroup.value : this.value;
      },

      isDisabled() { // 首先判断其父组件是否是 checkboxGroup ，如果是的话 disabled 优先级：checkboxGroup.disabled >  this.disabled > this.elForm.disabled，否则：this.disabled > this.elForm.disabled
        return this.isGroup
          ? this._checkboxGroup.disabled || this.disabled || (this.elForm || {}).disabled
          : this.disabled || (this.elForm || {}).disabled;
      },

      _elFormItemSize() { // 返回 formItem 的 size
        return (this.elFormItem || {}).elFormItemSize;
      },

      checkboxSize() { // 返回应用于 checkbox 的 size
        const temCheckboxSize = this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
        return this.isGroup
          ? this._checkboxGroup.checkboxGroupSize || temCheckboxSize
          : temCheckboxSize;
      }
    },

    props: {
      value: {},
      label: {},
      indeterminate: Boolean,
      disabled: Boolean,
      checked: Boolean,
      name: String,
      trueLabel: [String, Number],
      falseLabel: [String, Number],
      id: String, /* 当 indeterminate 为真时，为 controls 提供相关连的 checkbox 的 id ，表明元素间的控制关系*/
      controls: String,
      border: Boolean,
      size: String
    },

    methods: {
      addToStore() { // 添加当前组件的值
        if (
          Array.isArray(this.model) &&
          this.model.indexOf(this.label) === -1
        ) {
          this.model.push(this.label);
        } else {
          this.model = this.trueLabel || true;
        }
      },
      handleChange(ev) {
        if (this.isLimitExceeded) return;
        let value;
        if (ev.target.checked) {
          value = this.trueLabel === undefined ? true : this.trueLabel;
        } else {
          value = this.falseLabel === undefined ? false : this.falseLabel;
        }
        this.$emit('change', value, ev);
        this.$nextTick(() => {
          if (this.isGroup) {
            this.dispatch('ElCheckboxGroup', 'change', [this._checkboxGroup.value]);
          }
        });
      }
    },

    created() {
      this.checked && this.addToStore(); // 当前组件选中的时候，将其添加到 mode 中
    },
    mounted() { // 为indeterminate元素 添加aria-controls 属性
      if (this.indeterminate) {
        this.$el.setAttribute('aria-controls', this.controls);
      }
    },

    watch: {
      value(value) {
        this.dispatch('ElFormItem', 'el.form.change', value);
      }
    }
  };
</script>
