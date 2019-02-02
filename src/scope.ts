import { PrimitiveType } from './types'
import { ErrorType } from './errors'

export type Unknown = {
  astId: number
}
export type VariableType = PrimitiveType | ErrorType | Unknown

export type Scopes = Scope[]

export type Definiton = {
  name: string
  type: VariableType
  count: number
}

export class Scope {
  id: number
  parentId: number | null
  defs: Definiton[] = []
  constructor(id: number, parentId: number | null) {
    this.id = id
    this.parentId = parentId
  }
}
