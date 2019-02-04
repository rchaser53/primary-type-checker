import { createIfCondtionIsNotBoolean } from '../../errors'
import { PrimitiveType } from '../../types'
import { setup } from './helper'

describe('typeChecker ifStatement', () => {
  describe('normal', () => {
    it('no emit error when it uses', () => {
      const input = `
      if (true) {}
      if (false) {}
      `
      const actual = setup(input)
      const expected = []
      expect(actual).toEqual(expected)
    })
  })

  describe('error', () => {
    it('should only boolean error', () => {
      const input = `
      if ('a') {}
      if (1) {}
      `
      const actual = setup(input)
      const expected = [
        createIfCondtionIsNotBoolean(PrimitiveType.String),
        createIfCondtionIsNotBoolean(PrimitiveType.Number),
      ]
      expect(actual).toEqual(expected)
    })
  })
})
