import {
    h
} from "../../lib/guide-mini-vue.esm.js";

export const Foo = {
    name: 'Foo',
    setup(props) {
        // 1. 可在组件里接收到父组件传的值 props.count
        console.log('props: ', props);
        // 3. readonly 传过来的值必须是只读的，但vue3这里对对象里深层的是没有处理的，所以这里是一个 shallowReadonly
        props.count++; // 这行会报警报
    },
    render() {
        // 2. 在组件的template里可以用this访问到 props.count
        return h('div', {}, "foo: " + this.count);
    }
}