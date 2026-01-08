import { Router } from "express";
import { userMiddleware } from "../../middlewares/user.js";
import { UpdateMetadataSchema } from "../../types/index.js";
import prisma from "@repo/db/client";

export const userRouter = Router();

userRouter.post('/metadata', userMiddleware,async(req,res)=>{
    const parsedData = UpdateMetadataSchema.safeParse(req.body);

    if(!parsedData.success){
        res.status(400).json({message : "input error"})
        return;
    }
    console.log("avatarId : ",parsedData.data.avatarId);
    try {
        
        await prisma.user.update({
            where:{
                id : (req as any).userId
            },
            data : {
                avatarId : parsedData.data.avatarId
            }
        })
        res.json({message : "Metadata updated"})
    } catch (error) {
        return res.status(400).json({message : "this userId can't change the metdata"})
    }
})
userRouter.get('/metadata/bulk', async (req, res) => {
    try {
        
        const userIdString = (req.query.ids ?? "[]") as string;

        const metadata = await prisma.user.findMany({
            where: { id: userIdString },
            select: {
                avatar: true,
                id: true
            }
        });

        console.log(metadata)

        return res.json({
            avatars: metadata.map(x => ({
                userId: x.id,
                avatarUrl: x.avatar?.imageUrl
            }))
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ error: "Invalid ids format" });
    }
});
