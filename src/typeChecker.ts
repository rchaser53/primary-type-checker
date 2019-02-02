// export default class TypeChecker {
//   walkNode(envs, node) {
//     switch (node.type) {
//       case 'VariableDeclaration':
//         this.setEnvironment(envs, node)
//         break
//       case 'BlockStatement':
//         console.log(node.type, 'block')
//         const innerEnv = []
//         node.body.forEach((innerNode) => {
//           this.walkNode(innerEnv, innerNode)
//         })
//         envs.push(innerEnv)
//         break
//       default:
//         console.log(node)
//         break
//     }
//   }
// }
