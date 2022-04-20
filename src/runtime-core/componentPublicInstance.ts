const publicPropertiesMap = {
    $el: (i) => i.vnode.el
}
export const PublicInstanceProxyHandlers = {
    get({ instance }, key) {
        // setupState一开始并没有值，会在 handleSetupResult 方法中被赋值得到，
        // 最后在renderer中 instance.render.call(proxy) 绑定到当前proxy执行时 访问 this.${key}，触发proxy的get，在 setupState 中找到对应的key
        const { setupState } = instance
        if (key in setupState) {
            return setupState[key];
        }
        // debugger;
        // 访问 this.$el 时 key -> $el
        /* if (key === '$el') {
            return instance.vnode.el
        } */
        const publicGetter = publicPropertiesMap[key]
        if (publicGetter) {
           return publicGetter(instance)
        }

        // $options
        // $data
    }
}