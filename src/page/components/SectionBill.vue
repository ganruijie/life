<template>
  <form @submit.prevent="() => false">
    <!-- 阻止表单提交，避免在输入框里回车时触发提交方法 -->
    <div class="page-content">
      <!-- 运营商 -->
      <div 
        class="input-subscriber"
        v-if="electricitySelect && !subscriber">
        <form 
          class="input-subscriber-content" 
          @submit.prevent="submitSubscriber">
          <div class="subscriber-box-bg" />
          <div class="subscriber-box">
            <div class="subscriber-name">
              <p class="title">Payment unit</p>
              <p class="value">{{ electricityTitle }}</p>
            </div>
            <div class="subscriber-input">
              <p class="input-title">Subscriber</p>
              <div class="input-box">
                <input
                  ref="input"
                  name="subscriber"
                  placeholder="Enter Your Electricity Bill"
                  autocomplete="off"
                  v-model="subscriberValue"
                  maxlength="30">
                <span 
                  type="submit"
                  @click="submitSubscriber"
                  class="search-btn"><i class="ic-search" /></span>
              </div>
            </div>
            <div class="subscriber-tips">
              <p>How to check your Subscriber NO.?Find it on your Electricity Bill or call the customer service NO. 09369746932 to request.</p>
            </div>
          </div>
          <div class="subscriber-btn">
            <styled-button
              type="submit"
              tag="button"
              class="confirm-btn"
              :disabled="isDisabled"
            >Next</styled-button>
          </div>
        </form>
      </div>
      <div v-else-if="subscriber && electricitySelect">
        <div class="subscriber-bill">
          <div>2222</div>
        </div>
      </div>
      <!-- 输入Subscriber-->
      <div 
        v-else 
        class="bill-input-sub">
        <ul class="electricity-list">
          <li
            class="charge-item-full"
            v-for="(ele, index) in electricity"
            :key="index">
            <form-radio
              name="electricity"
              class="charge-item-radio"
              :btn-class="'radio-item-btn'"
              @input="selectElectricity(ele.id)"
              :val-code="ele.id">
              <div
                class="value-wrapper">
                <template>
                  <p class="face-value" >{{ ele.title }}</p>
                  <p class="face-right" />
                </template>
              </div>
            </form-radio>
          </li>
        </ul>
      </div>
      <div class="game-type-nav f-clearfix">
        <div
          v-for="item in chargeList"
          :key="item.categoryId"
          class="nav-item-box"
        >
          <a
            class="nav-item"
            href="javascript:;"
            @click="severType = item.categoryId"
            :class="{ selected: severType === item.categoryId }"
          >
            <span
              v-if="item.activityDescption"
              class="charge-item-icon"
            >
              {{ item.activityDescption }}
            </span>
            <div class="icon">
              <img
                :src="item.categoryIconUrl"
                style="width: 100%; height: 100%;"
              >
            </div>
            <span class="text">
              {{ item.categoryName }}
            </span>
          </a>
        </div>
      </div>
      <!-- 输入Subscriber详情 -->
      <div
        v-if="chargeList && chargeList.length > 0"
        @click="$refs.inputServe.input.focus();"
        class="input-wrapper"
      >
        <AccountInput
          ref="inputServe"
          :type="2"
          :value="accountNum"
          :focused.sync="focused"
          @input="accountInput($event)"
          @change="accountChange"
        />
        <p
          class="phone-num-tips"
          :class="{ error: error }"
        >
          {{ error || "" }}
        </p>
      </div>
    </div>
  </form>
</template>

<script>import { constructorMap } from "@/config/macroMap";
import { code, msg } from "@/config/error.js";
import AccountInput from "./AccountInput";
import FormRadio from "@/components/form/FormRadio.vue";
import StyledButton from "@/components/StyledButton.vue";
import ChargesAmountGroup from "./ChargesAmountGroup";
import bridge from "@/modules/bridge";
import { formatPrice } from "@/modules/formatter";
import { computeSucc, getChargeData } from "@/modules/api";
import { isAndroid } from "@/modules/env";
import * as url from "@/modules/url";

export default {
  name: "SectionGame",
  components: {
    AccountInput,
    StyledButton,
    ChargesAmountGroup,
    FormRadio
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
    return {
      loading: true,
      mealList: [],
      //充值种类
      severType: undefined,
      chargeList: [],
      //请求数据参数
      reqToken: "",
      osCode: "",
      //输入框相关
      accountNum: "",
      error: "",
      focused: false,
      // 
      electricity: [
        {id: 1, title: "Electricity Bill(Yangon)"},
        {id: 2, title: "Electricity Bill(Mandalay)"},
        {id: 3, title: "Electricity Bill(Ayeyarwaddy)"},
        {id: 4, title: "Electricity Bill(Kayin)"},
        {id: 5, title: "Electricity Bill(NayPyiTaw)"},
        {id: 6, title: "Electricity Bill(Magwe)"},
        {id: 7, title: "SKYNET"},
      ],
      subscriberValue: null,
      bill: [
        {orderNo: "24GH67854768", title: "Electricity Bill(Yangon)", amount: 980000, status: 1, name: "Myint Myat Aung", address: "NO.24，Anawrahta Road,Yangon", time: "01/05/2021-31/05/2021"},
        {orderNo: "8888888888", title: "Electricity Bill(Mandalay)", amount: 880000, status: 2, name: "Myint Myat Aung", address: "NO.24，Anawrahta Road,Yangon", time: "01/05/2021-31/05/2021"},
        {orderNo: "24GH67854767", title: "Electricity Bill(Ayeyarwaddy)", amount: 1080000, status: 3, name: "Myint Myat Aung", address: "NO.24，Anawrahta Road,Yangon", time: "01/05/2021-31/05/2021"},
        {orderNo: "24GH67854766", title: "Electricity Bill(Kayin)", amount: 960000, status: 1, name: "Myint Myat Aung", address: "NO.24，Anawrahta Road,Yangon", time: "01/05/2021-31/05/2021"},
        {orderNo: "24GH67854765", title: "Electricity Bill(NayPyiTaw)", amount: 970000, status: 2, name: "Myint Myat Aung", address: "NO.24，Anawrahta Road,Yangon", time: "01/05/2021-31/05/2021"},
        {orderNo: "24GH67854764", title: "Electricity Bill(Magwe)", amount: 990000, status: 3, name: "Myint Myat Aung", address: "NO.24，Anawrahta Road,Yangon", time: "01/05/2021-31/05/2021"},
        {orderNo: "24GH67854763", title: "SKYNET", amount: 120000, status: 1, name: "Myint Myat Aung", address: "NO.24，Anawrahta Road,Yangon", time: "01/05/2021-31/05/2021"},
      ]
    };
  },
  watch: {
    precondition: {
      handler(val) {
        if (val) {
          this.init();
        }
      },
      immediate: true,
    },
    severType: {
      handler: async function () {
        this.$tips.showLoading();
        this.mealList = await this.getChargeMeal() || [];
        this.$tips.removeLoading();
      },
    },
  },
  computed: {
    baseUrl() {
      return process.env.BASE_URL;
    },
    isAndroid() {
      return isAndroid();
    },
    /** @return {Boolean}*/
    hasMeals() { // 是否存在充值套餐
      return (
        this.validMeals.toString()
        && this.validMeals.some(group => group.itemVOList.length !== 0)
      );
    },
    //按钮是否可以点击
    isDisabled() {
      return !this.subscriberValue || !!this.error;
    },
    hideFooter() {
      return this.isAndroid && this.focused;
    },
    electricitySelect() {
      return url.getParam("type");
    },
    subscriber() {
      return url.getParam("subscriber");
    },
    electricityTitle() {
      let res =  this.electricity.find(item => `${item.id}` === this.electricitySelect);
      return (res && res["title"]) || "";
    }
  },
  methods: {
    //token改变加载页面数据设置请求参数
    async init() {
      this.$tips.showLoading();
      this.accountNum = "";
      this.reqToken = this.precondition.requestToken;
      this.osCode = this.precondition.osCode;
      await this.getData();
    },
    //获取充值类型数据并处理
    async getData() {
      this.loading = true;
      const data = await this.getChargesList();
      this.setDataAfterGetList(data);
      this.loading = false;
    },
    //获取充值类型data
    async getChargesList() {
      try {
        const params = {
          osCode: this.osCode,
          requestToken: this.reqToken,
          requestPlainString: JSON.stringify({
            constructor: constructorMap.CON_CHARGE_SEVER,
          }),
        };
        const res = await computeSucc(getChargeData)(params);
        return { res };
      } catch (err) {
        this.$tips.removeLoading();
        this.$tips.showAlert({
          text: err.errorMessage || msg[err.errorCode || code.NET_ERR]
        });
      }
    },
    /**
     * 选中electricity
    */
    selectElectricity(id) {
      window.location.href = `${this.baseUrl}/bill.html?type=${id}`;
    },
    // 输入完整Electricity Bill后提交
    submitSubscriber() {
      if (this.isDisabled) {
        return;
      }
      window.location.href = `${this.baseUrl}/bill.html?type=${this.electricitySelect}&subscriber=${this.subscriberValue}`;
    },
    /**
     * 拉取列表数据后，对组件多个数据进行设置。
     * */
    setDataAfterGetList(data) {
      if (!data || Object.keys(data).length === 0) {
        return;
      }
      const {
        res: { categoryVOList },
      } = data;
      this.chargeList = categoryVOList || [];
      this.severType = this.severType || (this.chargeList[0] && this.chargeList[0].categoryId);
      //拉取充值类型的列表后下面的充值种类设置为可点击
    },
    //请求对应的充值金额
    async getChargeMeal() {
      try {
        const params = {
          osCode: this.osCode,
          requestToken: this.reqToken,
          requestPlainString: JSON.stringify({
            constructor: constructorMap.CON_CHARGE_MEALS,
            categoryId: this.severType,
          }),
        };
        const res = await computeSucc(getChargeData)(params);
        return res.getVirtualGoodsItemVOList;
      } catch (err) {
        this.$tips.showAlert({
          text: err.errorMessage || msg[err.errorCode || code.NET_ERR]
        });
        return null;
      }
    },
    /**
     * @param {String} value
     * qq输入框的输入错误验证
     * */
    accountInput(value) {
      if (this.accountNum === value) {
        return;
      }
      this.accountNum = value;
      this.error = "";
    },
    //验证qq账号是否正确
    accountChange(info) {
      if (this.accountNum !== "" && this.accountNum !== undefined && info && !info.isValid) {
        this.error = info.errMsg;
        return null;
      }
    },
    //充值提交
    async submit() {
      if (this.isDisabled) {
        return;
      }
      let params = {};
      if (this.supportType == 7) {
        params.paramsJsonStr = "";
        params.orderGoodsType = "QQSERVICE";
      } else {
        params.orderGoodsType = "5";
      }
      const str = `确定向QQ账号\n ${this.accountNum} 充值?`;
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
  .game-charge-section {
    /*padding-bottom: .px2rem(40) [];*/
  }
  .game-type-nav {
    position: relative;
    padding: .px2rem(15)[] .px2rem(22.5)[] 0;
    .nav-item-box {
      margin-bottom: .px2rem(15) [];
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
        position: relative;
        text-align: center;
        cursor: pointer;
        position: relative;
        padding-bottom: .px2rem(23)[];
        .icon {
          width: .px2rem(50) [];
          height: .px2rem(50) [];
          border: 1px solid @color-normal;
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
  .input-wrapper {
    margin-top: .px2rem(20) [];
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
    // border-top: 1px solid #e6e6e6;
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
  .bill-input-sub {
    padding: .px2rem(16) [];
  }
  ::v-deep .electricity-list {
    .charge-item-radio {
      width: 100%;
    }
    .styled-button {
      line-height: .px2rem(20) [];
      padding: .px2rem(14) [] .px2rem(12) [];
      font-size: .px2rem(14) [];
      color: #333;
      border-color: #F0F0F0;
      text-align: left;
    }
    .charge-item-full+.charge-item-full {
      margin-top: .px2rem(10) [];
    }
    .value-wrapper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .face-right {
        width: .px2rem(14) [];
        height: .px2rem(24) [];
        background-image: url(~@/assets/bill/arrow-right.svg);
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
      }
    }
  }
  .input-subscriber {
    .input-subscriber-content {
      padding: .px2rem(16) [];
      position: relative;
      .subscriber-box-bg {
        position: absolute;
        top: 0;
        left: 0;
        height: .px2rem(260) [];
        width: 100vw;
        background: linear-gradient(141deg, #6E3DF9 0%, #623CF8 100%);
        border-radius: 0 0 .px2rem(30) [] .px2rem(30) [];
      }
    }
    .subscriber-box {
      z-index: 10;
      background: #FFFFFF;
      box-shadow: 0px 12px 30px 1px rgba(36, 34, 116, 0.08);
      padding: .px2rem(16) [];
      border-radius: .px2rem(10) [];
    }
    .subscriber-name {
      margin-bottom: .px2rem(30) [];
      .title {
        font-size: .px2rem(14) [];
        color: #8F92A1;
        line-height: .px2rem(20) [];
      }
      .value {
        font-size: .px2rem(16) [];
        color: #39449D;
        line-height: .px2rem(20) [];
      }
    }
    .subscriber-input {
      .input-box {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: .px2rem(4) [];
        border-bottom: 1px solid #E6E6E6;
        height: .px2rem(26) [];
      }
      .input-title {
        font-size: .px2rem(14) [];
        color: #333;
        line-height: .px2rem(18) [];
        margin-bottom: .px2rem(24) [];
      }
      .search-btn {
        display: block;
        padding: .px2rem(0) [] .px2rem(8) [];
        height: 100%;
        .ic-search {
          display: inline-block;
          width: .px2rem(21.525) [];
          height: 100%;
          background-image: url("~@/assets/bill/ic-search.svg");
          background-repeat: no-repeat;
          background-size: .px2rem(21.525) [];
          background-position: center;
        }
      }
      input::-webkit-input-placeholder {//webkit内核
        font-size: .px2rem(18) [];
      }
    }
    .subscriber-tips {
      margin-top: .px2rem(80) [];
      p {
        font-size: .px2rem(13) [];
        color: #888;
        line-height: .px2rem(18) [];;
      }
    }
    .subscriber-btn {
      z-index: 10;
      margin-top: .px2rem(42) [];
      .confirm-btn{
        padding: .px2rem(12) [] .px2rem(16) [];
        font-size: .px2rem(17) [];
        line-height: .px2rem(22) [];
        height: auto;
      }
    }
  }
</style>