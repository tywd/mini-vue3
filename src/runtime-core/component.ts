import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode) {
    const component = { vnode, type: vnode.type, setupState: {} }
    return component;
}

export function setupComponent(instance) {
    // TODO
    // initProps()
    // initSlots()

    setupStateFulComponent(instance)
}

function setupStateFulComponent(instance) {
    const Component = instance.type;
    // ctx
    instance.proxy = new Proxy({instance}, PublicInstanceProxyHandlers)
    const { setup } = Component;
    if (setup) {
        // function Object
        const setupResult = setup();
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