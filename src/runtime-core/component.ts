import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlot";

export function createComponentInstance(vnode) {
    const component = { vnode, type: vnode.type, setupState: {}, props: {}, slots: {}, emit: () => { } }
    // component.emit = (emit as any).bind(null, component)
    component.emit = emit.bind(null, component) as any
    return component;
}

export function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props) // 将props 赋值给 instance.props
    // console.log('instance.props: ', instance.props);
    initSlots(instance, instance.vnode.children) // 将chhildren 赋值给 instance.slots
    // console.log('instance.slots: ', instance.slots);
    setupStateFulComponent(instance)
}

function setupStateFulComponent(instance) {
    const Component = instance.type;
    // ctx
    instance.proxy = new Proxy({ instance }, PublicInstanceProxyHandlers)
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
        handleSetupResult(instance, setupResult)
    }
}

function handleSetupResult(instance, setupResult) {
    // function Object
    // TODO function
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance)
}

function finishComponentSetup(instance) {
    const Component = instance.type
    // if(Component.render){
    instance.render = Component.render
    // }
}

let currentInstance = null;
export function getCurrentInstance() {
    return currentInstance;
}

export function setCurrentInstance(instance) {
    currentInstance = instance;
}