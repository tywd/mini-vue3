// import { render } from "./renderer"
import { createVNode } from "./vnode"

export function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // 先vnode
                // component -> vnode
                // 所有的逻辑操作都会基于 vnode 做处理
                const vnode = createVNode(rootComponent)

                render(vnode, rootContainer)
            }
        }
    }
}
/* export function createApp(rootComponent){
    return{
        mount(rootContainer){
            // 先vnode
            // component -> vnode
            // 所有的逻辑操作都会基于 vnode 做处理
            const vnode = createVNode(rootComponent)

            render(vnode, rootContainer)
        }
    }
} */