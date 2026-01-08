import { Router } from "express";
import prisma from "@repo/db/client";
import { adminMiddleware } from "../../middlewares/admin.js";
import { CreateAvatarSchema, CreateElementSchema, CreateMapSchema, UpdateElementSchema } from "../../types/index.js";

export const adminRouter = Router();

adminRouter.post('/element',adminMiddleware,async(req,res)=>{
    console.log("w-w-w-w-w-w-w-w-ww-w-w-w-w-w-w-w-w-w-w")
    const parsedData = CreateElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message : "invlaid credinals"})
        return;
    }
    console.log(parsedData.data)
    const element = await prisma.element.create({
        data : {
            imageUrl : parsedData.data.imageUrl,
            width : parsedData.data.width,
            height : parsedData.data.height,
            static : parsedData.data.static
        }
    })
    return res.json({id : element.id})
})

adminRouter.put('/element/:elementId', adminMiddleware, async(req,res)=>{
    const parsedData = UpdateElementSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message : "invalid credenetials"})
        return;
    }
    console.log("id : ",parsedData.data.imageUrl);
    console.log(req.params.elementId)

    await prisma.element.update({
        where : {
            id : req.params.elementId as string
        },
        data : {
            imageUrl : parsedData.data.imageUrl
        }
    })

    res.json({message : "element is updated"})
})

adminRouter.post('/avatar',adminMiddleware, async(req,res)=>{
    console.log("213123123")
    const parsedData = CreateAvatarSchema.safeParse(req.body);
    console.log(parsedData.data?.imageUrl);
    if(!parsedData.success){
        return res.status(400).json({message : "invalid credentials"})
    }

    console.log("imageUrl : ",parsedData.data.imageUrl)

    const createAvatar = await prisma.avatar.create({
        data :{
            imageUrl : parsedData.data.imageUrl,
            name : parsedData.data.name
        }
    })
    console.log("yoyoyo : ",createAvatar.id)
    
    return res.json({
        id : createAvatar.id
    })
})

adminRouter.post('/map', async(req,res)=>{
    const parsedData = CreateMapSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message : "invalid credentials"})
        return;
    }

    console.log(parsedData.data);

    const createMap = await prisma.map.create({
        data : {
            thumbnail : parsedData.data.thumbnail,
            width : Number(parsedData.data.dimensions.split('x')[0]),
            height : Number(parsedData.data.dimensions.split('x')[1]),
            name : parsedData.data.name,
            mapElements : {
                create :  parsedData.data.defaultElements.map(e=>({
                elementId : e.elementId,
                x : e.x,
                y : e.y
            }))
            }
        }
    })
    return res.json({id : createMap.id})
})
