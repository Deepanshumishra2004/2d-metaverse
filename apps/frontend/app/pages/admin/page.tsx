'use client'
import { useRouter } from "next/navigation"

export default function AdminPage(){

    const router = useRouter();

   return (
  <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
    <button
      onClick={() => router.push("/pages/admin/element")}
      className="w-60 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
    >
      Create / Update Element
    </button>
    <button
      onClick={() => router.push("/pages/admin/map")}
      className="w-60 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
    >
      Create Map
    </button>
    <button
      onClick={() => router.push("/pages/admin/avatar")}
      className="w-60 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
    >
      Create Avatar
    </button>
  </div>
);

}

