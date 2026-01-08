'use client'

import { BACKEND_URL } from "@/app/config";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage(){

    const router = useRouter();
    const [username, setUsername] = useState<string>('');
    const [password , setPassword]= useState<string>('');
const [type, setType] = useState<"admin" | "user" | "">("")

    const SignUpHandler=async()=>{
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
                username,
                password,
                type
            })
            if(response.data){
                localStorage.setItem('userId',response.data.userId);
                router.push(`/pages/signin`)
            }
        } catch (error) {
            console.log("signup fails");
        }
    }

    return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div className="bg-white shadow-lg rounded-2xl p-8 w-96 space-y-4">
      <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>

      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-600">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mt-1 px-3 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter username"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-600">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mt-1 px-3 py-2  text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter password"
        />
      </div>

      {/* Role Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setType("admin")}
          className={`w-1/2 py-2 mr-2 rounded-lg border ${
            type === "admin"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Admin
        </button>
        <button
          onClick={() => setType("user")}
          className={`w-1/2 py-2 ml-2 rounded-lg border ${
            type === "user"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          User
        </button>
      </div>

      {/* Signup Button */}
      <button
        onClick={SignUpHandler}
        className="w-full py-2 mt-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
      >
        Sign Up
      </button>
    </div>
  </div>
);

}