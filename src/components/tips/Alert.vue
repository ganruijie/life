<template>
  <transition name="fade">
    <div
      v-if="show"
      :class="[env]"
      class="mod-mask shadow"
      @click="handlerClick"
      @touchmove.prevent
    >
      <div class="alert">
        <div class="content">{{ text }}</div>
        <div class="btn-group">
          <span class="confirm">确定</span>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import * as env from "@/modules/env.js";

export default {
  name: "TipsAlert",
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
      env: env.isIos() ? "ios" : "android"
    };
  },
  methods: {
    handlerClick(e) {
      this.$emit("update:show", false);
      if (e.target.className.indexOf("confirm") > -1) {
        this.$emit("confirm");
      }
    }
  }
};
</script>
