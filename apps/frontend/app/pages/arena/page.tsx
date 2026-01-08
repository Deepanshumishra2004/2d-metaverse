"use client";
import { useSearchParams } from "next/navigation";
import Arena from "../../components/Arena";

export default function ArenaPage() {

  const searchParams = useSearchParams();

  const token = searchParams.get('token') as string;
  const spaceId = searchParams.get('spaceId') as string;
  console.log("token : ",token)
  console.log("spaceId : ",spaceId)

  return <div className="w-full h-screen flex justify-center items-center p-2 bg-amber-500">
      <Arena token={token} spaceId={spaceId} />;
    </div>
}
