import {
    h
} from "../../lib/guide-mini-vue.esm.js";

window.self = null
export const App = {
    // .vue
    // <template></template>
    // render === <template></template>
    // {type,props,children}
    render() {
        window.self = this;
        return h('div', {
                id: "root",
                class: ["root", "head"]
            },
            // setupState
            // this.$el -> get root element
            'hi ' + this.msg
            /* [
                h("p", {
                    class: "red"
                }, "hi"),
                h("p", {
                    class: "blue"
                }, "mini-vue")
            ] */
        );
    },
    /* h('div', {
            id: "root",
            class: ["root", "head"]
        },
        [
            h("p", {
                class: "red"
            }, "hi"),
            h("p", {
                class: "blue"
            }, "mini-vue")
        ]
    ) */
    // 上面render return h例子中的h返回解构后如下 
    /* {
        type: 'div',
        props: {
            id: "root",
            class: ["root", "head"]
        },
        children: [
            {
                type: "p",
                props: {
                    class: 'red'
                },
                children: 'hi'
            },
            {
                type: "p",
                props: {
                    class: 'blue'
                },
                children: 'mini-vue'
            }
        ]
    } */
    setup() {
        // componsition api
        return {
            msg: 'mini-vue-哈哈哈'
        }
    }
}