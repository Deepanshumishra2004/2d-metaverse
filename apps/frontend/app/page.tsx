'use client'
import { useRouter } from "next/navigation";

export default function Home() {

  const router = useRouter();
  return  <div className="flex items-center justify-center space-x-4 p-4">
  <button
    onClick={() => router.push("/pages/signin")}
    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
  >
    Sign In
  </button>
  <button
    onClick={() => router.push("/pages/signup")}
    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
  >
    Sign Up
  </button>
</div>

}
