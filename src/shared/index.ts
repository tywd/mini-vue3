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

export const camlize = (str: string) => {
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

export const toHandlerKey = (str: string) => {
    return str ? "on" + capitalize(str) : ""
}