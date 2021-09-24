<template>
  <label class="radio">
    <!--
      除了class style外，所有不在props列表中的属性直接作为html特性绑定在以下input上
    -->
    <input
      v-bind="$attrs"
      :value="valCode"
      :checked="!!value && (value === valCode)"
      :disabled="disabled"
      class="real-radio"
      type="radio"
    >
    <!--
      为了方便更改样式，给组件的btn-class值将会以class绑定的形式绑定在以下按钮组件根元素上，以下按钮组件是单根元素组件
    -->
    <styled-button
      :class="[$attrs['btn-class']]"
      v-if="type === 'button'"
      :disabled="!!disabled"
      :checked="!!value && (value === valCode)"
      tag="span"
      class="fake-radio-button"
      @click="clickHandler(valCode);"
    >
      <slot>{{ valCode }}</slot>
    </styled-button>
    <text-radio
      :checked="!!value && (value === valCode)"
      @click.native="clickHandler(valCode);"
      v-else-if="type === 'text'">
      <slot>{{ valCode }}</slot>
    </text-radio>
  </label>
</template>

<script>
import StyledButton from "@/components/StyledButton.vue";

export default {
  name: "Radio",
  inheritAttrs: false,
  components: {
    StyledButton,
    //以后需要组件化再提出来作单独组件,
    TextRadio: {
      name: "TextRadio",
      render(h) {
        return (
          <div class="fake-radio-text">
            <span class="dot" />
            <span>{this.$slots.default}</span>
          </div>
        );
      }
    }
  },
  props: {
    type: {
      type: String,
      default: "button"
    },
    valCode: {
      type: [String, Number, Object],
      default: ""
    },
    value: {
      type: [String, Number, Object],
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    clickHandler(valCode) {
      !this.disabled
        && this.$emit("input", valCode);
    }
  }
};
</script>

<style lang="less" scoped>
.radio {
  display: inline-block;
  .fake-radio-button {
    display: block;
    width: auto;
    height: 100%;
    line-height: .px2rem(28) [];
    padding: 0 .px2rem(10) [];
    background-color: white;
    color: inherit;
    border: 0.5px solid @color-btn-bg;
    box-sizing: border-box;
    user-select: none;
    &[checked] {
      color: #fff;
      background-color: @color-btn-bg;
      border-color: @color-btn-bg;
    }
  }
  /deep/ .fake-radio-text {
    &[checked] {
      color: @color-btn-bg;
      .dot {
        position: relative;
        background-color: @color-btn-bg;
        &:after {
          position: absolute;
          display: block;
          content: "";
          background-color: white;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 50%;
          height: 50%;
          border-radius: 50%;
        }
      }
    }
    .dot {
      vertical-align: middle;
      display: inline-block;
      height: .px2rem(14) [];
      width: .px2rem(14) [];
      box-sizing: border-box;
      border: 1px solid @color-btn-bg;
      border-radius: 50%;
    }
    span{
      vertical-align: middle;
    }
  }
  .real-radio {
    opacity: 0;
    outline: none;
    position: absolute;
    margin: 0;
    width: 0;
    height: 0;
    left: -999px;
  }
}
</style>
