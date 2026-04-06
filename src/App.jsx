import { useState, useRef, useEffect } from 'react'
import './App.css'
import ThreeScene from './ThreeScene'

function App() {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [rooms, setRooms] = useState([])
  const [furniture, setFurniture] = useState([])
  const [currentRoom, setCurrentRoom] = useState(null)
  const [selectedRoomType, setSelectedRoomType] = useState('Living Room')
  const [selectedWallColor, setSelectedWallColor] = useState('#ffffff')
  const [selectedFloorType, setSelectedFloorType] = useState('wood')
  const [viewMode, setViewMode] = useState('2d')
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(null)
  const [selectedFurnitureIndex, setSelectedFurnitureIndex] = useState(null)
  const [draggingFurniture, setDraggingFurniture] = useState(null)
  const [isDraggingExisting, setIsDraggingExisting] = useState(false)
  const [mode, setMode] = useState('room')
  const [showBudget, setShowBudget] = useState(false)

  const roomTypes = [
    { name: 'Living Room', color: 'rgba(100, 200, 255, 0.3)', border: '#64c8ff' },
    { name: 'Bedroom', color: 'rgba(200, 150, 255, 0.3)', border: '#c896ff' },
    { name: 'Kitchen', color: 'rgba(255, 200, 100, 0.3)', border: '#ffc864' },
    { name: 'Bathroom', color: 'rgba(100, 255, 200, 0.3)', border: '#64ffc8' },
    { name: 'Dining Room', color: 'rgba(255, 150, 150, 0.3)', border: '#ff9696' },
    { name: 'Office', color: 'rgba(200, 200, 200, 0.3)', border: '#c8c8c8' },
  ]

  const wallColors = [
    { name: 'White', color: '#ffffff', pricePerSqm: 5 },
    { name: 'Cream', color: '#f5f5dc', pricePerSqm: 6 },
    { name: 'Light Gray', color: '#d3d3d3', pricePerSqm: 6 },
    { name: 'Light Blue', color: '#add8e6', pricePerSqm: 7 },
    { name: 'Light Green', color: '#90ee90', pricePerSqm: 7 },
    { name: 'Light Pink', color: '#ffb6c1', pricePerSqm: 7 },
    { name: 'Lavender', color: '#e6e6fa', pricePerSqm: 8 },
    { name: 'Peach', color: '#ffdab9', pricePerSqm: 8 },
  ]

  const floorTypes = [
    { name: 'wood', label: 'Wood', color: '#8B4513', pricePerSqm: 45 },
    { name: 'tile', label: 'Tile', color: '#b0c4de', pricePerSqm: 35 },
    { name: 'carpet', label: 'Carpet', color: '#696969', pricePerSqm: 25 },
    { name: 'marble', label: 'Marble', color: '#f0f0f0', pricePerSqm: 80 },
    { name: 'concrete', label: 'Concrete', color: '#808080', pricePerSqm: 20 },
  ]

  const furnitureItems = [
    { type: 'sofa', label: 'Sofa', width: 80, height: 35, color: '#4a6fa5', price: 599 },
    { type: 'bed', label: 'Bed', width: 70, height: 90, color: '#8b5a2b', price: 449 },
    { type: 'table', label: 'Table', width: 60, height: 40, color: '#deb887', price: 199 },
    { type: 'chair', label: 'Chair', width: 25, height: 25, color: '#cd853f', price: 89 },
    { type: 'desk', label: 'Desk', width: 60, height: 30, color: '#a0522d', price: 249 },
    { type: 'wardrobe', label: 'Wardrobe', width: 50, height: 25, color: '#8b4513', price: 399 },
    { type: 'tv', label: 'TV Stand', width: 60, height: 20, color: '#2f2f2f', price: 179 },
    { type: 'bathtub', label: 'Bathtub', width: 70, height: 35, color: '#e0e0e0', price: 699 },
    { type: 'toilet', label: 'Toilet', width: 25, height: 30, color: '#f5f5f5', price: 199 },
    { type: 'sink', label: 'Sink', width: 30, height: 25, color: '#d3d3d3', price: 149 },
    { type: 'stove', label: 'Stove', width: 35, height: 30, color: '#1a1a1a', price: 549 },
    { type: 'fridge', label: 'Fridge', width: 35, height: 35, color: '#c0c0c0', price: 799 },
  ]

  const getSelectedRoomStyle = () => {
    return roomTypes.find(r => r.name === selectedRoomType) || roomTypes[0]
  }

  // Calculate budget
  const calculateBudget = () => {
    let flooringCost = 0
    let paintCost = 0
    let furnitureCost = 0
    const flooringDetails = []
    const paintDetails = []
    const furnitureDetails = []

    rooms.forEach(room => {
      const area = (room.width / 50) * (room.height / 50)
      const wallHeight = 2.8
      const perimeter = 2 * ((room.width / 50) + (room.height / 50))
      const wallArea = perimeter * wallHeight

      const floor = floorTypes.find(f => f.name === room.floorType) || floorTypes[0]
      const floorCost = area * floor.pricePerSqm
      flooringCost += floorCost
      flooringDetails.push({
        room: room.type,
        area: area.toFixed(1),
        type: floor.label,
        cost: floorCost.toFixed(0)
      })

      const paint = wallColors.find(w => w.color === room.wallColor) || wallColors[0]
      const paintCostRoom = wallArea * paint.pricePerSqm
      paintCost += paintCostRoom
      paintDetails.push({
        room: room.type,
        area: wallArea.toFixed(1),
        color: paint.name,
        cost: paintCostRoom.toFixed(0)
      })
    })

    furniture.forEach(item => {
      const furn = furnitureItems.find(f => f.type === item.type)
      if (furn) {
        furnitureCost += furn.price
        const existing = furnitureDetails.find(d => d.type === furn.label)
        if (existing) {
          existing.quantity += 1
          existing.cost = existing.quantity * furn.price
        } else {
          furnitureDetails.push({
            type: furn.label,
            quantity: 1,
            unitPrice: furn.price,
            cost: furn.price
          })
        }
      }
    })

    return {
      flooring: { total: flooringCost, details: flooringDetails },
      paint: { total: paintCost, details: paintDetails },
      furniture: { total: furnitureCost, details: furnitureDetails },
      grandTotal: flooringCost + paintCost + furnitureCost
    }
  }

  const budget = calculateBudget()

  useEffect(() => {
    if (viewMode !== '2d') return
    
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
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
    
    rooms.forEach((room, index) => {
      const floorType = floorTypes.find(f => f.name === room.floorType) || floorTypes[0]
      ctx.fillStyle = floorType.color
      ctx.globalAlpha = 0.5
      ctx.fillRect(room.x, room.y, room.width, room.height)
      ctx.globalAlpha = 1.0

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
      
      ctx.strokeStyle = room.wallColor || '#ffffff'
      ctx.lineWidth = 6
      ctx.strokeRect(room.x + 3, room.y + 3, room.width - 6, room.height - 6)

      const roomStyle = roomTypes.find(r => r.name === room.type) || roomTypes[0]
      ctx.strokeStyle = selectedRoomIndex === index ? '#ffff00' : roomStyle.border
      ctx.lineWidth = 2
      ctx.strokeRect(room.x, room.y, room.width, room.height)
      
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 14px Arial'
      ctx.fillText(room.type, room.x + 8, room.y + 22)
      
      ctx.font = '12px Arial'
      ctx.fillStyle = '#cccccc'
      const widthM = (room.width / 50).toFixed(1)
      const heightM = (room.height / 50).toFixed(1)
      ctx.fillText(widthM + 'm x ' + heightM + 'm', room.x + 8, room.y + 40)
    })
    
    furniture.forEach((item, index) => {
      const furnitureType = furnitureItems.find(f => f.type === item.type)
      
      ctx.fillStyle = furnitureType?.color || '#666'
      ctx.fillRect(item.x, item.y, item.width, item.height)
      
      ctx.strokeStyle = selectedFurnitureIndex === index ? '#ffff00' : '#333'
      ctx.lineWidth = selectedFurnitureIndex === index ? 3 : 2
      ctx.strokeRect(item.x, item.y, item.width, item.height)
      
      ctx.fillStyle = '#fff'
      ctx.font = '11px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(furnitureType?.label || '', item.x + item.width/2, item.y + item.height/2 + 4)
      ctx.textAlign = 'left'
    })

    if (draggingFurniture && !isDraggingExisting) {
      const furnitureType = furnitureItems.find(f => f.type === draggingFurniture.type)
      ctx.globalAlpha = 0.6
      ctx.fillStyle = furnitureType?.color || '#666'
      ctx.fillRect(draggingFurniture.x, draggingFurniture.y, draggingFurniture.width, draggingFurniture.height)
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.strokeRect(draggingFurniture.x, draggingFurniture.y, draggingFurniture.width, draggingFurniture.height)
      ctx.globalAlpha = 1.0
    }
    
    if (currentRoom && mode === 'room') {
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
      
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 16px Arial'
      const widthM = (Math.abs(currentRoom.width) / 50).toFixed(1)
      const heightM = (Math.abs(currentRoom.height) / 50).toFixed(1)
      const area = (widthM * heightM).toFixed(1)
      ctx.fillText(selectedRoomType + ': ' + widthM + 'm x ' + heightM + 'm (' + area + ' m2)', 
        Math.min(currentRoom.x, currentRoom.x + currentRoom.width) + 5, 
        Math.min(currentRoom.y, currentRoom.y + currentRoom.height) - 10)
    }
  }, [rooms, furniture, currentRoom, selectedRoomType, viewMode, selectedRoomIndex, selectedFurnitureIndex, selectedWallColor, selectedFloorType, draggingFurniture, isDraggingExisting, mode])

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const clickedFurnitureIndex = furniture.findIndex(item => 
      x >= item.x && x <= item.x + item.width &&
      y >= item.y && y <= item.y + item.height
    )

    if (clickedFurnitureIndex !== -1) {
      setSelectedFurnitureIndex(clickedFurnitureIndex)
      setSelectedRoomIndex(null)
      setIsDraggingExisting(true)
      setDraggingFurniture({
        ...furniture[clickedFurnitureIndex],
        offsetX: x - furniture[clickedFurnitureIndex].x,
        offsetY: y - furniture[clickedFurnitureIndex].y
      })
      return
    }

    const clickedRoomIndex = rooms.findIndex(room => 
      x >= room.x && x <= room.x + room.width &&
      y >= room.y && y <= room.y + room.height
    )

    if (clickedRoomIndex !== -1 && mode === 'room') {
      setSelectedRoomIndex(clickedRoomIndex)
      setSelectedFurnitureIndex(null)
      return
    }

    setSelectedRoomIndex(null)
    setSelectedFurnitureIndex(null)

    if (mode === 'room') {
      setIsDrawing(true)
      setStartPos({ x, y })
      setCurrentRoom({ x, y, width: 0, height: 0 })
    }
  }

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isDraggingExisting && draggingFurniture) {
      const updatedFurniture = [...furniture]
      updatedFurniture[selectedFurnitureIndex] = {
        ...updatedFurniture[selectedFurnitureIndex],
        x: x - draggingFurniture.offsetX,
        y: y - draggingFurniture.offsetY
      }
      setFurniture(updatedFurniture)
      return
    }

    if (draggingFurniture && !isDraggingExisting) {
      setDraggingFurniture({
        ...draggingFurniture,
        x: x - draggingFurniture.width / 2,
        y: y - draggingFurniture.height / 2
      })
      return
    }

    if (!isDrawing || mode !== 'room') return
    
    setCurrentRoom({
      x: startPos.x,
      y: startPos.y,
      width: x - startPos.x,
      height: y - startPos.y
    })
  }

  const handleMouseUp = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isDraggingExisting) {
      setIsDraggingExisting(false)
      setDraggingFurniture(null)
      return
    }

    if (draggingFurniture && !isDraggingExisting) {
      const newFurniture = {
        type: draggingFurniture.type,
        x: x - draggingFurniture.width / 2,
        y: y - draggingFurniture.height / 2,
        width: draggingFurniture.width,
        height: draggingFurniture.height,
        rotation: 0
      }
      setFurniture([...furniture, newFurniture])
      setDraggingFurniture(null)
      return
    }

    if (currentRoom && mode === 'room' && (Math.abs(currentRoom.width) > 20 && Math.abs(currentRoom.height) > 20)) {
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

  const handleFurnitureDragStart = (item) => {
    setDraggingFurniture({
      type: item.type,
      width: item.width,
      height: item.height,
      x: 0,
      y: 0
    })
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

  const deleteSelectedFurniture = () => {
    if (selectedFurnitureIndex === null) return
    setFurniture(furniture.filter((_, index) => index !== selectedFurnitureIndex))
    setSelectedFurnitureIndex(null)
  }

  const rotateFurniture = () => {
    if (selectedFurnitureIndex === null) return
    const updatedFurniture = [...furniture]
    const item = updatedFurniture[selectedFurnitureIndex]
    updatedFurniture[selectedFurnitureIndex] = {
      ...item,
      width: item.height,
      height: item.width,
      rotation: (item.rotation || 0) + 90
    }
    setFurniture(updatedFurniture)
  }

  const clearCanvas = () => {
    setRooms([])
    setFurniture([])
    setSelectedRoomIndex(null)
    setSelectedFurnitureIndex(null)
  }

  const undoLast = () => {
    if (furniture.length > 0) {
      setFurniture(furniture.slice(0, -1))
    } else if (rooms.length > 0) {
      setRooms(rooms.slice(0, -1))
    }
    setSelectedRoomIndex(null)
    setSelectedFurnitureIndex(null)
  }

  const totalArea = rooms.reduce((sum, room) => {
    return sum + (room.width / 50) * (room.height / 50)
  }, 0).toFixed(1)

  return (
    <div className="app">
      <header className="header">
        <h1>ChalsHomeDesign</h1>
        <p>Draw rooms - Add furniture - See in 3D - Calculate Budget</p>
      </header>
      
      <div className="mode-toggle">
        <button 
          className={mode === 'room' ? 'active' : ''} 
          onClick={() => setMode('room')}
          disabled={viewMode === '3d'}
        >
          Draw Rooms
        </button>
        <button 
          className={mode === 'furniture' ? 'active' : ''} 
          onClick={() => setMode('furniture')}
          disabled={viewMode === '3d'}
        >
          Add Furniture
        </button>
        <button 
          className={showBudget ? 'active budget-btn' : 'budget-btn'}
          onClick={() => setShowBudget(!showBudget)}
        >
          Budget Calculator
        </button>
      </div>

      {mode === 'room' && viewMode === '2d' && !showBudget && (
        <>
          <div className="toolbar">
            <div className="toolbar-section">
              <label>Room Type:</label>
              <div className="room-selector">
                {roomTypes.map(room => (
                  <button
                    key={room.name}
                    className={'room-btn ' + (selectedRoomType === room.name ? 'active' : '')}
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
            </div>
          </div>

          <div className="toolbar secondary">
            <div className="toolbar-section">
              <label>Wall Color:</label>
              <div className="color-picker">
                {wallColors.map(wc => (
                  <button
                    key={wc.color}
                    className={'color-btn ' + (selectedWallColor === wc.color ? 'active' : '')}
                    style={{ backgroundColor: wc.color }}
                    onClick={() => {
                      setSelectedWallColor(wc.color)
                      if (selectedRoomIndex !== null) {
                        updateSelectedRoom('wallColor', wc.color)
                      }
                    }}
                    title={wc.name}
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
                    className={'floor-btn ' + (selectedFloorType === ft.name ? 'active' : '')}
                    style={{ backgroundColor: ft.color }}
                    onClick={() => {
                      setSelectedFloorType(ft.name)
                      if (selectedRoomIndex !== null) {
                        updateSelectedRoom('floorType', ft.name)
                      }
                    }}
                  >
                    {ft.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {mode === 'furniture' && viewMode === '2d' && !showBudget && (
        <div className="furniture-panel">
          <label>Drag furniture to canvas:</label>
          <div className="furniture-items">
            {furnitureItems.map(item => (
              <div
                key={item.type}
                className="furniture-item"
                draggable
                onDragStart={() => handleFurnitureDragStart(item)}
                onMouseDown={() => handleFurnitureDragStart(item)}
                style={{ backgroundColor: item.color }}
              >
                {item.label} - ${item.price}
              </div>
            ))}
          </div>
        </div>
      )}

      {showBudget && (
        <div className="budget-panel">
          <div className="budget-header">
            <h2>Budget Estimate</h2>
            <div className="grand-total">
              Total: <span>${budget.grandTotal.toFixed(0)}</span>
            </div>
          </div>

          <div className="budget-sections">
            <div className="budget-section">
              <h3>Flooring - ${budget.flooring.total.toFixed(0)}</h3>
              {budget.flooring.details.length === 0 ? (
                <p className="no-items">No rooms added yet</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Room</th>
                      <th>Type</th>
                      <th>Area</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budget.flooring.details.map((item, i) => (
                      <tr key={i}>
                        <td>{item.room}</td>
                        <td>{item.type}</td>
                        <td>{item.area} m2</td>
                        <td>${item.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="budget-section">
              <h3>Paint - ${budget.paint.total.toFixed(0)}</h3>
              {budget.paint.details.length === 0 ? (
                <p className="no-items">No rooms added yet</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Room</th>
                      <th>Color</th>
                      <th>Wall Area</th>
                      <th>Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budget.paint.details.map((item, i) => (
                      <tr key={i}>
                        <td>{item.room}</td>
                        <td>{item.color}</td>
                        <td>{item.area} m2</td>
                        <td>${item.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="budget-section">
              <h3>Furniture - ${budget.furniture.total.toFixed(0)}</h3>
              {budget.furniture.details.length === 0 ? (
                <p className="no-items">No furniture added yet</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budget.furniture.details.map((item, i) => (
                      <tr key={i}>
                        <td>{item.type}</td>
                        <td>{item.quantity}</td>
                        <td>${item.unitPrice}</td>
                        <td>${item.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="budget-summary">
            <div className="summary-row">
              <span>Flooring:</span>
              <span>${budget.flooring.total.toFixed(0)}</span>
            </div>
            <div className="summary-row">
              <span>Paint:</span>
              <span>${budget.paint.total.toFixed(0)}</span>
            </div>
            <div className="summary-row">
              <span>Furniture:</span>
              <span>${budget.furniture.total.toFixed(0)}</span>
            </div>
            <div className="summary-row total">
              <span>Grand Total:</span>
              <span>${budget.grandTotal.toFixed(0)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="stats">
        <span>Rooms: <strong>{rooms.length}</strong></span>
        <span>Furniture: <strong>{furniture.length}</strong></span>
        <span>Total Area: <strong>{totalArea} m2</strong></span>
        <span className="budget-preview">Est. Cost: <strong>${budget.grandTotal.toFixed(0)}</strong></span>
        
        <div className="actions-bar">
          {selectedRoomIndex !== null && (
            <button onClick={deleteSelectedRoom} className="delete-btn">Delete Room</button>
          )}
          {selectedFurnitureIndex !== null && (
            <>
              <button onClick={rotateFurniture} className="rotate-btn">Rotate</button>
              <button onClick={deleteSelectedFurniture} className="delete-btn">Delete</button>
            </>
          )}
          <button onClick={undoLast} disabled={rooms.length === 0 && furniture.length === 0}>Undo</button>
          <button onClick={clearCanvas} className="clear-btn">Clear All</button>
        </div>

        <div className="view-toggle">
          <button 
            className={viewMode === '2d' ? 'active' : ''} 
            onClick={() => setViewMode('2d')}
          >
            2D View
          </button>
          <button 
            className={viewMode === '3d' ? 'active' : ''} 
            onClick={() => setViewMode('3d')}
            disabled={rooms.length === 0}
          >
            3D View
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
          <ThreeScene rooms={rooms} furniture={furniture} furnitureItems={furnitureItems} />
        )}
      </main>

      {viewMode === '2d' && mode === 'furniture' && !showBudget && (
        <div className="edit-hint">
          Click and drag furniture items onto the canvas. Click placed furniture to select and move it.
        </div>
      )}

      {viewMode === '3d' && (
        <div className="controls-hint">
          <p>Left click + drag to rotate - Scroll to zoom - Right click + drag to pan</p>
        </div>
      )}
    </div>
  )
}

export default App