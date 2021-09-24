import Fastclick from "fastclick";
import "@/styles/index.less";

export default  function initialize(app) {
  if (process.env.NODE_ENV === "development") {
    // import("eruda").then(module => {
    //   module.default.init();
    // });
    import(/* webpackChunkName: "appEnv" */"@/../mock/appEnv.js");
  }
  window.addEventListener("DOMContentLoaded", function () {
    Fastclick.attach(document.body);
    app && app();
  });
}
