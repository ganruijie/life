
import Vue from "vue";
import  initialize from "@/init";
import Tips from "@/components/tips/index.vue";
import App from "@/page/Recharge";

Vue.use(Tips);

initialize(() =>{
  new Vue({
    el: "#app",
    render(h) {
      return h(App);
    }
  });
});