import { PrimitiveType } from './types'
import { ErrorType } from './errors'

export class Unknown {
  astId: number
  referencedName: string
  constructor(astId: number, name: string) {
    this.astId = astId
    this.referencedName = name
  }
}
export type VariableType = PrimitiveType | ErrorType | Unknown

export type Scopes = Scope[]

export type Definiton = {
  name: string
  type: VariableType
  count: number
  shouldUse: boolean
}

export class Scope {
  id: number
  parentId: number | null
  defs: Definiton[] = []
  declareCount: { [name: string]: number } = {}

  constructor(id: number, parentId: number | null) {
    this.id = id
    this.parentId = parentId
  }

  resolve(nodeName: string): Definiton | undefined {
    return this.defs.find(({ name, shouldUse }) => {
      return name === nodeName && shouldUse
    })
  }

  incrementDeclareCount(nodeName: string) {
    this.declareCount[nodeName] = this.declareCount[nodeName] == null ? 0 : this.declareCount[nodeName] + 1

    this.defs.forEach((def) => {
      if (def.name === nodeName) {
        def.shouldUse = def.count === this.declareCount[nodeName]
      }
    })
  }
}
