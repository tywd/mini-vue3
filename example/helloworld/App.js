import {
    h
} from "../../lib/guide-mini-vue.esm.js";
export const App = {
    // .vue
    // <template></template>
    // render === <template></template>
    render() {
        return h('div', {
                id: "root",
                class: ["root", "head"]
            },
            // 'hi ' + this.msg
            [
                h("p", {
                    class: "red"
                }, "hi"),
                h("p", {
                    class: "blue"
                }, "mini-vue")
            ]
        );
    },

    setup() {
        // componsition api
        return {
            msg: 'mini-vue'
        }
    }
}