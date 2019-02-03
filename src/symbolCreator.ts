import { Identifier, PrimitiveType, resolvePrimitiveType } from './types'
import { createLeftIsNotRight, createCannotBinaryOp, ErrorType } from './errors'
import { Definiton, Unknown, Scope, Scopes, VariableType } from './scope'
import { GlobalScopeId } from './constants'

export enum NodeType {
  VariableDeclaration = 'VariableDeclaration',
  BlockStatement = 'BlockStatement',
  BinaryExpression = 'BinaryExpression',
  Identifier = 'Identifier'
}

export default class SymbolCreator {
  currentScope: Scope
  idCounter: number = GlobalScopeId
  scopes: Scopes = []

  constructor() {
    this.currentScope = new Scope(this.idCounter++, null) // set global scope
    this.scopes.push(this.currentScope)
  }

  walkNode(node) {
    switch (node.type) {
      case NodeType.VariableDeclaration:
        this.resolveVariableDeclaration(node)
        break
      case NodeType.BlockStatement:
        this.resolveBlockStatement(node)
        break
      default:
        console.log(node)
        break
    }
  }

  resolveBlockStatement(node) {
    const scope = new Scope(this.idCounter++, this.currentScope.id)
    const lastScope = this.currentScope

    this.currentScope = scope
    node.body.forEach((innerNode) => {
      this.walkNode(innerNode)
    })
    this.currentScope = lastScope

    this.scopes.push(scope)
  }

  resolveBinaryExpression(left, right): PrimitiveType {
    left.scopeId = this.currentScope.id
    right.scopeId = this.currentScope.id

    const leftType = this.resolveBinaryOpNode(left)
    if (leftType !== PrimitiveType.Number && leftType !== PrimitiveType.String) {
      throw createCannotBinaryOp(left.type)
    }

    const rightType = this.resolveBinaryOpNode(right)
    if (leftType !== rightType && left.type !== NodeType.Identifier) {
      throw createLeftIsNotRight(left.type, right.type)
    }

    return leftType
  }

  resolveBinaryOpNode(node): PrimitiveType | Identifier {
    let nodeType = node.type
    switch (node.type) {
      case NodeType.BinaryExpression:
        nodeType = this.resolveBinaryExpression(node.left, node.right)
        break
      case NodeType.Identifier:
        node.scopeId = this.currentScope.id
      default:
        break
    }

    if (node.type === NodeType.Identifier) {
      throw new Unknown(this.currentScope.id, node.name)
    }

    return nodeType
  }

  resolveVariableDeclaration(node) {
    const { id, init } = node.declarations[0] // why Array?
    id.scopeId = this.currentScope.id

    let type: VariableType = PrimitiveType.Undefined
    switch (init.type) {
      case NodeType.BinaryExpression:
        try {
          type = this.resolveBinaryExpression(init.left, init.right)
        } catch (err) {
          type = err as ErrorType | Unknown
        }
        break
      case NodeType.Identifier:
        // undefined is Identifier
        if (init.name === 'undefined') {
          type = PrimitiveType.Undefined
        } else {
          type = new Unknown(this.currentScope.id, init.name)
        }
        init.scopeId = this.currentScope.id
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
