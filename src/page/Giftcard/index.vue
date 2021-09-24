<template>
  <div 
    class="container gift-card" 
    @submit.prevent="() => false">
    <main class="m-body">
      <section-game
        class="game-charge-section"
        :support-type="0"
        :precondition="preconditionData"/>
    </main>
  </div>
</template>
<script>
import SectionGame from "@/page/components/SectionGame";
export default {
  name: "GiftCard",
  components: {
    SectionGame
  },
  data() {
    return {
      preconditionData: {},
    };
  }
};
</script>

<style lang="less" scoped>
  @import "~@/assets/style/common.less";
</style>