import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveMediaSource, resolveMediaUrl } from './media-url'

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000/api/v1'

test('resolveMediaUrl normalizes uploads paths and stale dev hosts', () => {
  assert.equal(resolveMediaUrl('/uploads/file.jpg'), 'http://localhost:4000/uploads/file.jpg')
  assert.equal(resolveMediaUrl('uploads/file.jpg'), 'http://localhost:4000/uploads/file.jpg')
  assert.equal(resolveMediaUrl('http://localhost:4000/uploads/file.jpg'), 'http://localhost:4000/uploads/file.jpg')
  assert.equal(resolveMediaUrl('http://10.0.2.2:4000/uploads/file.jpg'), 'http://localhost:4000/uploads/file.jpg')
  assert.equal(resolveMediaUrl('http://192.168.10.111:4000/uploads/file.jpg'), 'http://localhost:4000/uploads/file.jpg')
})

test('resolveMediaSource supports object shapes used by admin media surfaces', () => {
  assert.equal(resolveMediaSource({ url: '/uploads/file.jpg' }), 'http://localhost:4000/uploads/file.jpg')
  assert.equal(resolveMediaSource({ mediaFile: { url: '/uploads/file.jpg' } }), 'http://localhost:4000/uploads/file.jpg')
  assert.equal(resolveMediaSource({ coverImage: { url: '/uploads/file.jpg' } }), 'http://localhost:4000/uploads/file.jpg')
  assert.equal(resolveMediaSource('https://cdn.example.com/file.jpg'), 'https://cdn.example.com/file.jpg')
  assert.equal(resolveMediaSource(null), null)
})
