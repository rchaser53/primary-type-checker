import { createCannotAssignOtherType } from '../../errors'
import { PrimitiveType } from '../../types'
import { setup } from './helper'

describe('typeChecker assign', () => {
  describe('error', () => {
    it('undeclared variable error', () => {
      const input = `
        let a = 3;
        a = "d";
      `
      const actual = setup(input)
      const expected = [createCannotAssignOtherType(PrimitiveType.Number, PrimitiveType.String)]
      expect(actual).toEqual(expected)
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
      expect(actual).toEqual(expected)
    })
  })
})
