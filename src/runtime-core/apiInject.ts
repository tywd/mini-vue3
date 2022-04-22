import { getCurrentInstance } from "./component";
export function provide(key, value) {
    // 存
    const currentInstance: any = getCurrentInstance()
    if (currentInstance) {
        let { provides } = currentInstance;

        const parentProvides = currentInstance.parent.provides
        if (parentProvides === provides) {
            provides = currentInstance.provides = Object.create(parentProvides); // 将当前组件的this沿着原型链指向父组件，防止修改到自身属性
        }

        provides[key] = value; // 将父组件的provides存在父组件的实例里，供子组件取用
    }
}
export function inject(key, defaultValue) {
    // 取
    const currentInstance: any = getCurrentInstance()
    // inject在子组件里要获取父组件的provides[key]，
    // 需要父组件一开始就将provides传到了该子组件的实例里
    // TODO 两步
    /* 1.父组件必须传 instance(里面已经在provides方法时就存入了instance) 下来 
    在renderer的patch 一直传下来给到当前组件实例的parent（可在创建组件实例createComponentInstance时加一个parent）
    2.子组件取用 */
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides
        if (key in parentProvides) {
            return parentProvides[key]
        }
        if(typeof defaultValue === 'function'){
            return defaultValue()
        }
        return defaultValue
    }
}