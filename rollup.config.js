import typescript from '@rollup/plugin-typescript'
import { copyFile } from 'fs/promises'
import { glob } from 'fs/promises'
import { nodeResolve } from '@rollup/plugin-node-resolve'

try {
  await copyFile('./src/ui/checkout/index.html', './exports/ui/checkout/index.html')
} catch (error) {
  console.error(error)
}

export default [
  {
    input: 'src/server.ts',
    output: {
      file: 'exports/server.js',
      format: 'esm'
    },
    plugins: [typescript()]
  },
  {
    input: await Array.fromAsync(glob(['./src/ui/checkout/*.ts'])),
    output: {
      dir: 'exports/ui/checkout',
      format: 'esm'
    },
    plugins: [nodeResolve(), typescript({ compilerOptions: { declaration: false, outDir: 'exports/ui/checkout' } })]
  }
]
