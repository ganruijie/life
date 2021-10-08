<template>
  <div 
    class="container gift-card" 
    @submit.prevent="() => false">
    <header 
      v-if="!itemId"
      class="m-header top-up-padding">
      <nav 
        class="nav"
        ref="nav">
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
    <main class="m-body">
      <section-game
        class="game-charge-section"
        :charge-type="carrier"
        :support-type="0"
        :precondition="preconditionData"/>
    </main>
  </div>
</template>
<script>
import SectionGame from "@/page/components/SectionGame";
import * as url from "@/modules/url";
export default {
  name: "GiftCard",
  components: {
    SectionGame
  },
  data() {
    return {
      preconditionData: {},
      rechargeItem: [],
      chargeType: 11,
    };
  },
  computed: {
    carrier() {
      return this.chargeType;
    },
    itemId() {
      return url.getParam("itemId");
    },
    type() {
      return url.getParam("chargeType") || 11;
    }
  },
  created() {
    this.chargeType = this.type || 11;
    this.init();
  },
  methods: {
    init() {
      this.getChargeData().then(res => {
        this.rechargeItem = [...res];
      });
    },
    // 获取运营商信息
    getChargeData() {
      return new Promise((resolve) => {
        resolve([
          { tabKey: 11, tabName: "Discount", id: 1 },
          { tabKey: 12, tabName: "Normal", id: 2 },
        ]);
      });
    },
  }
};
</script>

<style lang="less" scoped>
  @import "~@/assets/style/common.less";
  .m-body {
    margin: 0;
  }
</style>