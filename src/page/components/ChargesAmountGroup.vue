<template>
  <div 
    class="charges-amount-group">
    <p
      class="charges-group-title"
      v-if="showTitle">
      <span class="charges-group-name">{{ chargeType === 2 ? group.title : group.categoryVO.categoryName }}</span>
    </p>
    <ul class="charges-amount-list">
      <li
        :class="ele.virtualGoodsType === 2 ? 'charge-item-full' : 'charge-item'"
        v-for="(ele, index) in renderData"
        :key="index">
        <div 
          v-if="chargeType !== 3 && ele.activityDescption"
          class="charge-item-radio-rebate"
        >
          {{ ele.activityDescption }}
        </div>
        <form-radio
          name="fee"
          class="charge-item-radio"
          :disabled="!isServerValid"
          :btn-class="ele.virtualGoodsType === 2 ? 'radio-item-btn radio-item-height' : 'radio-item-btn'"
          :value="isServerValid && value ? value.goodsId : null"
          @input="select($event, ele)"
          :val-code="ele.goodsId">
          <div
            class="value-wrapper">
            <template v-if="chargeType !== 3">
              <template v-if="ele.virtualGoodsType === 2">
                <div class="data-package">
                  <p class="face-value data-package-item">{{ ele.goodsName }}</p>
                  <p class="sale-price data-package-item">{{ ele.salePrice | formatPrice(true) }}Ks</p>
                </div>
              </template>
              <template v-else>
                <p
                  v-if="chargeType === 2"
                  class="face-value">{{ ele.amount | formatPrice(false) }}Ks</p>
                <p
                  v-else
                  class="face-value">{{ ele.goodsName }}</p>
                <p
                  class="sale-price"
                  v-if="isServerValid">Price:{{ ele.salePrice | formatPrice(true) }}Ks</p>
              </template>
            </template>
            <template v-else>
              <p 
                class="face-value" 
                style="margin-top: 0">{{ ele.goodsName }}</p>
            </template>
          </div>
        </form-radio>
      </li>
    </ul>
  </div>
</template>

<script>
import StyledButton from "@/components/StyledButton.vue";
import FormRadio from "@/components/form/FormRadio.vue";
import { formatPrice } from "@/modules/formatter";

export default {
  name: "ChargesAmountGroup",
  filters: {
    formatPrice: formatPrice
  },
  props: {
    group: {
      type: Object,
      default() {
        return {};
      }
    },
    showTitle: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      default() {
        return {};
      }
    },
    chargeType: { // 1 MPT；2 OORRDOO,3 TELENOR
      type: Number,
      default: 1
    },
    isServerValid: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    type() {
      return this.group.virtualGoodsType;
    },
    renderData() {
      return this.group.goodsVOList;
    },
  },
  methods: {
    select(goodsId, item) {
      //默认数据所有充值项的goodsId为 0,以此为标志来实现默认数据不可选择充值项。
      if (!this.isServerValid) {
        return;
      }
      this.$emit("input", (this.value  && this.value.goodsId === goodsId) ? null : item);
    }
  },
  components: {
    StyledButton,
    FormRadio
  },
};
</script>

<style lang="less" scoped>
.charges-amount-group {
  padding-bottom: .px2rem(28) [];
  // &:first-child {
  //   padding-top: .px2rem(12) [];
  // }
  &:last-child {
    padding-bottom: .px2rem(20) [];
    .stretch & {
      padding-bottom: .px2rem(70) [];
    }
  }
  .charges-group-title {
    user-select: none;
  }
}
.charges-group-title {
  display: flex;
  align-items: center;
  margin-left: .px2rem(2) [];
  padding-bottom: .px2rem(12) [];
}
.charges-group-name {
  line-height: .px2rem(22.5) [];
  font-size: .px2rem(15) [];
  font-weight: 700;
  .f-pingfang-medium();
}
.charges-group-desc {
  margin-left: .px2rem(8) [];
  font-size: .px2rem(12) [];
  color: #888;
}
.charges-amount-list {
  margin: .px2rem(-10) [] .px2rem(-10) [] 0;
}
.charge-item {
  display: inline-block;
  vertical-align: bottom;
  width: calc(100%/3);
  box-sizing: border-box;
  padding: 0 .px2rem(10) [];
  margin-top: .px2rem(10) [];
  position: relative;
}
.charge-item-full {
  display: inline-block;
  vertical-align: bottom;
  width: 100%;
  box-sizing: border-box;
  padding: 0 .px2rem(10) [];
  margin-top: .px2rem(10) [];
  position: relative;
}
.charge-item-radio {
  display: block;
  width: 100%;
  /deep/ .radio-item-btn {
    width: 100%;
    height: .px2rem(70) [];
    border-radius: .px2rem(6) [];
    border: 1px solid #d9d9d9;
    &[checked] {
      background: #ffffff;
      color: @color-select;
      border: 1px solid @color-select;
    }
    &[disabled]{
      color: #AAA;
    }
  }
  /deep/ .radio-item-height {
    height: .px2rem(48) [];
  }
}
.data-package {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .data-package-item {
    margin: 0px !important;
  }
}
.value-wrapper{
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  .face-value {
    [disabled] &{
      margin: 0;
    }
    margin-top: .px2rem(9) [];
    line-height: 22.5px;
    font-size: .px2rem(15) [];
    white-space: nowrap;
    .f-sf-pro-text-semibold();
  }
  .sale-price {
    margin-top: .px2rem(4) [];
    font-size: .px2rem(12) [];
    line-height: 15px;
    margin-bottom: .px2rem(8) [];
    // white-space: nowrap;
    word-break: break-all;
    color: #888;
  }
}
.charge-item-radio-rebate {
  position: absolute;
  background: @color-red;
  right: .px2rem(10) [];
  width: .px2rem(32) [];
  height: .px2rem(17) [];
  border-radius: .px2rem(0) [] .px2rem(6) [] .px2rem(0) [] .px2rem(6) [];
  text-align: center;
  line-height: .px2rem(17) [];
  color: #FFFFFF;
  font-size: .px2rem(10) [];
}
</style>
