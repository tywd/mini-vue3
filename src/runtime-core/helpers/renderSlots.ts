import { createVNode } from "../vnode";

export function renderSlots(slots, name, props) {
    // console.log('slots: ', slots);
    // return createVNode("div", {}, slots)
    const slot = slots[name];
    if (slot) {
        // function
        if (typeof slot === 'function') {
            return createVNode("div", {}, slot(props))
        }
    }
}