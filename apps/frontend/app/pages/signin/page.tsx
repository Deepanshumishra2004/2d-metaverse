'use client'

import { BACKEND_URL } from "@/app/config";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SigninPage(){

    const router = useRouter();
    const [username, setUsername] = useState<string>('');
    const [password , setPassword]= useState<string>('');

    const SignInHandler=async()=>{
        try {
            const response = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
                username,
                password
            })
            if(response.data){
                localStorage.setItem('token',response.data.token);
                localStorage.setItem('role',response.data.role);
                router.push(`/pages/dashboard`)
            }
        } catch (error) {
            console.log("signin fails");
        }
    }

   return (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="bg-white shadow-md rounded-xl p-6 w-80 space-y-4">
      <h2 className="text-xl font-bold text-center text-gray-700">Sign In</h2>

      {/* Username */}
      <div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full px-3 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Password */}
      <div>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Sign In Button */}
      <button
        onClick={SignInHandler}
        className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Sign In
      </button>
    </div>
  </div>
);

}