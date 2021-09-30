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
                <div class="input-content-subscriber">
                  <input
                    ref="input"
                    name="subscriber"
                    class="input-content-value"
                    placeholder="Enter Your Electricity Bill"
                    autocomplete="off"
                    v-model="subscriberValue"
                    maxlength="30">
                </div>
                <span 
                  type="submit"
                  @click="submitSubscriber"
                  class="search-btn"><i class="ic-search" /></span>
              </div>
            </div>
            <div 
              v-if="error"
              class="err-tips">
              <p>{{ error }}</p>
            </div>
            <div class="subscriber-tips">
              <p>How to check your Subscriber NO.?Find it on your Electricity Bill or call the customer service NO. 09369746932 or 24GH67854763-24GH67854768 to request.</p>
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
      <div 
        style="height:100%;display: flex;flex-direction: column;flex: 1;" 
        v-else-if="subscriber && electricitySelect">
        <form 
          class="input-subscriber-bill" 
          @submit.prevent="submitSubscriberBill">
          <div class="page-content">
            <div class="subscriber-bill">
              <div class="bill-detail">
                <div class="bill-detail-item">
                  <p class="title">Amount</p>
                  <p class="value">{{ electricityBill.amount | formatPrice(true) }}Ks</p>
                </div>
                <div class="bill-detail-item">
                  <p class="title">Payment Status</p>
                  <p class="value">{{ electricityBill.status === 1 
                    ? "unpaid" : electricityBill.status === 2 
                      ? "partly paid" : electricityBill.status === 3 
                  ? "paid" : "--" }}</p>
                </div>
                <div class="bill-detail-item">
                  <p class="title">Name of Subscriber</p>
                  <p class="value">{{ electricityBill.name }}</p>
                </div>
                <div class="bill-detail-item">
                  <p class="title">Payment unit</p>
                  <p class="value">{{ electricityBill.title }}</p>
                </div>
                <div class="bill-detail-item">
                  <p class="title">Subscriber NO</p>
                  <p class="value">{{ electricityBill.orderNo }}</p>
                </div>
                <div class="bill-detail-item">
                  <p class="title">Address of Subscriber</p>
                  <p class="value">{{ electricityBill.address }}</p>
                </div>
                <div class="bill-detail-item">
                  <p class="title">Consume Time</p>
                  <p class="value">{{ electricityBill.time }}</p>
                </div>
              </div>
            </div>
            <div class="divide-line" />
            <div class="bill-input">
              <p class="bill-input-title">Insert Amount</p>
              <div class="bill-input-content">
                <div class="bill-input-value">
                  <input
                    ref="billInput"
                    class="bill-input-box"
                    name="billInput"
                    placeholder="Enter Payment Amount "
                    autocomplete="off"
                    v-model="billAmount">
                </div>
                <span class="input-ks">Ks</span>
              </div>
            </div>
          </div>
          <footer class="m-footer">
            <styled-button
              type="submit"
              tag="button"
              class="confirm-btn"
              :disabled="isPayNow">Pay now</styled-button>
            <styled-button
              type="buttom"
              tag="button"
              @click="cancelFn"
              class="confirm-btn">Cancel</styled-button>
          </footer>
        </form>
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
      <!-- 输入Subscriber详情 -->
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
import { computeSucc, getChargeData, dispatchRecharge } from "@/modules/api";
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
        {amount: 980000, status: 1, name: "Myint Myat Aung", orderNo: "09369746932", title: "Electricity Bill(Yangon)", address: "NO.24，Anawrahta Road,Yangon", time: "01/05/2021-31/05/2021"},
        {amount: 880000, status: 2, name: "Myint Myat Aung", orderNo: "24GH67854763", title: "Electricity Bill(Mandalay)", address: "NO.24，Anawrahta Road,Yangon", time: "01/05/2021-31/05/2021"},
        {amount: 1080000, status: 3, name: "Myint Myat Aung", orderNo: "24GH67854764", title: "Electricity Bill(Ayeyarwaddy)", address: "NO.24，Anawrahta Road,Yangon", time: "01/05/2021-31/05/2021"},
        {amount: 960000, status: 1, name: "Myint Myat Aung", orderNo: "24GH67854765", title: "Electricity Bill(Kayin)", address: "NO.24，Anawrahta Road,Yangon", time: "01/05/2021-31/05/2021"},
        {amount: 970000, status: 2, name: "Myint Myat Aung", orderNo: "24GH67854766", title: "Electricity Bill(NayPyiTaw)", address: "NO.24，Anawrahta Road,Yangon", time: "01/05/2021-31/05/2021"},
        {amount: 990000, status: 3, name: "Myint Myat Aung", orderNo: "24GH67854767", title: "Electricity Bill(Magwe)", address: "NO.24，Anawrahta Road,Yangon", time: "01/05/2021-31/05/2021"},
        {amount: 120000, status: 1, name: "Myint Myat Aung", orderNo: "24GH67854768", title: "SKYNET", address: "NO.24，Anawrahta Road,Yangon", time: "01/05/2021-31/05/2021"},
      ],
      billAmount: null
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
    subscriberValue: {
      handler() {
        this.error = "";
      }
    }
  },
  computed: {
    baseUrl() {
      return process.env.BASE_URL;
    },
    isAndroid() {
      return isAndroid();
    },
    /** @return {Boolean}*/
    hasMeals() { // 是否存在账单
      return (
        this.subscriberValue
        && this.bill.some(group => group.orderNo === `${this.subscriberValue}`.trim(""))
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
    },
    electricityBill() {
      return this.bill.find(item => this.subscriber === item.orderNo);
    },
    isPayNow() {
      return !this.billAmount || this.electricityBill.status === 3;
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
      this.loading = false;
    },
    /**
     * 选中electricity
    */
    selectElectricity(id) {
      window.location.href = `${this.baseUrl}/bill.html?type=${id}`;
    },
    // 输入完整Electricity Bill后提交
    submitSubscriber() {
      this.error = "";
      if (this.isDisabled) {
        return;
      }
      if (this.hasMeals) {
        window.location.href = `${this.baseUrl}/bill.html?type=${this.electricitySelect}&subscriber=${this.subscriberValue}`;
      } else {
        this.error = "This Subscriber does not exist, Please check it is accurate and try again ";
      }
    },
    /**
     * 将bill单号，支付金额提交到后台，拉取支付窗口
     */
    async submitSubscriberBill() {
      if (this.isPayNow) {
        return;
      }
      let params = {
        productName: this.electricityBill.title,
        goodsId: this.electricityBill.orderNo,
        amount: this.billAmount * 1000,
        billAmount: this.electricityBill.amount,
        address: this.electricityBill.address,
        name: this.electricityBill.name,
        status: this.electricityBill.status,
        poundage: 0,
      };
      await computeSucc(dispatchRecharge)({params: JSON.stringify(params), version: 1, timestamp: +new Date()}).then(res => {
        const { data } = res;
        const str = `Please confirm purchase\n Confirm the Electricity Bill\nName:${params.name}\nAddress:${params.address}?`;
        this.$tips.showConfirm({text: str}).then(() => {
          bridge.getOrderReq(data).then(res => {
            window.location.href = `${this.baseUrl}/pay-result.html?type=2&billAmount=${params.billAmount}&address=${params.address}&status=${params.status}&name=${params.name}&goodsId=${params.goodsId}&goodsName=${params.productName}&amount=${params.amount}&orderNo=${res}`;
          });
        });
      }).finally(() => {

      });
    },
    cancelFn() {
      window.history.back(-1);
    }
  },
  filters: {
    formatPrice: formatPrice
  },
};
</script>

<style lang="less" scoped>
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
        background-image: url("~@/assets/bill/arrow-right.svg");
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
        background: linear-gradient(141deg, #5761B5 0%, #5761B5 100%);
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
        position: relative;
        display: flex;
        height: .px2rem(24) [];
        .f-divide-line(@color:#E6E6E6);
        padding-bottom: .px2rem(6) [];
      }
      .input-content-subscriber {
        display: flex;
        flex-direction: column;
        justify-content: center;
        box-sizing: border-box;
        flex: 1;
        font-size: 0;
      }
      .input-content-value {
        flex-basis: .px2rem(22) [];
        font-size: .px2rem(22) [];
        line-height: .px2rem(24) [];
        font-weight: 600;
        .f-sf-pro-text-medium();
        &::placeholder {
          line-height: .px2rem(18) [];
          font-size: .px2rem(18) [];
          color: #999;
          .f-pingfang-regular();
          font-weight: normal;
        }
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
        line-height: .px2rem(24) [];;
        .ic-search {
          display: inline-block;
          width: .px2rem(21.525) [];
          height: 100%;
          background-image: url("~@/assets/bill/ic-search.svg");
          background-repeat: no-repeat;
          background-size: .px2rem(21.525) [] .px2rem(24) [];
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
  .input-subscriber-bill {
    padding: 0 .px2rem(16) [];
    .subscriber-bill {
      padding: .px2rem(26) [] 0;
    }
    .bill-detail-item {
      display: flex;
      padding: .px2rem(6) [];
      p {
        display: flex;
        flex-direction: column;
        justify-content: center;
        box-sizing: border-box;
        flex: 1;
        font-size: .px2rem(14) [];
        line-height: .px2rem(16) [];
      }
      .title {
        color: #888;
      }
      .value {
        color: #191919;
      }
    }
    .divide-line {
      position: relative;
      .f-divide-line(@color:#E6E6E6)
    }
    .bill-input {
      margin-top: .px2rem(24) [];
      .bill-input-title {
        font-size: .px2rem(14) [];
        line-height: .px2rem(18) [];
        color: #333333;
        margin-bottom: .px2rem(30) [];
      }
      .bill-input-content {
        position: relative;
        display: flex;
        .f-divide-line(@color:#E6E6E6);
        height: .px2rem(24) [];
        padding-bottom: .px2rem(6) [];
      }
      .bill-input-value {
        display: flex;
        flex-direction: column;
        justify-content: center;
        box-sizing: border-box;
        flex: 1;
        font-size: 0;
      }
      .bill-input-box {
        flex-basis: .px2rem(22) [];
        font-size: .px2rem(22) [];
        line-height: .px2rem(24) [];
        font-weight: 600;
        .f-sf-pro-text-medium();
        &::placeholder {
          line-height: .px2rem(18) [];
          font-size: .px2rem(18) [];
          color: #999;
          .f-pingfang-regular();
          font-weight: normal;
        }
      }
      .input-ks {
        font-size: .px2rem(18) [];
        display: block;
        height: 100%;
        line-height: .px2rem(24) [];;
      }
      input::-webkit-input-placeholder {//webkit内核
        font-size: .px2rem(18) [];
      }
    }
  }
  .m-footer {
    /*position: fixed;*/
    bottom: 0;
    left: 0;
    right: 0;
    /*height: .px2rem(53.5) [];*/
    box-sizing: border-box;
    padding: 0 0 .px2rem(20) [];
    background: white;
    font-size: 0;
    user-select: none;
    .confirm-btn {
      .f-pingfang-semibold();
      line-height: .px2rem(44) [];
      height: .px2rem(44) [];
      font-size: .px2rem(17) [];
    }
    .styled-button+.styled-button {
      margin-top: .px2rem(16) [];
    }
  }
  .err-tips {
    padding-top: .px2rem(8) [];
    p {
      font-size: .px2rem(14) [];
      color: #F02E45;
      line-height: .px2rem(16) [];
    }
  }
</style>