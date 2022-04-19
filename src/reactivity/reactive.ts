import { mutableHandles, readonlyHandles, shallowReadonlyHandles, shallowReactiveHandles } from "./baseHandles";

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly'
}

export function reactive(raw) {
    return createActiveObject(raw, mutableHandles)
}

export function shallowReactive(raw) {
    return createActiveObject(raw, shallowReactiveHandles)
}

export function readonly(raw) {
    return createActiveObject(raw, readonlyHandles)
}

export function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandles)
}

export function isReactive(value) {
    //    return value['is_reactive'] // 利用访问一个值来触发 proxy的get 获得key is_reactive，在get里做处理返回是否是reactive
    return !!value[ReactiveFlags.IS_REACTIVE] // 若校验是否为false，传入的可能不是一个reactive，则统一用!!转boolean
}

export function isReadonly(value) {
    return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy(value){
    return isReactive(value) || isReadonly(value)
}

function createActiveObject(raw, baseHandles = mutableHandles) {
    return new Proxy(raw, baseHandles)
}