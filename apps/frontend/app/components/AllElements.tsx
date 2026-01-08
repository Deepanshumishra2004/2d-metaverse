'use client'

import axios from "axios"
import { useEffect, useState } from "react"
import { BACKEND_URL } from "../config"

export interface ElementType {
    id : string,
    imageUrl : string,
    width : number,
    height : number,
    static : boolean
}

interface SelectedType {
    onselect : (element : ElementType)=>void,
    reloadTrigger? : number
}

export const AllElement=({onselect, reloadTrigger}:SelectedType)=>{

    const [allElement, setAllElement]=useState<ElementType[]>([]);
    
    useEffect(()=>{
        async function elementHandler(){
            const response = await axios.get(`${BACKEND_URL}/api/v1/elements`) as any
            if(response.data){
                setAllElement(response.data.elements)
            }
        }
        elementHandler()
    },[reloadTrigger])

return (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {allElement?.map((u) => (
      <button
        key={u.id}
        onClick={() => onselect(u)}
        className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition transform hover:-translate-y-1 cursor-pointer text-left"
      >
        <img
          src={u.imageUrl}
          alt={u.id.toString()}
          className="w-full h-40 object-cover"
        />
        <div className="p-4 space-y-1">
          <p className="text-sm text-gray-500">ID: {u.id}</p>
          <p className="text-gray-700">Width: {u.width}</p>
          <p className="text-gray-700">Height: {u.height}</p>
          <p className="text-gray-700">Static: {u.static ? "Yes" : "No"}</p>
        </div>
      </button>
    ))}
  </div>
);

}