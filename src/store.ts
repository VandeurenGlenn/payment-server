import { Dir } from 'node:fs'
import { PayconiqPaymentCallback } from './types.js'
import { FileHandle, mkdir, open, opendir } from 'node:fs/promises'

export let payments: Map<string, PayconiqPaymentCallback>
let paymentsStore: FileHandle
let dataDir: Dir

try {
  dataDir = await opendir('./data')
} catch (error) {
  await mkdir('./data', { recursive: true })
  dataDir = await opendir('./data')
}

try {
  paymentsStore = await open('./data/store.json', 'w+')
  let file
  try {
    file = JSON.parse(await paymentsStore.readFile({ encoding: 'utf8' }))
  } catch (error) {
    file = {}
    await paymentsStore.writeFile(JSON.stringify(file))
  }
  const entries = Object.entries(file)
  if (entries.length === 0) {
    payments = new Map()
  } else {
    payments = new Map(entries)
  }
} catch (error) {
  paymentsStore.writeFile(JSON.stringify({}))
  payments = new Map()
}
console.log('Store initialized')
console.log('Payments:', payments)

export const readPayments = async () => {
  return JSON.parse((await paymentsStore.readFile()).toString())
}
export const writePayments = async () => {
  const entries = Object.fromEntries(payments)
  if (Object.keys(entries).length === 0) {
    await paymentsStore.writeFile(JSON.stringify({}))
  } else {
    await paymentsStore.writeFile(JSON.stringify(entries))
  }
}

export const cleanup = async () => {
  await writePayments()
  await paymentsStore.close()
}
process.on('exit', cleanup)
process.on('SIGINT', () => process.exit(0))
