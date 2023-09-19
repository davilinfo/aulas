import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select.tsx";
import { api } from "@/lib/axios.ts";

interface Prompt{
    id: string
    template: string
    title: string
}

interface PromptSelectProps{
    onPromptSelected: (template: string) => void
}

export function PromptSelect(props: PromptSelectProps){
    const [prompts, setPrompts] = useState<Prompt[] | null>(null)

    //se não for informado nada no colchete o use effect será disparado uma única vez
    //se informado, então quando variável for alterado useEffect será disparado
    useEffect(()=>{ 
        api.get("/prompts").then(response =>{
            setPrompts(response.data)
        })

    }, [])

    function handlePromptSelected(promptId: string){
        const selectedPrompt = prompts?.find(prompt=> prompt.id === promptId)

        if (!selectedPrompt){
            return
        }

        props.onPromptSelected(selectedPrompt.template)
    }

    return (
        <Select onValueChange={handlePromptSelected} >
            <SelectTrigger>
                <SelectValue placeholder="Selecione um prompt ..."/>
            </SelectTrigger>
            <SelectContent className="w-4 h-4">
                {prompts?.map(prompt=> {
                    return (
                        <SelectItem key={prompt.id} value={prompt.id}>{prompt.title}</SelectItem>
                    )
                })}
            </SelectContent>                
        </Select>
    )
}