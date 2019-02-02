const { parse } = require('@babel/parser')
import SymbolCreator from '../symbolCreator'
import { createCannotBinaryOp, createLeftIsNotRight, ErrorType } from '../errors'
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

  return symbolCreator.scopes.sort((before, after) => {
    return before.id > after.id ? 1 : -1
  })
}

describe('symbolCreator', () => {
  describe('symbol tables', () => {
    it('let a = true;"', () => {
      const input = `let a = true;`

      const actual = testNormal(input)
      const expected = [
        {
          defs: [
            {
              count: 0,
              name: 'a',
              type: PrimitiveType.Boolean
            }
          ],
          id: 1,
          parentId: null
        }
      ]
      expect(actual).toEqual(expected)
    })

    it('has nest scope correctly', () => {
      const input = `
      let a = true;
      {
        let a = false;
        {
          let b = 3;
        }
      }
      `

      const actual = testNormal(input)
      const expected = [
        {
          defs: [
            {
              count: 0,
              name: 'a',
              type: PrimitiveType.Boolean
            }
          ],
          id: 1,
          parentId: null
        },
        {
          defs: [
            {
              count: 0,
              name: 'a',
              type: PrimitiveType.Boolean
            }
          ],
          id: 2,
          parentId: 1
        },
        {
          defs: [
            {
              count: 0,
              name: 'b',
              type: PrimitiveType.Number
            }
          ],
          id: 3,
          parentId: 2
        }
      ]
      expect(actual).toEqual(expected)
    })

    it('has scopes correctly', () => {
      const input = `
      let a = "str";
      {
        let a = false;
      }
      {
        let a = 3;
      }
      `

      const actual = testNormal(input)
      const expected = [
        {
          defs: [
            {
              count: 0,
              name: 'a',
              type: PrimitiveType.String
            }
          ],
          id: 1,
          parentId: null
        },
        {
          defs: [
            {
              count: 0,
              name: 'a',
              type: PrimitiveType.Boolean
            }
          ],
          id: 2,
          parentId: 1
        },
        {
          defs: [
            {
              count: 0,
              name: 'a',
              type: PrimitiveType.Number
            }
          ],
          id: 3,
          parentId: 1
        }
      ]
      expect(actual).toEqual(expected)
    })
  })

  describe('error', () => {
    it('let a = 1 + "str"; is error', () => {
      const input = 'let a = 1 + "str"'

      const actual = testError(input)
      const expected = [createLeftIsNotRight(PrimitiveType.Number, PrimitiveType.String)]
      expect(actual).toEqual(expected)
    })

    it('let a = true + "str"; is error', () => {
      const input = 'let a = true + "str";'

      const actual = testError(input)
      const expected = [createCannotBinaryOp(PrimitiveType.Boolean)]
      expect(actual).toEqual(expected)
    })

    it('no emit error when it declare correctly', () => {
      const input = `
      let a = true
      let b = "abc"
      let c = null
      let d = undefined
      let e = 1
      let f = Symbol('abc')
      `
      const actual = testError(input)
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
      const actual = testError(input)
      const expected = []
      expect(actual).toEqual(expected)
    })
  })
})
