import { createCannotAssignOtherType, createLeftIsNotRight } from '../../errors'
import { PrimitiveType } from '../../types'
import { errorAssert, setup } from './helper'

describe('typeChecker expression', () => {
  describe('error', () => {
    it('unaray should be boolean', () => {
      const input = `
      let a = !ture;
      a = 'str';
      `
      const actual = setup(input)
      const expected = [createCannotAssignOtherType(PrimitiveType.Boolean, PrimitiveType.String)]
      errorAssert(actual, expected)
    })
  })

  describe('normal', () => {
    it('no emit error when it uses', () => {
      const input = `
      "use strict"
      let i = 1;
      i++;
      let a = !true;
      `
      const actual = setup(input)
      const expected = []
      errorAssert(actual, expected)
    })
  })
})
