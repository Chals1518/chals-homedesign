import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [rooms, setRooms] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [selectedRoomType, setSelectedRoomType] = useState('Living Room')

  const roomTypes = [
    { name: 'Living Room', color: 'rgba(100, 200, 255, 0.3)', border: '#64c8ff' },
    { name: 'Bedroom', color: 'rgba(200, 150, 255, 0.3)', border: '#c896ff' },
    { name: 'Kitchen', color: 'rgba(255, 200, 100, 0.3)', border: '#ffc864' },
    { name: 'Bathroom', color: 'rgba(100, 255, 200, 0.3)', border: '#64ffc8' },
    { name: 'Dining Room', color: 'rgba(255, 150, 150, 0.3)', border: '#ff9696' },
    { name: 'Office', color: 'rgba(200, 200, 200, 0.3)', border: '#c8c8c8' },
  ]

  const getSelectedRoomStyle = () => {
    return roomTypes.find(r => r.name === selectedRoomType) || roomTypes[0]
  }

  useEffect(() => {
    const canvas = canvasRef.current
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
    rooms.forEach(room => {
      const roomStyle = roomTypes.find(r => r.name === room.type) || roomTypes[0]
      
      ctx.fillStyle = roomStyle.color
      ctx.fillRect(room.x, room.y, room.width, room.height)
      ctx.strokeStyle = roomStyle.border
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
    })
    
    // Draw current room being drawn
    if (currentRoom) {
      const style = getSelectedRoomStyle()
      ctx.fillStyle = style.color
      ctx.fillRect(currentRoom.x, currentRoom.y, currentRoom.width, currentRoom.height)
      ctx.strokeStyle = style.border
      ctx.lineWidth = 3
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
  }, [rooms, currentRoom, selectedRoomType])

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
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
        type: selectedRoomType
      }
      setRooms([...rooms, normalizedRoom])
    }
    setIsDrawing(false)
    setCurrentRoom(null)
  }

  const clearCanvas = () => {
    setRooms([])
  }

  const undoLast = () => {
    setRooms(rooms.slice(0, -1))
  }

  // Calculate total area
  const totalArea = rooms.reduce((sum, room) => {
    return sum + (room.width / 50) * (room.height / 50)
  }, 0).toFixed(1)

  return (
    <div className="app">
      <header className="header">
        <h1>🏠 ChalsHomeDesign</h1>
        <p>Select room type → Click and drag to draw → Grid = 1 meter</p>
      </header>
      
      <div className="toolbar">
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
            >
              {room.name}
            </button>
          ))}
        </div>
        <div className="actions">
          <button onClick={undoLast} disabled={rooms.length === 0}>↩️ Undo</button>
          <button onClick={clearCanvas} className="clear-btn">🗑️ Clear All</button>
        </div>
      </div>

      <div className="stats">
        <span>Rooms: <strong>{rooms.length}</strong></span>
        <span>Total Area: <strong>{totalArea} m²</strong></span>
      </div>
      
      <main className="workspace">
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
      </main>
    </div>
  )
}

export default App