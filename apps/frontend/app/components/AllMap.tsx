import axios from "axios"
import { useEffect, useState } from "react"
import { BACKEND_URL } from "../config"

export interface MapType {
    id : string,
    name : string,
    width : string,
    height : string,
    thumbnail : string
}

export const AllMap=({onselect}:{onselect : (space : MapType)=>void})=>{

    const [allMaps , setAllMaps]=useState<MapType[]>([]);

    useEffect(()=>{
        async function getMaps(){
            const res = await axios.get(`${BACKEND_URL}/api/v1/map`)
            console.log(res.data)
            if(res.data){
                setAllMaps(res.data.map)
            }
        }
        getMaps()
    },[])

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allMaps.map((u) => (
            <button
                key={u.id}
                className="bg-white border rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col items-center"
                onClick={()=>onselect(u)}
            >
                <img
                src={u.thumbnail}
                alt={u.name}
                className="w-full h-40 object-cover rounded-md mb-3"
                />
                <h3 className="font-semibold text-lg text-gray-800">{u.name}</h3>
                <p className="text-sm text-gray-500">ID: {u.id}</p>
                <p className="mt-1 text-gray-700">
                {u.width} × {u.height}
                </p>
            </button>
            ))}
        </div>
    )
}