export const createLeftIsNotRight = (leftType: string, rightType: string): ErrorType => {
  return new ErrorType(1, `${leftType} cannot be calculate ${rightType}`)
}

export const createCannotBinaryOp = (leftType: string): ErrorType => {
  return new ErrorType(2, `${leftType} cannot be used binary operation`)
}

export const createUnknownIdentifier = (name: string): ErrorType => {
  return new ErrorType(3, `cannot find ${name}`)
}

export const createCannotAssignOtherType = (leftType: string, rightType: string): ErrorType => {
  return new ErrorType(4, `cannot assign other type. left: ${leftType}, right: ${rightType}`)
}

export const createIfCondtionIsNotBoolean = (type: string): ErrorType => {
  return new ErrorType(5, `if condition should be Boolean. current: ${type}`)
}

export class ErrorType {
  code: number
  message: string

  constructor(code: number, message: string) {
    this.code = code
    this.message = message
  }
}
