import { hasChanged, isObject } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive"

class RefImpl {
    private _value: any
    public dep
    private _rawValue: any
    public __v_isRef: boolean = true
    constructor(value) {
        this._rawValue = value
        this._value = convert(value)
        this.dep = new Set()
    }
    get value() {
        trackRefValue(this)
        return this._value
    }

    set value(newValue) {
        // 一定是先修改了value的值
        // newValue - > this._value 是否相等
        // object 对比
        if (hasChanged(newValue, this._rawValue)) {
            this._rawValue = newValue
            this._value = convert(newValue);
            triggerEffects(this.dep)
        }
    }
}

function convert(value) {
    return isObject(value) ? reactive(value) : value;
}

function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep)
    }
}

export function ref(value) {
    value = new RefImpl(value)
    return value
}

// 是否是ref声明的
export function isRef(ref) {
    // return ref instanceof RefImpl;
    return !!ref.__v_isRef;
}

// 非ref声明的直接返回本身
export function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}

// 使用proxyRefs之后可省略ref的 .value语法
//  非ref声明的直接返回本身与unRef一样
export function proxyRefs(objectWithRefs) {
    // get set
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key))
        },

        set(target, key, value) {
            // set -> ref 改.value
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            } else {
                return Reflect.set(target, key, value)
            }
        }
    })
}