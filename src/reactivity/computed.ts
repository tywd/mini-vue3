import { ReactiveEffect } from './effect';
class ComputedRefImpl {
    private _getter: any
    private _active: boolean
    private _value: any
    private _effect: any
    constructor(getter) {
        this._getter = getter
        this._active = true
        this._effect = new ReactiveEffect(getter, () => {
            if (!this._active) {
                this._active = true
            }
        })
    }

    get value() {
        // get value -> _active true
        // 当依赖的响应式对象的值发生改变时
        if (this._active) {
            this._active = false
            // this._value = this._getter()
            this._value = this._effect.run()
        }
        return this._value
    }
}

export function computed(getter) {
    return new ComputedRefImpl(getter)
}