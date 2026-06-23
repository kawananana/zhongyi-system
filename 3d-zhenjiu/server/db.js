import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'data')
const dbPath = path.join(dataDir, 'acupoints.json')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, '[]', 'utf-8')
}

function readStore() {
  const raw = fs.readFileSync(dbPath, 'utf-8')
  return JSON.parse(raw)
}

function writeStore(list) {
  fs.writeFileSync(dbPath, JSON.stringify(list, null, 2), 'utf-8')
}

function now() {
  return new Date().toISOString()
}

export function listAcupoints() {
  return readStore().sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function getAcupoint(id) {
  return readStore().find((item) => item.id === id) || null
}

export function createAcupoint(acupoint) {
  const list = readStore()
  const record = {
    ...acupoint,
    description: acupoint.description || '',
    color: acupoint.color || '#409eff',
    createdAt: now(),
    updatedAt: now(),
  }
  list.push(record)
  writeStore(list)
  return record
}

export function updateAcupoint(id, acupoint) {
  const list = readStore()
  const index = list.findIndex((item) => item.id === id)
  if (index === -1) return null

  list[index] = {
    ...list[index],
    ...acupoint,
    id,
    updatedAt: now(),
  }
  writeStore(list)
  return list[index]
}

export function deleteAcupoint(id) {
  const list = readStore()
  const next = list.filter((item) => item.id !== id)
  if (next.length === list.length) return false
  writeStore(next)
  return true
}
