import { createIfCondtionIsNotBoolean, createCannotAssignOtherType } from '../../errors'
import { PrimitiveType } from '../../types'
import { errorAssert, setup } from './helper'

describe('typeChecker ifStatement', () => {
  describe('error', () => {
    it('if test primary error', () => {
      const input = `
      if ('a') {}
      if (1) {}
      `
      const actual = setup(input)
      const expected = [
        createIfCondtionIsNotBoolean(PrimitiveType.String),
        createIfCondtionIsNotBoolean(PrimitiveType.Number)
      ]
      errorAssert(actual, expected)
    })

    it('if test using identifier', () => {
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
      errorAssert(actual, expected)
    })

    it('if block error', () => {
      const input = `
      let a = 3;
      if (true) {
        a = 'str';
      }
      `
      const actual = setup(input)
      const expected = [createCannotAssignOtherType(PrimitiveType.Number, PrimitiveType.String)]
      errorAssert(actual, expected)
    })

    it('else if test', () => {
      const input = `
      let a = 1;
      let b = false;
      let c = "ccc";
      if (a) {}
      else if (b) {}
      else {}

      if (b) {}
      else if (c) {}
      `
      const actual = setup(input)
      const expected = [
        createIfCondtionIsNotBoolean(PrimitiveType.Number),
        createIfCondtionIsNotBoolean(PrimitiveType.String)
      ]
      errorAssert(actual, expected)
    })

    it('else if and else block error', () => {
      const input = `
      let a = 3;
      if (true) {
        a = 15;
      } else if (false) {
        a = true;
      } else {
        a = 'str'
      }
      `
      const actual = setup(input)
      const expected = [
        createCannotAssignOtherType(PrimitiveType.Number, PrimitiveType.Boolean),
        createCannotAssignOtherType(PrimitiveType.Number, PrimitiveType.String)
      ]
      errorAssert(actual, expected)
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
      errorAssert(actual, expected)
    })

    it('use identifier', () => {
      const input = `
      let a = true;
      let b = false;
      if (a) {}
      if (b) {}
      `
      const actual = setup(input)
      const expected = []
      errorAssert(actual, expected)
    })

    it('else if', () => {
      const input = `
      let a = true;
      let b = false;
      if (a) {}
      else if (b) {}
      else {}
      if (a) {}
      else if (b) {}
      `
      const actual = setup(input)
      const expected = []
      errorAssert(actual, expected)
    })

    it('if, else if and else block', () => {
      const input = `
      let a = 3;
      if (true) {
        a = 15;
      } else if (false) {
        a = 25;
      } else {
        a = 35
      }
      `
      const actual = setup(input)
      const expected = []
      errorAssert(actual, expected)
    })
  })
})
