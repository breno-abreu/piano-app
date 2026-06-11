import sharp from 'sharp'
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rhythmsDir = path.resolve(__dirname, '../public/rhythms')
const WHITE_THRESHOLD = 235

function isNearWhite(r, g, b) {
  return r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD
}

async function makeTransparent(filePath) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    if (isNearWhite(r, g, b)) {
      data[i + 3] = 0
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toFile(filePath)

  console.log(`processed: ${path.basename(filePath)}`)
}

const files = (await readdir(rhythmsDir))
  .filter((name) => name.endsWith('.png') && name !== 'base.png')
  .sort()

for (const file of files) {
  await makeTransparent(path.join(rhythmsDir, file))
}

console.log(`Done. ${files.length} images updated.`)
