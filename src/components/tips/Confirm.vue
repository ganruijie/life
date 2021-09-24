<template>
  <transition name="fade">
    <div
      v-if="show"
      class="mod-mask shadow"
      :class="[env]"
      :id="id"
      @touchmove.prevent
    >
      <div class="alert confirm">
        <div class="content"> {{ text }} </div>
        <div class="btn-group">
          <span
            class="cancel"
            @click="handlerClick"> {{ options.no }} </span>
          <span
            class="confirm"
            @click="handlerClick"> {{ options.yes }} </span>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import * as env from "@/modules/env.js";
export default {
  name: "Confirm",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    text: {
      type: String,
      default: ""
    },
    options: {
      type: Object,
      default: () => {
        return {
          no: "Cancel",
          yes: "Ok"
        };
      }
    }
  },
  data() {
    return {
      id: "asdsdnkcondifrmdd",
      env: env.isIos() ? "ios" : "android"
    };
  },
  methods: {
    handlerClick(e) {
      this.$emit("update:show", false);
      if (e.target.classList.contains("confirm")) {
        this.$emit("confirm");
      } else if (e.target.classList.contains("confirm")) {
        this.$emit("cancel");
      }
    }
  }
};
</script>
