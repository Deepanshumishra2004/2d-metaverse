'use client'

import { AllAvatar, AvatarType } from "@/app/components/AllAvatar";
import { AllMap, MapType } from "@/app/components/AllMap";
import { ExistingSpace } from "@/app/components/ExistingSpace";
import { BACKEND_URL } from "@/app/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Space {
    id : number,
    name : string,
    dimensions : string,
    thumbnail : string
}

export default function DashboardPage(){

    const router = useRouter();
    const [role , setRole]=useState<string | null>(null);
    const [token , setToken]=useState<string>('');
    const [spaceId , setSpaceId] = useState<string>();
    const [selectspace, setSelectspace] = useState<Space>();
    const [selectMap, setSelectMap] = useState<MapType>();
    const [selectAvatar, setSelectAvatar]=useState<AvatarType>();
    const [visible ,setVisible] = useState(true);
    const [message , setMessage]=useState<string>('')

    useEffect(()=>{
        setToken(localStorage.getItem('token') as string)
        if(localStorage.getItem('role')){
            setRole(localStorage.getItem('role'))
        }else{
            router.push('/signin')
        }
    },[router])


    async function joinHandler(){
      console.log("spaceId : ",spaceId)
        router.push(`arena?token=${token}&&spaceId=${spaceId}`)
    }

    async function joinExistingSpaceHandler(){
      console.log("spaceId : ",selectspace?.name)
        router.push(`arena?token=${token}&&spaceId=${selectspace?.id}`)
    }

    async function createSpace(){
        const res = await axios.post(`${BACKEND_URL}/api/v1/space`,{
            name : selectMap?.name,
            dimensions : `${selectMap?.width}x${selectMap?.height}`,
            mapId : selectMap?.id
        },{
            headers : {
                Authorization : `Bearer ${token}`
            }
        })
        if(res.data){
          console.log(res.data.spaceId)
          router.push(`arena?token=${token}&&spaceId=${res.data.spaceId}`)
        }
    }

    async function ConfirmAvatar(){
        const res = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`,{
            avatarId : selectAvatar?.id
        },{
            headers : {
                Authorization : `Bearer ${token}`
            }
        })
        if(res.data){
            setMessage(res.data.message)
            setVisible(false)
        }
    }

   return (
  <div className="w-screen min-h-screen bg-gray-100 p-8 flex flex-col items-center">
    {/* Admin Dashboard (only if Admin) */}
    {role === "Admin" && (
      <button
        className="mb-8 bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        onClick={() => router.push("/pages/admin")}
      >
        Admin Dashboard
      </button>
    )}

    {/* 3 Section Layout */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
      {/* Join Room */}
      <div className="bg-white border rounded-xl shadow-lg p-6 flex flex-col">
        <h3 className="font-semibold text-xl mb-4 text-gray-900 border-b pb-2">
          Join Room
        </h3>
        <input
          type="text"
          placeholder="Enter room ID"
          className="border p-3 w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={spaceId}
          onChange={(e) => setSpaceId(e.target.value)}
        />
        <button
          className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition font-medium"
          onClick={() => joinHandler()}
        >
          Join Room
        </button>
      </div>

      {/* Select Map */}
      <div className="bg-white border rounded-xl shadow-lg p-6 flex flex-col">
        <h3 className="font-semibold text-xl mb-4 text-gray-900 border-b pb-2">
          Select Map
        </h3>
        <div className="text-black">
          spaceId : {spaceId}
        </div>
        {selectMap ? (
          <div className="flex flex-col items-center border p-3 rounded-lg mb-4 bg-gray-50">
            <img
              src={selectMap.thumbnail}
              alt={selectMap.name}
              className="w-full h-32 object-cover rounded-lg mb-2"
            />
            <p className="font-semibold">{selectMap.name}</p>
            <span className="text-sm text-gray-500">ID: {selectMap.id}</span>
            <span className="text-sm text-gray-600">
              {selectMap.width} × {selectMap.height}
            </span>
          </div>
        ) : (
          <p className="text-gray-500 text-center mb-4">No map selected</p>
        )}

        <button
          className={`w-full py-2 rounded-lg font-medium transition ${
            selectMap
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
          onClick={() => createSpace()}
          disabled={!selectMap}
        >
          Confirm Map
        </button>

        <div className="mt-4 overflow-y-auto max-h-64 pr-2">
          <AllMap onselect={setSelectMap} />
        </div>
      </div>

      {/* Select Avatar */}
      <div className="bg-white border rounded-xl shadow-lg p-6 flex flex-col">
        <h3 className="font-semibold text-xl mb-4 text-gray-900 border-b pb-2">
          Select Avatar
        </h3>

        {selectAvatar ? (
          <div className="flex flex-col items-center border p-3 rounded-lg mb-4 bg-gray-50">
            <img
              src={selectAvatar.imageUrl}
              alt={selectAvatar.name}
              className="w-20 h-20 rounded-full border mb-2"
            />
            <p className="font-semibold">{selectAvatar.name}</p>
            <span className="text-sm text-gray-500">
              ID: {selectAvatar.id}
            </span>
          </div>
        ) : (
          <p className="text-gray-500 text-center mb-4">No avatar selected</p>
        )}

        <button
          className={`w-full py-2 rounded-lg font-medium transition ${
            selectAvatar
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
          onClick={() => ConfirmAvatar()}
          disabled={!selectAvatar}
        >
          Confirm Avatar
        </button>

        <div className="mt-4 overflow-y-auto max-h-64 pr-2">
          {visible ? (
            <AllAvatar onselect={setSelectAvatar} />
          ) : (
            <p className="text-gray-600 text-center">{message}</p>
          )}
        </div>
      </div>
    </div>

    {/* Existing Spaces */}
    <div className="bg-white border rounded-xl shadow-lg p-6 mt-10 w-full max-w-6xl">
      <h3 className="font-semibold text-xl mb-4 text-gray-900 border-b pb-2">
        Existing Spaces
      </h3>
      <ExistingSpace onselect={setSelectspace} />
      <button className="w-full pt-3" onClick={()=>joinExistingSpaceHandler()}>Join ${selectspace?.name}</button>
    </div>
  </div>
);

}
