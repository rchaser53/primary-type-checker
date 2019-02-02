export enum PrimitiveType {
  Number = 'Number',
  String = 'String',
  Boolean = 'Boolean',
  Null = 'Null',
  Undefined = 'Undefined',
  Symbol = 'Symbol',
  ErrorType = 'Error' // should not be here
}

export const resolvePrimitiveType = (value): PrimitiveType => {
  let type = PrimitiveType.Undefined
  switch (typeof value) {
    case 'number':
      type = PrimitiveType.Number
    case 'string':
      type = PrimitiveType.String
    case 'boolean':
      type = PrimitiveType.Boolean
    case 'object':
      type = PrimitiveType.Null
    case 'undefined':
      type = PrimitiveType.Undefined
    case 'symbol':
      type = PrimitiveType.Symbol
    default:
  }
  return type
}
