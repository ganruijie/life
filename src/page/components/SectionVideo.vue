<!--
  author : JY
  date : 2019/6/4
  time : 11:14
-->
<template>
  <form
    class="game-charge-section"
    @submit.prevent="() => false">
    <!-- 阻止表单提交，避免在输入框里回车时触发提交方法 -->
    <div class="page-content">
      <div class="game-type-nav f-clearfix">
        <div
          v-for="item in chargeList"
          :key="item.categoryId"
          class="nav-item-box">
          <a
            class="nav-item"
            href="javascript:;"
            @click="videoType = item.categoryId"
            :class="{ selected: videoType === item.categoryId }">
            <span
              v-if="item.activityDescption"
              class="charge-item-icon"
            >
              {{ item.activityDescption }}
            </span>
            <div class="icon">
              <img 
                :src="item.categoryIconUrl" 
                style="width: 100%; height: 100%;">
            </div>
            <span class="text">{{ item.categoryName }}</span>
          </a>
        </div>
      </div>
      <div class="divide-line"/>
      <div 
        v-if="chargeList && chargeList.length > 0"
        @click="$refs.inputVideo.input.focus();"
        class="input-wrapper">
        <account-input
          ref="inputVideo"
          :type="accountIptType"
          :value="accountNum" 
          :focused.sync="focused"
          @input="accountInput($event);"
          @change="accountChange"/>
        <p 
          class="phone-num-tips" 
          :class="{ error: error }"
        >{{ error || "" }}</p>
      </div>
      <div
        v-if="!loading"
        class="charge-content">
        <template v-if="hasMeals">
          <charges-amount-group
            :is-server-valid="isServerValid"
            v-for="(group, index) in validMeals"
            :key="index"
            :show-title="validMeals.length > 0"
            @input="data => selectedMeal = data"
            v-model="selectedMeal"
            :group="group"/>
        </template>
        <template v-else>
          <div class="bg-no-charges" />
          <p class="text-no-charges">暂无充值套餐</p>
        </template>
      </div>
    </div>
    <footer
      v-if="!hideFooter"
      class="m-footer">
      <styled-button
        v-show="hasMeals"
        type="button"
        @click="submit"
        tag="button"
        class="confirm-btn"
        :disabled="isDisabled"
      >¥{{ price | formatPrice(true) }}立即充值</styled-button>
    </footer>
  </form>
</template>

<script>import { constructorMap } from "@/config/macroMap";
import { code, msg } from "@/config/error.js";
import accountInput from "./AccountInput";
import StyledButton from "@/components/StyledButton.vue";
import chargesAmountGroup from "./ChargesAmountGroup";
import bridge from "@/modules/bridge";
import { formatPrice, formatData } from "@/modules/formatter";
import { computeSucc, getChargeData } from "@/modules/api";
import { isAndroid } from "@/modules/env";

export default {
  name: "SectionVideo",
  components: {
    accountInput,
    StyledButton,
    chargesAmountGroup,
  },
  props: {
    precondition: {
      type: Object,
      default: null,
    },
    supportType: {
      type: [Number, String],
      default: null,
    }
  },
  data() {
    const tencentIds = [3, 4];// 腾讯系的 categoryId
    return {
      tencentIds,
      loading: true,
      focused: false,
      isServerValid: false,
      lastGetListAccount: {},
      chargeList: [],
      mealList: [],
      selectedMeal: null,
      videoType: undefined,
      reqToken: "",
      osCode: "",
      accountNum: "",
      error: "",
    };
  },
  watch: {
    videoType: {
      handler: async function () {
        this.$tips.showLoading();
        this.mealList = await this.getChargeMeal() || [];
        this.$tips.removeLoading();
      },
    },
    precondition: {
      handler(val) {
        if (val) {
          this.init();
        }
      },
      immediate: true,
    }
  },
  computed: {
    isAndroid() {
      return isAndroid();
    },
    validMeals() {
      const arr = this.mealList.filter(ele => ele.itemVOList.length);
      this.selectedMeal = arr.length > 0 ? arr[0].itemVOList && arr[0].itemVOList[0] : null;
      return arr;
    },
    /** @return {Boolean}*/
    hasMeals() { // 是否存在充值套餐
      return (
        this.validMeals.toString()
        && this.validMeals.some(group => group.itemVOList.length !== 0)
      );
    },
    isDisabled() {
      return !this.accountNum || !!this.error || !this.isServerValid || !this.selectedMeal;
    },
    hideFooter() {
      return this.isAndroid && this.focused;
    },
    price() {
      return (this.selectedMeal && this.selectedMeal.salePrice) || 0;
    },
    accountIptType() { // 腾讯系充值账号为 qq，其它为手机号或邮箱
      return this.tencentIds.includes(this.videoType) ? 2 : 4;
    },
  },
  methods: {
    async init() {
      // 腾讯系账号为QQ号，非腾讯系为邮箱或手机号，账号保存在本地意义不大
      // this.accountNum = localStorage.getItem("lastVideoChargeAccount") || "";
      this.accountNum = "";
      this.$tips.showLoading();
      this.reqToken = this.precondition.requestToken;
      this.osCode = this.precondition.osCode;
      await this.getData();
    },
    //验证输入框是否输入正确
    accountChange(info) {
      if (this.accountNum !== "" && this.accountNum !== undefined && info && !info.isValid) {
        this.error = info.errMsg;
        return null;
      }
    },
    //获取对应的数据
    async getData(accountNum = "") {
      this.loading = true;
      const data = await this.getChargesList(accountNum);
      this.setDataAfterGetList(data);
      this.loading = false;
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
      this.loading = true;
      try {
        const params = {
          osCode: this.osCode,
          requestToken: this.reqToken,
          requestPlainString: JSON.stringify({
            constructor: constructorMap.CON_CHARGE_VIDEO,
            mobile: accountNum
          }),
        };
        const res = await computeSucc(getChargeData)(params);
        return { res, defaultDataFlag: !accountNum, accountNum };
      } catch (err) {
        this.$tips.removeLoading();
        if (err.errorCode === code.PHONE_INVALID) {
          this.error = err.errorMessage || msg[code.PHONE_INVALID];
          return !this.hasMeals && { res: err, defaultDataFlag: true, accountNum};
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
        res: { categoryVOList },
        defaultDataFlag,
        accountNum
      } = data;
      this.chargeList = categoryVOList || [];
      this.videoType = this.videoType || (this.chargeList[0] && this.chargeList[0].categoryId);
      this.isServerValid = true;
    },
    async getChargeMeal() {
      try {
        const params = {
          osCode: this.osCode,
          requestToken: this.reqToken,
          requestPlainString: JSON.stringify({
            constructor: constructorMap.CON_CHARGE_MEALS,
            categoryId: this.videoType,
          }),
        };
        const res = await computeSucc(getChargeData)(params);
        return res.getVirtualGoodsItemVOList;
      } catch (err) {
        if (err.errorCode === code.PHONE_INVALID) {
          this.error = err.errorMessage || msg[code.PHONE_INVALID];
          return !this.hasMeals && err;
        } 
        this.$tips.showAlert({
          text: err.errorMessage || msg[err.errorCode || code.NET_ERR]
        });
        return null;
      }
    },
    /**
     * @param {String} value
     * */
    accountInput(value) {
      if (this.accountNum === value) {
        return;
      }
      this.accountNum = value;
      this.error = "";
    },
    //提交
    async submit() {
      if (this.isDisabled) {
        return;
      }
      let params = {
        goodsId: this.selectedMeal.goodsId.toString(),
        payAmount: this.selectedMeal.salePrice.toString(),
        mobile: this.accountNum.toString()
      };
      if (this.supportType == 7) {
        params.paramsJsonStr = "";
        params.orderGoodsType = "VIDEO";
      } else {
        params.orderGoodsType = "4";
      }
      const selectedCharge = this.chargeList.filter(v => this.videoType === v.categoryId)[0];
      const str = selectedCharge ? `确定向${selectedCharge.categoryName }账号\n ${this.accountNum} 充值${this.selectedMeal.goodsName}?` : "";
      await this.$tips.showConfirm({text: str});
      bridge.prepareToBuyRechargeGoods(params);
    },
  },
  filters: {
    formatPrice: formatPrice
  },
};
</script>

<style lang="less" scoped>
  /*.game-charge-section {*/
    /*padding-bottom: .px2rem(40) [];*/
  /*}*/
  .game-type-nav {
    position: relative;
    padding: .px2rem(15)[] .px2rem(21.5)[] 0;
    .nav-item-box {
      margin-bottom: .px2rem(20) [];
      width: 25%;
      float: left;
      &:nth-of-type(4n+1) {
        text-align: left;
      }
      &:nth-of-type(4n+2) {
        text-align: center;
        .nav-item {
          margin-left: .px2rem(-11) [];
        }
      }
      &:nth-of-type(4n+3) {
        text-align: center;
        .nav-item {
          margin-right: .px2rem(-11) [];
        }
      }
      &:nth-of-type(4n+4) {
        text-align: right;
      }
      .nav-item {
        line-height: 0;
        display: inline-block;
        text-align: center;
        cursor: pointer;
        position: relative;
        padding-bottom: .px2rem(23)[];
        .icon {
          width: .px2rem(50) [];
          height: .px2rem(50) [];
          border: 1px solid @color-normal;
          box-sizing: border-box;
          border-radius: .px2rem(4) [];
          margin: 0 auto;
        }
        .text {
          position: absolute;
          left: 50%;
          bottom: 0;
          max-width: .px2rem(80) [];
          transform: translateX(-50%);
          white-space: nowrap;
          color: @color-font-normal;
          font-size: .px2rem(13)[];
          line-height: .px2rem(16)[];
          user-select: none;
        }
      }
      .nav-item.selected {
        .icon {
          border: 1px solid @color-red;
        }
        .text {
          color: @color-red;
        }
      }
    }
  }
  .divide-line {
    height: .px2rem(8) [];
    background-color: #f5f5f5;
  }
  .input-wrapper {
    margin-top: .px2rem(15) [];
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    box-sizing: border-box;
    flex: 1;
    padding-left: .px2rem(12) [];
    padding-bottom: .px2rem(5) [];
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

  .charge-content {
    border-top: 1px solid #e6e6e6;
    padding: .px2rem(20) [] .px2rem(12) [];
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