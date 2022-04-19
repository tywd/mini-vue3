import { extend, isObject } from "../shared";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)
const shallowReactiveGet = createGetter(false, true)

function createGetter(isReadonly = false, shallow = false) {
    return function (target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        }
        const res = Reflect.get(target, key)

        if (shallow) {
            return res;
        }

        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res)
        }

        if (!isReadonly) {
            // TODO 依赖收集
            track(target, key)
        }
        return res;
    }
}
function createSetter() {
    return function (target, key, value) {
        const res = Reflect.set(target, key, value)
        // TODO 触发依赖
        trigger(target, key)
        return res;
    }
}

export const mutableHandles = {
    get,
    set
}

export const readonlyHandles = {
    get: readonlyGet,
    set(target, key, value) {
        // Set operation on key "currentNum" failed: target is readonly
        console.warn(`Set operation on key ${key} failed: target is readonly`)
        return true
    }
}

export const shallowReadonlyHandles = extend({}, readonlyHandles, {
    get: shallowReadonlyGet,
    /* set(target, key, value) {
        // Set operation on key "currentNum" failed: target is readonly
        console.warn(`Set operation on key ${key} failed: target is readonly`)
        return true
    } */
})

export const shallowReactiveHandles = extend({}, mutableHandles, {
    get: shallowReactiveGet,
})

