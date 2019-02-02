const { parse, parseExpression } = require('@babel/parser')
import SymbolCreator from './symbolCreator'

const input = `
let a = () => {
  let b = 3;
};
`
const symbolCreator = new SymbolCreator()

let baseEnv = []
const program = parse(input).program
program.body.forEach((node) => {
  symbolCreator.walkNode(baseEnv, node)
})
