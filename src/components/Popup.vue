<template>
  <transition 
    name="fade"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div
      v-show="show"
      class="m-popup mod-mask shadow"
      @touchmove.stop.prevent
      @click="hidePopup"
    >
      <transition name="slide">
        <div 
          v-show="show" 
          class="m-popup-panel" 
          @click.stop>
          <slot :show="show"/>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
export default {
  name: "Popup",
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    this.$nextTick(() =>{
      document.body.appendChild(this.$el);
    });
  },
  destroyed() {
    this.$el && this.$el.parentNode && this.$el.parentNode.removeChild(this.$el);
  },
  methods: {
    hidePopup() {
      this.$emit("update:show", false);
    }
  }
};
</script>

<style lang="less" scoped>
.mod-mask {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  &.shadow {
    background-color: rgba(0, 0, 0, 0.6);
  }
  &.m-popup {
    justify-content: flex-end;
  }
}

.m-popup-panel{
  position: relative;
  width: 100%;
}

.slide-enter,
.slide-leave-to {
  transform: translate3d(0, 100% + .px2rem(25) [], 0);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease-in-out;
}
</style>
