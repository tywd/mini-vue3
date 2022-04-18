import { readonly } from "../reactive";

describe('reactive', () => {
    it('happy path', () => {
        // not set
        const original = { foo: 1, bar: { baz: 2 } }
        const wrapped = readonly(original)
        expect(wrapped).not.toBe(original);
        expect(wrapped.foo).toBe(1);
    });

    it('warn then call set ', () => {
        // jest.fn 来验证 console.warn有没被调用到
        console.warn = jest.fn();
        const user = readonly({
            age:10
        })
        user.age = 11

        expect(console.warn).toBeCalled(); // 验证当set的时候有没有调用console.warn方法执行警告
    });
})
