import mime from 'mime-types'
import { open } from 'fs/promises'

export const streamWhenPossible = async (path: string, ctx) => {
  const fd = await open(path)
  ctx.status = 200
  ctx.type = mime.lookup(path) || 'application/octet-stream'
  const stream = fd.createReadStream({ autoClose: true })
  stream.on('end', () => {
    fd.close()
  })
  ctx.body = stream
}
