import {
  createCannotBinaryOp,
  createCannotAssignOtherType,
  createLeftIsNotRight,
  createUnknownIdentifier
} from '../../errors'
import { PrimitiveType } from '../../types'
import { errorAssert, setup } from './helper'

describe('typeChecker declare', () => {
  describe('error', () => {
    it('undeclared variable error', () => {
      const input = `
        let a = b;
        let a = 3 + c;
        let a = d + e;
      `
      const actual = setup(input)
      const expected = [createUnknownIdentifier('b'), createUnknownIdentifier('c'), createUnknownIdentifier('d')]
      errorAssert(actual, expected)
    })

    it('let a = true + 1;', () => {
      const input = `
        let a = true + 1;
        let b = "acb" + 1;
      `
      const actual = setup(input)
      const expected = [
        createCannotBinaryOp(PrimitiveType.Boolean),
        createLeftIsNotRight(PrimitiveType.String, PrimitiveType.Number)
      ]
      errorAssert(actual, expected)
    })

    it('identify', () => {
      const input = `
        let a = 1;
        let b = "abc" + a;
      `
      const actual = setup(input)
      const expected = [createLeftIsNotRight(PrimitiveType.String, PrimitiveType.Number)]
      errorAssert(actual, expected)
    })

    it('use identify twice', () => {
      const input = `
        let a = 1;
        let b = a * 3;
        let c = "abc" + b;
      `
      const actual = setup(input)
      const expected = [createLeftIsNotRight(PrimitiveType.String, PrimitiveType.Number)]
      errorAssert(actual, expected)
    })

    it('shadowing at same scope', () => {
      const input = `
        let a = 1;
        let a = "abc";
        a = 3;
      `
      const actual = setup(input)
      const expected = [createCannotAssignOtherType(PrimitiveType.String, PrimitiveType.Number)]
      errorAssert(actual, expected)
    })

    describe('nest', () => {
      it('identify nest', () => {
        const input = `
          let a = true;
          {
            let b = a + "def"
          }
        `
        const actual = setup(input)
        const expected = [createCannotBinaryOp(PrimitiveType.Boolean)]
        errorAssert(actual, expected)
      })

      it('not found because declare other nest', () => {
        const input = `
          let a = "abc";
          {
            let b = a + "def"
          }
          {
            let c = a + b;
          }
        `
        const actual = setup(input)
        const expected = [createUnknownIdentifier('b')]
        errorAssert(actual, expected)
      })

      it('not found because declare other dobule nest ', () => {
        const input = `
          let a = "abc";
          {
            {
              let b = a + "def";
            }
          }
          {
            {
              let b = "def";
            }
            let c = a + b;
          }
        `
        const actual = setup(input)
        const expected = [createUnknownIdentifier('b')]
        errorAssert(actual, expected)
      })
    })
  })

  describe('normal', () => {
    it('no emit error when it declare correctly', () => {
      const input = `
      let a = true;
      let b = "abc";
      let c = null;
      let d = undefined;
      let e = 1;
      let f = Symbol('abc');
      `
      const actual = setup(input)
      const expected = []
      errorAssert(actual, expected)
    })

    it('no emit error when it calculates correctly', () => {
      const input = `
      let a = 1 + 4;
      let b = 3 + 5 * 3;
      let c = 4 / 2 + 12;
      let d = (4 + 5) * (3 - 2);
      let e = "abc" + "def";
      `
      const actual = setup(input)
      const expected = []
      errorAssert(actual, expected)
    })

    it('identify', () => {
      const input = `
        let a = 1;
        let b = 12 + a;
      `
      const actual = setup(input)
      const expected = []
      errorAssert(actual, expected)
    })

    it('identify nest', () => {
      const input = `
        let a = 1;
        {
          let a = "abc"
          let b = a + "def"
        }
      `
      const actual = setup(input)
      const expected = []
      errorAssert(actual, expected)
    })

    it('use identify twice', () => {
      const input = `
        let a = 1;
        let b = a * 3;
        let c = 5 + b;
      `
      const actual = setup(input)
      const expected = []
      errorAssert(actual, expected)
    })
  })
})
