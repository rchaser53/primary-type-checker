const { parse } = require('@babel/parser')
import SymbolCreator from '../symbolCreator'
import TypeChecker from '../typeChecker'
import { createCannotBinaryOp, createLeftIsNotRight, createUnknownIdentifier, ErrorType } from '../errors'
import { PrimitiveType } from '../types'

export const testError = (input: string) => {
  const symbolCreator = new SymbolCreator()
  const program = parse(input).program
  program.body.forEach((node) => {
    symbolCreator.walkNode(node)
  })

  return symbolCreator.currentScope.defs.reduce<ErrorType[]>((stack, def) => {
    return typeof def.type !== 'string' ? stack.concat([def.type as ErrorType]) : stack
  }, [])
}

export const testNormal = (input: string) => {
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
  describe('symbol tables', () => {
    it('let a = b; is error', () => {
      const input = `let a = b;`

      const actual = testNormal(input)
      const expected = [createUnknownIdentifier('b')]
      expect(actual).toEqual(expected)
    })
  })
})
