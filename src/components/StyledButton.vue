<!--
     这个组件不指定 tag属性时除了样式基本就表现为原生<button type="button"></button>
     可直接v-on监听原生事件
 -->
<script>
export default {
  name: "StyledButton",
  props: {
    tag: {
      type: String,
      default: "button"
    }
  },
  computed: {
    listeners() {
      return Object.assign({}, this.$listeners);
    }
  },
  render(createElement) {
    return createElement(
      //用render函数来做到根据传入的 tag来生成响应的根元素
      this.tag,
      {
        class: ["styled-button"],
        on: {
          ...this.listeners
        },
        attrs: {
          type: "button",
          ...this.$attrs
        }
      },
      [this.$slots.default]
    );
  }
};
</script>

<style lang="less" scoped>
.styled-button {
  margin: 0;
  height: .px2rem(25)[];
  line-height: .px2rem(25) [];
  width: 100%;
  text-align: center;
  font-size: inherit;
  border-radius: .px2rem(4)[];
  color: #fff;
  background-color: @color-btn-bg;
  &.active,
  &:active {
    color: @color-btn-active-ft;
    background-color: @color-btn-active-bg;
  }
  &:disabled,&[disabled] {
    color: @color-btn-disable-ft;
    background-color: @color-btn-disable-bg;
  }
}
</style>
