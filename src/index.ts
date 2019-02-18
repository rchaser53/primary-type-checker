import * as fs from 'fs'
import * as commander from 'commander'

// need to use require because type declartion in @babel/parser is wrong
const { parse } = require('@babel/parser')

import SymbolCreator from './symbolCreator'
import TypeChecker from './typeChecker'

let cmdValue
commander
  .version('1.0.7')
  .arguments('*')
  .action((cmd) => {
    cmdValue = cmd
  })
commander.parse(process.argv)

try {
  if (typeof cmdValue === 'undefined') {
    console.error('no command given!')
    process.exit(1)
  }
  const inputPath = cmdValue
  const input = fs.readFileSync(inputPath, { encoding: 'utf8' })
  const symbolCreator = new SymbolCreator()

  const program = parse(input).program
  program.body.forEach((node) => {
    symbolCreator.walkNode(node)
  })

  const typeChecker = new TypeChecker(symbolCreator.scopes)
  program.body.forEach((node) => {
    typeChecker.walkNode(node)
  })

  typeChecker.emitError()
} catch (err) {
  console.error(err.toString())
}
