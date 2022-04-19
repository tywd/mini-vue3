import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
    it("happy path", () => {
        // 调用 .value
        const user = reactive({
            age: 1,
        });

        const age = computed(() => {
            return user.age;
        });

        expect(age.value).toBe(1);
    });

    // 有缓存功能
    it("should compute lazily", () => {
      const value = reactive({
        foo: 1,
      });
      const getter = jest.fn(() => {
        return value.foo;
      });
      const cValue = computed(getter);
  
      // lazy
      expect(getter).not.toHaveBeenCalled(); // 一开始不会被调用， 除非使用 .value
  
      expect(cValue.value).toBe(1);
      expect(getter).toHaveBeenCalledTimes(1); // 验证getter是否被调用了一次
  
      // should not compute again
      cValue.value; // get
      expect(getter).toHaveBeenCalledTimes(1); // 不管执行cValue.value都应该让 getter方法还是只应该被调用过一次，不应该再次被调用
  
      // should not compute until needed
      value.foo = 2; // 赋值执行了trigger ->  所以必须有对应的effect，则应道要执行track收集依赖
      expect(getter).toHaveBeenCalledTimes(1); // 访问的是reactive包裹的value.foo，所以getter应该是只应该被调用过一次
  
      // now it should compute
      expect(cValue.value).toBe(2);
      expect(getter).toHaveBeenCalledTimes(2);
  
      // should not compute again
      cValue.value;
      expect(getter).toHaveBeenCalledTimes(2);
    });
});
