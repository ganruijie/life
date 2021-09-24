<template>
  <form 
    class="fee-charge-section" 
    @submit.prevent="submit">
    <div class="page-content">
      <div class="top-up-padding">
        <div class="account-num-box">
          <div 
            @click="$refs.inputFee.input.focus();" 
            class="input-wrapper">
            <account-input
              :type="1"
              ref="inputFee"
              :value="accountNum"
              :focused.sync="focused"
              @input="accountInput($event);"
              @change="accountChange();"
            />
          </div>
          <span 
            class="address-book-btn" 
            @click="getConcat">
            <i class="ic-address-book" />
          </span>
        </div>
        <p 
          class="phone-num-tips" 
          :class="{ error: error }">
          {{ error || `${contactName} ${tips ? `(${tips})` : ""}` }}
        </p>
      </div>
      <div 
        v-if="!loading" 
        class="charge-content">
        <template v-if="hasMeals || loading">
          <charges-amount-group
            :is-server-valid="isServerValid"
            v-for="(group, index) in validMeals"
            :key="index"
            :charge-type="2"
            :show-title="validMeals.length > 1"
            @input="data => (selectedMeal = data)"
            v-model="selectedMeal"
            :group="group"
          />
        </template>
        <template v-else>
          <div class="bg-no-charges" />
          <p class="text-no-charges">No recharge package temporarily</p>
        </template>
      </div>
    </div>
    <footer 
      v-if="!hideFooter" 
      class="m-footer">
      <styled-button
        v-show="hasMeals"
        type="submit"
        tag="button"
        class="confirm-btn"
        :disabled="isDisabled"
      >{{ price | formatPrice(true) }}Rs Recharge</styled-button
      >
    </footer>
  </form>
</template>

<script>
import { constructorMap } from "@/config/macroMap";
import { code, msg } from "@/config/error.js";
import accountInput from "./AccountInput";
import StyledButton from "@/components/StyledButton.vue";
import chargesAmountGroup from "./ChargesAmountGroup";
import bridge from "@/modules/bridge";
import { formatPrice, formatData } from "@/modules/formatter";
import { computeSucc, getChargeData, dispatchRecharge } from "@/modules/api";
import { isAndroid } from "@/modules/env";

export default {
  name: "SectionFee",
  components: {
    accountInput,
    StyledButton,
    chargesAmountGroup
  },
  props: {
    isActive: {
      type: Boolean,
      default: true
    },
    precondition: {
      type: Object,
      default: null,
    },
    supportType: {
      type: [Number, String],
      default: null,
    },
    chargeType: {
      type: [Number, String],
      default: 1,
    }
  },
  data() {
    return {
      loading: true,
      focused: false,
      isServerValid: false,
      lastGetListAccount: {},
      chargeList: [],
      selectedMeal: null,
      feeType: undefined,
      reqToken: "",
      osCode: "",
      accountNum: "",
      contactName: "",
      error: "",
      tips: ""
    };
  },
  watch: {
    precondition: {
      handler(val) {
        if (val) {
          this.init();
        }
      },
      immediate: true
    },
    chargeType: {
      handler(val) {
        if (val) {
          this.init();
        }
      }
    }
  },
  computed: {
    isAndroid() {
      return isAndroid();
    },
    validMeals() {
      return this.chargeList.filter(ele => ele.goodsVOList.length);
    },
    /** @return {Boolean}*/
    hasMeals() {
      // 是否存在充值套餐
      return (
        this.validMeals.toString()
        && this.validMeals.some(group => group.goodsVOList.length !== 0)
      );
    },
    isDisabled() {
      return (
        !this.accountNum
        || this.error
        || !this.isServerValid
        || !this.selectedMeal
      );
    },
    hideFooter() {
      return this.isAndroid && this.focused;
    },
    price() {
      return (
        (!this.isDisabled
          && this.selectedMeal
          && this.selectedMeal.salePrice)
        || 0
      );
    }
  },
  beforeDestroy() {
    this.$tips.removeLoading();
  },
  methods: {
    async init() {
      this.chargeList = [];
      this.selectedMeal = null;
      this.accountNum = localStorage.getItem("lastFeeChargeAccount") || ""; //手机号码
      this.$tips.showLoading();
      // await bridge.readyPromisify();
      // getRechargeToken 返回值的结构已和客户端约定好，见 appEnv.js 中 mockData，本地开发时得到的数据来自于该 mockData 数据；
      // 另外现在的几个 token 值相同，取用任意一个都行
      // const [
      //   feeListToken,
      //   dataListToken,
      //   osCode
      // ] = await bridge.getRechargeToken();

      // this.reqToken = feeListToken;
      // this.osCode = osCode;

      this.reqToken = this.precondition.requestToken;
      this.osCode = this.precondition.osCode;
      await this.accountChange();
      this.$tips.removeLoading();
    },
    async accountChange(info) {
      if (info && !info.isValid) {
        this.error = info.errMsg;
        return null;
      }
      let accountNum = this.accountNum;
      // 如果当前充值类型最后一次获取数据成功后的账号与当前的一致，则不再次获取
      // if (accountNum === this.lastGetListAccount.accountNum) {
      //   this.isServerValid = true;
      //   const { tips, chargeList } = this.lastGetListAccount;
      //   [this.tips, this.chargeList] = [tips, chargeList];
      //   this.log({
      //     accountNum,
      //     chargeList,
      //     tips,
      //     contactName: this.setContactName(accountNum)
      //   });
      //   return;
      // }
      if (accountNum.length !== 11) {
        //如果手机号码有且不足11位
        accountNum && (this.error = "请输入完整的手机号码");
        //如果当前数据不为空,返回。
        if (this.hasMeals) {
          return;
        }
        //如果数据为空获取默认数据
        accountNum = "";
      }
      return await this.getData(accountNum);
    },
    async getData(accountNum) {
      this.$tips.showLoading();
      this.loading = true;
      const data = await this.getChargesList(accountNum);
      this.setDataAfterGetList(data);
      this.loading = false;
      this.$tips.removeLoading();
    },
    /**
     * @typedef {Object} returnValueAfterReq
     * @property {Object} res  请求虚拟商品列表的返回数据
     * @property {Boolean} defaultDataFlag  是否获取默认数据标记
     * @property {String} chargeType  充值类型
     * */
    /**
     * @param {String} accountNum 是否获取默认话费数据
     * @param {String} chargeType  充值类型
     * @return {Promise<returnValueAfterReq>}
     * */
    async getChargesList(accountNum = "") {
      try {
        const params = {
          osCode: this.osCode,
          requestToken: this.reqToken,
          requestPlainString: JSON.stringify({
            constructor: constructorMap.CON_CHARGE_FEE,
            mobile: accountNum
          })
        };
        // const res = await computeSucc(getChargeData)(params);
        const fn = this.isAndroid ? window["MallJs"] :  window;
        const res = await fn.getRenderData(this.chargeType);
        return { res, defaultDataFlag: !accountNum, accountNum };
      } catch (err) {
        if (err.errorCode === code.PHONE_INVALID) {
          this.error = err.errorMessage || msg[code.PHONE_INVALID];
          return (
            !this.hasMeals && { res: err, defaultDataFlag: true, accountNum }
          );
        }
        if (err.errorCode === code.PHONE_UNSUPPORT) {
          this.error = err.errorMessage || msg[code.PHONE_UNSUPPORT];
          return (
            !this.hasMeals && { res: err, defaultDataFlag: true, accountNum }
          );
        }
        this.$tips.showAlert({
          text: err.errorMessage || msg[err.errorCode || code.NET_ERR]
        });
      }
    },
    /**
     * 拉取列表数据后，对组件多个数据进行设置。
     * @param {returnValueAfterReq}  data
     * */
    setDataAfterGetList(data) {
      if (!data || Object.keys(data).length === 0) {
        return;
      }
      const {
        res: { goodsItemList, mobileInfo },
        defaultDataFlag,
        accountNum
      } = data;
      this.chargeList = goodsItemList || [];
      this.feeType
        = this.feeType
        || (this.chargeList[0] && this.chargeList[0].virtualGoodsType);

      if (defaultDataFlag) {
        return;
      }
      this.isServerValid = true;
      this.tips = mobileInfo ? mobileInfo.carrier : "";
      const contactName = this.setContactName(this.accountNum);

      this.log({
        accountNum,
        chargeList: this.chargeList,
        contactName,
        tips: this.tips
      });
    },

    /**
     * @param {String} value
     * */
    accountInput(value) {
      value = this.accountReset(value);
      if (this.accountNum === value) {
        return;
      }
      this.accountNum = value;
      this.error = "";
      this.tips = "";
      this.contactName = "";
      this.isServerValid = false;
    },
    /**
     * @param {String} value
     * */
    accountReset(value) {
      if (value.length > 11) {
        value = value.slice(0, 11);
      }
      // 手机号从头到尾不能超过 11 位数字，否则置为空
      return /^\d{1,11}$/.test(value) ? value : "";
    },
    async getConcat() {
      const [phoneNum, name] = await bridge.getConcatFromAddressBooks();
      this.accountNum = phoneNum.replace(/\D/g, "");
      this.error = "";
      this.tips = "";
      this.contactName = name;
      this.isServerValid = false;
      this.accountChange();
    },
    setContactName(accountNum) {
      //在之前获取数据成功的请求信息中寻找相同电话号码的项，并返回请求信息。
      const samePhoneNum = Object.values(this.lastGetListAccount).find(
        ele => ele.accountNum === accountNum
      );
      //若有相同电话号码的请求信息，则取其联系人名显示。
      if (samePhoneNum && samePhoneNum.contactName) {
        this.contactName = samePhoneNum.contactName;
      }
      return this.contactName;
    },
    async submit() {
      let params = {
        productName: this.selectedMeal.goodsName,
        goodsId: this.selectedMeal.goodsId.toString(),
        amount: this.selectedMeal.salePrice.toString(),
        activity: this.selectedMeal.activityDescption,
        mobile: this.accountNum.toString(),
        poundage: 0,
      };
      if (this.supportType == 7) {
        params.orderGoodsType = "PHONEBILL";
      } else {
        params.orderGoodsType = "1";
      }
      // bridge.prepareToBuyRechargeGoods(params);
      await computeSucc(dispatchRecharge)({params: JSON.stringify(params), version: 1, timestamp: +new Date()}).then(res => {
        const { data } = res;
        const str = `Please confirm purchase\n Confirm the Phone Number\n${this.accountNum}?`;
        const fn = this.isAndroid ? window["MallJs"] :  window;
        this.$tips.showConfirm({text: str}).then(() => {
          fn.getOrderReq1(data, "getOrderReqSucc");
        });
      }).finally(() => {

      });
    },

    log({ accountNum, chargeList, tips, contactName }) {
      //设置请求信息记录,只保留一条。
      this.lastGetListAccount = {
        accountNum,
        chargeList,
        tips,
        contactName
      };
      localStorage.setItem("lastFeeChargeAccount", accountNum);
    },
  },
  filters: {
    formatPrice: formatPrice
  }
};
</script>

<style lang="less" scoped>
.fee-charge-section {
  //padding-bottom: .px2rem(40) [];
}
.account-num-box {
  position: relative;
  display: flex;
  height: .px2rem(48) [];
  background: #E9EDFB;
  opacity: 1;
  border: 1px solid rgba(54, 66, 218, 0.07999999821186066);
  border-radius: 4px 4px 4px 4px;
  .input-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    flex: 1;
    padding-left: .px2rem(12) [];
    font-size: 0;
  }
  .phone-num-tips {
    flex-basis: .px2rem(15) [];
    line-height: .px2rem(15) [];
    font-size: .px2rem(10) [];
    color: #888;
    &.error {
      color: @color-red;
    }
  }
  .address-book-btn {
    display: block;
    padding: .px2rem(0) [] .px2rem(12) [];
    height: 100%;
    .ic-address-book {
      display: inline-block;
      width: .px2rem(21.525) [];
      height: 100%;
      background-image: url("~@/assets/recharge/ic-address-book.png");
      background-repeat: no-repeat;
      background-size: .px2rem(21.525) [];
      background-position: center;
    }
  }
}
.top-up-padding {
  padding: 0px .px2rem(16) [];
}
.divide-line {
  height: .px2rem(8) [];
  background-color: #f5f5f5;
}

.charge-content {
  // border-top: 1px solid #e6e6e6;
  padding: .px2rem(15) [] .px2rem(16) [];
  .banner-ad-box {
    margin-bottom: .px2rem(15) [];
    .banner-ad-img {
      display: block;
      width: 100%;
    }
  }
  .bg-no-charges {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    margin-top: .px2rem(30) [];
    height: .px2rem(100) [];
    background: url("~@/assets/recharge/bg-no-recharge.png") no-repeat
      center/.px2rem(100) [];
  }
  .text-no-charges {
    font-size: 15px;
    color: #999;
    text-align: center;
  }

  // .box-ul {
  //   padding: 0 .px2rem(10) [];
  //   display: flex;
  //   flex-direction: row;
  //   justify-content: space-between;
  //   box-sizing: border-box;
  //   flex-wrap: wrap;
  //   .item-li {
  //     width: .px2rem(80) [];
  //     height: .px2rem(60) [];
  //     margin-bottom: .px2rem(10) [];
  //     border: 1px solid @color-red;
  //     color: @color-red;
  //     text-align: center;
  //     .item-li-text {
  //       font-size: .px2rem(16) [];
  //       line-height: .px2rem(16) [];
  //     }
  //     .item-li-alias {
  //       font-size: .px2rem(12) [];
  //       line-height: .px2rem(12) [];
  //     }
  //   }
  // }
}

.m-footer {
  /*position: fixed;*/
  bottom: 0;
  left: 0;
  right: 0;
  /*height: .px2rem(53.5) [];*/
  box-sizing: border-box;
  padding: 0 .px2rem(15) [] .px2rem(9.5) [];
  background: white;
  font-size: 0;
  user-select: none;
  .confirm-btn {
    .f-pingfang-semibold();
    line-height: .px2rem(44) [];
    height: .px2rem(44) [];
    font-size: .px2rem(17) [];
  }
}
</style>
