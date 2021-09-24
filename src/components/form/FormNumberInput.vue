<template>
  <div class="u-form-input-number">
    <span
      :class="{ disabled: value <= min }"
      class="u-number-decrease u-number-operate-btn"
      @touchend.stop="(value > min && numberValue--) || $emit('reachMin');"
    />
    <span class="u-number-show">{{ value }}</span>
    <span
      :class="{ disabled: value >= max }"
      class="u-number-increase u-number-operate-btn"
      @touchend.stop="(value < max && numberValue++) || $emit('reachMax');"
    />
  </div>
</template>

<script>
export default {
  name: "FormInputNumber",
  props: {
    max: {
      type: Number,
      default: Number.MAX_SAFE_INTEGER
    },
    min: {
      type: Number,
      default: Number.MIN_SAFE_INTEGER
    },
    value: {
      type: Number,
      default: 1
    }
  },
  computed: {
    numberValue: {
      get() {
        return Number(this.value);
      },
      set(to) {
        Number.isNaN(Number(to)) || this.$emit("input", Number(to));
      }
    }
  },
  watch: {
    numberValue: {
      handler(to) {
        if (to > this.max) {
          this.numberValue = this.max;
          this.$emit("reachMax");
        }
        if (to < this.min) {
          this.numberValue = this.min;
          this.$emit("reachMax");
        }
      }
    },
    immediate: true
  },
  methods: {
    focus(e) {
      e.target.focus();
    },
    enter(e) {
      e.preventDefault();
      e.target.blur();
    }
  }
};
</script>

<style lang="less" scoped>
.u-form-input-number {
  display: flex;
  height: 25px;
  overflow: hidden;
  font-size: 0;
  * {
    font-size: 14px;
  }
  .u-number-operate-btn {
    position: relative;
    display: inline-block;
    line-height: 1;
    text-align: center;
    width: 27px;
    height: 100%;
    background-color: #f2f2f2;
    border-radius: 2px;
    font-weight: bolder;
    &:before,
    &:after {
      position: absolute;
      display: block;
      top: 50%;
      left: 50%;
      transform: translate3d(-50%, -50%, 0);
      height: 2px;
      width: 11px;
      background-color: #6b6b6b;
    }
    &:before {
      content: "";
    }
    &.u-number-increase {
      &:after {
        content: "";
        height: 11px;
        width: 2px;
      }
    }
    &.disabled {
      &:before,
      &:after {
        background-color: #b4b4b4;
      }
    }
  }
  .u-number-show {
    margin: 0 2px;
    width: 48px;
    height: 100%;
    line-height: 25px;
    background-color: #f2f2f2;
    border-radius: 2px;
    color: inherit;
    text-align: center;
    user-select: none;
  }
}
</style>
