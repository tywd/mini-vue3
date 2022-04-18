import { reactive } from "../reactive";
import { effect, stop } from "../effect";

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10
    })
    let nextAge;
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(11)

    // update
    user.age++;
    expect(nextAge).toBe(12)
  });

  it('should return runner when call effect', () => {
    // 1.effect(fn) -> function(runner) -> fn ->return
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return "foo";
    });
    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe("foo");
  })

  it("scheduler", () => {
    // 1. 通过 effect 的第二个参数给定的 一个 scheduler 的fn
    // 2. effect 第一次执行的时候 还会执行fn 所以dummy会toBe(1) 成立
    // 3. 当响应式对象 set update (即obj.foo++)不会执行 fn 而是执行一次 scheduler 
    // 4. 如果说当执行 runner 的时候，会再次执行 fn 将obj.foo++后的值赋给dummy 所以最后 toBe(2)
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => { // jest.fn 返回一个新的、未使用的模拟函数。可选地采用模拟实现。
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );
    expect(scheduler).not.toHaveBeenCalled(); // 一开始不会被调用
    expect(dummy).toBe(1);
    // should be called on first trigger
    obj.foo++;
    expect(scheduler).toBeCalledTimes(1); // 模拟调用函数几次，1表示只被调用1次
    // // should not run yet
    expect(dummy).toBe(1);
    // // manually run
    run();
    // // should have run
    expect(dummy).toBe(2);
  });

  it("stop", () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    stop(runner); // stop后停止更新，obj.prop怎么改都会保持原值，除非再次执行runner
    obj.prop = 3;
    // obj.prop++;
    expect(dummy).toBe(2);

    // stopped effect should still be manually callable
    runner(); // 执行runner后就会再次更新
    expect(dummy).toBe(3);
  });

  it("onStop", () => {
    const obj = reactive({
      foo: 1,
    });
    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop,
      }
    );

    stop(runner);
    expect(onStop).toBeCalledTimes(1);
  });
})
