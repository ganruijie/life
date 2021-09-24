<template>
  <div
    v-if="show"
    class="pre_error_wrap">
    <div class="pre_error">
      <div class="pre_error_text"> {{ text }}</div>
    </div>
  </div>
</template>
<script>
export default {
  name: "Error",
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
  }
};
</script>
<style lang="less" scoped>
.pre_error_wrap {
  position: fixed;
  z-index: 1003;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: transparent;

  .pre_error {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -60px;
    margin-top: -60px;
    z-index: 1003;
    width: 120px;
    height: 120px;
    border-radius: 5px;
    background: rgba(0, 0, 0, 0.6) url(~@/assets/ic-error.png) 50% 35% no-repeat;
    background-size: 60px;

    .pre_error_text {
      position: relative;
      top: 77%;
      font-size: 14px;
      text-align: center;
      color: #fff;
    }
  }
}
</style>
