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
          <h3 class="name">MPT</h3>
          <h3 class="pay-amount">{{ amount | formatPrice(true) }}<span class="ks">Ks</span></h3>
          <p class="pay-goods-name">{{ goodsName }}</p>
        </div>
      </div>
    </main>
    <div class="footer">
      <p v-if="type === '1'">* The Top Up transaction is generally completed within 30 mins after it has been sent.</p>
    </div>
  </div>
</template>
<script>
import * as url from "@/modules/url";
import { formatPrice } from "@/modules/formatter";
export default {
  name: "PayResult",
  computed: {
    goodsName() {
      return decodeURIComponent(url.getParam("goodsName"));
    },
    amount() {
      return url.getParam("amount") * 10;
    },
    orderNo() {
      return url.getParam("orderNo");
    },
    type() {
      return url.getParam("type");
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
  .footer {
    bottom: 0;
    left: 0;
    right: 0;
    box-sizing: border-box;
    padding: 0 .4rem .px2rem(50) [];
    font-size: .px2rem(14) [];
    color: #F02E45;
    line-height: .px2rem(22) [];
    text-align: center;
  }
}
</style>