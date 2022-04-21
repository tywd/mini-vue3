import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode) {
    const component = { vnode, type: vnode.type, setupState: {}, props: {}, emit: () => { } }
    // component.emit = (emit as any).bind(null, component)
    component.emit = emit.bind(null, component) as any
    return component;
}

export function setupComponent(instance) {
    // TODO
    initProps(instance, instance.vnode.props)
    // console.log('instance.props: ', instance.props);
    // initSlots()

    setupStateFulComponent(instance)
}

function setupStateFulComponent(instance) {
    const Component = instance.type;
    // ctx
    instance.proxy = new Proxy({ instance }, PublicInstanceProxyHandlers)
    const { setup } = Component;
    if (setup) {
        // function Object
        const setupResult = setup(shallowReadonly(instance.props), {
            /* emit: function (instance, event) {
                console.log('emit', instance, event,);
            }.bind(null, instance) */
            emit: instance.emit
        });
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