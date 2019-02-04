import { createIfCondtionIsNotBoolean } from '../../errors'
import { PrimitiveType } from '../../types'
import { setup } from './helper'

describe('typeChecker ifStatement', () => {
  describe('error', () => {
    it('primary error', () => {
      const input = `
      if ('a') {}
      if (1) {}
      `
      const actual = setup(input)
      const expected = [
        createIfCondtionIsNotBoolean(PrimitiveType.String),
        createIfCondtionIsNotBoolean(PrimitiveType.Number)
      ]
      expect(actual).toEqual(expected)
    })

    it('use identifier', () => {
      const input = `
      let a = 3;
      let b = 'bbb';
      if (a) {}
      if (b) {}
      `
      const actual = setup(input)
      const expected = [
        createIfCondtionIsNotBoolean(PrimitiveType.Number),
        createIfCondtionIsNotBoolean(PrimitiveType.String)
      ]
      expect(actual).toEqual(expected)
    })
  })

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
})
