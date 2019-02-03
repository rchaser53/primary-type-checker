import { PrimitiveType } from './types'
import { createLeftIsNotRight, createCannotBinaryOp, createUnknownIdentifier, ErrorType } from './errors'
import { Definiton, Scope, Scopes } from './scope'
import { NodeType } from './symbolCreator'
import { GlobalScopeId } from './constants'

export default class TypeChecker {
  scopes: Scopes
  currentScope: Scope
  errorStacks: ErrorType[] = []

  constructor(scopes: Scopes) {
    this.scopes = scopes
    this.currentScope = scopes.find((scope) => {
      return scope.id === GlobalScopeId
    })!
  }

  emitError() {
    if (this.errorStacks.length > 0) {
      throw this.errorStacks
        .map((error) => {
          return error.message
        })
        .join('\n')
    }
  }

  walkNode(node) {
    switch (node.type) {
      case NodeType.VariableDeclaration:
        this.resolveVariableDeclaration(node)
        break
      case NodeType.BlockStatement:
        node.body.forEach((innerNode) => {
          this.walkNode(innerNode)
        })
        break
      default:
        console.log(node)
        break
    }
  }

  resolveVariableDeclaration(node) {
    try {
      const { id, init } = node.declarations[0] // why Array?

      const def = this.resolveIdentifier(id.scopeId, id.name)
      if (def.type instanceof ErrorType) {
        throw def.type
      }

      switch (init.type) {
        case NodeType.BinaryExpression:
          this.resolveBinaryExpression(init.left, init.right)
          break
        case NodeType.Identifier:
          // undefined is Identifier
          if (init.name === 'undefined') {
            break
          }

          // just type check
          this.resolveIdentifier(init.scopeId, init.name)
          break
        default:
          break
      }
    } catch (err) {
      this.errorStacks.push(err)
    }
  }

  resolveBinaryExpression(left, right): PrimitiveType {
    const leftType = this.resolveBinaryOpNode(left)
    if (leftType !== PrimitiveType.Number && leftType !== PrimitiveType.String) {
      throw createCannotBinaryOp(leftType)
    }

    const rightType = this.resolveBinaryOpNode(right)
    if (leftType !== rightType) {
      throw createLeftIsNotRight(leftType, rightType)
    }

    return leftType
  }

  resolveBinaryOpNode(node): PrimitiveType {
    let nodeType = node.type
    switch (node.type) {
      case NodeType.BinaryExpression:
        nodeType = this.resolveBinaryExpression(node.left, node.right)
        break
      case NodeType.Identifier:
        nodeType = this.resolveIdentifier(node.scopeId, node.name).type
      default:
        break
    }
    return nodeType
  }

  resolveIdentifier(nodeId: number, nodeName: string): Definiton {
    const targetScope = this.findNameScope(nodeId)

    let resolved = targetScope.defs.find((def) => {
      return def.name === nodeName
    })

    if (resolved === undefined) {
      if (targetScope.parentId == null) {
        throw createUnknownIdentifier(nodeName)
      } else {
        return this.resolveIdentifier(targetScope.parentId, nodeName)
      }
    }

    return resolved
  }

  findNameScope(nodeId: number): Scope {
    const targetScope = this.scopes.find((scope) => {
      return scope.id === nodeId
    })

    if (targetScope === undefined) {
      console.error(nodeId, this.scopes)
      throw new Error(`should not come here`)
    }

    return targetScope
  }
}
