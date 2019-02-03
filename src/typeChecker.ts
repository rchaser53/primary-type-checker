import { PrimitiveType } from './types'
import { createLeftIsNotRight, createCannotBinaryOp, createUnknownIdentifier, ErrorType } from './errors'
import { Definiton, Scope, Scopes, Unknown } from './scope'
import { NodeType } from './symbolCreator'
import { GlobalScopeId } from './constants'

const DummyDefininition = {
  name: 'dummy',
  type: PrimitiveType.Undefined,
  count: 0
}

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

      const def = this.tryFindError(id.scopeId, id.name, 0)
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
          this.resolveIdentifier(init.scopeId, init.name, 0)
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
        const resolved = this.resolveIdentifier(node.scopeId, node.name, 0)
        nodeType = resolved.type
      default:
        break
    }
    return nodeType
  }

  tryFindError(nodeId: number, nodeName: string, count: number): Definiton {
    const targetScope = this.findNameScope(nodeId)
    const resolved = targetScope.defs.find((def) => {
      return def.name === nodeName && def.count === count
    })

    if (resolved === undefined) {
      if (targetScope.parentId == null) {
        return DummyDefininition
      }
      const resolved = this.tryFindError(targetScope.parentId, nodeName, 0)

      return resolved.type instanceof Unknown ? this.tryFindError(targetScope.parentId, resolved.name, 0) : resolved
    }

    return resolved!.type instanceof Unknown ? this.tryFindError(nodeId, resolved!.name, ++count) : resolved
  }

  resolveIdentifier(nodeId: number, nodeName: string, count: number): Definiton {
    const targetScope = this.findNameScope(nodeId)
    const resolved = targetScope.defs.find((def) => {
      return def.name === nodeName && def.count === count
    })

    if (resolved === undefined) {
      if (targetScope.parentId == null) {
        throw createUnknownIdentifier(nodeName)
      }

      const resolved = this.resolveIdentifier(targetScope.parentId, nodeName, 0)
      return resolved.type instanceof Unknown
        ? this.resolveIdentifier(targetScope.parentId, resolved.name, 0)
        : resolved
    }

    if (resolved.type instanceof Unknown) {
      const referencedName = resolved.type.referencedName
      const actualCount = nodeName !== referencedName ? 0 : ++count
      return this.resolveIdentifier(nodeId, referencedName, actualCount)
    }

    return resolved
  }

  findNameScope(nodeId: number): Scope {
    const targetScope = this.scopes.find((scope) => {
      return scope.id === nodeId
    })

    if (targetScope === undefined) {
      console.error(nodeId, this.scopes)
      throw new Error(`should not come in typeChecker's findNameScope`)
    }

    return targetScope
  }
}
