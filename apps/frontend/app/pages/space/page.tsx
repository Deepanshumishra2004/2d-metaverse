'use client'

import axios from "axios";
import { useEffect, useState } from "react"

const BACKEND_URL = 'http://localhost:3001';

interface Space {
    id : number,
    name : string,
    dimensions : string,
    thumbnail : string
}

export default function MapPage(){

    const [space, setSpace]=useState<Space[]>();

    const token = "312312312sdas21jvyi12c3123cviy";
     useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`,{
                headers : {
                    Authorization : `Bearer ${token}`
                }
            });
                if(response.data){
                    console.log(response.data)
                }
            };
        fetchData();
    }, []);

    return <div className="flex items-center justify-center w-screen h-screen">
        map
        {/* {space?.map((e) => (
            <div key={e.id}>
                <div>ID: {e.id}</div>
                <div>Dimensions: {e.dimensions}</div>
            </div>
        ))} */}
    </div>
}