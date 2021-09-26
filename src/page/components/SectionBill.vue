<template>
  <form
    class="game-charge-section"
    @submit.prevent="() => false"
  >
    <!-- 阻止表单提交，避免在输入框里回车时触发提交方法 -->
    <div class="page-content">
      <!-- 运营商 -->
      <div v-if="electricitySelect && !subscriber">1111</div>
      <div v-else-if="subscriber && electricitySelect">2222</div>
      <!-- 输入Subscriber-->
      <div 
        v-else 
        class="bill-input-sub" >
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
                  <p 
                    class="face-value" 
                    style="margin-top: 0">{{ ele.title }}</p>
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
      <div
        v-if="!loading"
        class="charge-content"
      >
        <template v-if="hasMeals">
          <ChargesAmountGroup
            :is-server-valid="isServerValid"
            v-for="(group, index) in validMeals"
            :key="index"
            :show-title="validMeals.length > 1"
            @input="data => selectedMeal = data"
            v-model="selectedMeal"
            :group="group"
          />
        </template>
        <template v-else>
          <div class="bg-no-charges" />
          <p class="text-no-charges">
            暂无充值套餐
          </p>
        </template>
      </div>
    </div>
    <footer
      v-if="!hideFooter"
      class="m-footer"
    >
      <StyledButton
        v-show="hasMeals"
        type="button"
        @click="submit"
        tag="button"
        class="confirm-btn"
        :disabled="isDisabled"
      >
        ¥{{ price | formatPrice(true) }}立即充值
      </StyledButton>
    </footer>
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
      isServerValid: false,
      selectedMeal: null,
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
    //验证是否有充值套餐
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
    //充值按钮是否可以点击
    isDisabled() {
      return !this.accountNum || !!this.error || !this.isServerValid || !this.selectedMeal;
    },
    hideFooter() {
      return this.isAndroid && this.focused;
    },
    price() {
      return (this.selectedMeal && this.selectedMeal.salePrice) || 0;
    },
    electricitySelect() {
      return url.getParam("type");
    },
    subscriber() {
      return url.getParam("subscriber");
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
      this.isServerValid = true;
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
      let params = {
        goodsId: this.selectedMeal.goodsId.toString(),
        payAmount: this.selectedMeal.salePrice.toString(),
        mobile: this.accountNum.toString()
      };
      if (this.supportType == 7) {
        params.paramsJsonStr = "";
        params.orderGoodsType = "QQSERVICE";
      } else {
        params.orderGoodsType = "5";
      }
      const str = `确定向QQ账号\n ${this.accountNum} 充值${this.selectedMeal.description}?`;
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
  .divide-line {
    height: .px2rem(8) [];
    background-color: #f5f5f5;
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
  .m-footer {
    bottom: 0;
    left: 0;
    right: 0;
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