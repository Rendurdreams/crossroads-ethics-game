/**
 * Generates minimal valid GLB 2.0 files for KingdomScene landmarks.
 * These are the simplest possible valid GLB files — each contains a single mesh
 * with named nodes and materials. KingdomScene.jsx uses these as anchors and
 * wraps them in procedural Three.js geometry for the visual detail.
 *
 * GLB binary format:
 *   [header 12 bytes][JSON chunk][BIN chunk]
 *   Header: magic(4) + version(4) + length(4)
 *   Chunk: length(4) + type(4) + data(length)
 *   JSON chunk type: 0x4E4F534A ("JSON")
 *   BIN chunk type: 0x004E4942 ("BIN\0")
 */

const fs = require('fs')
const path = require('path')
const outDir = path.join(__dirname, '../public/models')

function writeGLB(filename, gltfJson, binBuffer) {
  // Serialize JSON
  let jsonStr = JSON.stringify(gltfJson)
  // JSON chunk must be padded to 4-byte boundary with spaces (0x20)
  while (jsonStr.length % 4 !== 0) jsonStr += ' '
  const jsonBytes = Buffer.from(jsonStr, 'utf8')

  // BIN chunk must be padded to 4-byte boundary with zeros
  let binBytes = binBuffer ? Buffer.from(binBuffer) : Buffer.alloc(0)
  if (binBytes.length % 4 !== 0) {
    const padded = Buffer.alloc(Math.ceil(binBytes.length / 4) * 4, 0)
    binBytes.copy(padded)
    binBytes = padded
  }

  const jsonChunkLength = jsonBytes.length
  const binChunkLength = binBytes.length

  // Total: 12 (header) + 8 (json chunk header) + jsonChunkLength + (binChunkLength > 0 ? 8 + binChunkLength : 0)
  const hasBin = binChunkLength > 0
  const totalLength = 12 + 8 + jsonChunkLength + (hasBin ? 8 + binChunkLength : 0)

  const buf = Buffer.alloc(totalLength)
  let offset = 0

  // Header
  buf.writeUInt32LE(0x46546C67, offset); offset += 4  // magic: "glTF"
  buf.writeUInt32LE(2, offset); offset += 4           // version: 2
  buf.writeUInt32LE(totalLength, offset); offset += 4 // total length

  // JSON chunk
  buf.writeUInt32LE(jsonChunkLength, offset); offset += 4
  buf.writeUInt32LE(0x4E4F534A, offset); offset += 4  // type: "JSON"
  jsonBytes.copy(buf, offset); offset += jsonChunkLength

  // BIN chunk (optional)
  if (hasBin) {
    buf.writeUInt32LE(binChunkLength, offset); offset += 4
    buf.writeUInt32LE(0x004E4942, offset); offset += 4  // type: "BIN\0"
    binBytes.copy(buf, offset); offset += binChunkLength
  }

  const filepath = path.join(outDir, filename)
  fs.writeFileSync(filepath, buf)
  console.log(`Created ${filename} (${buf.length} bytes)`)
}

// ── Create a simple box mesh GLB ──────────────────────────────────────────
// A box with 8 vertices, 12 triangles (24 indices as uint16)
// Positions: Float32, 3 components per vertex
// Indices: Uint16, 1 component

function createBoxGLB(filename, meshName, materialName, color, width, height, depth) {
  const hw = width / 2, hh = height / 2, hd = depth / 2

  // 8 corner vertices of a box
  const positions = new Float32Array([
    -hw, -hh, -hd,
     hw, -hh, -hd,
     hw,  hh, -hd,
    -hw,  hh, -hd,
    -hw, -hh,  hd,
     hw, -hh,  hd,
     hw,  hh,  hd,
    -hw,  hh,  hd,
  ])

  // 12 triangles (6 faces, 2 triangles each) as Uint16 indices
  const indices = new Uint16Array([
    0, 2, 1,  0, 3, 2,  // back
    4, 5, 6,  4, 6, 7,  // front
    0, 1, 5,  0, 5, 4,  // bottom
    3, 7, 6,  3, 6, 2,  // top
    0, 4, 7,  0, 7, 3,  // left
    1, 2, 6,  1, 6, 5,  // right
  ])

  const posBytes = Buffer.from(positions.buffer)
  const idxBytes = Buffer.from(indices.buffer)

  // Pad posBytes to 4-byte boundary
  const posLen = posBytes.length
  const idxLen = idxBytes.length
  const binBuffer = Buffer.concat([posBytes, idxBytes])

  // Bounding box for accessor
  const min = [-hw, -hh, -hd]
  const max = [hw, hh, hd]

  // Normalize color to 0-1 range
  const r = ((color >> 16) & 0xFF) / 255
  const g = ((color >> 8) & 0xFF) / 255
  const b = (color & 0xFF) / 255

  const gltf = {
    asset: { version: '2.0', generator: 'KingdomScene model generator' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ name: meshName, mesh: 0 }],
    meshes: [{
      name: meshName,
      primitives: [{
        attributes: { POSITION: 0 },
        indices: 1,
        material: 0
      }]
    }],
    materials: [{
      name: materialName,
      pbrMetallicRoughness: {
        baseColorFactor: [r, g, b, 1.0],
        metallicFactor: 0.1,
        roughnessFactor: 0.9
      }
    }],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126, // FLOAT
        count: 8,
        type: 'VEC3',
        min: min,
        max: max
      },
      {
        bufferView: 1,
        componentType: 5123, // UNSIGNED_SHORT
        count: 36,
        type: 'SCALAR'
      }
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: posLen, target: 34962 },  // ARRAY_BUFFER
      { buffer: 0, byteOffset: posLen, byteLength: idxLen, target: 34963 }  // ELEMENT_ARRAY_BUFFER
    ],
    buffers: [{ byteLength: binBuffer.length }]
  }

  writeGLB(filename, gltf, binBuffer)
}

// Generate 4 landmark GLB files
// Bridge: a wide flat box (bridge deck proportions)
createBoxGLB('bridge.glb', 'bridge_deck', 'bridge_stone', 0x4a4a5a, 6.0, 0.3, 1.2)
// Beacon tower: a tall narrow box (tower proportions)
createBoxGLB('beacon-tower.glb', 'tower_shaft', 'tower_stone', 0x3a3a4a, 0.8, 5.5, 0.8)
// Village cluster: a wider squat box (hut proportions)
createBoxGLB('village-cluster.glb', 'hut_wall_0', 'village_wall', 0x5a4a3a, 2.5, 1.2, 2.5)
// Terrain: a wide thin box (ground tile proportions)
createBoxGLB('terrain.glb', 'terrain_ground_plane', 'terrain_ground', 0x1a2a1a, 20.0, 0.2, 16.0)

console.log('\nAll models generated in public/models/')
const { readdirSync, statSync } = require('fs')
readdirSync(outDir).forEach(f => {
  const size = statSync(path.join(outDir, f)).size
  console.log(`  ${f}: ${size} bytes`)
})
