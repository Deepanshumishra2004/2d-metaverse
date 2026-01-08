import { Router } from "express";
import { adminRouter } from "./admin.js";
import { userRouter } from "./user.js";
import { spaceRouter } from "./space.js";
import { SigninSchema, SignupSchema } from "../../types/index.js";
import prisma from "@repo/db/client";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from "../../config.js";
export const router = Router();

router.post('/signup', async(req,res)=>{
    console.log(req.body)
    const parsedData = SignupSchema.safeParse(req.body);
    console.log("type : ",parsedData.data)

    if(!parsedData.success){
        res.status(400).json({message : "valdiation failed"})
        return;
    }

    const existingUser = await prisma.user.findUnique({
        where: { username: parsedData.data.username }
    })
      
    if (existingUser) {
        return res.status(400).json({ message: "Username already exists" })
    }

    try{
        console.log("type rokc aksbdjibasjkbdjkasbkjndjkabnjk : ",parsedData.data.type)
        const hashPassword = await bcrypt.hash(parsedData.data.password,10);
        const response = await prisma.user.create({
            data : {
                username : parsedData.data.username,
                password : hashPassword,
                role : parsedData.data.type === 'admin' ? "Admin" : "User"
            }
        })
        return res.json({
            userId : response.id
        })
    } catch(e){
        res.status(400).json({message: "User already exists"})
    }
})

router.post('/signin', async(req,res)=>{
    const parsedData = SigninSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({message : "valdiation failed"})
        return;
    }

    const data = await prisma.user.findUnique({
        where : {
            username : parsedData.data.username
        }
    })

    if(data && await bcrypt.compare(parsedData.data.password, data.password)){
        const token = Jwt.sign({
            userId : data.id,
            role : data.role
        },JWT_SECRET);
    
        if(token){
            return res.json({
                token,
                role : data.role
            })
        }else{
            res.status(400).json({message : "token not found"})
        }
    }else{
        res.status(400).json({message : "user not found"})
    }
})

router.get('/avatars', async(req,res)=>{
    const getAvatar = await prisma.avatar.findMany({
        select : {
            id : true,
            imageUrl : true,
            name : true
        }
    })

    res.json({
        avatars : getAvatar.map(e=>({
            id : e.id,
            name : e.name,
            imageUrl : e.imageUrl
        }))
    })
})  

router.get('/elements', async(req,res)=>{
    const getElements = await prisma.element.findMany({
        select : {
            id : true,
            imageUrl : true,
            width : true,
            height : true,
            static : true
        }
    })

    return res.json({
        elements : getElements.map(e=>({
            id : e.id,
            imageUrl : e.imageUrl,
            height : e.height,
            width : e.width,
            static : e.static
        }))
    })
})

router.get('/map', async(req,res)=>{
    const getAllMaps = await prisma.map.findMany()

    console.log("maps : ",getAllMaps)
    return res.json({
        map : getAllMaps.map((u)=>({
            id : u.id,
            name : u.name,
            width : u.width,
            height : u.height,
            thumbnail : u.thumbnail
        }))
    })

})

router.use('/admin',adminRouter);
router.use('/user',userRouter);
router.use('/space',spaceRouter);
