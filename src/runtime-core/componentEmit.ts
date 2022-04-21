import { camlize, toHandlerKey } from "../shared"

export function emit(instance, event, ...args) {
    // console.log('emit', event);
    // instance.props -> event
    const { props } = instance
    // TPP 先去写一个特定的行为 -> 再慢慢重构成通用行为
    // add -> Add

    // add-foo -> addFoo 将emit('add-foo') 这种形式转换成 addFoo，即是调用复组件的 addFoo
    /* const camlize = (str: string) => {
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

    const toHandlerKey = (str: string) => {
        return str ? "on" + capitalize(str) : ""
    } */

    // TODO 疑问：？ 这里 toHandlerKey 将所有父组件传过来的方法统一都认为是 on开头的方法名(如onAdd)，
    // 这里与实际在vue3中父组件传方法时可以是 on-add,onadd,或者非on开头的，如notice-add,noticeAdd 不同，因为这里我们使用的render用h函数来进行传参
    // 具体需要参考 https://github.com/tywd/vue3-learn-project.git 的 src/components/Foo.js
    const handler = props[toHandlerKey(camlize(event))]
    handler && handler(...args)
}