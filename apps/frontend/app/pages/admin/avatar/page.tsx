'use client'

import { BACKEND_URL } from "@/app/config"
import axios from "axios"
import { useState } from "react"

export default function AvatarPage(){


    const [imageUrl , setImageUrl] = useState<string>()
    const [name , setName] = useState<string>()
    const [avatarId , setAvatarId]=useState();

    const token = localStorage.getItem('token');

    async function createAvatarhandler(){
        const res = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`,{
            imageUrl : imageUrl,
            name : name
        },{
            headers : {
                Authorization : `Bearer ${token}`
            }
        })
        if(res.data){
            setAvatarId(res.data.id)
            setImageUrl("")
            setName("")
        }
    }

    return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800">Create Avatar</h2>

        <div className="text-black">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Enter image URL"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <div className="text-black">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter avatar name"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
        </div>

        <button
          onClick={()=>createAvatarhandler()}
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Create Avatar
        </button>

        {avatarId && (
          <div className="text-center mt-4 text-black" >
            <h3 className="text-lg font-semibold text-green-600">
              Avatar Created! 🎉
            </h3>
            <p className="text-gray-700">ID: {avatarId}</p>
          </div>
        )}
      </div>
    </div>
  )
}