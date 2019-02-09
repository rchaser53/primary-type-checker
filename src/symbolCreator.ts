import { Identifier, PrimitiveType, resolvePrimitiveType } from './types'
import { createLeftIsNotRight, createCannotBinaryOp, ErrorType } from './errors'
import { Definiton, Unknown, Scope, Scopes, VariableType } from './scope'
import { GlobalScopeId, NodeType } from './constants'

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
      case NodeType.BlockStatement:
        this.walkBlockStatement(node)
        break
      case NodeType.IfStatement:
        this.walkIfStatement(node)
        break
      case NodeType.WhileStatement:
        this.walkWhileStatement(node)
        break
      case NodeType.ForStatement:
        this.walkNode(node.body)
        break
      case NodeType.ExpressionStatement:
        this.resolveExpressionStatement(node)
        break
      case NodeType.VariableDeclaration:
        this.resolveVariableDeclaration(node)
        break
      default:
        break
    }
  }

  walkBlockStatement(node) {
    const scope = new Scope(this.idCounter++, this.currentScope.id)
    const lastScope = this.currentScope

    this.currentScope = scope
    node.body.forEach((innerNode) => {
      this.walkNode(innerNode)
    })
    this.currentScope = lastScope

    this.scopes.push(scope)
  }

  walkIfStatement(node) {
    const { test, consequent, alternate } = node

    // else case
    if (test == null) {
      this.walkBlockStatement(node)
      return
    }
    // others
    else {
      this.walkBlockStatement(consequent)
    }

    test.scopeId = this.currentScope.id
    if (alternate != null) {
      this.walkIfStatement(alternate)
    }
  }

  walkWhileStatement({ body, test }) {
    this.walkNode(body)
    test.scopeId = this.currentScope.id
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
      case NodeType.UnaryExpression:
        nodeType = PrimitiveType.Boolean
        break
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
      case NodeType.UnaryExpression:
        type = PrimitiveType.Boolean
        break
      default:
        type = resolvePrimitiveType(init.value)
        break
    }

    const count = this.calculateDeclareCount(this.currentScope.defs, id.name)
    this.currentScope.defs.push({
      name: id.name,
      type,
      count,
      shouldUse: count === 0
    })
  }

  calculateDeclareCount(defs: Definiton[], name: string): number {
    return defs.filter((def) => {
      return def.name === name
    }).length
  }

  resolveExpressionStatement({ expression }) {
    const { left, right } = expression
    if (left != null) {
      left.scopeId = this.currentScope.id
    }

    if (right != null) {
      if (right.type === NodeType.BinaryExpression) {
        right.left.scopeId = this.currentScope.id
        right.right.scopeId = this.currentScope.id
      } else {
        right.scopeId = this.currentScope.id
      }
    }
  }
}
