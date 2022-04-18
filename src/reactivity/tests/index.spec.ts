/*
 * @Author: scy
 * @Date: 2022-04-18 17:39:06
 * @LastEditors: scy
 * @LastEditTime: 2022-04-18 17:45:30
 * @FilePath: /mini-vue3/src/reactivity/tests/index.spec.ts
 * @Description: jest 单测
 */
import {add} from '../index'

it('init',()=>{
    // expect(true).toBe(true)
    expect(add(1,1)).toBe(2)
})