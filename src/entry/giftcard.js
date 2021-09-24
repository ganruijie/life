import Vue from "vue";
import initialize from "@/init.js";
import Tips from "@/components/tips/index.vue";
import GiftCard from "@/page/Giftcard/index.vue";

Vue.use(Tips);

initialize(() => {
  new Vue({
    el: "#app",
    render: (h) => { return h(GiftCard); },
  });
});
