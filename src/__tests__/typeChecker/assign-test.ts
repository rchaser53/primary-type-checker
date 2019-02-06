import { createCannotAssignOtherType, createLeftIsNotRight } from '../../errors'
import { PrimitiveType } from '../../types'
import { errorAssert, setup } from './helper'

describe('typeChecker assign', () => {
  describe('error', () => {
    it('type difference error', () => {
      const input = `
        let a = 3;
        a = "d";
      `
      const actual = setup(input)
      const expected = [createCannotAssignOtherType(PrimitiveType.Number, PrimitiveType.String)]
      errorAssert(actual, expected)
    })

    it('use identify error', () => {
      const input = `
        let a = 3;
        let b = a;
        a = b + "aaa";
      `
      const actual = setup(input)
      const expected = [createLeftIsNotRight(PrimitiveType.Number, PrimitiveType.String)]
      errorAssert(actual, expected)
    })

    it('use identify for delaration twice', () => {
      const input = `
        let a = 3
        let b = a
        let c = b
        b = 5
        c = 12
        c = true
      `
      const actual = setup(input)
      const expected = [createCannotAssignOtherType(PrimitiveType.Number, PrimitiveType.Boolean)]
      errorAssert(actual, expected)
    })
  })

  describe('normal', () => {
    it('no emit error when it assign correctly', () => {
      const input = `
      let a = true;
      a = false;
      let b = 3;
      b = 4;
      let c = "abc";
      c = "def";
      `
      const actual = setup(input)
      const expected = []
      errorAssert(actual, expected)
    })
  })
})
