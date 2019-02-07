export const createLeftIsNotRight = (leftType: string, rightType: string, loc = ForTestLoc): ErrorType => {
  return new ErrorType(1, `${leftType} cannot be calculate ${rightType}`, loc)
}

export const createCannotBinaryOp = (leftType: string, loc = ForTestLoc): ErrorType => {
  return new ErrorType(2, `${leftType} cannot be used binary operation`, loc)
}

export const createUnknownIdentifier = (name: string, loc = ForTestLoc): ErrorType => {
  return new ErrorType(3, `cannot find ${name}`, loc)
}

export const createCannotAssignOtherType = (leftType: string, rightType: string, loc = ForTestLoc): ErrorType => {
  return new ErrorType(4, `cannot assign other type. left: ${leftType}, right: ${rightType}`, loc)
}

export const createIfCondtionIsNotBoolean = (type: string, loc = ForTestLoc): ErrorType => {
  return new ErrorType(5, `if condition should be Boolean. current: ${type}`, loc)
}

export class ErrorType {
  code: number
  message: string
  loc: any

  constructor(code: number, message: string, loc) {
    this.code = code
    this.message = message
    this.loc = loc
  }

  createMessage(): string {
    return `L${this.loc.start.line}: ${this.message}`
  }
}

export const ForTestLoc = {
  start: {
    line: 0
  }
}
