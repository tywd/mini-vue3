/**
 * @Descripttion: 自定义简单查看响应式原理的方法说明
 */
let activeEffect;
class ReactiveEffect {
    private _fn: any
    constructor(fn) {
        this._fn = fn;
    }
    run() {
        activeEffect = this;  // 一开始就将 ReactiveEffect 实例 存在全局变量 activeEffect
        this._fn();
    }
}

/**
 * @Descripttion: 
 * @param raw {object} reactive 传进的 object
 * ? 关于使用vue3 Proxy 数据劫持为什么用 Reflect.get(target,key) 而不用 target[key] 的原因
   当我们在 Proxy 中使用Reflect，可以添加一个额外参数receiver，可以被传递到Reflect调用中。
    get(target, key, recivier) {
        Reflect.get(target, key, receiver)
   这能确保当我们的对象有从其他对象继承的值/函数时，this 值能正确地指向调用对象。使用 Proxy 的一个难点就是this绑定。我们希望任何方法都绑定到这个 Proxy，而不是target对象。这就是为什么我们总是在Proxy内部使用Reflect，这样我们就能保留我们正在自定义的原始行为
 * @return {*}
 */
export function reactive(raw) {
    return new Proxy(raw, { // 使用 Proxy 来进行代理
        get(target, key) {
            const res = Reflect.get(target, key)
            // 收集依赖
            track(target, key);
            return res
        },

        set(target, key, value) {
            const res = Reflect.set(target, key, value)
            // 触发依赖
            trigger(target, key, value)
            return res
        }
    })
}

/**
 * @Descripttion: effect 执行传进来的方法
 * @param fn {function}
 * @return {*}
 */
export function effect(fn) {
    const _effect = new ReactiveEffect(fn); // 用类来收集
    _effect.run(); // 会触发 reactive里 proxy 的 get 从而触发 track，此时 run 后的 activeEffect 已经绑定
}

const targetMap = new Map(); // 定义一个全局的 Map 用于收集 reactive 传进的 object 的依赖
/**
 * @Descripttion: 触发 reactive里 proxy 的 get 时会 收集依赖
 * @param target {object} reactive 传入的
 * @param key {object.key} reactive 传入 object下的key
 * @return {*}
 */
function track(target, key) {
    // 1、一开始未进行 new ReactiveEffect() 时，activeEffect 为空，track 不进行依赖收集，所以vue内部一开始是有执行行一次effect方法
    // 2、当 effect 被执行时，ReactiveEffect 才会被实例化，调用run 方法，将该实例给到 activeEffect，之后的 track 依赖收集才有意义
    // 3、将 effect 理解成 提供一个依赖函数就可以
    if (!activeEffect) return;
    let depsMap = targetMap.get(target) // 得到 reactive 传进的 object 的值
    if (!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }

    let dep = depsMap.get(key) // 得到 reactive 传进的 object 的 key 的值
    if (!dep) {
        dep = new Set()
        depsMap.set(key, dep)
    }

    if (dep.has(activeEffect)) return; // 依赖已收集则直接 return

    // 1、将一开始实例后的 ReactiveEffect 依赖收集存入 dep，
    // 2、等待 trigger 触发
    dep.add(activeEffect); 
}

/**
 * @Descripttion: 触发 reactive里 proxy 的 set 时会 触发依赖
 * @param target {object}
 * @param key 
 * @param value
 * @return {*}
 */
function trigger(target, key, value) {
    // 1、找依赖，我们在 track 已经收集过
    // 2、通过 reactive 传进的 object 先找到整个 object 的依赖，
    let depsMap = targetMap.get(target)
    // 3、接着找到 object.key 的依赖
    let dep = depsMap.get(key)
    for (const effect of dep) {
        effect.run() // 4、执行 track 时收集进来的依赖实例的 run(), 则会再一次调用了 effect，完成响应式更新
    }
}