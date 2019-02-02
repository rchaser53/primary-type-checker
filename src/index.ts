const { parse, parseExpression } = require('@babel/parser')

const input = `
let a = 4;
let a = 5;
{
  let a = 3;
}
`

const program = parse(input).program

export const walkNode = (env, node) => {
  switch (node.type) {
    case 'VariableDeclaration':
      // console.log(node.type, 'declare');
      setEnvironment(env, node)
      break;
    case 'BlockStatement':
      console.log(node.type, 'block');
      const innerEnv = []
      node.body.forEach((innerNode) => {
        walkNode(innerEnv, innerNode)
      })
      env.push(innerEnv)
      break;
    default:
      break;
  }
}

export const setEnvironment = (env, node) => {
  const {id, init} = node.declarations[0];    // why Array?

  let value = null
  switch (init.type) {
    default:
      value = init.value
      break;
  }
  const count = env.filter((declare) => {
    return declare.name === id.name
  }).length;

  env.push({
    name: id.name,
    value: value,
    count,
  })
}

let baseEnv = []
program.body.forEach((node) => {
  walkNode(baseEnv, node)
})
console.log(baseEnv)