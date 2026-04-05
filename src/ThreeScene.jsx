import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

function ThreeScene({ rooms }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(15, 15, 15)
    camera.lookAt(0, 0, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.maxPolarAngle = Math.PI / 2.1

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Base floor
    const floorGeometry = new THREE.PlaneGeometry(50, 50)
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a4e,
      roughness: 0.8
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.01
    floor.receiveShadow = true
    scene.add(floor)

    // Grid
    const grid = new THREE.GridHelper(50, 50, 0x444444, 0x333333)
    scene.add(grid)

    // Floor colors
    const floorColors = {
      'wood': 0x8B4513,
      'tile': 0xb0c4de,
      'carpet': 0x696969,
      'marble': 0xf0f0f0,
      'concrete': 0x808080
    }

    // Create 3D rooms
    rooms.forEach(room => {
      const width = room.width / 50
      const depth = room.height / 50
      const height = 2.8
      
      const x = (room.x / 50) - 9 + (width / 2)
      const z = (room.y / 50) - 6 + (depth / 2)

      const wallColor = new THREE.Color(room.wallColor || '#ffffff')
      const floorColor = floorColors[room.floorType] || floorColors['wood']

      // Room floor
      const roomFloorGeo = new THREE.PlaneGeometry(width, depth)
      const roomFloorMat = new THREE.MeshStandardMaterial({ 
        color: floorColor,
        roughness: room.floorType === 'marble' ? 0.2 : 0.8,
        metalness: room.floorType === 'marble' ? 0.1 : 0
      })
      const roomFloor = new THREE.Mesh(roomFloorGeo, roomFloorMat)
      roomFloor.rotation.x = -Math.PI / 2
      roomFloor.position.set(x, 0.01, z)
      roomFloor.receiveShadow = true
      scene.add(roomFloor)

      // Floor pattern for wood
      if (room.floorType === 'wood') {
        for (let i = -depth/2 + 0.1; i < depth/2; i += 0.3) {
          const plankGeo = new THREE.PlaneGeometry(width - 0.02, 0.02)
          const plankMat = new THREE.MeshStandardMaterial({ color: 0x5D3A1A })
          const plank = new THREE.Mesh(plankGeo, plankMat)
          plank.rotation.x = -Math.PI / 2
          plank.position.set(x, 0.02, z + i)
          scene.add(plank)
        }
      }

      // Floor pattern for tile
      if (room.floorType === 'tile') {
        const tileSize = 0.5
        for (let tx = -width/2 + tileSize/2; tx < width/2; tx += tileSize) {
          for (let tz = -depth/2 + tileSize/2; tz < depth/2; tz += tileSize) {
            const groutGeo = new THREE.PlaneGeometry(0.02, tileSize)
            const groutMat = new THREE.MeshStandardMaterial({ color: 0x8a9aae })
            const groutV = new THREE.Mesh(groutGeo, groutMat)
            groutV.rotation.x = -Math.PI / 2
            groutV.position.set(x + tx, 0.02, z + tz)
            scene.add(groutV)
          }
        }
      }

      // Wall material with room's wall color
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: wallColor,
        roughness: 0.9,
        side: THREE.DoubleSide
      })

      const wallThickness = 0.1

      // Front wall
      const frontWallGeo = new THREE.BoxGeometry(width, height, wallThickness)
      const frontWall = new THREE.Mesh(frontWallGeo, wallMaterial)
      frontWall.position.set(x, height / 2, z + depth / 2)
      frontWall.castShadow = true
      frontWall.receiveShadow = true
      scene.add(frontWall)

      // Back wall
      const backWall = new THREE.Mesh(frontWallGeo, wallMaterial)
      backWall.position.set(x, height / 2, z - depth / 2)
      backWall.castShadow = true
      backWall.receiveShadow = true
      scene.add(backWall)

      // Left wall
      const sideWallGeo = new THREE.BoxGeometry(wallThickness, height, depth)
      const leftWall = new THREE.Mesh(sideWallGeo, wallMaterial)
      leftWall.position.set(x - width / 2, height / 2, z)
      leftWall.castShadow = true
      leftWall.receiveShadow = true
      scene.add(leftWall)

      // Right wall
      const rightWall = new THREE.Mesh(sideWallGeo, wallMaterial)
      rightWall.position.set(x + width / 2, height / 2, z)
      rightWall.castShadow = true
      rightWall.receiveShadow = true
      scene.add(rightWall)

      // Room label
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = 256
      canvas.height = 64
      context.fillStyle = '#000000'
      context.font = 'bold 24px Arial'
      context.textAlign = 'center'
      context.fillText(room.type, 128, 40)
      
      const texture = new THREE.CanvasTexture(canvas)
      const labelMaterial = new THREE.SpriteMaterial({ map: texture })
      const label = new THREE.Sprite(labelMaterial)
      label.position.set(x, 1.5, z)
      label.scale.set(2, 0.5, 1)
      scene.add(label)
    })

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [rooms])

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '900px', 
        height: '600px', 
        borderRadius: '8px',
        overflow: 'hidden',
        border: '2px solid #333'
      }} 
    />
  )
}

export default ThreeScene