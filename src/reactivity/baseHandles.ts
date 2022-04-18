import { track, trriger } from "./effect";

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly = false) {
    return function (target, key) {
        const res = Reflect.get(target, key)
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
        trriger(target, key)
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