import '@vandeurenglenn/qrcode-scanner'

export class CheckoutShell extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', (e) => {
      if (e.target?.id === 'scan') {
        const scanner = this.querySelector('qrcode-scanner')
        scanner.scan()
      }
    })

    this.innerHTML = `
        <h1>Checkout</h1>
        <button id="scan">Scan QR Code</button>
        <qrcode-scanner></qrcode-scanner>
        `
  }
}

customElements.define('checkout-shell', CheckoutShell)
