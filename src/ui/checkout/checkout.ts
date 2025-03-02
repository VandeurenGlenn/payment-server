import '@vandeurenglenn/qrcode-scanner'

export class CheckoutShell extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', async (e) => {
      if (e.target?.id === 'scan') {
        const scanner = this.querySelector('qrcode-scanner')
        const result = await scanner.scan((result: string) => {
          try {
            JSON.parse(result)
            return true
          } catch (error) {
            console.log(result)
          }
          return false
        })

        console.log(result)
        if (result) {
          const data = JSON.parse(result)
          const logchild = document.createElement('div')
          logchild.innerText = `${data.amount} ${data.currency} - ${data.paymentId}`
          this.querySelector('.log').appendChild(logchild)
          alert

          console.log(data)
        }
      }
    })

    this.innerHTML = `
        <h1>Checkout</h1>
        <button id="scan">Scan QR Code</button>
        <br />
        <span class="log"></span>
        <qrcode-scanner></qrcode-scanner>
        `
  }
}

customElements.define('checkout-shell', CheckoutShell)
