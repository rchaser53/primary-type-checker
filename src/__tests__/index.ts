const { parse } = require('@babel/parser')
import SymbolCreator from '../symbolCreator'
import { createLeftIsNotRight } from '../errors'
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

  it('no emit error when it calculates correctly', () => {
    const input = `
    let a = 1 + 4
    let b = 3 + 5 * 3
    let c = 4 / 2 + 12
    let d = (4 + 5) * (3 - 2)
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