'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const publicPropertiesMap = {
    $el: (i) => i.vnode.el
};
const PublicInstanceProxyHandlers = {
    get({ instance }, key) {
        // setupState一开始并没有值，会在 handleSetupResult 方法中被赋值得到，
        // 最后在renderer中 instance.render.call(proxy) 绑定到当前proxy执行时 访问 this.${key}，触发proxy的get，在 setupState 中找到对应的key
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        // debugger;
        // 访问 this.$el 时 key -> $el
        /* if (key === '$el') {
            return instance.vnode.el
        } */
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
        // $options
        // $data
    }
};

function createComponentInstance(vnode) {
    const component = { vnode, type: vnode.type, setupState: {} };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()
    setupStateFulComponent(instance);
}
function setupStateFulComponent(instance) {
    const Component = instance.type;
    // ctx
    instance.proxy = new Proxy({ instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        // function Object
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function Object
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    // if(Component.render){
    instance.render = Component.render;
    // }
}

function render(vnode, container) {
    // patch 方便后续递归处理
    patch(vnode, container);
}
function patch(vnode, container) {
    // 去处理组件
    // ShapeFlags
    // vnode -> flag
    // element
    // STATEFUL_COMPONENT
    // TODO 判断vnode 是不是一个 element
    // 是 element 就处理element, 如何区分element 和 component
    const { shapeFlag } = vnode;
    // if (typeof vnode.type === "string") {
    if (shapeFlag & 1 /* ELEMENT */) {
        processElement(vnode, container);
        // } else if (isObject(vnode.type)) {
    }
    else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        // 判断是不是组件类型
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const { type, props, children, shapeFlag } = vnode;
    // type
    // vnode -> element -> div
    const el = (vnode.el = document.createElement(type));
    // children
    // if (typeof children == 'string') {
    if (shapeFlag & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
        // } else if (Array.isArray(children)) {
    }
    else if (shapeFlag & 8 /* ARRAY_CHILDREN */) {
        mountChildren(vnode.children, el);
    }
    // props
    for (const key in props) {
        const val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el);
    // document.body.append(el)
}
function mountChildren(children, container) {
    children.forEach(v => {
        patch(v, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initialVnode, container) {
    const instance = createComponentInstance(initialVnode);
    // instance = (const component = { vnode, type: vnode.type, setupState: {} })
    setupComponent(instance);
    setupRenderEffect(instance, initialVnode, container);
}
function setupRenderEffect(instance, initialVnode, container) {
    const { proxy } = instance;
    // const subTree = instance.render
    const subTree = instance.render.call(proxy);
    // vnode -> patch
    // vnode -> element ->mountElement
    patch(subTree, container);
    // 获取初始化完成(element -> mount挂载之后)之后的el，
    // 挂载完成后的subTree结构大致如下
    /* {
        children:[],
        props: {},
        type: '',
        el: '#root'
    } */
    // 把当前subTree根(root)节点的el赋值给(initialVnode)的el
    initialVnode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    // children
    if (typeof children === 'string') {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先vnode
            // component -> vnode
            // 所有的逻辑操作都会基于 vnode 做处理
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
