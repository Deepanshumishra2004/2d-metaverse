import { useEffect, useState } from "react"
import { BACKEND_URL } from "../config"
import axios from "axios";

interface Space {
    id : number,
    name : string,
    dimensions : string,
    thumbnail : string
}


export const ExistingSpace=({onselect}:{onselect : (space : Space)=>void})=>{

    const [allSpace, setAllSpace]=useState<Space[] | []>([]);
    
    useEffect(()=>{
      async function space(){
          const token = localStorage.getItem('token');
          console.log(token)
            const res = await axios.get(`${BACKEND_URL}/api/v1/space/all`,{
                headers : {
                    Authorization : `Bearer ${token}`
                }
            })
            if(res.data){
              console.log("comming")
                setAllSpace(res.data.space)
                console.log(res.data.space)
            }
        }
        space()
    },[])

  return (
    <div>
      {allSpace && allSpace.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allSpace.map((u) => (
            <div
              key={u.id}
              className="bg-white shadow-md rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition"
              onClick={() => onselect(u)}
            >
              <img
                src={u.thumbnail}
                alt={u.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{u.name}</h3>
                <p className="text-gray-500 text-sm">ID: {u.id}</p>
                <p className="text-gray-600">{u.dimensions}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8 border rounded-lg bg-gray-50">
          No Spaces Yet 🚀
        </div>
      )}
    </div>
  )
}