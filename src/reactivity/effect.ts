import { extend } from "../shared";

/*
 * @Author: tywd
 * @Date: 2022-04-18 19:12:43
 * @LastEditors: tywd
 * @LastEditTime: 2022-04-18 19:55:46
 * @FilePath: /mini-vue3/src/reactivity/effect.ts
 * @Description: Do not edit
 */
class ReactiveEffect {
    private _fn: any;
    public scheduler: Function | undefined;
    deps = [];
    private active: boolean = true
    onStop?: () => void
    constructor(fn, scheduler?) {
        this._fn = fn
        this.scheduler = scheduler
    }

    run() {
        activeEffect = this;
        return this._fn();
    }
    stop() {
        if (this.active) {
            cleanupEffect(this)
            if (this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}

function cleanupEffect(effect) {
    effect.deps.forEach((dep: any) => {
        dep.delete(effect)
    })
}

const targetMap = new Map()
export function track(target, key) {
    // target -> key -> dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap); // 此处将整个对象target存到全局targetMap，下次来就直接targetMap.get取这个对象target
    }

    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);// key即为对象target里面被改动的值的key，又将这个key映射到 dep，就能在对应的dep 收集依赖
    }
    if(!activeEffect) return;

    dep.add(activeEffect); // 每次track就会把 new ReactiveEffect() 一整个存入dep，触发依赖时直接遍历dep里的 ReactiveEffect，并调用run方法，就执行了effect方法的fn
    activeEffect.deps.push(dep); // 存储所有的dep到activeEffect方便后续stop
}

export function trriger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key)
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        } else {
            effect.run();
        }
    }
}

let activeEffect;
export function effect(fn, options: any = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options)
    _effect.run();
    const runner: any = _effect.run.bind(_effect)
    runner.effect = _effect; // 给原先的runner加一个effect参数，赋值整个_effect给它 供stop调用对应runner的effect
    return runner;
}


export function stop(runner) {
    runner.effect.stop();
}
