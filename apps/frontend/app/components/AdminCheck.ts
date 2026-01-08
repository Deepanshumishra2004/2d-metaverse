import { useRouter } from "next/navigation"

export const AdminCheck=()=>{
    const router = useRouter();
    const res = localStorage.getItem('role')
    if(res !== 'admin'){
        router.push('/signin')
    }
    return;
}