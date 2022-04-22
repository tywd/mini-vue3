import { createVNode, Fragment } from "../vnode";

export function renderSlots(slots, name, props) {
    // console.log('slots: ', slots);
    // return createVNode("div", {}, slots)
    const slot = slots[name];
    if (slot) {
        // function
        if (typeof slot === 'function') {
            // 我们需要将 div 去掉
            return createVNode(Fragment, {}, slot(props))
        }
    }
}