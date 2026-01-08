'use client'
import { useState, useEffect, useRef } from "react"
import { AllElement, ElementType } from "../../../components/AllElements" // adjust path
import axios from "axios"
import { BACKEND_URL } from "@/app/config"

interface MapType {
  thumbnail: string
  dimensions: string
  name: string
  defaultElements: PlacementElement[]
}

interface Position {
  x: number
  y: number
}

interface PlacementElement {
  elementId: string
  x: number
  y: number
  imageUrl : string
  width: number
  height: number
}

interface MapData {
  thumbnail: string
  dimensions: string
  name: string,
  defaultElements : sendElementData[]
}

interface sendElementData {
  elementId :string,
  x: number,
  y : number
}

export default function MapPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mapWidth, setMapWidth] = useState<number>(1000);
  const [mapHeight, setMapHeight] = useState<number>(1000);
  const [thumbnail, setThumbnail] = useState<string>('');
  const [mapName , setMapName]=useState<string>('')
  const [token, setToken]=useState<string>('');
  const [mapId , setMapId] = useState<string>('');
  

  useEffect(()=>{
    setToken(localStorage.getItem('token') as string)
  })

  const gridSize = 50
  const [map, setMap] = useState<MapType>({
    thumbnail: `${thumbnail}`,
    dimensions: `${mapWidth}x${mapHeight}`,
    name: `${mapName}`,
    defaultElements: [],
  })

  const [mapData, setMapData] = useState<MapData>({
    thumbnail: `${thumbnail}`,
    dimensions: `${mapWidth}x${mapHeight}`,
    name: `${mapName}`,
    defaultElements: [],
  });


  const [selectedElement, setSelectedElement] = useState<ElementType>()
  const [avatarPosition, setAvatarPosition] = useState<Position>({ x: 0, y: 0 })
  const [showTileValues, setShowTileValues] = useState<boolean>(false)
  const [placementMode, setPlacementMode] = useState<boolean>(true)


  const gridWidth = Math.floor(mapWidth! / gridSize)
  const gridHeight = Math.floor(mapHeight! / gridSize)

  // Compute tile values based on unique elements per tile
  const getTileValues = () => {
    const tileValues: number[][] = Array(gridHeight).fill(0).map(() => Array(gridWidth).fill(0))
    const tileCounts: { [key: string]: Set<string> } = {}

    map.defaultElements.forEach(el => {
      for (let dx = 0; dx < el.width; dx++) {
        for (let dy = 0; dy < el.height; dy++) {
          const tx = el.x + dx
          const ty = el.y + dy
          if (tx >= 0 && tx < gridWidth && ty >= 0 && ty < gridHeight) {
            const key = `${tx},${ty}`
            if (!tileCounts[key]) tileCounts[key] = new Set()
            tileCounts[key].add(el.elementId)
          }
        }
      }
    })

    Object.entries(tileCounts).forEach(([key, set]) => {
      const [x, y] = key.split(',').map(Number)
      tileValues[y][x] = set.size
    })

    return tileValues
  }

  const tileValues = getTileValues()

  const canAvatarMoveTo = (x: number, y: number): boolean => {
    if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) return false
    return tileValues[y][x] <= 1
  }

  // Check if a specific element already exists at a tile
  const isElementAlreadyOnTile = (x: number, y: number, elementId: string): boolean => {
    return map.defaultElements.some(el =>
      elementId === el.elementId &&
      x >= el.x && x < el.x + el.width &&
      y >= el.y && y < el.y + el.height
    )
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "#ddd"
    ctx.lineWidth = 1
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw tile value background if enabled
    if (showTileValues) {
      ctx.fillStyle = "black"
      ctx.font = "12px Arial"
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const value = tileValues[y][x]
          if (value > 0) {
            ctx.fillText(
              value.toString(),
              x * gridSize + gridSize / 2 - 3,
              y * gridSize + gridSize / 2 + 4
            )
          }
        }
      }
    }

    // Draw placed elements with visual stacking
    const elementPositions: { [key: string]: number } = {}
    map.defaultElements.forEach(el => {
      const key = `${el.x},${el.y}`
      const stackIndex = elementPositions[key] || 0
      elementPositions[key] = stackIndex + 1

      const offsetX = (stackIndex % 3) * 5
      const offsetY = Math.floor(stackIndex / 3) * 5

      const img = new Image()
      img.src = el.imageUrl
      img.onload = () => {
        ctx.drawImage(img, el.x * gridSize, el.y * gridSize, el.width * gridSize, el.height * gridSize)
      }

      // Fallback rectangle if image fails
      ctx.fillStyle = "rgba(0,0,0,0.2)"
      ctx.fillRect(el.x * gridSize + 2 + offsetX, el.y * gridSize + 2 + offsetY, gridSize - 10, gridSize - 10)

      // Draw element ID abbreviation
      ctx.fillStyle = "white"
      ctx.font = "8px Arial"
      const abbrev = el.elementId.substring(0, 2).toUpperCase()
      ctx.fillText(abbrev, el.x * gridSize + 5 + offsetX, el.y * gridSize + 12 + offsetY)
    })

    // Draw avatar
    ctx.fillStyle = "#FF6B6B"
    ctx.fillRect(avatarPosition.x * gridSize + 10, avatarPosition.y * gridSize + 10, gridSize - 20, gridSize - 20)
    ctx.fillStyle = "white"
    ctx.font = "14px Arial"
    ctx.fillText("A", avatarPosition.x * gridSize + gridSize/2 - 5, avatarPosition.y * gridSize + gridSize/2 + 5)

    // Highlight invalid avatar tiles
    if (!placementMode) {
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          if (!canAvatarMoveTo(x, y)) {
            ctx.fillStyle = "rgba(255, 0, 0, 0.3)"
            ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize)
          }
        }
      }
    }
  }, [map, gridSize, avatarPosition, showTileValues, placementMode, tileValues])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / gridSize)
    const y = Math.floor((e.clientY - rect.top) / gridSize)

    if (placementMode) {
      if (!selectedElement) return

      // Prevent placing the same element twice on the same tile
      for (let dx = 0; dx < selectedElement.width; dx++) {
        for (let dy = 0; dy < selectedElement.height; dy++) {
          const tx = x + dx
          const ty = y + dy
          if (isElementAlreadyOnTile(tx, ty, selectedElement.id)) {
            const ctx = canvas.getContext("2d")
            if (!ctx) return
            ctx.fillStyle = "rgba(255, 165, 0, 0.7)" // Orange flash
            ctx.fillRect(tx * gridSize, ty * gridSize, gridSize, gridSize)
            setTimeout(() => setMap(prev => ({ ...prev })), 200)
            return
          }
        }
      }

      // Place element
      setMap(prev => ({
        ...prev,
        defaultElements: [
          ...prev.defaultElements,
          {
            elementId: selectedElement.id,
            x,
            y,
            imageUrl : selectedElement.imageUrl,
            width: selectedElement.width,
            height: selectedElement.height
          }
        ]
      }))

      setMapData(prev => ({
        ...prev,
        defaultElements:[
          ...prev.defaultElements,
          {
            elementId : selectedElement.id,
            x,
            y
          }
        ]
      }))

    } else {
      // Avatar movement
      if (canAvatarMoveTo(x, y)) {
        setAvatarPosition({ x, y })
      } else {
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.fillStyle = "rgba(255, 0, 0, 0.7)"
        ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize)
        setTimeout(() => setAvatarPosition(prev => ({ ...prev })), 200)
      }
    }
  }

  const clearMap = () => setMap(prev => ({ ...prev, defaultElements: [] }))
  const undoLast = () => setMap(prev => ({ ...prev, defaultElements: prev.defaultElements.slice(0, -1) }))

  async function createMapHandler(){
    const res = await axios.post(`${BACKEND_URL}/api/v1/admin/map`,{
      thumbnail : thumbnail,
      dimensions : `${mapWidth}x${mapHeight}`,
      name : mapName,
      defaultElements : mapData.defaultElements
    },{
      headers : {
        Authentication : `Bearer ${token}`
      }
    })

    if(res.data){
      setMapId(res.data.id)
    }
  }

  return (
    <div className="w-screen h-screen flex justify-between bg-gray-100">
      <div className="w-[70%] flex items-center justify-center p-4">
        <div className="relative p-4">
          <canvas
            ref={canvasRef}
            width={mapWidth}
            height={mapHeight}
            className="border-2 border-gray-400 shadow-lg bg-white cursor-pointer"
            onClick={handleCanvasClick}
          />
        </div>
      </div>

      <div className="w-[30%] p-4 border-l bg-white overflow-y-auto">
        <div className="space-y-4">
          <div className=" flex justify-center">
              <button className="border-2 border-black px-6 py-4 w-[50%] bg-blue-500 hover:bg-blue-700 rounded-2xl font-bold text-xl" onClick={()=>{createMapHandler()}}>create Map</button>
          </div>

            <div className="text-black font-bold text-3xl">
              {mapId ? `MapId : ${mapId}` : ''}
            </div>
          {/* Mode Toggle */}
          <div>
            <h2 className="text-lg font-bold mb-2">Mode</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setPlacementMode(true)}
                className={`px-3 py-2 rounded text-sm ${placementMode ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                Place Elements
              </button>
              <button
                onClick={() => setPlacementMode(false)}
                className={`px-3 py-2 rounded text-sm ${!placementMode ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                Move Avatar
              </button>
            </div>
          </div>
          <div>
            <div className="text-black">
              <h1>Map Name</h1>
              <input type="text" key={'width'} value={mapName} className="border-gray-400 border-2 p-2" onChange={(e)=>setMapName(e.target.value)}/>
              <h1>{mapName}</h1>
            </div>
            <div className="text-black">
              <h1>Thumbnail</h1>
              <input type="text" key={'width'} value={thumbnail} className="border-gray-400 border-2 p-2" onChange={(e)=>setThumbnail(e.target.value)}/>
              <h1>{mapName}</h1>
            </div>
            <h1 className="text-neutral-400">Recommeneded start (100x100)</h1>
            <div className="text-black flex justify-start gap-10">
              <div className="gap-4">
                <p className="text-gray-700">width</p>
                <input type="text" key={'width'} value={mapWidth} className="border-gray-400 border-2 p-2" onChange={(e)=>setMapWidth(Number(e.target.value))}/>
              </div>
              <div>
                <p className="text-gray-700">Height</p>
                <input type="text" key={'height'} value={mapHeight} className="border-gray-400 border-2 p-2" onChange={(e)=>setMapHeight(Number(e.target.value))}/>
              </div>
            </div>
          </div>
          {placementMode && (
            <div>
              <h2 className="text-lg font-bold mb-2">Select an Element</h2>
              <AllElement onselect={setSelectedElement} />
            </div>
          )}

          {/* Controls */}
          <div>
            <h2 className="text-lg font-bold mb-2">Controls</h2>
            <div className="space-y-2">
              <button
                onClick={undoLast}
                className="w-full px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                disabled={map.defaultElements.length === 0}
              >
                Undo Last
              </button>
              <button
                onClick={clearMap}
                className="w-full px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Clear Map
              </button>
              <button
                onClick={() => setShowTileValues(!showTileValues)}
                className={`w-full px-3 py-2 rounded text-sm ${showTileValues ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-700"}`}
              >
                {showTileValues ? "Hide" : "Show"} Tile Values
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
