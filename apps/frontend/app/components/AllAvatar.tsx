import axios from "axios"
import { useEffect, useState } from "react"
import { BACKEND_URL } from "../config"

export interface AvatarType {
    id : string,
    imageUrl : string,
    name : string
}

interface SelectType {
    onselect : ({id, imageUrl, name}:AvatarType)=>void
}

export const AllAvatar=({onselect} : SelectType)=>{

    const [ allAvatar, setAllAvatar] = useState<AvatarType[]>([]);

    useEffect(()=>{
        async function getAllAvatar(){
            const res = await axios.get(`${BACKEND_URL}/api/v1/avatars`)
            if(res.data){
                setAllAvatar(res.data.avatars)
            }
        }
        getAllAvatar()
    },[])

    return (
    <div>
      <h4 className="font-semibold mb-3 text-gray-700">All Avatars</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {allAvatar.map((u: any) => (
          <button
            key={u.id}
            onClick={() => onselect(u)}
            className="flex flex-col items-center p-3 border rounded-lg shadow hover:shadow-lg hover:border-blue-400 transition bg-white"
          >
            <img
              src={u.imageUrl}
              alt=""
              className="w-16 h-16 rounded-full mb-2 border"
            />
            <p className="font-medium text-sm text-gray-800">{u.name}</p>
            <span className="text-xs text-gray-500">ID: {u.id}</span>
          </button>
        ))}
      </div>
    </div>
  )
}