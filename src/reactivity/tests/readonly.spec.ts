import { readonly, isReadonly, isProxy } from "../reactive";

describe('reactive', () => {
    it('happy path', () => {
        // not set
        const original = { foo: 1, bar: { baz: 2 } }
        const wrapped = readonly(original)
        expect(wrapped).not.toBe(original);
        expect(wrapped.foo).toBe(1);

        expect(isReadonly(wrapped)).toBe(true);
        expect(isReadonly(original)).toBe(false);
        expect(isReadonly(wrapped.bar)).toBe(true); // 检查对象是否是由 readonly 创建的只读代理，这里检查wrapped.foo并没用，会返回false
        expect(isReadonly(original.bar)).toBe(false);

        expect(isProxy(wrapped)).toBe(true);
    });

    it('warn then call set ', () => {
        // jest.fn 来验证 console.warn有没被调用到
        console.warn = jest.fn();
        const user = readonly({
            age: 10
        })
        user.age = 11

        expect(console.warn).toBeCalled(); // 验证当set的时候有没有调用console.warn方法执行警告
    });
})
