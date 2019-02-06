import { createCannotAssignOtherType, createIfCondtionIsNotBoolean } from '../../errors'
import { PrimitiveType } from '../../types'
import { setup } from './helper'

describe('typeChecker expression', () => {
  describe('error', () => {
    it('unaray should be boolean', () => {
      const input = `
      let a = !ture;
      a = 'str';

      if (a) {

      } else if (2) {

      }
      `
      const actual = setup(input).map((err) => {
        return err.createMessage()
      })
      const firstLoc = {
        start: { line: 2 }
      }
      const secondLoc = {
        start: { line: 6 }
      }

      const expected = [
        createCannotAssignOtherType(PrimitiveType.Boolean, PrimitiveType.String, firstLoc).createMessage(),
        createIfCondtionIsNotBoolean(PrimitiveType.Number, secondLoc).createMessage(),
      ]
      expect(actual).toEqual(expected)
    })
  })
})
