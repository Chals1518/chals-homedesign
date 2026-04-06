import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

function ThreeScene({ rooms, furniture, furnitureItems }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(15, 15, 15)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement)

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
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a4e, roughness: 0.8 })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.01
    floor.receiveShadow = true
    scene.add(floor)

    const grid = new THREE.GridHelper(50, 50, 0x444444, 0x333333)
    scene.add(grid)

    const floorColors = {
      'wood': 0x8B4513,
      'tile': 0xb0c4de,
      'carpet': 0x696969,
      'marble': 0xf0f0f0,
      'concrete': 0x808080
    }

    // Create rooms
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
        roughness: room.floorType === 'marble' ? 0.2 : 0.8
      })
      const roomFloor = new THREE.Mesh(roomFloorGeo, roomFloorMat)
      roomFloor.rotation.x = -Math.PI / 2
      roomFloor.position.set(x, 0.01, z)
      scene.add(roomFloor)

      // Walls
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
      scene.add(frontWall)

      // Back wall
      const backWall = new THREE.Mesh(frontWallGeo, wallMaterial)
      backWall.position.set(x, height / 2, z - depth / 2)
      backWall.castShadow = true
      scene.add(backWall)

      // Left wall
      const sideWallGeo = new THREE.BoxGeometry(wallThickness, height, depth)
      const leftWall = new THREE.Mesh(sideWallGeo, wallMaterial)
      leftWall.position.set(x - width / 2, height / 2, z)
      leftWall.castShadow = true
      scene.add(leftWall)

      // Right wall
      const rightWall = new THREE.Mesh(sideWallGeo, wallMaterial)
      rightWall.position.set(x + width / 2, height / 2, z)
      rightWall.castShadow = true
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

    // Create 3D furniture
    furniture.forEach(item => {
      const furnitureType = furnitureItems.find(f => f.type === item.type)
      const width = item.width / 50
      const depth = item.height / 50
      const x = (item.x / 50) - 9 + (width / 2)
      const z = (item.y / 50) - 6 + (depth / 2)
      
      let furnitureHeight = 0.4
      let yPos = furnitureHeight / 2

      // Adjust heights based on furniture type
      switch(item.type) {
        case 'sofa':
          furnitureHeight = 0.5
          yPos = furnitureHeight / 2
          break
        case 'bed':
          furnitureHeight = 0.5
          yPos = furnitureHeight / 2
          break
        case 'table':
          furnitureHeight = 0.75
          yPos = furnitureHeight / 2
          break
        case 'chair':
          furnitureHeight = 0.85
          yPos = furnitureHeight / 2
          break
        case 'desk':
          furnitureHeight = 0.75
          yPos = furnitureHeight / 2
          break
        case 'wardrobe':
          furnitureHeight = 2.0
          yPos = furnitureHeight / 2
          break
        case 'tv':
          furnitureHeight = 0.5
          yPos = furnitureHeight / 2
          break
        case 'bathtub':
          furnitureHeight = 0.6
          yPos = furnitureHeight / 2
          break
        case 'toilet':
          furnitureHeight = 0.7
          yPos = furnitureHeight / 2
          break
        case 'sink':
          furnitureHeight = 0.85
          yPos = furnitureHeight / 2
          break
        case 'stove':
          furnitureHeight = 0.9
          yPos = furnitureHeight / 2
          break
        case 'fridge':
          furnitureHeight = 1.8
          yPos = furnitureHeight / 2
          break
        default:
          furnitureHeight = 0.5
          yPos = furnitureHeight / 2
      }

      const geometry = new THREE.BoxGeometry(width, furnitureHeight, depth)
      const material = new THREE.MeshStandardMaterial({ 
        color: furnitureType?.color || 0x666666,
        roughness: 0.7
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(x, yPos, z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      scene.add(mesh)

      // Furniture label
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = 128
      canvas.height = 32
      context.fillStyle = '#ffffff'
      context.font = 'bold 16px Arial'
      context.textAlign = 'center'
      context.fillText(furnitureType?.label?.split(' ')[0] || '', 64, 22)
      
      const texture = new THREE.CanvasTexture(canvas)
      const labelMaterial = new THREE.SpriteMaterial({ map: texture })
      const label = new THREE.Sprite(labelMaterial)
      label.position.set(x, furnitureHeight + 0.3, z)
      label.scale.set(1, 0.25, 1)
      scene.add(label)
    })

    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!containerRef.current) return
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [rooms, furniture, furnitureItems])

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