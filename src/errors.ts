export const createLeftIsNotRight = (leftType, rightType): ErrorType => {
  return {
    code: 1,
    message: `${leftType} cannot be calculate ${rightType}`
  }
}

export const createCannotBinaryOp = (leftType): ErrorType => {
  return {
    code: 2,
    message: `${leftType} cannot be used binary operation`
  }
}

export const createUnknownIdentifier = (name: string): ErrorType => {
  return {
    code: 3,
    message: `cannot find ${name}`
  }
}

export type ErrorType = {
  code: number
  message: string
}
