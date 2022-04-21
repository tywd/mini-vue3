import {
  h,
  // createTextVNode
} from "../../lib/guide-mini-vue.esm.js";
import {
  Foo
} from "./Foo.js";
// 插槽写法
// tempate 写法
/* <div id="app">
  <Foo><p>123</p></Foo>
</div> */
// h 函数写法
// const foo = h(Foo, {}, h("p", {}, "123"));

// Fragment 以及 Text
export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "App");
    // object key 具名插槽形式
    const foo = h(Foo, {}, {
      header: ({age}) => h("p", {}, "header "+ age),
      footer: () => h("p", {}, "footer")
    });
    /* const foo = h(Foo, {}, {
      header: h("p", {}, "header"),
      footer: h("p", {}, "footer")
    }); */
    // 数组 vnode
    // const foo = h(Foo, {}, h("p", {}, "123"));
    // const foo = h(Foo, {}, [h("p", {}, "header"),h("p", {}, "footer")]);
    return h("div", {}, [app, foo]);
  },

  setup() {
    return {};
  },
};