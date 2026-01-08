'use client'

import { BACKEND_URL } from "@/app/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UpdatePage(){

    const router = useRouter();
    const [updateElement, setUpdateElement] = useState<string>('');
    const [elementId , setElementId] = useState<string>('');
    const [token, setToken]=useState<string>('');


    useEffect(()=>{
        setToken(localStorage.getItem('token') as string)
        setElementId( localStorage.getItem('elementId') as string)
    },[])

    console.log(elementId)

    async function updateHandler(){
        const res = await axios.put(`${BACKEND_URL}/api/v1/admin/element/${elementId}`,{
            imageUrl : updateElement
        },{
            headers : {
                Authorization : `Bearer ${token}`
            }
        })
        if(res.data){
            localStorage.removeItem('elementId')
            router.push('/pages/admin/element')
        }
    }

    return (
  <div className="flex flex-col items-center space-y-3 p-4">
    {/* Input box */}
    <input
      type="text"
      value={updateElement}
      onChange={(e) => setUpdateElement(e.target.value)}
      placeholder="Enter new element name"
      className="px-3 py-2 border rounded-lg w-64 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    />

    {/* Update button */}
    <button
      onClick={updateHandler}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
    >
      Update Element
    </button>

    {/* Show selected elementId */}
    <p className="text-sm text-gray-600 mt-2">Selected ID: {elementId}</p>
  </div>
)

}