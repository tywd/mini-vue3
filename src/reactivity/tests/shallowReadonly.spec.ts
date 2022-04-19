import { shallowReadonly, isReadonly } from "../reactive";

describe('shallowReadonly', () => {
    it('should not make non-reactive properties reactive ', () => {
        const props = shallowReadonly({ n: { foo: 1 } })
        expect(isReadonly(props)).toBe(true);
        expect(isReadonly(props.n)).toBe(false);
    });

    it('warn then call set ', () => {
        // jest.fn 来验证 console.warn有没被调用到
        console.warn = jest.fn();
        const user = shallowReadonly({
            age:10
        })
        user.age = 11

        expect(console.warn).toBeCalled(); // 验证当set的时候有没有调用console.warn方法执行警告
    });
})
