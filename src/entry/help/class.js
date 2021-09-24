import Vue from "vue";
import App from "@/page/Help/Class";
import  initialize from "@/init";
import Tips from "@/components/tips/index.vue";

Vue.use(Tips);

initialize(() =>{
  new Vue({
    el: "#app",
    render(h) {
      return h(App);
    }
  });
});