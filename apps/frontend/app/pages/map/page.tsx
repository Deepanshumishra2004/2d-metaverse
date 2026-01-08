'use client'

import { AllElement } from "@/app/components/AllElements"
import { useState, useEffect, useRef } from "react"

interface MapType {
  thumbnail: string
  dimensions: string
  name: string
  defaultElements: defaultElementsType[]
}

interface defaultElementsType {
  elementId: string
  x: number
  y: number
}

export default function MapPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gridSize = 50 // size of each block
  const [map, setMap] = useState<MapType>({
    thumbnail: "",
    dimensions: "1000x1000",
    name: "My Map",
    defaultElements: [],
  })
  const [selectedElement, setSelectedElement] = useState<string>()

  // Draw grid + elements
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = "#ddd"
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw placed elements (just colored squares for now)
    map.defaultElements.forEach((el) => {
      ctx.fillStyle = "skyblue"
      ctx.fillRect(el.x * gridSize, el.y * gridSize, gridSize, gridSize)
      ctx.fillStyle = "black"
      ctx.fillText(el.elementId, el.x * gridSize + 5, el.y * gridSize + 20)
    })
  }, [map, gridSize])

  // Handle clicks -> place selected element
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedElement) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / gridSize)
    const y = Math.floor((e.clientY - rect.top) / gridSize)

    setMap((prev) => ({
      ...prev,
      defaultElements: [
        ...prev.defaultElements,
        { elementId: selectedElement, x, y },
      ],
    }))
  }

  return (
    <div className="w-screen h-screen flex justify-between">
      <div className="w-[70%] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={1000}
          height={1000}
          id="defaultmap"
          className="border"
          onClick={handleCanvasClick}
        />
      </div>
      <div className="w-[30%] p-4 border-l">
        <h2 className="text-lg font-bold mb-2">Select an Element</h2>
        <AllElement onselect={setSelectedElement} />

        <div className="mt-4">
          <h3 className="font-bold">Selected:</h3>
          <p>{selectedElement ?? "None"}</p>
        </div>
      </div>
    </div>
  )
}
