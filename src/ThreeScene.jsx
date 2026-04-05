import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

function ThreeScene({ rooms }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)
    sceneRef.current = scene

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
    rendererRef.current = renderer

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

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(50, 50)
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2a2a4e,
      roughness: 0.8
    })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    // Grid
    const grid = new THREE.GridHelper(50, 50, 0x444444, 0x333333)
    scene.add(grid)

    // Room colors matching 2D view
    const roomColors = {
      'Living Room': 0x64c8ff,
      'Bedroom': 0xc896ff,
      'Kitchen': 0xffc864,
      'Bathroom': 0x64ffc8,
      'Dining Room': 0xff9696,
      'Office': 0xc8c8c8,
    }

    // Create 3D rooms
    rooms.forEach(room => {
      const width = room.width / 50  // Convert to meters
      const depth = room.height / 50
      const height = 2.8  // Wall height in meters
      
      // Position (convert from canvas coords to 3D coords)
      const x = (room.x / 50) - 9 + (width / 2)
      const z = (room.y / 50) - 6 + (depth / 2)

      const color = roomColors[room.type] || 0x64c8ff

      // Floor of the room
      const roomFloorGeo = new THREE.PlaneGeometry(width, depth)
      const roomFloorMat = new THREE.MeshStandardMaterial({ 
        color: color,
        opacity: 0.3,
        transparent: true
      })
      const roomFloor = new THREE.Mesh(roomFloorGeo, roomFloorMat)
      roomFloor.rotation.x = -Math.PI / 2
      roomFloor.position.set(x, 0.01, z)
      scene.add(roomFloor)

      // Walls
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: color,
        opacity: 0.7,
        transparent: true,
        side: THREE.DoubleSide
      })

      // Front wall
      const frontWall = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        wallMaterial
      )
      frontWall.position.set(x, height / 2, z + depth / 2)
      scene.add(frontWall)

      // Back wall
      const backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        wallMaterial
      )
      backWall.position.set(x, height / 2, z - depth / 2)
      scene.add(backWall)

      // Left wall
      const leftWall = new THREE.Mesh(
        new THREE.PlaneGeometry(depth, height),
        wallMaterial
      )
      leftWall.rotation.y = Math.PI / 2
      leftWall.position.set(x - width / 2, height / 2, z)
      scene.add(leftWall)

      // Right wall
      const rightWall = new THREE.Mesh(
        new THREE.PlaneGeometry(depth, height),
        wallMaterial
      )
      rightWall.rotation.y = Math.PI / 2
      rightWall.position.set(x + width / 2, height / 2, z)
      scene.add(rightWall)

      // Room label
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = 256
      canvas.height = 64
      context.fillStyle = '#ffffff'
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