<template>
  <input
    class="qq-num-input"
    ref="input"
    :type="iptDomType"
    name="phoneNum"
    :placeholder="placeholder"
    autocomplete="off"
    :value="numberShow"
    maxlength="30"
    @input="inputHandler"
    @focus="focusHandler"
    @blur="blurHandler"
    @copy="copyHandler"
    @keydown.delete="deleteHandler"
    @keyup.enter="kbEnter">
</template>

<script>
import { isAndroid } from "@/modules/env";

export default {
  name: "AccountInput",
  props: {
    value: {
      type: String,
      default: ""
    },
    type: { // 约束类型，1:手机号；2:QQ号；3:邮箱；4:手机号或邮箱
      type: Number,
      default: 1
    },
    focused: {
      type: Boolean,
      default: false
    },
    // rules: {
    //   type: RegExp,
    //   default() {
    //     return /^\d{11}$/;
    //   }
    // }
  },
  data() {
    return {
      rules: [],
      errMsg: "",
      iptDomType: "tel",
      accountNumIsClientValid: false,
    };
  },
  watch: {
    type() { // 类型切换时要清空
      this.numberShow = "";
      this.$emit("input");
    },
  },
  computed: {
    input() {
      return this.$refs.input;
    },
    placeholder() {
      let placeholder;
      switch (this.type) {
        case 1: //手机号
          this.rules = [];
          this.iptDomType = "tel";
          placeholder = "Phone Number";
          this.rules.push({
            reg: /^1(3|4|5|6|7|8|9)\d{9}$/,
            errMsg: "Please enter the correct phone number",
          });
          break;
        case 2: //QQ号
          this.rules = [];
          this.iptDomType = "tel";
          placeholder = "请输入充值QQ号";
          this.rules.push({
            reg: /^[1-9][0-9]{4,10}$/,
            errMsg: "请输入正确的QQ帐号",
          });
          break;
        case 3: //邮箱
          this.rules = [];
          this.iptDomType = "text";
          placeholder = "请输入充值邮箱";
          this.rules.push({
            reg: /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]{2,}$/,
            errMsg: "请输入正确的充值邮箱",
          });
          break;
        case 4: //手机号或邮箱
          this.rules = [];
          this.iptDomType = "text";
          placeholder = "请输入手机号或邮箱";
          this.rules.push({
            reg: /^1(3|4|5|6|7|8|9)\d{9}$/,
            errMsg: "请输入正确的手机号",
          });
          this.rules.push({
            reg: /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/,
            errMsg: "请输入正确的充值邮箱",
          });
          break;
        default:
          this.rules = [];
          this.iptDomType = "tel";
          placeholder = "指定的输入类型不存在";
          this.rules.push({
            reg: new RegExp(null),
            errMsg: "指定的输入类型不存在",
          });
          break;
      }
      this.updateStatusInfo();
      return placeholder;
    },
    numberShow: {
      get() {
        let returnValue;
        switch (this.type) {
          case 1: //手机号
            returnValue = this.value.replace(
              /^(\d{3})(\d{1,4})?(\d+)?$/g,
              (p0, p1, p2, p3) => {
                return p1 + (p2 ? ` ${p2}` : "") + (p3 ? ` ${p3}` : "");
              }
            );
            break;
          case 2: //QQ号
            returnValue = this.value;
            break;
          case 3: //邮箱
            returnValue = this.value;
            break;
          case 4: //手机号或邮箱
            if (/^1(3|4|5|6|7|8|9)\d{9}$/.test(this.value)) {
              // returnValue = this.value.replace(
              //   /^(\d{3})(\d{1,4})?(\d+)?$/g,
              //   (p0, p1, p2, p3) => {
              //     return p1 + (p2 ? ` ${p2}` : "") + (p3 ? ` ${p3}` : "");
              //   }
              // );
              returnValue = this.value;
            } else {
              returnValue = this.value;
            }
            break;
        }
        return returnValue;
      },
      set(unTransform) {
        let iptVal;
        switch (this.type) {
          case 1: //手机号
          case 2: //QQ号
            iptVal = unTransform.replace(/\D/g, "");
            break;
          case 3: //邮箱
          case 4: //手机号或邮箱
            iptVal = unTransform.replace(/[^\D\w-\.]/g, "");
          default:
            iptVal = unTransform;
            break;
        }
        this.updateStatusInfo(iptVal);
        this.$emit("input", iptVal);
        this.$forceUpdate();
      }
    },
    isAndroid() {
      return isAndroid();
    }
  },
  methods: {
    /**
     * input blur时的处理函数
     * */
    blurHandler() {
      if (!this.isAndroid) { // 安卓时键盘回收时有 $emit 逻辑
        this.$emit("update:focused", false);
        this.$emit("change", { isValid: this.accountNumIsClientValid, errMsg: this.errMsg });
      }
    },
    deleteHandler({ target }) {
      const { selectionStart, selectionEnd } = target;
      if (
        selectionStart === selectionEnd
        && this.numberShow[selectionStart - 1] === " "
        && this.type === 1
      ) {
        target.selectionStart = target.selectionEnd = selectionStart - 1;
      }
    },
    updateStatusInfo(iptVal = "") {
      const arr = this.rules.filter(v => v.reg.test(iptVal.toString()));
      if (arr.length > 0) {
        this.errMsg = "";
        this.accountNumIsClientValid = true;
      } else if (this.rules.length > 1) {
        this.errMsg = "请输入正确的充值账号";
        this.accountNumIsClientValid = false;
      } else {
        this.errMsg = (this.rules[0] && this.rules[0].errMsg) || "";
        this.accountNumIsClientValid = false;
      }
    },
    copyHandler(e) {
      const target = e.target;
      const { selectionStart, selectionEnd, value } = target;
      e.clipboardData.setData(
        "text/plain",
        value.slice(selectionStart, selectionEnd).replace(/\D/g, "")
      );
      e.preventDefault();
    },
    inputHandler({ target }) {
      let { selectionEnd } = target;
      const vlen = selectionEnd === target.value.length;
      this.numberShow = target.value;
      //此处不可使用$nextTick 或Promise,在安卓5.1.1版本或者说webview55.0.2883.91中发现 microTask存在问题。
      if (this.type === 1) { // 手机号类型时要求手机号码合法时自动结束输入
        setTimeout(() => {
          vlen && (selectionEnd = target.value.length);
          target.setSelectionRange(selectionEnd, selectionEnd);
          //在setTimeout异步执行中，this.value若已由父级组件改变,this.accountNumIsClientValid 的值为重新计算后的结果
          this.accountNumIsClientValid && target.blur();
        });
      }
    },
    focusHandler({ target }) {
      this.isAndroid && !this.focused && this.androidResizeObserve(target);
      this.$emit("update:focused", true);
    },
    kbEnter({ target }) {
      this.$emit("update:focused", false);
      target && target.blur();
      this.$emit("change", { isValid: this.accountNumIsClientValid, errMsg: this.errMsg });
    },
    androidResizeObserve(target) {
      const normalHeight = window.innerHeight;
      const keyboardHeight = 100;
      const resizeHandler = () => {
        const transformHeight = window.innerHeight;
        if (normalHeight - transformHeight > keyboardHeight) {
          //键盘弹出
        }
        if (normalHeight === transformHeight) {
          //键盘收起
          window.removeEventListener("resize", resizeHandler);
          this.focused
            && this.$nextTick(() => {
              target.blur();
              this.$emit("update:focused", false);
              this.$emit("change", { isValid: this.accountNumIsClientValid, errMsg: this.errMsg });
            });
        }
      };
      window.addEventListener("resize", resizeHandler);
    }
  }
};
</script>

<style lang="less" scoped>
.qq-num-input {
  flex-basis: .px2rem(29) [];
  font-size: 20px;
  line-height: .px2rem(29) [];
  .f-sf-pro-text-medium();
  font-weight: bold;
  caret-color: @color-red;
  &::placeholder {
    line-height: .px2rem(29) [];
    font-size: .px2rem(22) [];
    color: #999;
    .f-pingfang-regular();
    font-weight: normal;
  }
}
</style>
