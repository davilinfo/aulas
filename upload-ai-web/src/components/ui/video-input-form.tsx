import { FileVideo, Upload } from "lucide-react";
import { Separator } from "./separator.tsx";
import { Label } from "./label.tsx";
import { Textarea } from "./textarea.tsx";
import { Button } from "./button.tsx";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpeg.ts";
import { fetchFile } from "@ffmpeg/util";
import { api } from "@/lib/axios.ts";

interface VideoInputFormProps{
    onVideoUpload: (id:string) => void
}

type Status = 'waiting' | 'converting' | 'uploading' | 'generating' | 'success' | 'error'

const statusMessaging = {
    converting: "Convertendo",
    generating: 'Transcrevendo',
    uploading: "Carregando",
    success: "Sucesso",
    error: "Erro"
}

export function VideoInputForm(props: VideoInputFormProps){
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [status, setStatus] = useState<Status>("waiting")

    const promptInputRef = useRef<HTMLTextAreaElement>(null)

    function handleFileSelected(event: ChangeEvent<HTMLInputElement>){        
        const {files} = event.currentTarget

        if (!files){
            return
        }

        const selectedFile = files[0]

        setVideoFile(selectedFile)        
    }

    async function convertVideoToAudio(video: File){
        console.log('Convert started')

        const ffmpeg = await getFFmpeg()

        console.log('ffmpeg', ffmpeg)

        await ffmpeg.writeFile('input.mp4', await fetchFile(video))

        ffmpeg.on('log', log =>{
            console.log(log)
        })

        ffmpeg.on('progress', progress =>{
            console.log('Convert progress' + Math.round(progress.progress * 100))
        })

        await ffmpeg.exec([
            '-i',
            'input.mp4', 
            '-map',
            '0:a',
            '-b:a', 
            '20k', 
            '-acodec', 
            'libmp3lame', 
            'output.mp3' 
        ]
        )

        const data = await ffmpeg.readFile('output.mp3')
        const audioFileBlob = new Blob([data], {type: 'audio/mpeg'})
        const audioFile = new File([audioFileBlob], 'audio.mp3', {type: 'audio/mpeg'})

        console.log('Convert finish')

        return audioFile
    }

    async function handleUploadVideo(event: FormEvent<HTMLFormElement>){
        event.preventDefault()

        const prompt = promptInputRef.current?.value
        console.log('video', videoFile)
        if (!videoFile){
            return
        }

        //converter video em audio
        setStatus('converting')

        const audioFile = await convertVideoToAudio(videoFile)

        const data = new FormData()

        data.append('file', audioFile)

        setStatus('uploading')

        const response = await api.post("/videos", data)

        const videoId = response.data.video.id

        setStatus('generating')

        try {
            const result = await api.post(`videos/${videoId}/transcription`, { prompt })    
            if (result.status === 500){
                setStatus('error')
            }else{
                setStatus('success')
                props.onVideoUpload(videoId)
            }
        } catch (error) {
            console.log("error", error)
            setStatus('error')
        }                        

        console.log("finalizou")
    }

    const previewUrl = useMemo(()=>{
        if (!videoFile){
            return null
        }

        return URL.createObjectURL(videoFile)
    }, [videoFile])

    return (
        <form onSubmit={handleUploadVideo} className="space-y-6">
            <label 
              htmlFor="video"
              className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col
                gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
            >
              {previewUrl ? <video src={previewUrl} controls={false} className="pointer-events-none absolute inset-0" /> : 
                (
                    <>
                        <FileVideo className="w-4 h-4"></FileVideo>
                        Selecione um video
                    </>
                )
              }
            </label>
            <input type="file" id="video" accept="video/mp4" className="sr-only" onChange={handleFileSelected} />

            <Separator></Separator>

            <div className="space-y-6">
              <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>
              <Textarea ref={promptInputRef} 
                id="transcription_prompt" 
                disabled={status !== 'waiting'}
                className="h-20 leading-relaxed resize-none"
                placeholder="Inclua palavras-chave mencionadas no video separadas por (,)"
              >                
              </Textarea>
            </div>

            <Button 
                data-success={status === "success"}
                disabled={status !== 'waiting'} 
                type="submit" 
                className="w-full data-[success=true]:bg-emerald-400">
                {status === "waiting" ? (
                    <>
                        Carregar vídeo
                        <Upload className="h-4 w-4 ml-2"></Upload>
                    </>
                    ) 
                    : statusMessaging[status]
                }
            </Button>
          </form>
    )
}