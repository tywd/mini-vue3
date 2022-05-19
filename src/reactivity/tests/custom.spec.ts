import { reactive, effect } from "../custom-reactive-effect";

describe('effect', () => {
    it('happy path', () => {
        const user = reactive({
            age: 10
        })
        expect(user.age).toBe(10)
        // user.age++

        let nextAge;
        effect(() => {
            nextAge = user.age + 1
        })
        expect(nextAge).toBe(11)

        // update
        user.age++;
        expect(nextAge).toBe(12)
   })
})