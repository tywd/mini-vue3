import { isObject } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { Fragment,Text } from "./vnode"

export function render(vnode, container) {
    // patch 方便后续递归处理
    patch(vnode, container)
}

function patch(vnode, container) {
    // 去处理组件
    // ShapeFlags
    // vnode -> flag
    // element
    // STATEFUL_COMPONENT
    // TODO 判断vnode 是不是一个 element
    // 是 element 就处理element, 如何区分element 和 component
    const { shapeFlag, type } = vnode

    // Fragment -> 只渲染 children
    switch (type) {
        case Fragment:
            processFragment(vnode, container)
            break;
        case Text:
            processText(vnode, container)
            break;
        default:
            // if (typeof vnode.type === "string") {
            if (shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container)
                // } else if (isObject(vnode.type)) {
            } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                // 判断是不是组件类型
                processComponent(vnode, container)
            }
            break;
    }
}

function processText(vnode, container) {
    const { children } = vnode
    const textNode = (vnode.el = document.createTextNode(children))
    container.append(textNode);
}

function processFragment(vnode, container) {
    mountChildren(vnode.children, container)
}

function processElement(vnode, container) {
    mountElement(vnode, container)
}

function mountElement(vnode, container) {
    const { type, props, children, shapeFlag } = vnode
    // type
    // vnode -> element -> div
    const el = (vnode.el = document.createElement(type));
    // children
    // if (typeof children == 'string') {
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children
        // } else if (Array.isArray(children)) {
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode.children, el)
    }
    // props
    for (const key in props) {
        const val = props[key]
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

function mountComponent(initialVnode, container) {
    const instance = createComponentInstance(initialVnode)
    // instance = (const component = { vnode, type: vnode.type, setupState: {} })
    setupComponent(instance)
    setupRenderEffect(instance, initialVnode, container)
}

function setupRenderEffect(instance, initialVnode, container) {
    const { proxy } = instance
    // const subTree = instance.render
    const subTree = instance.render.call(proxy)
    // vnode -> patch
    // vnode -> element ->mountElement
    patch(subTree, container)

    // 获取初始化完成(element -> mount挂载之后)之后的el，
    // 挂载完成后的subTree结构大致如下
    /* {
        children:[],
        props: {},
        type: '',
        el: '#root'
    } */
    // 把当前subTree根(root)节点的el赋值给(initialVnode)的el
    initialVnode.el = subTree.el
}