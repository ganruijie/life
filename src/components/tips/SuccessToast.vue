<template>
  <transition
    name="fade"
    @after-enter="afterShow"
  >
    <div
      v-if="show"
      class="success-tip mod-mask"
      @click="hide"
    >

      <div class="tip-section">
        <img
          class="success-img"
          src="~@/assets/ic-success.svg"
        >
        <p class="message">{{ text }}</p>
      </div>

    </div>
  </transition>
</template>

<script>
export default {
  name: "TipsShowSuccess",
  props: {
    show: {
      type: Boolean,
      default: false,
      required: true
    },
    text: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      /** @type {(number|null)}*/
      timer: null
    };
  },
  watch: {
    show(to) {
      if (to === false) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    }
  },
  methods: {
    hide() {
      if (!this.show) {
        return;
      }
      clearTimeout(this.timer);
      this.$emit("update:show", false);
      this.$emit("confirm", null);
    },
    afterShow() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.hide();
      }, 800);
    }
  }
};
</script>

<style lang="less" scoped>
  
.success-tip {
  .tip-section {
    width: 85/37.5rem;
    padding: 10/37.5rem;
    background-color: rgba(0, 0, 0, 0.6);
    text-align: center;
    font-size: 16/37.5rem;
    border-radius: 10/37.5rem;
    color: white;

    .success-img {
      width: 60/37.5rem;
      height: 60/37.5rem;
    }
  }
}
</style>
