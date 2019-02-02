import { PrimitiveType, resolvePrimitiveType } from './types'
import { createLeftIsNotRight } from './errors'

export default class SymbolCreator {
  errorStack: string[]

  constructor(errorStack: string[]) {
    this.errorStack = errorStack
  }

  walkNode(envs, node) {
    switch (node.type) {
      case 'VariableDeclaration':
        this.setEnvironment(envs, node)
        break
      case 'BlockStatement':
        console.log(node.type, 'block')
        const innerEnv = []
        node.body.forEach((innerNode) => {
          this.walkNode(innerEnv, innerNode)
        })
        envs.push(innerEnv)
        break
      default:
        console.log(node)
        break
    }
  }

  resolveBinaryExpression(left, right): PrimitiveType {
    let leftType = left.type
    switch (left.type) {
      case 'BinaryExpression':
        leftType = this.resolveBinaryExpression(left.left, left.right)
        break
      default:
        break
    }

    let rightType = right.type
    switch (right.type) {
      case 'BinaryExpression':
        rightType = this.resolveBinaryExpression(right.left, right.right)
        break
      default:
        break
    }

    if (leftType !== rightType) {
      this.errorStack.push(createLeftIsNotRight(leftType, rightType))
      throw new Error('escape to setEnvironmet')
    }

    return leftType
  }

  setEnvironment(envs, node) {
    const { id, init } = node.declarations[0] // why Array?

    let type = PrimitiveType.Undefined
    switch (init.type) {
      case 'BinaryExpression':
        try {
          type = this.resolveBinaryExpression(init.left, init.right)
        } catch (_) {
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
}
