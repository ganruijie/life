<template>
  <transition 
    name="fade"
    @after-enter="afterEnter"
    :css="options.useTransition"
  >
    <div 
      v-if="show"
      class="u-toast">
      <span class="text">{{ options.text }}</span>
    </div>
  </transition>
</template>

<script>
export default {
  name: "Toast",
  props: {
    options: {
      validator({ text, show }) {
        return typeof text === "string" && typeof show === "boolean";
      },
      default() {
        return {
          text: "",
          show: false,
          useTransition: false
        };
      }
    }
  },
  data() {
    return {
      timer: null,
      show: false
    };
  },
  mounted() {
    this.show = this.options.show;
  },
  methods: {
    createTimer() {
      this.timer = setTimeout(() => {
        this.$emit("update:options", false);
      }, 2000);
    },
    afterEnter() {
      this.createTimer();
    }
  }
};
</script>

<style lang="less" scoped>
.u-toast {
  position: fixed;
  left: 50%;
  top: 50%;
  width: max-content;
  transform: translate(-50%, -50%);
  padding: .px2rem(5) [] .px2rem(15) [];
  background-color: rgba(0, 0, 0, 0.6);
  text-align: center;
  border-radius: .px2rem(5)[];
  color: white;
  font-size: 0;
  z-index: 10000;
  .text {
    font-size: .px2rem(14) [];
  }
  &.fade-leave-to {
    transform: translate(-50%, -50%) scale(0.5, 0.5);
  }
  &.fade-leave-active {
    transition: all 0.5s ease-in-out;
  }
}
</style>
