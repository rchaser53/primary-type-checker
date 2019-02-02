import { PrimitiveType, resolvePrimitiveType } from './types'
import { createLeftIsNotRight, createCannotBinaryOp, ErrorType } from './errors'
import { Definiton, Scope, Scopes, VariableType } from './scope'

export default class SymbolCreator {
  currentScope: Scope
  idCounter: number = 1
  scopes: Scopes = []

  constructor() {
    this.currentScope = new Scope(this.idCounter++, null) // set global scope
    this.scopes.push(this.currentScope)
  }

  walkNode(node) {
    switch (node.type) {
      case 'VariableDeclaration':
        this.resolveVariableDeclaration(node)
        break
      case 'BlockStatement':
        this.resolveBlockStatement(node)
        break
      default:
        console.log(node)
        break
    }
  }

  resolveBlockStatement(node) {
    const scope = new Scope(this.idCounter++, this.currentScope.id)
    node.id = scope.id // think this more deeply
    const lastScope = this.currentScope

    this.currentScope = scope
    node.body.forEach((innerNode) => {
      this.walkNode(innerNode)
    })
    this.currentScope = lastScope

    this.scopes.push(scope)
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

  resolveVariableDeclaration(node) {
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

    this.currentScope.defs.push({
      name: id.name,
      type,
      count: this.calculateDeclareCount(this.currentScope.defs, id.name)
    })
  }

  calculateDeclareCount(defs: Definiton[], name: string): number {
    return defs.filter((def) => {
      return def.name === name
    }).length
  }
}
