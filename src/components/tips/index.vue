<template>
  <div class="tips">
    <tips-alert
      :show.sync="alert.show"
      :text="alert.text"
      @confirm="alert.confirm"
    />
    <tips-error
      :show.sync="err.show"
      :text="err.text"
    />
    <tips-loading :show="loading.show" />
    <tips-confirm
      :show.sync="confirm.show"
      :options="confirm.options"
      :text="confirm.text"
      @confirm="confirm.confirm"
      @cancel="confirm.cancel"
    />
    <tips-success
      :show.sync="success.show"
      :text="success.text"
      @confirm="success.callback"
    />
    <tips-toast
      v-for="options in toast.list"
      :key="options.count"
      :options="options"
      @update:options="
        toast.list = toast.list.filter(item => item !== options);
      "
    />
  </div>
</template>
<script>
import Vue from "vue";
import Alert from "./Alert.vue";
import TipsLoading from "./Loading.vue";
import TipsError from "./showError.vue";
import TipsConfirm from "./Confirm.vue";
import TipsSuccess from "./SuccessToast.vue";
import TipsToast from "./Toast.vue";

function emptyFn() {}

function mergeToTar(tar, opt) {
  if (!opt) {
    return;
  }
  Object.keys(tar).forEach(prop => {
    if (opt.hasOwnProperty(prop)) {
      tar[prop] = opt[prop];
    }
  });
}

export default {
  name: "Tips",
  components: {
    "tips-alert": Alert,
    "tips-loading": TipsLoading,
    "tips-error": TipsError,
    "tips-confirm": TipsConfirm,
    "tips-success": TipsSuccess,
    "tips-toast": TipsToast
  },
  data() {
    return {
      loading: {
        show: false
      },
      alert: {
        show: false,
        text: "",
        close: emptyFn,
        confirm: emptyFn
      },
      err: {
        show: false,
        text: ""
      },
      confirm: {
        show: false,
        text: "",
        options: undefined,
        confirm: emptyFn,
        cancel: emptyFn
      },
      success: {
        show: false,
        text: "",
        callback: emptyFn
      },
      toast: {
        count: 0,
        /** @type{{text:String, show:Boolean, count: Number ,useTransition: Boolean}[]}*/
        list: []
      }
    };
  },
  computed: {},
  watch: {
    "alert.show"(val) {
      if (!val) {
        this.alert.close && this.alert.close();
      }
    }
  },
  methods: {
    showAlert(options) {
      mergeToTar(this.alert, options);
      this.alert.show = true;
    },
    showLoading() {
      this.loading.show = true;
    },
    removeLoading() {
      this.loading.show = false;
    },
    showError(options) {
      mergeToTar(this.err, options);
    },
    showConfirm(options) {
      mergeToTar(this.confirm, options);
      this.confirm.show = true;
      if (!options.confirm) {
        return new Promise(resolve => {
          this.confirm.confirm = () => resolve();
        });
      }
    },
    /**
     *  @param {{callback:Function,text:String}} options
     */
    showSuccess(options) {
      mergeToTar(this.success, options);
      this.success.show = true;
      if (!options.callback) {
        return new Promise(resolve => {
          this.success.callback = () => resolve();
        });
      }
    },
    /**
     *  @param {{text:String, useTransition: Boolean | undefined}} options
     */
    showToast(options) {
      this.toast.list.push({
        useTransition: true,
        ...options,
        show: true,
        count: this.toast.count++,
      });
      return this.toast.count;
    },
  },
  install() {
    let VComponent = Vue.extend(this);
    let single = new VComponent({
      el: document.createElement("div")
    });
    Vue.tips = single;
    Vue.prototype.$tips = single;
    document.body.appendChild(single.$el);
    return single;
  }
};
</script>

<style lang="less" scoped>
/* 遮罩层 */
/deep/ .mod-mask {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;

  &.shadow {
    background-color: rgba(0, 0, 0, 0.5);
  }

  /* alert和confirm的弹框 */
  &.ios {
    .alert {
      border-radius: 0.34667rem;
      background-color: #fff;
      overflow: hidden;
      text-align: center;
      transition: all 0.2s;
      animation: scale 0.2s ease-in-out;
      @keyframes scale{
        0% {
          transform: scale(1.2);
        }
        100%{
          transform: scale(1);
        }
      }

      &.confirm .content {
        font-weight: bold;
      }

      .content {
        position: relative;
        width: 220px;
        padding: 22.5px 25px;
        font-size: 17px;
        line-height: 20px;
        color: #000;

        &::after {
          content: " ";
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          border-top: 1px solid #d9d9d9;
          transform-origin: 0 bottom;
          transform: scaleY(0.5);
        }
      }

      .alert-btn {
        float: left;
        box-sizing: border-box;
        width: 50%;
        font-size: 17px;
        line-height: 44px;
        color: #3478f6;
      }

      .confirm,
      .cancel {
        display: inline-block;
        width: 100%;
        margin: 0;
        font-size: 17px;
        line-height: 44px;
        color: #3478f6;
      }

      .btn-group {
        width: 270px;
        display: table;
        table-layout: fixed;

        & > * {
          position: relative;
          display: table-cell;
          width: auto;
          user-select: none;
          /*background: #ebeaeb;*/
          &:active{
            background: #ebeaeb;
          }
          &::after {
            content: " ";
            position: absolute;
            right: 0;
            bottom: 0;
            top: 0;
            border-right: 1px solid #d9d9d9;
            transform-origin: right 0;
            transform: scaleX(0.5);
          }
        }
      }
    }
  }

  &.android {
    .alert {
      background-color: #fff;
      overflow: hidden;
      text-align: center;

      .content {
        width: 230px;
        padding: 17.5px 20px;
        font-size: 17px;
        line-height: 21px;
        color: #000;
        text-align: left;
      }

      .alert-btn {
        float: right;
        padding: 0 15px 18px 15px;
        box-sizing: border-box;
        font-size: 17px;
        line-height: 21px;
        color: #888;
      }

      .left-btn {
        color: #01a1ef;
        margin-right: 15px;
      }

      .confirm,
      .cancel {
        float: right;
        padding: 0 10px 10px 10px;
        margin-right: 15px;
        font-size: 17px;
        line-height: 21px;
        color: #01a1ef;
      }

      .btn-group {
        text-align: right;

        & > * {
          float: none;
          display: inline-block;
          margin-right: 0;

          &:last-child {
            margin-right: 15px;
          }
        }
      }
    }
  }
}
</style>
