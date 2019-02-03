const { parse } = require('@babel/parser')
import SymbolCreator from '../symbolCreator'
import TypeChecker from '../typeChecker'
import { createCannotBinaryOp, createLeftIsNotRight, createUnknownIdentifier, ErrorType } from '../errors'
import { PrimitiveType } from '../types'

export const setup = (input: string) => {
  const symbolCreator = new SymbolCreator()
  const program = parse(input).program
  program.body.forEach((node) => {
    symbolCreator.walkNode(node)
  })

  const typeChecker = new TypeChecker(symbolCreator.scopes)

  program.body.forEach((node) => {
    typeChecker.walkNode(node)
  })

  return typeChecker.errorStacks
}

describe('typeChecker', () => {
  describe('error', () => {
    it('undeclared variable error', () => {
      const input = `
        let a = b;
        let a = 3 + c;
        let a = d + e;
      `
      const actual = setup(input)
      const expected = [createUnknownIdentifier('b'), createUnknownIdentifier('c'), createUnknownIdentifier('d')]
      expect(actual).toEqual(expected)
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
      expect(actual).toEqual(expected)
    })
  })

  describe('normal', () => {
    it('no emit error when it declare correctly', () => {
      const input = `
      let a = true
      let b = "abc"
      let c = null
      let d = undefined
      let e = 1
      let f = Symbol('abc')
      `
      const actual = setup(input)
      const expected = []
      expect(actual).toEqual(expected)
    })

    it('no emit error when it calculates correctly', () => {
      const input = `
      let a = 1 + 4
      let b = 3 + 5 * 3
      let c = 4 / 2 + 12
      let d = (4 + 5) * (3 - 2)
      let e = "abc" + "def"
      `
      const actual = setup(input)
      const expected = []
      expect(actual).toEqual(expected)
    })
  })
})