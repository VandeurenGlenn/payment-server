import Router from '@koa/router'
import { CronJob } from 'cron'
import qrcode from 'qrcode'
import type { PayconiqPaymentCallback } from '../types.js'
import { payments } from '../store.js'

const router = new Router()

const runCallback = async (payment: PayconiqPaymentCallback) => {
  // @ts-ignore
  const response = await fetch(payment.creditor.callbackUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payment)
  })

  if (response.status !== 200) {
    payment.status = 'FAILED'
    payments.set(payment.paymentId, payment)
  }
  return response.status
}

const job = new CronJob(
  '* * * * *',
  () => {
    for (const [paymentId, payment] of payments) {
      if (payment.status === 'PENDING' && new Date(payment.expireAt) < new Date()) {
        payment.status = 'EXPIRED'
        payments.set(paymentId, payment)
        runCallback(payment)
      } else if (payment.status === 'AUTHORIZED' && new Date(payment.expireAt) < new Date()) {
        payment.status = 'FAILED'
        payments.set(paymentId, payment)
        runCallback(payment)
      } else if (payment.status === 'FAILED' && new Date(payment.expireAt) > new Date()) {
        payments.delete(paymentId)
      }
    }
  },
  null,
  true,
  'Europe/Amsterdam'
)

/**
 * create payment
 * POST /payconiq/v3/payments
 * {
 *   amount: number,
 *   currency: string,
 *   description: string,
 *   callbackUrl: string
 * }
 */
router.post('/payconiq/v3/payments', async (ctx) => {
  const { amount, currency, description, callbackUrl } = ctx.request.body
  if (!amount || !currency || !description || !callbackUrl) {
    ctx.status = 400
    ctx.body = 'Missing required fields'
    return
  }

  ctx.status = 200

  const paymentId = `ps-${crypto.randomUUID()}`
  const payment = {
    paymentId,
    amount: Number(amount),
    currency,
    description,
    creditor: {
      name: 'PS TEST',
      iban: 'BE02ABNA0123456789',
      merchantId: '123456',
      profileId: '123456',
      callbackUrl
    },
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    _links: {
      self: { href: `http://localhost:9090/payconiq/v3/payments/${paymentId}` },
      cancel: { href: `http://localhost:9090/payconiq/v3/payments/${paymentId}` },
      deeplink: { href: `payconiq://payment/${paymentId.toUpperCase()}` },
      qrcode: { href: `http://localhost:9090/payconiq/v3/payments/${paymentId}/qrcode` }
    }
  } as PayconiqPaymentCallback

  payments.set(payment.paymentId, payment)
  ctx.body = payment
})

router.delete('/payconiq/v3/payments/:paymentId', async (ctx) => {
  const paymentId = ctx.params.paymentId
  if (!payments.has(paymentId)) {
    ctx.status = 404
    return
  }
  payments.delete(paymentId)
  ctx.status = 204
})

router.get('/payconiq/v3/payments/:paymentId', async (ctx) => {
  const paymentId = ctx.params.paymentId
  const payment = payments.get(paymentId)
  if (!payment) {
    ctx.status = 404
    return
  }
  ctx.body = payment
})

router.post('/payconiq/v3/payments/:paymentId/authorize', async (ctx) => {
  const paymentId = ctx.params.paymentId
  const payment = payments.get(paymentId)
  if (!payment) {
    ctx.status = 404
    return
  }
  if (payment.status !== 'PENDING') {
    ctx.status = 400
    ctx.body = 'Payment is not pending'
    return
  }
  payment.status = 'AUTHORIZED'
  payments.set(paymentId, payment)
  ctx.body = payment
  // @ts-ignore
  const response = await fetch(payment.creditor.callbackUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payment)
  })
})

router.get('/payconiq/v3/payments/:paymentId/pay', async (ctx) => {
  console.log(ctx.params.paymentId)

  const paymentId = ctx.params.paymentId
  const payment = payments.get(paymentId)
  if (!payment) {
    ctx.status = 404
    return
  }
  if (payment.status !== 'PENDING') {
    ctx.status = 400
    ctx.body = 'Payment is not pending'
    return
  }
  payment.status = 'SUCCEEDED'
  payment.succeededAt = new Date().toISOString()
  payments.set(paymentId, payment)
  // @ts-ignore
  if ((await runCallback(payment)) === 200) {
    payments.delete(paymentId)
  }
  ctx.status = 200
  ctx.body = payment
})

router.get('/payconiq/v3/payments/:paymentId/qrcode', async (ctx) => {
  const paymentId = ctx.params.paymentId
  const payment = payments.get(paymentId)
  if (!payment) {
    ctx.status = 404
    return
  }

  const input = {
    paymentId,
    amount: payment.amount,
    description: payment.description,
    createdAt: payment.createdAt,
    expiresAt: payment.expiresAt,
    status: payment.status,
    creditor: payment.creditor,
    currency: payment.currency
  }

  ctx.type = 'image/svg+xml'
  ctx.body = await qrcode.toString(JSON.stringify(input), {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1,
    scale: 100,
    color: {
      dark: '#fff',
      light: '#000'
    }
  })
})

export default router.routes()
