import { useState, useRef, useEffect } from 'react'
import './App.css'
import ThreeScene from './ThreeScene'

function App() {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [rooms, setRooms] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [selectedRoomType, setSelectedRoomType] = useState('Living Room')
  const [selectedWallColor, setSelectedWallColor] = useState('#ffffff')
  const [selectedFloorType, setSelectedFloorType] = useState('wood')
  const [viewMode, setViewMode] = useState('2d')
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(null)

  const roomTypes = [
    { name: 'Living Room', color: 'rgba(100, 200, 255, 0.3)', border: '#64c8ff' },
    { name: 'Bedroom', color: 'rgba(200, 150, 255, 0.3)', border: '#c896ff' },
    { name: 'Kitchen', color: 'rgba(255, 200, 100, 0.3)', border: '#ffc864' },
    { name: 'Bathroom', color: 'rgba(100, 255, 200, 0.3)', border: '#64ffc8' },
    { name: 'Dining Room', color: 'rgba(255, 150, 150, 0.3)', border: '#ff9696' },
    { name: 'Office', color: 'rgba(200, 200, 200, 0.3)', border: '#c8c8c8' },
  ]

  const wallColors = [
    { name: 'White', color: '#ffffff' },
    { name: 'Cream', color: '#f5f5dc' },
    { name: 'Light Gray', color: '#d3d3d3' },
    { name: 'Light Blue', color: '#add8e6' },
    { name: 'Light Green', color: '#90ee90' },
    { name: 'Light Pink', color: '#ffb6c1' },
    { name: 'Lavender', color: '#e6e6fa' },
    { name: 'Peach', color: '#ffdab9' },
  ]

  const floorTypes = [
    { name: 'wood', label: '🪵 Wood', color: '#8B4513', pattern: 'wood' },
    { name: 'tile', label: '🔲 Tile', color: '#b0c4de', pattern: 'tile' },
    { name: 'carpet', label: '🟫 Carpet', color: '#696969', pattern: 'carpet' },
    { name: 'marble', label: '⬜ Marble', color: '#f0f0f0', pattern: 'marble' },
    { name: 'concrete', label: 'ite Concrete', color: '#808080', pattern: 'concrete' },
  ]

  const getSelectedRoomStyle = () => {
    return roomTypes.find(r => r.name === selectedRoomType) || roomTypes[0]
  }

  useEffect(() => {
    if (viewMode !== '2d') return
    
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    
    // Clear canvas
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Draw grid
    ctx.strokeStyle = '#2a2a4e'
    ctx.lineWidth = 1
    for (let x = 0; x <= canvas.width; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y <= canvas.height; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }
    
    // Draw saved rooms
    rooms.forEach((room, index) => {
      // Draw floor pattern
      const floorType = floorTypes.find(f => f.name === room.floorType) || floorTypes[0]
      ctx.fillStyle = floorType.color
      ctx.globalAlpha = 0.5
      ctx.fillRect(room.x, room.y, room.width, room.height)
      ctx.globalAlpha = 1.0

      // Draw floor pattern overlay
      if (room.floorType === 'wood') {
        ctx.strokeStyle = '#5D3A1A'
        ctx.lineWidth = 1
        for (let i = room.y; i < room.y + room.height; i += 15) {
          ctx.beginPath()
          ctx.moveTo(room.x, i)
          ctx.lineTo(room.x + room.width, i)
          ctx.stroke()
        }
      } else if (room.floorType === 'tile') {
        ctx.strokeStyle = '#8a9aae'
        ctx.lineWidth = 1
        for (let i = room.x; i < room.x + room.width; i += 25) {
          ctx.beginPath()
          ctx.moveTo(i, room.y)
          ctx.lineTo(i, room.y + room.height)
          ctx.stroke()
        }
        for (let i = room.y; i < room.y + room.height; i += 25) {
          ctx.beginPath()
          ctx.moveTo(room.x, i)
          ctx.lineTo(room.x + room.width, i)
          ctx.stroke()
        }
      }
      
      // Draw wall color border (thick)
      ctx.strokeStyle = room.wallColor || '#ffffff'
      ctx.lineWidth = 6
      ctx.strokeRect(room.x + 3, room.y + 3, room.width - 6, room.height - 6)

      // Draw room type border
      const roomStyle = roomTypes.find(r => r.name === room.type) || roomTypes[0]
      ctx.strokeStyle = selectedRoomIndex === index ? '#ffff00' : roomStyle.border
      ctx.lineWidth = 2
      ctx.strokeRect(room.x, room.y, room.width, room.height)
      
      // Draw room name
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 14px Arial'
      ctx.fillText(room.type, room.x + 8, room.y + 22)
      
      // Draw dimensions
      ctx.font = '12px Arial'
      ctx.fillStyle = '#cccccc'
      const widthM = (room.width / 50).toFixed(1)
      const heightM = (room.height / 50).toFixed(1)
      ctx.fillText(`${widthM}m × ${heightM}m`, room.x + 8, room.y + 40)
      
      // Draw area
      const area = ((room.width / 50) * (room.height / 50)).toFixed(1)
      ctx.fillText(`${area} m²`, room.x + 8, room.y + 56)

      // Show floor type
      const floorLabel = floorTypes.find(f => f.name === room.floorType)?.label || '🪵 Wood'
      ctx.fillText(floorLabel, room.x + 8, room.y + 72)
    })
    
    // Draw current room being drawn
    if (currentRoom) {
      const style = getSelectedRoomStyle()
      const floorType = floorTypes.find(f => f.name === selectedFloorType) || floorTypes[0]
      
      ctx.fillStyle = floorType.color
      ctx.globalAlpha = 0.5
      ctx.fillRect(currentRoom.x, currentRoom.y, currentRoom.width, currentRoom.height)
      ctx.globalAlpha = 1.0

      ctx.strokeStyle = selectedWallColor
      ctx.lineWidth = 6
      ctx.strokeRect(currentRoom.x + 3, currentRoom.y + 3, currentRoom.width - 6, currentRoom.height - 6)
      
      ctx.strokeStyle = style.border
      ctx.lineWidth = 2
      ctx.strokeRect(currentRoom.x, currentRoom.y, currentRoom.width, currentRoom.height)
      
      // Show live dimensions
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 16px Arial'
      const widthM = (Math.abs(currentRoom.width) / 50).toFixed(1)
      const heightM = (Math.abs(currentRoom.height) / 50).toFixed(1)
      const area = (widthM * heightM).toFixed(1)
      ctx.fillText(`${selectedRoomType}: ${widthM}m × ${heightM}m (${area} m²)`, 
        Math.min(currentRoom.x, currentRoom.x + currentRoom.width) + 5, 
        Math.min(currentRoom.y, currentRoom.y + currentRoom.height) - 10)
    }
  }, [rooms, currentRoom, selectedRoomType, viewMode, selectedRoomIndex, selectedWallColor, selectedFloorType])

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicking on existing room
    const clickedRoomIndex = rooms.findIndex(room => 
      x >= room.x && x <= room.x + room.width &&
      y >= room.y && y <= room.y + room.height
    )

    if (clickedRoomIndex !== -1) {
      setSelectedRoomIndex(clickedRoomIndex)
      return
    }

    setSelectedRoomIndex(null)
    setIsDrawing(true)
    setStartPos({ x, y })
    setCurrentRoom({ x, y, width: 0, height: 0 })
  }

  const handleMouseMove = (e) => {
    if (!isDrawing) return
    
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setCurrentRoom({
      x: startPos.x,
      y: startPos.y,
      width: x - startPos.x,
      height: y - startPos.y
    })
  }

  const handleMouseUp = () => {
    if (currentRoom && (Math.abs(currentRoom.width) > 20 && Math.abs(currentRoom.height) > 20)) {
      const normalizedRoom = {
        x: currentRoom.width < 0 ? currentRoom.x + currentRoom.width : currentRoom.x,
        y: currentRoom.height < 0 ? currentRoom.y + currentRoom.height : currentRoom.y,
        width: Math.abs(currentRoom.width),
        height: Math.abs(currentRoom.height),
        type: selectedRoomType,
        wallColor: selectedWallColor,
        floorType: selectedFloorType
      }
      setRooms([...rooms, normalizedRoom])
    }
    setIsDrawing(false)
    setCurrentRoom(null)
  }

  const updateSelectedRoom = (property, value) => {
    if (selectedRoomIndex === null) return
    const updatedRooms = [...rooms]
    updatedRooms[selectedRoomIndex] = {
      ...updatedRooms[selectedRoomIndex],
      [property]: value
    }
    setRooms(updatedRooms)
  }

  const deleteSelectedRoom = () => {
    if (selectedRoomIndex === null) return
    setRooms(rooms.filter((_, index) => index !== selectedRoomIndex))
    setSelectedRoomIndex(null)
  }

  const clearCanvas = () => {
    setRooms([])
    setSelectedRoomIndex(null)
  }

  const undoLast = () => {
    setRooms(rooms.slice(0, -1))
    setSelectedRoomIndex(null)
  }

  const totalArea = rooms.reduce((sum, room) => {
    return sum + (room.width / 50) * (room.height / 50)
  }, 0).toFixed(1)

  return (
    <div className="app">
      <header className="header">
        <h1>🏠 ChalsHomeDesign</h1>
        <p>Select room type → Choose colors → Click and drag to draw</p>
      </header>
      
      <div className="toolbar">
        <div className="toolbar-section">
          <label>Room Type:</label>
          <div className="room-selector">
            {roomTypes.map(room => (
              <button
                key={room.name}
                className={`room-btn ${selectedRoomType === room.name ? 'active' : ''}`}
                style={{ 
                  borderColor: room.border,
                  backgroundColor: selectedRoomType === room.name ? room.color : 'transparent'
                }}
                onClick={() => setSelectedRoomType(room.name)}
                disabled={viewMode === '3d'}
              >
                {room.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="toolbar secondary">
        <div className="toolbar-section">
          <label>Wall Color:</label>
          <div className="color-picker">
            {wallColors.map(wc => (
              <button
                key={wc.color}
                className={`color-btn ${selectedWallColor === wc.color ? 'active' : ''}`}
                style={{ backgroundColor: wc.color }}
                onClick={() => {
                  setSelectedWallColor(wc.color)
                  if (selectedRoomIndex !== null) {
                    updateSelectedRoom('wallColor', wc.color)
                  }
                }}
                title={wc.name}
                disabled={viewMode === '3d'}
              />
            ))}
          </div>
        </div>

        <div className="toolbar-section">
          <label>Floor:</label>
          <div className="floor-picker">
            {floorTypes.map(ft => (
              <button
                key={ft.name}
                className={`floor-btn ${selectedFloorType === ft.name ? 'active' : ''}`}
                style={{ backgroundColor: ft.color }}
                onClick={() => {
                  setSelectedFloorType(ft.name)
                  if (selectedRoomIndex !== null) {
                    updateSelectedRoom('floorType', ft.name)
                  }
                }}
                disabled={viewMode === '3d'}
              >
                {ft.label}
              </button>
            ))}
          </div>
        </div>

        <div className="actions">
          {selectedRoomIndex !== null && (
            <button onClick={deleteSelectedRoom} className="delete-btn">🗑️ Delete Room</button>
          )}
          <button onClick={undoLast} disabled={rooms.length === 0 || viewMode === '3d'}>↩️ Undo</button>
          <button onClick={clearCanvas} className="clear-btn" disabled={viewMode === '3d'}>🗑️ Clear All</button>
        </div>
      </div>

      <div className="stats">
        <span>Rooms: <strong>{rooms.length}</strong></span>
        <span>Total Area: <strong>{totalArea} m²</strong></span>
        {selectedRoomIndex !== null && (
          <span className="selected-info">✏️ Editing: <strong>{rooms[selectedRoomIndex]?.type}</strong></span>
        )}
        <div className="view-toggle">
          <button 
            className={viewMode === '2d' ? 'active' : ''} 
            onClick={() => setViewMode('2d')}
          >
            📐 2D View
          </button>
          <button 
            className={viewMode === '3d' ? 'active' : ''} 
            onClick={() => setViewMode('3d')}
            disabled={rooms.length === 0}
          >
            🎮 3D View
          </button>
        </div>
      </div>
      
      <main className="workspace">
        {viewMode === '2d' ? (
          <canvas
            ref={canvasRef}
            width={900}
            height={600}
            className="floor-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        ) : (
          <ThreeScene rooms={rooms} />
        )}
      </main>

      {viewMode === '2d' && selectedRoomIndex !== null && (
        <div className="edit-hint">
          💡 Click a room to select it, then change wall color or floor type above
        </div>
      )}

      {viewMode === '3d' && (
        <div className="controls-hint">
          <p>🖱️ Left click + drag to rotate • Scroll to zoom • Right click + drag to pan</p>
        </div>
      )}
    </div>
  )
}

export default App