import { createCannotAssignOtherType, createLeftIsNotRight } from '../../errors'
import { PrimitiveType } from '../../types'
import { setup } from './helper'

describe('typeChecker assign', () => {
  describe('normal', () => {
    it('no emit error when it uses', () => {
      const input = `
      "use strict"
      let i = 1;
      i++
      `
      const actual = setup(input)
      const expected = []
      expect(actual).toEqual(expected)
    })
  })
})
