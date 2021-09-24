<template>
  <div 
    class="container bill" 
    @submit.prevent="() => false">
    <main class="m-body">
      <keep-alive>
        <section-bill
          :support-type="0"
          class="bill-charge-section"
          :precondition="preconditionData"/>
      </keep-alive>
    </main>
  </div>
</template>
<script>
import SectionBill from "@/page/components/SectionBill";
import { computeSucc, getChargeData } from "@/modules/api";
import { code, msg } from "@/config/error.js";
import bridge from "@/modules/bridge";
import { isAndroid } from "@/modules/env";
import url from "@/modules/url.js";
import { constructorMap } from "@/config/macroMap";
export default {
  name: "Bill",
  components: {
    SectionBill
  },
  data() {
    return {
      preconditionData: null
    };
  }
};
</script>
<style lang="less" scoped>
  @import "~@/assets/style/common.less";
</style>