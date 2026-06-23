import cors from 'cors'
import express from 'express'
import crypto from 'crypto'
import {
  createAcupoint,
  deleteAcupoint,
  getAcupoint,
  listAcupoints,
  updateAcupoint,
} from './db.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: '3d-zhenjiu-api' })
})

app.get('/api/acupoints', (_req, res) => {
  res.json(listAcupoints())
})

app.get('/api/acupoints/:id', (req, res) => {
  const acupoint = getAcupoint(req.params.id)
  if (!acupoint) {
    res.status(404).json({ message: '穴位不存在' })
    return
  }
  res.json(acupoint)
})

app.post('/api/acupoints', (req, res) => {
  const { name, bodyPart, description, color, x, y, z } = req.body

  if (!name?.trim() || !bodyPart?.trim()) {
    res.status(400).json({ message: '名称和所属部位不能为空' })
    return
  }

  if ([x, y, z].some((value) => typeof value !== 'number' || Number.isNaN(value))) {
    res.status(400).json({ message: '坐标无效' })
    return
  }

  const acupoint = createAcupoint({
    id: crypto.randomUUID(),
    name: name.trim(),
    bodyPart: bodyPart.trim(),
    description: (description || '').trim(),
    color: color || '#409eff',
    x,
    y,
    z,
  })

  res.status(201).json(acupoint)
})

app.put('/api/acupoints/:id', (req, res) => {
  const { name, bodyPart, description, color, x, y, z } = req.body

  if (!name?.trim() || !bodyPart?.trim()) {
    res.status(400).json({ message: '名称和所属部位不能为空' })
    return
  }

  if ([x, y, z].some((value) => typeof value !== 'number' || Number.isNaN(value))) {
    res.status(400).json({ message: '坐标无效' })
    return
  }

  const acupoint = updateAcupoint(req.params.id, {
    name: name.trim(),
    bodyPart: bodyPart.trim(),
    description: (description || '').trim(),
    color: color || '#409eff',
    x,
    y,
    z,
  })

  if (!acupoint) {
    res.status(404).json({ message: '穴位不存在' })
    return
  }

  res.json(acupoint)
})

app.delete('/api/acupoints/:id', (req, res) => {
  const deleted = deleteAcupoint(req.params.id)
  if (!deleted) {
    res.status(404).json({ message: '穴位不存在' })
    return
  }
  res.status(204).send()
})

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`)
})
