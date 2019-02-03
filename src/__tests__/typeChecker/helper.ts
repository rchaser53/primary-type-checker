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
