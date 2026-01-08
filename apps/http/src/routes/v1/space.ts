import e, { Router } from "express";
import { AddElementSchema, CreateElementSchema, CreateMapSchema, CreateSpaceSchema, DeleteSpaceElementSchema } from "../../types/index.js";
import prisma from "@repo/db/client";
import { userMiddleware } from "../../middlewares/user.js";

export const spaceRouter = Router();

spaceRouter.post('/',userMiddleware,async(req,res)=>{
    console.log("data : ",req.body)
    const parsedData = CreateSpaceSchema.safeParse(req.body);
    if(!parsedData.success){
        return res.status(400).json({message : "invlaid input"})
    }
    console.log("data : ",parsedData.data)

    if(!parsedData.data.mapId){
        const space = await prisma.space.create({
            data : {
                name : parsedData.data.name,
                width : Number(parsedData.data.dimensions.split('x')[0]),
                height : Number(parsedData.data.dimensions.split('x')[1]),
                creatorId : (req as any).userId
            }
        })
        if(!space.id){
            return res.status(400).json({message : "data is missing"})
        }
        return res.json({spaceId : space.id})
    }

    const map = await prisma.map.findFirst({
        where : {
            id : parsedData.data.mapId
        },
        select : {
            width :true,
            height : true,
            mapElements : true
        }
    })
    console.log("map : ",map)
    if(!map){
        res.status(400).json({message : "map not found"})
        return;
    }

    console.log("length : ",map.mapElements.length);
    let space = await prisma.$transaction(async()=>{
        const space = await prisma.space.create({
            data : {
                name : parsedData.data.name,
                width : map.width,
                height : map.height,
                creatorId : (req as any).userId
            }
        })
    console.log("space : ",space)

        await prisma.spaceElements.createMany({
            data : map.mapElements.map(e=>({
                x : e.x!,
                y : e.y!,
                spaceId : space.id,
                elementId : e.elementId,
            }))
        })
        console.log("asidbawosndoiaos  space : ",space)
        return space;
    })
    console.log("spaceId new : ",space)
    return res.json({spaceId : space.id})
})

spaceRouter.get('/all', userMiddleware,async(req,res)=>{

    console.log("userId adlasokdnlasnl : ",(req as any).userId)
    const space = await prisma.space.findMany({
        where : {
            creatorId : (req as any).userId
        }
    })

    console.log("space : ",space)
    return res.json({spaces : space.map(x=>({
        id : x.id,
        name : x.name,
        dimensions : `${x.width}x${x.height}`,
        thumbnail : x.thumbnail
    }))})
})


spaceRouter.post('/element',userMiddleware, async(req,res)=>{
    console.log("-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-w-")
    const parsedData = AddElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message : "invalid input"})
        return;
    }
    
    const space = await prisma.space.findUnique({
        where : {
            id : parsedData.data.spaceId,
            creatorId : (req as any).userId
        },
        select :{
            width : true,
            height : true
        }
    })
    
    if(parsedData.data.x < 0 || parsedData.data.y < 0 || parsedData.data.x > space?.width! || parsedData.data.y > space?.height!) {
        res.status(400).json({message: "Point is outside of the boundary"})
        return
    }
    
    await prisma.spaceElements.create({
        data : {
            spaceId : parsedData.data.spaceId,
            x : Number(parsedData.data.x),
            y : Number(parsedData.data.y),
            elementId : parsedData.data.elementId
        }
    })
    res.json({message : "element is added in spaceElement"})
    
})

spaceRouter.delete('/element', userMiddleware,async(req,res)=>{
    console.log("a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a")
    const parsedData = DeleteSpaceElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message : "invalid input"})
        return;
    }
    
    console.log("data : ",parsedData.data)
    const spaceElement = await prisma.spaceElements.findFirst({
        where : {
            id : parsedData.data.id
        },
        select:{
            space : true
        }
    })
    console.log("spacednasodnasnl : ",spaceElement?.space);
    
    if(!spaceElement || spaceElement.space.creatorId !== (req as any).userId){
        res.status(400).json({message : "spaceelement creatorId not match with userId"})
        return;
    }
    
    await prisma.spaceElements.delete({
        where : {
            id : parsedData.data.id
        }
    })
    res.json({message : "element deleted from space"})
})

spaceRouter.get('/:spaceId',async(req,res)=>{
    const spaceId = req.params.spaceId as string;

    console.log("space Id get : ",spaceId);
    const spaceElement = await prisma.space.findUnique({
        where : {
            id : spaceId as string
        },
        include : {
            elements : {
                include : {
                    element : true
                }
            }
        }
    })
    console.log(spaceElement);
    console.log(spaceElement?.elements);

    if(!spaceElement){
        res.status(400).json({message : "space not found 1"})
        return;
    }

    return res.json({
        dimensions : `${spaceElement.width}x${spaceElement.height}`,
        elements : spaceElement.elements.map(e=>({
            id : e.id,
            element : {
                id : e.element.id,
                imageUrl : e.element.imageUrl,
                static : e.element.static,
                height : e.element.height,
                width : e.element.width
            },
            x : e.x,
            y : e.y
        }))
    })
})


spaceRouter.delete("/:spaceId", userMiddleware, async(req, res) => {
    console.log("userId : ",(req as any).userId)
    console.log("req.params.spaceId", req.params.spaceId)
    const spaceId = req.params.spaceId
    const space = await prisma.space.findUnique({
        where: {
            id: req.params.spaceId as string
        }, select: {
            creatorId: true
        }
    })
    console.log("space : ",space?.creatorId);
    
    if (!space) {
        return res.status(400).json({message: "Space not found 3"})
    }

    if (space.creatorId !== (req as any).userId) {
        console.log("code should reach here")
        res.status(403).json({message: "Unauthorized"})
        return
    }

    await prisma.$transaction([
    prisma.spaceElements.deleteMany({
        where: { spaceId: req.params.spaceId as string}
    }),
    prisma.space.delete({
        where: { id: req.params.spaceId as string }
    })
    ]);
    return res.json({ message: "space is deleted" });
})