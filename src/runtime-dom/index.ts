import { createRenderer } from "../runtime-core";

function createElement(type) { // 创建节点
    console.log('createElement: ');
    return document.createElement(type)
}
function patchProp(el, key, val) { // 设置属性
    console.log('patchProp: ');
    const isOn = (key: string) => /^on[A-Z]/.test(key) // 判断是否是onClick等一类on开头的事件
    if (isOn(key)) {
        // element事件添加
        const event = key.slice(2).toLowerCase()
        el.addEventListener(event, val)
    } else {
        // element属性添加
        el.setAttribute(key, val)
    }
}
function insert(el, container) { // 添加节点到父级parent
    console.log('insert: ');
    container.append(el)
}

const renderer: any = createRenderer({ createElement, patchProp, insert })

export function createApp(...args) {
    return renderer.createApp(...args)  // renderer.ts -> return createApp
}
export * from "../runtime-core"
