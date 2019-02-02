import { PrimitiveType, resolvePrimitiveType } from './types'
import { createLeftIsNotRight, createCannotBinaryOp, ErrorType } from './errors'

export type VariableType = PrimitiveType | ErrorType

export default class SymbolCreator {
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

    // 型チェック
    if (leftType !== PrimitiveType.Number && leftType !== PrimitiveType.String) {
      throw createCannotBinaryOp(leftType)
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
      throw createLeftIsNotRight(leftType, rightType)
    }

    return leftType
  }

  setEnvironment(envs, node) {
    const { id, init } = node.declarations[0] // why Array?

    let type: VariableType = PrimitiveType.Undefined
    switch (init.type) {
      case 'BinaryExpression':
        try {
          type = this.resolveBinaryExpression(init.left, init.right)
        } catch (err) {
          type = err as ErrorType
        }
        break
      default:
        type = resolvePrimitiveType(init.value)
        break
    }

    envs.push({
      name: id.name,
      type,
      count: this.calculateDeclareCount(envs, id.name)
    })
  }

  calculateDeclareCount(envs, name: string): number {
    return envs.filter((declare) => {
      return declare.name === name
    }).length
  }
}
