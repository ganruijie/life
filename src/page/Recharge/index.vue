<template>
  <div 
    class="container" 
    @submit.prevent="() => false">
    <header 
      class="m-header top-up-padding">
      <nav
        v-if="rechargeItem.length !== 1"
        class="nav"
        ref="nav"
      >
        <div
          class="nav-item"
          v-for="(value, index) in rechargeItem"
          :key="index"
          @click="chargeType = value.tabKey;"
          :class="{ selected: chargeType === value.tabKey }">
          <span class="nav-text">{{ value.tabName }}</span>
          <span
            v-if="value.activityDescption"
            class="exercise-icon"
          >
            {{ value.activityDescption }}
          </span>
        </div>
      </nav>
    </header>
    <main
      :class="{iosMain : rechargeItem.length === 1}"
      class="m-body">
      <section-fee
        class="fee-charge-section"
        :charge-type="carrier"
        :support-type="supportGoodType"
        :precondition="preconditionData"/>
    </main>
  </div>
</template>

<script>
/**
 * @typedef {Object} VirtualGoodsVO - 话费或者流量的商品信息
 * @property {Number} goodsId -商品ID
 * @property {Number} amount - 面额
 * @property {Number} salePrice - 售价
 * @property {Number} virtualGoodsType - 商品类型
 * @property {String} goodsName - 商品名称
 * */
/**
 * @typedef {Object} GoodsItem
 * @property {(Number|String)} virtualGoodsType
 * @property  {VirtualGoodsVO[]} goodsVOList
 * 
 * */
import SectionFee from "@/page/components/SectionFee.vue";
import { computeSucc, getChargeData } from "@/modules/api";
import { code, msg } from "@/config/error.js";
import bridge from "@/modules/bridge";
import { isAndroid } from "@/modules/env";
import url from "@/modules/url.js";
import { constructorMap } from "@/config/macroMap";

export default {
  name: "App",
  components: {
    SectionFee,
  },
  data() {
    return {
      chargeType: 1,
      preconditionData: null,
      rechargeItem: [],
      supportGoodType: 0
    };
  },
  created() {
    this.init();
  },
  computed: {
    isAndroid() {
      return isAndroid();
    },
    carrier() {
      return this.chargeType;
    }
  },
  methods: {
    async init() {
      if (url.getParam("chargeType") !== "") {
        this.chargeType = url.getParam("chargeType");
      }
      console.log(bridge, "909090");
      console.log(window, "0000000");
      await bridge.readyPromisify();
      
      // getRechargeToken 返回值的结构已和客户端约定好，见 appEnv.js 中 mockData，本地开发时得到的数据来自于该 mockData 数据；
      // 另外现在的几个 token 值相同，取用任意一个都行
      const [
        feeListToken,
        dataListToken,
        osCode,
        json,
      ] = await bridge.getRechargeToken();
      
      this.preconditionData = {
        requestToken: feeListToken,
        osCode,
      };
      try {
        //如果不传设置为默认值0
        this.supportGoodType = json ? JSON.parse(decodeURIComponent(json)).supportGoodType : 0;
        this.rechargeItem = await this.getItemList(this.supportGoodType);
      } catch (e) {
        this.rechargeItem = [];
      }
    },
    //请求tab栏和活动标识
    async getItemList(supportGoodType) {
      try {
        // const params = {
        //   osCode: this.preconditionData.osCode,
        //   requestToken: this.preconditionData.requestToken,
        //   requestPlainString: JSON.stringify({
        //     constructor: constructorMap.CON_TAB_LIST,
        //     systemVersion: supportGoodType
        //   }),
        // };
        // const res = await computeSucc(getChargeData)(params);
        // return res.tabList;
        let res = await this.getChargeData();
        return res;
      } catch (err) {
        this.$tips.showAlert({
          text: err.errorMessage || msg[err.errorCode || code.NET_ERR]
        });
        return [];
      }
    },
    // 获取运营商信息
    getChargeData() {
      return new Promise((resolve) => {
        resolve([
          { tabKey: 1, tabName: "MPT", id: 1 },
          { tabKey: 2, tabName: "OORRDOO", id: 2 },
          { tabKey: 3, tabName: "TELENOR", id: 3 },
        ]);
      });
    },
  },
};
</script>

<style lang="less" scoped>
@import "~@/assets/style/common.less";
.top-up-padding {
  padding: 0px .px2rem(16) [];
}
</style>
