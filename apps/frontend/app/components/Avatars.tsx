'use client'

import { BACKEND_URL } from "@/app/config"
import axios from "axios"
import { useEffect, useState } from "react"

interface AvatarType {
    id : number,
    imageUrl : string,
    name : string
}

export const AllAvatars=()=>{

    const [element , setElement] = useState<AvatarType[] | []>();

    useEffect(()=>{
        async function elementHandler(){
            const element = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk`) as any
            if(element.data){
                console.log(element.data);
                setElement(element.data);
            }
        }

        elementHandler()
    })

   return (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {element?.map((u) => (
      <div
        key={u.id}
        className="bg-white shadow-md rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition"
      >
        <img
          src={u.imageUrl}
          alt={u.name}
          className="w-full h-40 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold">{u.name}</h3>
        </div>
      </div>
    ))}
  </div>
);

}