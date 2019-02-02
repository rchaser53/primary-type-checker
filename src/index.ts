/**
 * 1. assign  で一貫
 * 2. if
 * 3. +-*\/   はnumberのみ
 */

const { parse, parseExpression } = require('@babel/parser')

const input = `
let a = (5 + 3) + ('a' * 5);
`

const program = parse(input).program

export const GlobalErrorStack: string[] = [];
export const createLeftIsNotRight = (leftType, rightType): string => {
  return `${leftType} cannot be calculate ${rightType}`
}

export const walkNode = (envs, node) => {
  switch (node.type) {
    case 'VariableDeclaration':
      setEnvironment(envs, node)
      break
    case 'BlockStatement':
      console.log(node.type, 'block')
      const innerEnv = []
      node.body.forEach((innerNode) => {
        walkNode(innerEnv, innerNode)
      })
      envs.push(innerEnv)
      break
    default:
      console.log(node)
      break
  }
}

export const resolveBinaryExpression = (left, right): PrimitiveType => {
  let leftType = left.type
  switch (left.type) {
    case 'BinaryExpression':
      leftType = resolveBinaryExpression(left.left, left.right)
      break
    default:
      break;
  }

  let rightType = right.type
  switch (right.type) {
    case 'BinaryExpression':
      rightType = resolveBinaryExpression(right.left, right.right)
      break
    default:
      break;
  }

  if (leftType !== rightType) {
    GlobalErrorStack.push(
      createLeftIsNotRight(leftType, rightType)
    )
    throw new Error('escape to setEnvironmet')
  }

  return leftType
}

export const setEnvironment = (envs, node) => {
  const { id, init } = node.declarations[0] // why Array?

  let type = PrimitiveType.Undefined
  switch (init.type) {
    case 'BinaryExpression':
      try {
        type = resolveBinaryExpression(init.left, init.right)
      } catch(_) {
        return
      }
      break
    default:
      type = resolvePrimitiveType(init.value)
      break
  }
  const count = envs.filter((declare) => {
    return declare.name === id.name
  }).length

  envs.push({
    name: id.name,
    type,
    count
  })
}

export enum PrimitiveType {
  Number = 'Number',
  String = 'String',
  Boolean = 'Boolean',
  Null = 'Null',
  Undefined = 'Undefined',
  Symbol = 'Symbol',
  ErrorType = 'Error',        // should not be here
}

export const resolvePrimitiveType = (value): PrimitiveType => {
  let type = PrimitiveType.Undefined
  switch (typeof value) {
    case 'number':
      type = PrimitiveType.Number
    case 'string':
      type = PrimitiveType.String
    case 'boolean':
      type = PrimitiveType.Boolean
    case 'object':
      type = PrimitiveType.Null
    case 'undefined':
      type = PrimitiveType.Undefined
    case 'symbol':
      type = PrimitiveType.Symbol
    default:
  }
  return type
}

let baseEnv = []
program.body.forEach((node) => {
  walkNode(baseEnv, node)
})

console.log(GlobalErrorStack)
