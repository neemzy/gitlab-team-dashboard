import Vue from "vue";
import App from "./components/App";

Vue.config.productionTip = false;

new Vue({
  el: "#app",
  render: h => h(App)
});
