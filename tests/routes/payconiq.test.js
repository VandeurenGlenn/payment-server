import test from 'node:test'
import assert from 'node:assert'

test('create payconiq payment', async () => {
  const response = await fetch('http://localhost:3000/payconiq', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: 100,
      currency: 'EUR',
      description: 'Test payment',
      reference: '1234567890'
    })
  })
  assert(response.ok, 'response not ok')
  const result = await response.json()
  assert(result.id, 'id not found')
  assert(result.url, 'url not found')
  assert(result.qr, 'qr not found')
  assert(result.amount, 'amount not found')
  assert(result.currency, 'currency not found')
  assert(result.description, 'description not found')
  assert(result.reference, 'reference not found')
  assert(result.created, 'created not found')
  assert(result.expires, 'expires not found')
  assert(result.status, 'status not found')
  assert(result.status === 'pending', 'status is not pending')
  assert(result.amount === 100, 'amount is not 100')
  assert(result.currency === 'EUR', 'currency is not EUR')
  assert(result.description === 'Test payment', 'description is not Test payment')
  assert(result.reference === '1234567890', 'reference is not 1234567890')
})
