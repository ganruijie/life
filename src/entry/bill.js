import Vue from "vue";
import Tips from "@/components/tips";
import initialize from "@/init.js";
import Bill from "@/page/Bill/index.vue";

Vue.use(Tips);

initialize(() => {
  new Vue({
    el: "#app",
    render: (h) => { return h(Bill); },
  });
});