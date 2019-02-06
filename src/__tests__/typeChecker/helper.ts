const { parse } = require('@babel/parser')
import SymbolCreator from '../../symbolCreator'
import TypeChecker from '../../typeChecker'

export const setup = (input: string) => {
  const symbolCreator = new SymbolCreator()
  const program = parse(input).program
  program.body.forEach((node) => {
    symbolCreator.walkNode(node)
  })

  const typeChecker = new TypeChecker(symbolCreator.scopes)

  program.body.forEach((node) => {
    typeChecker.walkNode(node)
  })

  return typeChecker.errorStacks
}

export const createExpectedErrorMessage = (errObjs) => {
  return errObjs.map(({ code, message }) => {
    return {
      code,
      message
    }
  })
}

export const errorAssert = (actual, expected) => {
  expect(createExpectedErrorMessage(actual)).toEqual(createExpectedErrorMessage(expected))
}
