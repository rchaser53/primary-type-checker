import { PrimitiveType } from './types'
import {
  createCannotBinaryOp,
  createCannotAssignOtherType,
  createIfCondtionIsNotBoolean,
  createLeftIsNotRight,
  createUnknownIdentifier,
  ErrorType
} from './errors'
import { Definiton, Scope, Scopes, Unknown } from './scope'
import { GlobalScopeId, NodeType } from './constants'

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
      case NodeType.ExpressionStatement:
        this.walkExpressionStatement(node)
        break
      case NodeType.IfStatement:
        this.walkIfStatement(node)
        break
      default:
        console.log(node)
        break
    }
  }

  walkExpressionStatement({ expression }) {
    switch (expression.type) {
      case NodeType.AssignmentExpression:
        this.resolveAssignmentExpression(expression)
        break
      default:
        break
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

  resolveAssignmentExpression({ left, right }) {
    try {
      const leftType = this.tryResolveLeftIdentifier(left)

      let rightType
      if (right.type === NodeType.BinaryExpression) {
        rightType = this.resolveBinaryExpression(right.left, right.right)
      } else {
        rightType = this.tryResolveRightNode(right)
      }

      if (leftType !== rightType) {
        throw createCannotAssignOtherType(leftType, rightType)
      }
    } catch (err) {
      this.errorStacks.push(err)
    }
  }

  tryResolveLeftIdentifier(node): PrimitiveType {
    const def = this.resolveLeftIdentifier(node.scopeId, node.name, 0)
    if (def.type instanceof ErrorType) {
      throw def.type
    } else if (def.type instanceof Unknown) {
      console.error(def.type)
      throw new Error('def.type should not Unknown in typeChecker.tryResolveLeftIdentifier')
    }

    return def.type
  }

  tryResolveRightNode(node): PrimitiveType {
    if (node.type !== NodeType.Identifier) {
      return node.type
    }

    const def = this.resolveRightIdentifier(node.scopeId, node.name, 0)
    if (def.type instanceof ErrorType) {
      throw def.type
    } else if (def.type instanceof Unknown) {
      console.error(def.type)
      throw new Error('def.type should not Unknown in typeChecker.tryResolveRightNode')
    }

    return def.type
  }

  resolveVariableDeclaration(node) {
    try {
      const { id, init } = node.declarations[0] // why Array?
      this.tryResolveLeftIdentifier(id)

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
          this.resolveRightIdentifier(init.scopeId, init.name, 0)
          break
        default:
          break
      }
    } catch (err) {
      this.errorStacks.push(err)
    }
  }

  resolveBinaryOpNode(node): PrimitiveType {
    let nodeType = node.type
    switch (node.type) {
      case NodeType.BinaryExpression:
        nodeType = this.resolveBinaryExpression(node.left, node.right)
        break
      case NodeType.Identifier:
        const resolved = this.resolveRightIdentifier(node.scopeId, node.name, 0)
        nodeType = resolved.type
      default:
        break
    }
    return nodeType
  }

  // should remove Unknow in type
  resolveLeftIdentifier(nodeId: number, nodeName: string, count: number): Definiton {
    const targetScope = this.findNameScope(nodeId)
    const resolved = targetScope.defs.find((def) => {
      return def.name === nodeName && def.count === count
    })

    if (resolved === undefined) {
      if (targetScope.parentId == null) {
        return DummyDefininition
      }
      const resolved = this.resolveLeftIdentifier(targetScope.parentId, nodeName, 0)

      return resolved.type instanceof Unknown
        ? this.resolveLeftIdentifier(targetScope.parentId, resolved.name, 0)
        : resolved
    }

    return resolved!.type instanceof Unknown ? this.resolveLeftIdentifier(nodeId, resolved!.name, ++count) : resolved
  }

  resolveRightIdentifier(nodeId: number, nodeName: string, count: number): Definiton {
    const targetScope = this.findNameScope(nodeId)
    const resolved = targetScope.defs.find((def) => {
      return def.name === nodeName && def.count === count
    })

    if (resolved === undefined) {
      if (targetScope.parentId == null) {
        throw createUnknownIdentifier(nodeName)
      }

      const resolved = this.resolveRightIdentifier(targetScope.parentId, nodeName, 0)
      return resolved.type instanceof Unknown
        ? this.resolveRightIdentifier(targetScope.parentId, resolved.name, 0)
        : resolved
    }

    if (resolved.type instanceof Unknown) {
      const referencedName = resolved.type.referencedName
      const actualCount = nodeName !== referencedName ? 0 : ++count
      return this.resolveRightIdentifier(nodeId, referencedName, actualCount)
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

  walkIfStatement({ test, alternate }) {
    // for else only
    if (test == null) return

    switch (test.type) {
      case PrimitiveType.Boolean:
        break
      case NodeType.Identifier:
        const resolved = this.resolveRightIdentifier(test.scopeId, test.name, 0)
        if (resolved.type !== PrimitiveType.Boolean) {
          this.errorStacks.push(createIfCondtionIsNotBoolean(resolved.type as string))
        }
        break
      default:
        this.errorStacks.push(createIfCondtionIsNotBoolean(test.type))
    }

    if (alternate != null) {
      this.walkIfStatement(alternate)
    }
  }
}
