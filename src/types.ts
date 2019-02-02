export enum PrimitiveType {
  Number = 'NumericLiteral',
  String = 'StringLiteral',
  Boolean = 'BooleanLiteral',
  Null = 'Null',
  Undefined = 'Undefined',
  Symbol = 'Symbol'
}

export const resolvePrimitiveType = (value): PrimitiveType => {
  let type = PrimitiveType.Undefined
  switch (typeof value) {
    case 'number':
      type = PrimitiveType.Number
      break
    case 'string':
      type = PrimitiveType.String
      break
    case 'boolean':
      type = PrimitiveType.Boolean
      break
    case 'object':
      type = PrimitiveType.Null
      break
    case 'undefined':
      type = PrimitiveType.Undefined
      break
    case 'symbol':
      type = PrimitiveType.Symbol
      break
    default:
  }
  return type
}
