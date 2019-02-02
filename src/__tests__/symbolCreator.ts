const { parse } = require('@babel/parser')
import SymbolCreator from '../symbolCreator'
import { createCannotBinaryOp, createLeftIsNotRight } from '../errors'
import { PrimitiveType } from '../types'

describe('symbolCreator', () => {
  it('let a = 1 + "str"; is error', () => {
    const input = 'let a = 1 + "str"'
    const symbolCreator = new SymbolCreator([])

    const program = parse(input).program
    program.body.forEach((node) => {
      symbolCreator.walkNode([], node)
    })

    const expected = [
      createLeftIsNotRight(PrimitiveType.Number, PrimitiveType.String)
    ]
    expect(expected).toEqual(symbolCreator.errorStack)
  })

  it('let a = true + "str"; is error', () => {
    const input = 'let a = true + "str";'
    const symbolCreator = new SymbolCreator([])

    const program = parse(input).program
    program.body.forEach((node) => {
      symbolCreator.walkNode([], node)
    })

    const expected = [
      createCannotBinaryOp(PrimitiveType.Boolean)
    ]
    expect(expected).toEqual(symbolCreator.errorStack)
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
    const symbolCreator = new SymbolCreator([])

    const program = parse(input).program
    program.body.forEach((node) => {
      symbolCreator.walkNode([], node)
    })

    const expected = []
    expect(expected).toEqual(symbolCreator.errorStack)
  })

  it('no emit error when it calculates correctly', () => {
    const input = `
    let a = 1 + 4
    let b = 3 + 5 * 3
    let c = 4 / 2 + 12
    let d = (4 + 5) * (3 - 2)
    let e = "abc" + "def"
    `
    const symbolCreator = new SymbolCreator([])

    const program = parse(input).program
    program.body.forEach((node) => {
      symbolCreator.walkNode([], node)
    })

    const expected = []
    expect(expected).toEqual(symbolCreator.errorStack)
  })
})