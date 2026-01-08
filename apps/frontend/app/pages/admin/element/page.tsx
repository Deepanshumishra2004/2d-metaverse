"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AllElement } from "@/app/components/AllElements"
import axios from "axios"
import { BACKEND_URL } from "@/app/config"

export default function CreateElementPage() {
  const router = useRouter()

  const [elementId, setElementId] = useState<string>("")
  const [imageUrl, setImageUrl] = useState("")
  const [width, setWidth] = useState<Number>(1)
  const [height, setHeight] = useState<Number>(1)
  const [isStatic, setIsStatic] = useState<boolean | null>(null)
  const [createdElementId, setCreatedElementId] = useState<string>('')
  const [token , setToken] = useState<string>('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    setToken(localStorage.getItem('token') as string)
    const role = localStorage.getItem("role")
    if (role !== "Admin") {
      router.push("/pages/signin")
    }
  }, [router])

  useEffect(() => {
    if (elementId) {
      localStorage.setItem("elementId", elementId)
      router.push("/pages/admin/element/update")
    }
  }, [elementId, router])

  
  async function createELementHandler(){
    console.log(token)
    const res = await axios.post(`${BACKEND_URL}/api/v1/admin/element`,{
      imageUrl,
      width,
      height,
      static : isStatic
    },{
      headers:{
        Authorization : `Bearer ${token}`
      }
    })

    if(res.data){
      setCreatedElementId(res.data.id)
      setReload((prev)=>prev+1)
    }
  }

  return (
    <div className="flex space-x-8 p-6">
      {/* Form Section */}
      <div className="space-y-4 bg-white p-6 rounded-xl shadow-md w-80">
        <h2 className="text-lg font-bold">Create Element</h2>

        <input
          type="text"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Image URL"
          className="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          placeholder="Width"
          className="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          placeholder="Height"
          className="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div>
          <p className="mb-2 font-medium">Static</p>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsStatic(true)}
              className={`flex-1 py-2 rounded-lg border ${
                isStatic === true
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              True
            </button>
            <button
              onClick={() => setIsStatic(false)}
              className={`flex-1 py-2 rounded-lg border ${
                isStatic === false
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              False
            </button>
          </div>
        </div>

        <button className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          onClick={()=>createELementHandler()}
        >
          Create Element
        </button>


        <div className="text-2xl text-amber-400 flex justify-center font-bold">
          id : {createdElementId}
        </div>
      </div>

      {/* All Elements Section */}
      <div className="flex-1">
        <AllElement onselect={setElementId} reloadTrigger={reload} />
      </div>
    </div>
  )
}
