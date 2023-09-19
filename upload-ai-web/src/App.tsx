import { Separator } from "./components/ui/separator.tsx";
import { Button } from "./components/ui/button.tsx";
import { Github, Wand2 } from "lucide-react"
import { Textarea } from "./components/ui/textarea.tsx";
import { Label } from "./components/ui/label.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select.tsx";
import { Slider } from "./components/ui/slider.tsx";
import { VideoInputForm } from "./components/ui/video-input-form.tsx";
import { PromptSelect } from "./components/ui/prompt-select.tsx";
import { useState } from "react";
import { useCompletion } from 'ai/react'

function App() {
  const [temperature, setTemperature] = useState(0.5)
  const [videoId, setVideoId] = useState<string | null>(null)

  const { 
    input, 
    setInput,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading
  } = useCompletion({
    api: "http://localhost:3333/ai/complete",
    body: {
      videoId,
      temperature
    },
    headers: {
      'Content-Type': 'application/json'
    }
  })    

  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-6 py-3 flex items-center justify-between border-b">
        <h1 className="text-xl font-bold">upload.ai</h1>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Desenvolvido com ❤️ no NLW da RocketSeat</span>

          <Separator orientation="vertical" className="h-6"></Separator>

          <Button variant={"outline"}>
            <Github className="w-4 h-4 mr-2"></Github>
            Github
          </Button>
        </div>        
      </div>

      <main className="flex-1 p-6 flex gap-6">
        <div className="flex flex-col flex-1 gap-4">
          <div className="grid grid-rows-2 gap-4 flex-1">
            <Textarea className="resize-none p-4 leading-relaxed" 
            placeholder="Inclua o prompt para a IA..."
            value={input}
            onChange={handleInputChange}
            ></Textarea>

            <Textarea className="resize-none p-4 leading-relaxed" 
            placeholder="Resultado gerado pela IA..." 
            value={completion}
            readOnly></Textarea>
          </div>
          <p className="text-sm text-muted-foreground">Lembre-se você pode utilizar a variável 
            <code className="text-violet-400"> {'{transcription}'} </code> no seu promot para adicionar o conteúdo da transcrição do vídeo selecionado</p>
        </div>
        <aside className="w-80 space-y-8">
          <VideoInputForm onVideoUpload={setVideoId} />

          <Separator/>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <PromptSelect onPromptSelected={setInput} />

            <div className="space-w-1">
              <Label>Modelo</Label>
              <Select disabled defaultValue="gpt3.5">
                <SelectTrigger>
                  <SelectValue/>
                </SelectTrigger>
                <SelectContent className="w-4 h-4">
                  <SelectItem value="gpt3.5">GPT 3.5 turbo 16k</SelectItem>
                </SelectContent>                
              </Select>
              <span className="block text-xs text-muted-foreground italic">
                poderá ser customizado em breve
              </span>
            </div>

            <Separator></Separator>

            <div className="space-w-4">
              <Label>Temperatura</Label>
              <Slider id="slider"
              min={0}
              max={1}
              step={0.1}
              value={[temperature]}
              onValueChange={value => setTemperature(value[0])}
              />
              <span className="block text-xs text-muted-foreground italic leading-relaxed">
                Valores mais altos tendem a deixar o resultado mais criativo e com possíveis erros
              </span>
            </div>

            <Separator></Separator>

            <Button disabled={isLoading} type="submit" className="w-full">
              Executar
              <Wand2 className="w-4 h-4 ml-2"></Wand2>
            </Button>
          </form>          
        </aside>
      </main>
    </div>
  )
}

export default App