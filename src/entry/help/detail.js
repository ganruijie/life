import Vue from "vue";
import App from "@/page/Help/Detail";
import  initialize from "@/init";

initialize(() =>{
  new Vue({
    el: "#app",
    render(h) {
      return h(App);
    }
  });
});