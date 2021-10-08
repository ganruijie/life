<template>
  <div class="container pay-result">
    <main class="m-body">
      <div class="success-top" />
      <div class="success-img">
        <img 
          src="~@/assets/ic-success.svg" 
          alt="">
      </div>
      <div class="success-title">
        <p>Payment Succeful</p>
      </div>
      <div class="success-content">
        <div class="title">
          <h3 class="name">{{ type === '1' ? 'MPT' : type === '2' ? 'Electricity Bill' : type === '3' ? 'Gift Card' : '' }}</h3>
          <h3 class="pay-amount">{{ amount | formatPrice(true) }}<span class="ks">Ks</span></h3>
          <p 
            v-if="type === '1' || type === '3'" 
            class="pay-goods-name">{{ goodsName }}</p>
        </div>
      </div>
      <div 
        v-if="type === '2'" 
        class="electricity-bill-detail">
        <div class="subscriber-bill">
          <div class="bill-detail">
            <div class="bill-detail-item">
              <p class="title">Amount</p>
              <p class="value">{{ billAmount | formatPrice(true) }}Ks</p>
            </div>
            <div class="bill-detail-item">
              <p class="title">Payment Status</p>
              <p class="value">{{ status === '1' 
                ? "unpaid" : status === '2' 
                  ? "partly paid" : status === '3' 
              ? "paid" : "--" }}</p>
            </div>
            <div class="bill-detail-item">
              <p class="title">Name of Subscriber</p>
              <p class="value">{{ name }}</p>
            </div>
            <div class="bill-detail-item">
              <p class="title">Payment unit</p>
              <p class="value">{{ goodsName }}</p>
            </div>
            <div class="bill-detail-item">
              <p class="title">Subscriber NO</p>
              <p class="value">{{ goodsId }}</p>
            </div>
            <div class="bill-detail-item">
              <p class="title">Address of Subscriber</p>
              <p class="value">{{ address }}</p>
            </div>
          </div>
        </div>
      </div>
      <div 
        v-if="type === '3'"
        class="gift-card-detail"
      >
        <div class="divide-line" />
        <div class="detail-item">
          <p class="item-sn">Serial Number: 3B10#756857</p>
          <button 
            class="copy j-copy-sn"
            data-clipboard-text="3B10#756857"
            @click="clickCopy('.j-copy-sn')">Copy</button>
        </div>
        <div class="detail-item">
          <p class="item-code">Redeem Code: X9H3JEG2367V</p>
          <button 
            class="copy j-copy-code" 
            data-clipboard-text="X9H3JEG2367V"
            @click="clickCopy('.j-copy-code')">Copy</button>
        </div>
      </div>
    </main>
    <div>
      <p style="font-size:14px;">
        <a href="/bill.html">Bill Payment </a>
      </p>
      <p style="font-size:14px;">
        <a href="/giftcard.html">GiftCard </a>
      </p>
    </div>
    <div class="footer">
      <p v-if="type === '1'">* The Top Up transaction is generally completed within 30 mins after it has been sent.</p>
      <p v-if="type === '2'">* The  transaction is generally completed within 3 days after it has been sent.</p>
      <p v-if="type === '3'">* The Top Up transaction is generally completed within 30 mins after it has been sent.</p>
    </div>
  </div>
</template>
<script>
import * as url from "@/modules/url";
import { formatPrice } from "@/modules/formatter";
import ClipboardJS from "clipboard";
export default {
  name: "PayResult",
  computed: {
    goodsName() {
      return decodeURIComponent(url.getParam("goodsName"));
    },
    amount() {
      return url.getParam("amount") * 1;
    },
    orderNo() {
      return url.getParam("orderNo");
    },
    type() {
      return url.getParam("type");
    },
    billAmount() {
      return url.getParam("billAmount");
    },
    address() {
      return decodeURIComponent(url.getParam("address"));
    },
    status() {
      return url.getParam("status");
    },
    name() {
      return decodeURIComponent(url.getParam("name"));
    },
    goodsId() {
      return url.getParam("goodsId");
    },
  },
  methods: {
    clickCopy(className) {
      let clipboard = new ClipboardJS(className);
      clipboard.on("success", () => {
        console.log("0000");
        this.$tips.showAlert({ text: "Copy successfully" });
        clipboard.destroy();
      });
      clipboard.on("error", () => {
        console.log("1111");
        this.$tips.showAlert({ text: "Copy failed" });
        clipboard.destroy();
      });
    }
  },
  filters: {
    formatPrice: formatPrice
  }
};
</script>
<style lang="less" scoped>
@import "~@/assets/style/common.less";
.pay-result {
  position: relative;
  height: 100vh;
  padding: 0 .px2rem(16) [];
  .m-body {
    margin: 0;
    flex: 1;
    flex-direction: column;
  }
  .success-top {
    height: .px2rem(32) [];
  }
  .success-img {
    margin: 0 auto;
    font-size: 0;
    img {
      height: .px2rem(50) [];
      width: .px2rem(50) [];
      border-radius: 50%;
      background-color: #09BB07;
    }
  }
  .success-title {
    margin-top: .px2rem(10)[];
    p {
      text-align: center;
      font-size: .px2rem(15) [];
      color: #000;
    }
  }
  .success-content {
    text-align: center;
    margin-top: .px2rem(30)[];
    .title {
      .name {
        font-size: .px2rem(15) [];
        color: #000;
        font-weight: 500;
      }
      .pay-amount {
        margin-top: .px2rem(6)[];
        font-size: .px2rem(27) [];
        line-height: .px2rem(32) [];
        color: #222;
        font-weight: 500;
      }
      .ks {
        font-size: .px2rem(16) [];
      }
      .pay-goods-name {
        color: #888888;
        font-size: .px2rem(15) [];
        line-height: .px2rem(18) [];
      }
    }
  }
  .electricity-bill-detail {
    margin-top: .px2rem(24) [];
    position: relative;
    .f-divide-line(@color:#E6E6E6, @direction: top,);
    .subscriber-bill {
      padding: .px2rem(24) [] 0;
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
  }
  .gift-card-detail {
    position: relative;
    margin-top: .px2rem(24) [];
    .divide-line {
      .f-divide-line(@color:#E6E6E6, @direction: top);
      margin: .px2rem(24) [] 0 .px2rem(32) [];
    }
    .detail-item {
      padding: .px2rem(14) [] .px2rem(12) [];
      border-radius: .px2rem(4) [];
      border: 1px solid rgba(143, 146, 161, 0.2);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: .px2rem(14) [];
      margin-bottom: .px2rem(10) [];
      .item-sn, .item-code {
        color: #333;
      }
      .copy {
        color: #5761B5;
        border: 1px solid #5761B5;
        padding: .px2rem(5) [] .px2rem(10) [];
        border-radius: .px2rem(4) [];
      }
    }
  }
  .footer {
    bottom: 0;
    left: 0;
    right: 0;
    box-sizing: border-box;
    padding: 0 0 .px2rem(50) [];
    font-size: .px2rem(14) [];
    color: #F02E45;
    line-height: .px2rem(22) [];
    text-align: center;
  }
}
</style>