import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'

function ThreeScene({ rooms, furniture, doors, windows, furnitureItems }) {
  const containerRef = useRef(null)
  const [isFirstPerson, setIsFirstPerson] = useState(false)
  const [controlsLocked, setControlsLocked] = useState(false)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const orbitControlsRef = useRef(null)
  const pointerControlsRef = useRef(null)
  const moveState = useRef({ forward: false, backward: false, left: false, right: false })
  const velocityRef = useRef(new THREE.Vector3())
  const directionRef = useRef(new THREE.Vector3())

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87CEEB) // Sky blue for first person
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(15, 15, 15)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Orbit Controls (default view)
    const orbitControls = new OrbitControls(camera, renderer.domElement)
    orbitControls.enableDamping = true
    orbitControls.dampingFactor = 0.05
    orbitControls.maxPolarAngle = Math.PI / 2.1
    orbitControlsRef.current = orbitControls

    // Pointer Lock Controls (first-person)
    const pointerControls = new PointerLockControls(camera, renderer.domElement)
    pointerControlsRef.current = pointerControls

    pointerControls.addEventListener('lock', () => {
      setControlsLocked(true)
    })

    pointerControls.addEventListener('unlock', () => {
      setControlsLocked(false)
    })

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    scene.add(directionalLight)

    // Add a second light for better indoor visibility
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 50)
    pointLight.position.set(0, 5, 0)
    scene.add(pointLight)

    // Base floor (larger for first person)
    const floorGeometry = new THREE.PlaneGeometry(100, 100)
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x3a7d3a, roughness: 0.8 })
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.01
    floor.receiveShadow = true
    scene.add(floor)

    // Grid
    const grid = new THREE.GridHelper(100, 100, 0x444444, 0x333333)
    grid.position.y = 0.01
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
      roomFloor.position.set(x, 0.02, z)
      scene.add(roomFloor)

      // Ceiling
      const ceilingGeo = new THREE.PlaneGeometry(width, depth)
      const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })
      const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat)
      ceiling.rotation.x = Math.PI / 2
      ceiling.position.set(x, height, z)
      scene.add(ceiling)

      // Walls with proper thickness for first-person view
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: wallColor,
        roughness: 0.9,
        side: THREE.DoubleSide
      })

      const wallThickness = 0.15

      // Front wall
      const frontWallGeo = new THREE.BoxGeometry(width + wallThickness, height, wallThickness)
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
      const sideWallGeo = new THREE.BoxGeometry(wallThickness, height, depth + wallThickness)
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

      // Room label (floating text)
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = 512
      canvas.height = 128
      context.fillStyle = 'rgba(0,0,0,0.7)'
      context.fillRect(0, 0, 512, 128)
      context.fillStyle = '#ffffff'
      context.font = 'bold 48px Arial'
      context.textAlign = 'center'
      context.fillText(room.type, 256, 80)
      
      const texture = new THREE.CanvasTexture(canvas)
      const labelMaterial = new THREE.SpriteMaterial({ map: texture })
      const label = new THREE.Sprite(labelMaterial)
      label.position.set(x, 2.2, z)
      label.scale.set(2, 0.5, 1)
      scene.add(label)
    })

    // Create 3D doors
    doors.forEach(door => {
      const doorWidth = door.width > door.height ? door.width / 50 : door.height / 50
      const doorDepth = 0.12
      const doorHeight = 2.2
      
      const x = (door.x / 50) - 9 + (door.width / 100)
      const z = (door.y / 50) - 6 + (door.height / 100)

      // Door frame
      const frameGeo = new THREE.BoxGeometry(doorWidth + 0.1, doorHeight + 0.1, doorDepth + 0.05)
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x5D3A1A, roughness: 0.8 })
      const frame = new THREE.Mesh(frameGeo, frameMat)
      frame.position.set(x, doorHeight / 2, z)
      scene.add(frame)

      // Door panel
      const doorGeo = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth)
      const doorMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 })
      const doorMesh = new THREE.Mesh(doorGeo, doorMat)
      doorMesh.position.set(x, doorHeight / 2, z)
      doorMesh.castShadow = true
      scene.add(doorMesh)

      // Door handle
      const handleGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.15, 16)
      const handleMat = new THREE.MeshStandardMaterial({ color: 0xFFD700, metalness: 0.8, roughness: 0.2 })
      const handle = new THREE.Mesh(handleGeo, handleMat)
      handle.rotation.x = Math.PI / 2
      handle.position.set(x + doorWidth / 3, 1.1, z + 0.1)
      scene.add(handle)
    })

    // Create 3D windows
    windows.forEach(window => {
      const windowWidth = window.width > window.height ? window.width / 50 : window.height / 50
      const windowDepth = 0.1
      const windowHeight = 1.2
      
      const x = (window.x / 50) - 9 + (window.width / 100)
      const z = (window.y / 50) - 6 + (window.height / 100)

      // Window frame
      const frameGeo = new THREE.BoxGeometry(windowWidth + 0.1, windowHeight + 0.1, windowDepth)
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x4682B4, roughness: 0.5 })
      const frame = new THREE.Mesh(frameGeo, frameMat)
      frame.position.set(x, 1.8, z)
      scene.add(frame)

      // Window glass
      const glassGeo = new THREE.BoxGeometry(windowWidth - 0.05, windowHeight - 0.05, 0.02)
      const glassMat = new THREE.MeshStandardMaterial({ 
        color: 0x87CEEB, 
        transparent: true, 
        opacity: 0.3,
        roughness: 0.1
      })
      const glass = new THREE.Mesh(glassGeo, glassMat)
      glass.position.set(x, 1.8, z)
      scene.add(glass)

      // Window dividers
      const dividerMat = new THREE.MeshStandardMaterial({ color: 0x4682B4 })
      const vDividerGeo = new THREE.BoxGeometry(0.03, windowHeight - 0.1, 0.03)
      const vDivider = new THREE.Mesh(vDividerGeo, dividerMat)
      vDivider.position.set(x, 1.8, z + 0.02)
      scene.add(vDivider)

      const hDividerGeo = new THREE.BoxGeometry(windowWidth - 0.1, 0.03, 0.03)
      const hDivider = new THREE.Mesh(hDividerGeo, dividerMat)
      hDivider.position.set(x, 1.8, z + 0.02)
      scene.add(hDivider)
    })

    // Create 3D furniture with more detail
    furniture.forEach(item => {
      const furnitureType = furnitureItems.find(f => f.type === item.type)
      const width = item.width / 50
      const depth = item.height / 50
      const x = (item.x / 50) - 9 + (width / 2)
      const z = (item.y / 50) - 6 + (depth / 2)
      
      let furnitureHeight = 0.4

      switch(item.type) {
        case 'sofa': furnitureHeight = 0.5; break
        case 'bed': furnitureHeight = 0.5; break
        case 'table': furnitureHeight = 0.75; break
        case 'chair': furnitureHeight = 0.85; break
        case 'desk': furnitureHeight = 0.75; break
        case 'wardrobe': furnitureHeight = 2.0; break
        case 'tv': furnitureHeight = 0.5; break
        case 'bathtub': furnitureHeight = 0.6; break
        case 'toilet': furnitureHeight = 0.7; break
        case 'sink': furnitureHeight = 0.85; break
        case 'stove': furnitureHeight = 0.9; break
        case 'fridge': furnitureHeight = 1.8; break
        default: furnitureHeight = 0.5
      }

      const geometry = new THREE.BoxGeometry(width, furnitureHeight, depth)
      const material = new THREE.MeshStandardMaterial({ 
        color: furnitureType?.color || 0x666666,
        roughness: 0.6
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(x, furnitureHeight / 2, z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      scene.add(mesh)

      // Add label above furniture
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = 256
      canvas.height = 64
      context.fillStyle = 'rgba(0,0,0,0.5)'
      context.fillRect(0, 0, 256, 64)
      context.fillStyle = '#ffffff'
      context.font = 'bold 24px Arial'
      context.textAlign = 'center'
      context.fillText(furnitureType?.label || '', 128, 42)
      
      const texture = new THREE.CanvasTexture(canvas)
      const labelMaterial = new THREE.SpriteMaterial({ map: texture })
      const label = new THREE.Sprite(labelMaterial)
      label.position.set(x, furnitureHeight + 0.3, z)
      label.scale.set(1, 0.25, 1)
      scene.add(label)
    })

    // Keyboard controls
    const onKeyDown = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveState.current.forward = true
          break
        case 'ArrowDown':
        case 'KeyS':
          moveState.current.backward = true
          break
        case 'ArrowLeft':
        case 'KeyA':
          moveState.current.left = true
          break
        case 'ArrowRight':
        case 'KeyD':
          moveState.current.right = true
          break
        case 'Escape':
          if (pointerControls.isLocked) {
            pointerControls.unlock()
          }
          break
      }
    }

    const onKeyUp = (event) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveState.current.forward = false
          break
        case 'ArrowDown':
        case 'KeyS':
          moveState.current.backward = false
          break
        case 'ArrowLeft':
        case 'KeyA':
          moveState.current.left = false
          break
        case 'ArrowRight':
        case 'KeyD':
          moveState.current.right = false
          break
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)

    // Animation loop
    const clock = new THREE.Clock()
    
    const animate = () => {
      requestAnimationFrame(animate)
      
      const delta = clock.getDelta()

      if (pointerControls.isLocked) {
        // First-person movement
        const velocity = velocityRef.current
        const direction = directionRef.current

        velocity.x -= velocity.x * 10.0 * delta
        velocity.z -= velocity.z * 10.0 * delta

        direction.z = Number(moveState.current.forward) - Number(moveState.current.backward)
        direction.x = Number(moveState.current.right) - Number(moveState.current.left)
        direction.normalize()

        const speed = 8.0

        if (moveState.current.forward || moveState.current.backward) {
          velocity.z -= direction.z * speed * delta
        }
        if (moveState.current.left || moveState.current.right) {
          velocity.x -= direction.x * speed * delta
        }

        pointerControls.moveRight(-velocity.x)
        pointerControls.moveForward(-velocity.z)

        // Keep camera at eye level
        camera.position.y = 1.7
      } else {
        orbitControls.update()
      }

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
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [rooms, furniture, doors, windows, furnitureItems])

  const enterFirstPerson = () => {
    if (pointerControlsRef.current && cameraRef.current) {
      // Position camera inside the first room or center
      if (rooms.length > 0) {
        const room = rooms[0]
        const x = (room.x / 50) - 9 + (room.width / 100)
        const z = (room.y / 50) - 6 + (room.height / 100)
        cameraRef.current.position.set(x, 1.7, z)
      } else {
        cameraRef.current.position.set(0, 1.7, 0)
      }
      pointerControlsRef.current.lock()
      setIsFirstPerson(true)
    }
  }

  const exitFirstPerson = () => {
    if (pointerControlsRef.current) {
      pointerControlsRef.current.unlock()
      setIsFirstPerson(false)
      // Reset camera to orbit view
      if (cameraRef.current) {
        cameraRef.current.position.set(15, 15, 15)
        cameraRef.current.lookAt(0, 0, 0)
      }
    }
  }

  return (
    <div style={{ position: 'relative' }}>
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
      
      {/* View mode toggle */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        display: 'flex',
        gap: '10px',
        zIndex: 100
      }}>
        <button
          onClick={() => {
            if (isFirstPerson) {
              exitFirstPerson()
            }
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: !isFirstPerson ? '#64c8ff' : '#444',
            color: !isFirstPerson ? '#000' : '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Orbit View
        </button>
        <button
          onClick={enterFirstPerson}
          disabled={rooms.length === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: isFirstPerson ? '#27ae60' : '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: rooms.length === 0 ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: rooms.length === 0 ? 0.5 : 1
          }}
        >
          🚶 Walk Inside
        </button>
      </div>

      {/* First-person controls hint */}
      {controlsLocked && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: '#fff',
          padding: '15px 25px',
          borderRadius: '8px',
          fontSize: '14px',
          zIndex: 100,
          textAlign: 'center'
        }}>
          <strong>🎮 First-Person Mode</strong><br/>
          WASD or Arrow Keys to move | Mouse to look | ESC to exit
        </div>
      )}

      {/* Click to start hint */}
      {isFirstPerson && !controlsLocked && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0,0,0,0.9)',
          color: '#fff',
          padding: '30px 50px',
          borderRadius: '12px',
          fontSize: '18px',
          zIndex: 100,
          textAlign: 'center',
          cursor: 'pointer'
        }}
        onClick={enterFirstPerson}
        >
          <strong>🖱️ Click to Start Walking</strong><br/>
          <span style={{ fontSize: '14px', color: '#aaa' }}>Press ESC to exit first-person mode</span>
        </div>
      )}
    </div>
  )
}

export default ThreeScene