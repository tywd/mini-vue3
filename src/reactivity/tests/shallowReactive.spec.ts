import { effect } from "../effect";
import { shallowReactive, isReactive, reactive } from "../reactive";

describe('shallowReactive', () => {
    it('should not make non-reactive properties reactive', () => {
        const original = { foo: 1, nested: { bar: 2 } }
        const observed = shallowReactive(original);
        const obj = reactive({ foo: 1, nested: { bar: 2 } });
        expect(isReactive(observed)).toBe(true);
        expect(isReactive(observed.nested)).toBe(false);
        let dummy,dummy2;
        effect(() => {
            dummy = observed.nested.bar;
            dummy2 = obj.nested.bar;
        });
        observed.nested.bar++;
        expect(dummy).toBe(2);  //  observed.nested.bar 非响应式，所以dummy仍为2
        obj.nested.bar++;
        expect(dummy2).toBe(3); // obj.nested.bar 响应式，所以dummy为3
    });
})