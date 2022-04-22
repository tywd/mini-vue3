'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === "object";
};
// 判断 key 是否在 val 的属性里
const hasOwn = (val, key) => {
    return Object.prototype.hasOwnProperty.call(val, key);
};
const camlize = (str) => {
    return str.replace(/-(\w)/g, (b, c) => {
        console.log('b: ', b); // b表示 获取的 -与-之后的第一个字母的拼接
        console.log('c: ', c); // c表示 -之后的第一个字母
        return c ? c.toUpperCase() : "";
    });
};
// 首字母取到并改成大写 + 除首字母之外的
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};

/*
 * @Author: tywd
 * @Date: 2022-04-18 19:12:43
 * @LastEditors: tywd
 * @LastEditTime: 2022-04-18 19:55:46
 * @FilePath: /mini-vue3/src/reactivity/effect.ts
 * @Description: Do not edit
 */
const targetMap = new Map();
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
const shallowReactiveGet = createGetter(false, true);
function createGetter(isReadonly = false, shallow = false) {
    return function (target, key) {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function (target, key, value) {
        const res = Reflect.set(target, key, value);
        // TODO 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandles = {
    get,
    set
};
const readonlyHandles = {
    get: readonlyGet,
    set(target, key, value) {
        // Set operation on key "currentNum" failed: target is readonly
        console.warn(`Set operation on key ${key} failed: target is readonly`);
        return true;
    }
};
const shallowReadonlyHandles = extend({}, readonlyHandles, {
    get: shallowReadonlyGet,
    /* set(target, key, value) {
        // Set operation on key "currentNum" failed: target is readonly
        console.warn(`Set operation on key ${key} failed: target is readonly`)
        return true
    } */
});
extend({}, mutableHandles, {
    get: shallowReactiveGet,
});

function reactive(raw) {
    return createActiveObject(raw, mutableHandles);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandles);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandles);
}
function createActiveObject(target, baseHandles = mutableHandles) {
    if (!isObject(target)) {
        console.warn(`target ${target} 必须是一个对象`);
        return target;
    }
    return new Proxy(target, baseHandles);
}

function emit(instance, event, ...args) {
    // console.log('emit', event);
    // instance.props -> event
    const { props } = instance;
    // TPP 先去写一个特定的行为 -> 再慢慢重构成通用行为
    // add -> Add
    // add-foo -> addFoo 将emit('add-foo') 这种形式转换成 addFoo，即是调用复组件的 addFoo
    /* const camlize = (str: string) => {
        return str.replace(/-(\w)/g, (b, c: string) => { // /-(\w)/g 正则匹配所有的- 和 -后第一个字
            console.log('b: ', b); // b表示 获取的 -与-之后的第一个字母的拼接
            console.log('c: ', c); // c表示 -之后的第一个字母
            return c ? c.toUpperCase() : ""
        })
    }

    // 首字母取到并改成大写 + 除首字母之外的
    const capitalize = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    const toHandlerKey = (str: string) => {
        return str ? "on" + capitalize(str) : ""
    } */
    // TODO 疑问：？ 这里 toHandlerKey 将所有父组件传过来的方法统一都认为是 on开头的方法名(如onAdd)，
    // 这里与实际在vue3中父组件传方法时可以是 on-add,onadd,或者非on开头的，如notice-add,noticeAdd 不同，因为这里我们使用的render用h函数来进行传参
    // 具体需要参考 https://github.com/tywd/vue3-learn-project.git 的 src/components/Foo.js
    const handler = props[toHandlerKey(camlize(event))];
    handler && handler(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
};
const PublicInstanceProxyHandlers = {
    get({ instance }, key) {
        // setupState一开始并没有值，会在 handleSetupResult 方法中被赋值得到，
        // 最后在renderer中 instance.render.call(proxy) 绑定到当前proxy执行时 访问 this.${key}，触发proxy的get，在 setupState 中找到对应的key
        const { setupState, props } = instance;
        /* if (key in setupState) {
            return setupState[key];
        } */
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
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

function initSlots(instance, children) {
    // instance.slots = children;
    // instance.slots = Array.isArray(children) ? children : [children];
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        // slots[key] = normalizeSlotValue(value)
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => { },
        provides: parent ? parent.provides : {},
        parent, // 首次挂载根组件的时候是传的null
    };
    // component.emit = (emit as any).bind(null, component)
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props); // 将props 赋值给 instance.props
    // console.log('instance.props: ', instance.props);
    initSlots(instance, instance.vnode.children); // 将chhildren 赋值给 instance.slots
    // console.log('instance.slots: ', instance.slots);
    setupStateFulComponent(instance);
}
function setupStateFulComponent(instance) {
    const Component = instance.type;
    // ctx
    instance.proxy = new Proxy({ instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance); // getCurrentInstance() 只能在 setup 或生命周期钩子中调用。
        // function Object
        const setupResult = setup(shallowReadonly(instance.props), {
            /* emit: function (instance, event) {
                console.log('emit', instance, event,);
            }.bind(null, instance) */
            emit: instance.emit
        });
        setCurrentInstance(null);
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
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

const Fragment = Symbol('Fragment'); // ES6 引入了一种新的原始数据类型 Symbol ，表示独一无二的值，最大的用法是用来定义对象的唯一属性名。
const Text = Symbol('Text');
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
    // 组件类型 + children object
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === 'string' ? 1 /* ELEMENT */ : 2 /* STATEFUL_COMPONENT */;
}

function render(vnode, container) {
    // patch 方便后续递归处理
    patch(vnode, container, null);
}
function patch(vnode, container, parentComponent) {
    // 去处理组件
    // ShapeFlags
    // vnode -> flag
    // element
    // STATEFUL_COMPONENT
    // TODO 判断vnode 是不是一个 element
    // 是 element 就处理element, 如何区分element 和 component
    const { shapeFlag, type } = vnode;
    // Fragment -> 只渲染 children
    switch (type) {
        case Fragment:
            processFragment(vnode, container, parentComponent);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            // if (typeof vnode.type === "string") {
            if (shapeFlag & 1 /* ELEMENT */) {
                processElement(vnode, container, parentComponent);
                // } else if (isObject(vnode.type)) {
            }
            else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                // 判断是不是组件类型
                processComponent(vnode, container, parentComponent);
            }
            break;
    }
}
function processText(vnode, container) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
}
function processFragment(vnode, container, parentComponent) {
    mountChildren(vnode.children, container, parentComponent);
}
function processElement(vnode, container, parentComponent) {
    mountElement(vnode, container, parentComponent);
}
function mountElement(vnode, container, parentComponent) {
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
        mountChildren(vnode.children, el, parentComponent);
    }
    // props
    for (const key in props) {
        const val = props[key];
        const isOn = (key) => /^on[A-Z]/.test(key); // 判断是否是onClick等一类on开头的事件
        if (isOn(key)) {
            // element事件添加
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, val);
        }
        else {
            // element属性添加
            el.setAttribute(key, val);
        }
    }
    container.append(el);
    // document.body.append(el)
}
function mountChildren(children, container, parentComponent) {
    children.forEach(v => {
        patch(v, container, parentComponent);
    });
}
function processComponent(vnode, container, parentComponent) {
    mountComponent(vnode, container, parentComponent);
}
function mountComponent(initialVnode, container, parentComponent) {
    const instance = createComponentInstance(initialVnode, parentComponent);
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
    patch(subTree, container, instance);
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

function renderSlots(slots, name, props) {
    // console.log('slots: ', slots);
    // return createVNode("div", {}, slots)
    const slot = slots[name];
    if (slot) {
        // function
        if (typeof slot === 'function') {
            // 我们需要将 div 去掉
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function provide(key, value) {
    // 存
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent.provides;
        if (parentProvides === provides) {
            provides = currentInstance.provides = Object.create(parentProvides); // 将当前组件的this沿着原型链指向父组件，防止修改到自身属性
        }
        provides[key] = value; // 将父组件的provides存在父组件的实例里，供子组件取用
    }
}
function inject(key, defaultValue) {
    // 取
    const currentInstance = getCurrentInstance();
    // inject在子组件里要获取父组件的provides[key]，
    // 需要父组件一开始就将provides传到了该子组件的实例里
    // TODO 两步
    /* 1.父组件必须传 instance(里面已经在provides方法时就存入了instance) 下来
    在renderer的patch 一直传下来给到当前组件实例的parent（可在创建组件实例createComponentInstance时加一个parent）
    2.子组件取用 */
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        if (typeof defaultValue === 'function') {
            return defaultValue();
        }
        return defaultValue;
    }
}

exports.createApp = createApp;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.renderSlots = renderSlots;
