import { h, getCurrentInstance } from "../../lib/guide-mini-vue.esm.js";
import { Foo } from "./Foo.js";

export const App = {
  name: "App",
  render() {
    return h("div", {}, [h("p", {}, "currentInstance demo"), h(Foo)]);
  },

  setup() {
    const instance = getCurrentInstance(); // 支持访问内部组件实例。即访问当前组件实例，只能在 setup 或生命周期钩子中调用。
    // https://v3.cn.vuejs.org/api/composition-api.html#getcurrentinstance
    console.log("App:", instance);
  },
};
