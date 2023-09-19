import { FastifyInstance } from "fastify"
import {z} from 'zod'
import { prisma } from "../lib/prisma"
import { createReadStream } from "fs";
import { openAi } from "../lib/openai";

export async function createTranscriptionRoute(app: FastifyInstance){
    app.post("/videos/:videoId/transcription", async (request)=>{
        const paramSchema = z.object({
            videoId: z.string().uuid()
        })
        const { videoId } = paramSchema.parse(request.params)
       
        const bodySchema = z.object({
            prompt: z.string()
        })
        const { prompt } = bodySchema.parse(request.body)

        console.log(videoId)
        const video = await prisma.video.findUniqueOrThrow({
            where: {
                id: videoId
            }
        })        

        const videoPath = video.path
        const audioReadStream = createReadStream(videoPath)        
        
        //open ai key precisa de creditos
        const response = await openAi.audio.transcriptions.create({
            file: audioReadStream,
            model: 'whisper-1',
            language: 'pt',
            response_format: 'json',
            temperature: 0,
            prompt
        })

        const transcription = response.text        

        await prisma.video.update({
            where: {
                id: videoId
            },
            data:{
                transcription: transcription
            }
        })

        return transcription
    });
}