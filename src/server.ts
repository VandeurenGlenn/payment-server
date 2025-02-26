import koa from 'koa'
import { bodyParser } from '@koa/bodyparser'
import payconiq from './routes/payconiq.js'
import path, { join } from 'path'
import { fileURLToPath } from 'url'
import { streamWhenPossible } from './helpers.js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const server = new koa()
console.log(__dirname)

server.use(bodyParser())
server.use(payconiq)
// server.use(checkout)
server.use(async (ctx, next) => {
  console.log(ctx.request.URL)
  console.log(ctx.request.originalUrl)

  try {
    let path
    if (ctx.request.URL.pathname.startsWith('/checkout')) {
      if (ctx.request.URL.pathname === '/checkout' || ctx.request.URL.pathname === '/checkout/')
        path = '/checkout/index.html'
      else path = join('checkout', ctx.request.URL.pathname)
    }
    await streamWhenPossible(join('ui', path), ctx)
  } catch (error) {}

  await next()
})
server.listen(9090)
