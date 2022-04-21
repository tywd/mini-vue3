export const extend = Object.assign;

export const isObject = (val) => {
    return val !== null && typeof val === "object"
}

export const hasChanged = (val, newValue) => {
    return !Object.is(val, newValue); // 方法判断两个值是否为同一个值。
}

// 判断 key 是否在 val 的属性里
export const hasOwn = (val, key) => {
    return Object.prototype.hasOwnProperty.call(val, key)
}