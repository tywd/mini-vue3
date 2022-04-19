import { isObject } from "../shared"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    // patch 方便后续递归处理
    patch(vnode, container)
}

function patch(vnode, container) {
    // 去处理组件
    // TODO 判断vnode 是不是一个 element
    // 是 element 就处理element
    // 如何区分element 和 component
    if (typeof vnode.type === "string") {
        processElement(vnode, container)
    } else if (isObject(vnode.type)) {
        // 判断是不是组件类型
        processComponent(vnode, container)
    }
}

function processElement(vnode, container) {
    mountElement(vnode, container)
}

function mountElement(vnode, container) {
    const { type, props, children } = vnode
    // type
    const el = document.createElement(type);
    // children
    if (typeof children == 'string') {
        el.textContent = children
    } else if (Array.isArray(children)) {
        mountChildren(vnode.children, el)
    }
    // props
    for (const key in props) {
        const val = props[key]
        el.setAttribute(key, val)
    }
    container.append(el)
    // document.body.append(el)
}

function mountChildren(children, container) {
    children.forEach(v => {
        patch(v, container)
    });
}

function processComponent(vnode, container) {
    mountComponent(vnode, container)
}

function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode)
    setupComponent(instance)
    setupRenderEffect(instance, container)
}

function setupRenderEffect(instance, container) {
    const subTree = instance.render()
    // vnode -> patch
    // vnode -> element ->mountElement
    patch(subTree, container)
}