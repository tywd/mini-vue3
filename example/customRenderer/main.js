import { createRenderer } from "../../lib/guide-mini-vue.esm.js";
import { App } from "./App.js";
console.log(PIXI)
const game = new PIXI.Application({
  width: 500,
  height: 500,
});

document.body.append(game.view);

const renderer = createRenderer({
  createElement(type) { // 创建节点
    if (type === "rect") { // APP.js中传递的 节点名称 rect
      const rect = new PIXI.Graphics();
      rect.beginFill(0xff0000);
      rect.drawRect(0, 0, 200, 200);
      rect.endFill();
      return rect;
    }
  },
  patchProp(el, key, val) { // 设置属性
    el[key] = val; // canvas PIXI 设置属性
  },
  insert(el, parent) { // 添加节点到父级parent
    // parent.append(el);
    parent.addChild(el); // PIXI 添加节点
  },
});

renderer.createApp(App).mount(game.stage); // PIXI创建的 game.stage 要让组件挂载的节点

// const rootContainer = document.querySelector("#app");
// renderer.createApp(App).mount(rootContainer);