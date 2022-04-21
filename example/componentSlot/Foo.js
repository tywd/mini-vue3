import {
  h,
  renderSlots
} from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
  name: 'Foo',
  setup() {
    return {};
  },
  render() {
    const foo = h("p", {}, "foo");

    // Foo .vnode. children 在子组件的children 里放入slot 就是插槽，也就是要在childre能访问父组件的传入的slot
    console.log(this.$slots);
    // children -> vnode
    //
    // renderSlots
    // 具名插槽
    // 1. 获取到要渲染的元素 1
    // 2. 要获取到渲染的位置
    // 作用域插槽
    const age = 18;
    return h("div", {}, [renderSlots(this.$slots, 'header', {age}), foo, renderSlots(this.$slots, 'footer')])
    // return h("div", {}, [renderSlots(this.$slots, 'header'), foo, renderSlots(this.$slots, 'footer')])
    // return h("div", {}, [foo, renderSlots(this.$slots)])
  },
};