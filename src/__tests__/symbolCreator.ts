const { parse } = require('@babel/parser')
import SymbolCreator from '../symbolCreator'
import { createCannotBinaryOp, createLeftIsNotRight } from '../errors'
import { PrimitiveType } from '../types'

export const setup = (input: string) => {
  const envs: any[] = [];
  const symbolCreator = new SymbolCreator()
  const program = parse(input).program
  program.body.forEach((node) => {
    symbolCreator.walkNode(envs, node)
  })

  return envs.reduce((stack, env) => {
    return typeof env.type !== 'string'
      ? stack.concat([env.type]) 
      : stack
  }, [])
}

describe('symbolCreator', () => {
  it('let a = 1 + "str"; is error', () => {
    const input = 'let a = 1 + "str"'
    
    const actual = setup(input)
    const expected = [
      createLeftIsNotRight(PrimitiveType.Number, PrimitiveType.String)
    ]
    expect(actual).toEqual(expected)
  })

  it('let a = true + "str"; is error', () => {
    const input = 'let a = true + "str";'

    const actual = setup(input)
    const expected = [
      createCannotBinaryOp(PrimitiveType.Boolean)
    ]
    expect(actual).toEqual(expected)
  })

  it('no emit error when it declare correctly', () => {
    const input = `
    let a = true
    let b = "abc"
    let c = null
    let d = undefined
    let e = 1
    let e = Symbol('abc')
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