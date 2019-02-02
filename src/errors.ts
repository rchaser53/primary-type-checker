export const createLeftIsNotRight = (leftType, rightType): string => {
  return `${leftType} cannot be calculate ${rightType}`
}

export const createCannotBinaryOp = (leftType): string => {
  return `${leftType} cannot be used binary operation`
}