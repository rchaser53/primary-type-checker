import { createCannotAssignOtherType, createLeftIsNotRight } from '../../errors'
import { PrimitiveType } from '../../types'
import { setup } from './helper'

describe('typeChecker forStatement', () => {
  describe('error', () => {
    it('for test primary error', () => {
      const input = `
        let a = true;
        for (const i = 0; i<10; i++) {
          let b = 3 + 'str';
          a = 1;
        }
      `
      const actual = setup(input)
      const expected = [
        createLeftIsNotRight(PrimitiveType.Number, PrimitiveType.String),
        createCannotAssignOtherType(PrimitiveType.Boolean, PrimitiveType.Number)
      ]
      expect(actual).toEqual(expected)
    })
  })

  describe('normal', () => {
    it('no emit error when it uses', () => {
      const input = `
      for (const i = 0; i<10; i++) {
        let a = 1;
      }
      `
      const actual = setup(input)
      const expected = []
      expect(actual).toEqual(expected)
    })
  })
})
