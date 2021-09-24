<template>
  <div
    @touchmove.prevent
    v-show="show"
    class="m-tips-loading"
  >
    <div class="loading-content"/>
  </div>
</template>
<script>
import "@/assets/ic-waiting.gif";
export default {
  name: "TipsLoading",
  props: {
    show: {
      type: Boolean,
      default: false,
      required: true
    }
  }
};
</script>

<style lang="less" scoped>
.m-tips-loading {
  position: fixed;
  z-index: 1003;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  @size: 78px;

  .loading-content {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -@size / 2;
    margin-top: -@size / 2;
    z-index: 1003;
    width: @size;
    height: @size;
    border-radius: 5px;
    //noinspection CssUnknownTarget
    background:
      rgba(0, 0, 0, 0.6) url("~!url-loader!@/assets/ic-waiting.gif") 50% 50%
      no-repeat;
    background-size: 36px;
  }
}
</style>
