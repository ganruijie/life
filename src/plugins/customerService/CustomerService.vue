<template>
  <a
    v-if="selfLink"
    class="u-customer-service"
    :href="selfLink"
  > 联系客服 </a>
</template>

<script>
export default {
  name: "CustomerService",
  props: {
    link: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      selfLink: ""
    };
  },
  watch: {
    link(to) {
      this.selfLink = to;
    }
  },
  methods: {
    show(link) {
      this.selfLink = link;
    },
  },
  install(Vue) {
    let VComponent = Vue.extend(this);
    const component = (Vue.prototype.$customer = Vue.customer = new VComponent({
      el: document.createElement("div")
    }));
    document.body.appendChild(component.$el);
    return component;
  }
};
</script>

<style lang="less" scoped>
.u-customer-service {
  @height: 82/37.5rem;
  @half-height:@height/2;
  display: block;
  position: fixed;
  right: 0;
  bottom: 40/37.5rem;
  height: 29/37.5rem;
  width: @height;
  text-align: center;
  border-top-left-radius: @half-height;
  border-bottom-left-radius: @half-height;
  font-size: 13px;
  line-height: 29/37.5rem;
  color: #01a1ef;
  background: #cbe3f3;
}
</style>
