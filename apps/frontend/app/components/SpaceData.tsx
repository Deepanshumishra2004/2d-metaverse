'use client'

import axios from "axios"
import { useEffect, useState } from "react"
import { BACKEND_URL } from "../config"
import { ElementType } from "./AllElements"

interface SpaceDataType {
    dimensions : string,
    elements : ElementsType[]
}


interface ElementsType {
    id : string,
    element : ElementType,
    x : number,
    y : number
}

export const SpaceData=()=>{

    const [spaceData , setSpaceData] = useState<SpaceDataType>();
    const spaceId = '';

    useEffect(()=>{
        async function spaceHandler(){
            const reponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`) as any
            if(reponse.data){
                setSpaceData(reponse.data);
            }
        }
        spaceHandler();
    },[])
    
    return <div>
        {spaceData?.dimensions}
        {spaceData?.elements.map((u)=>(
            <div>
                {u.id}
                <div>
                    {u.element.id}
                    {u.element.imageUrl}
                    {u.element.static}
                    {u.element.width}
                    {u.element.height}
                </div>
                {u.x}
                {u.y}
            </div>
        ))}
    </div>
}