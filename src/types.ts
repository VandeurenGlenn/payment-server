export type PayconiqPaymentRequest = {
  amount: number
  currency: string
  description: string
  callbackUrl: string
}

export type PayconiqPaymentStatus =
  | 'PENDING'
  | 'IDENTIFIED'
  | 'CANCELLED'
  | 'AUTHORIZED'
  | 'AUTHORIZATION_FAILED'
  | 'EXPIRED'
  | 'FAILED'
  | 'SUCCEEDED'

export type PayconiqPaymentVoucher = {
  voucherProvider: string
  voucherScheme: string
  amount: number
}

export type PayconiqPaymentCallback = {
  paymentId: string

  amount: number
  description: string
  createdAt: string
  expiresAt: string
  succeededAt?: string // only set when status is 'SUCCEEDED'
  status: PayconiqPaymentStatus
  creditor: {
    name: string
    callbackUrl: string
    iban: string
    merchantId: string
    profileId: string
  }
  currency: string
  reference: string
  _links: {
    self: { href: string }
    cancel: { href: string }
    deeplink: { href: string }
    qrcode: { href: string }
  }
}
