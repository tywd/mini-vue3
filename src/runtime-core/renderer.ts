import { isObject } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./createApp"
import { Fragment, Text } from "./vnode"
export function createRenderer(options) {
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert
    } = options

    // export function render(vnode, container) {
    function render(vnode, container) {
        // patch 方便后续递归处理
        patch(vnode, container, null)
    }

    function patch(vnode, container, parentComponent) {
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
                processFragment(vnode, container, parentComponent)
                break;
            case Text:
                processText(vnode, container)
                break;
            default:
                // if (typeof vnode.type === "string") {
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(vnode, container, parentComponent)
                    // } else if (isObject(vnode.type)) {
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 判断是不是组件类型
                    processComponent(vnode, container, parentComponent)
                }
                break;
        }
    }

    function processText(vnode, container) {
        const { children } = vnode
        const textNode = (vnode.el = document.createTextNode(children))
        container.append(textNode);
    }

    function processFragment(vnode, container, parentComponent) {
        mountChildren(vnode.children, container, parentComponent)
    }

    function processElement(vnode, container, parentComponent) {
        mountElement(vnode, container, parentComponent)
    }

    function mountElement(vnode, container, parentComponent) {
        const { type, props, children, shapeFlag } = vnode
        // type
        // vnode -> element -> div
        // const el = (vnode.el = document.createElement(type));
        const el = (vnode.el = hostCreateElement(type));
        // children
        // if (typeof children == 'string') {
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
            // } else if (Array.isArray(children)) {
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode.children, el, parentComponent)
        }
        // props
        for (const key in props) {
            const val = props[key]
            /* const isOn = (key: string) => /^on[A-Z]/.test(key) // 判断是否是onClick等一类on开头的事件
            if (isOn(key)) {
                // element事件添加
                const event = key.slice(2).toLowerCase()
                el.addEventListener(event, val)
            } else {
                // element属性添加
                el.setAttribute(key, val)
            } */
            hostPatchProp(el, key, val)
        }
        // document.body.append(el)
        // container.append(el)
        hostInsert(el, container)
    }

    function mountChildren(children, container, parentComponent) {
        children.forEach(v => {
            patch(v, container, parentComponent)
        });
    }

    function processComponent(vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent)
    }

    function mountComponent(initialVnode, container, parentComponent) {
        const instance = createComponentInstance(initialVnode, parentComponent)
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
        patch(subTree, container, instance)

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

    return {
        createApp: createAppAPI(render)
    }
}