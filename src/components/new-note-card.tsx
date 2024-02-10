import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { X } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'sonner';
import flagBR from '../assets/icons8-brasil-emoji-48.png';
import flagUSA from '../assets/icons8-emoji-dos-estados-unidos-48.png';

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null;

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {

  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [content, setContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [langSpeechRecognation, setLangSpeechRecognation] = useState("");

  function handleStartEditor () {
    setShouldShowOnboarding(false);
  } 

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);
    if (event.target.value === '') {
      setShouldShowOnboarding(true);
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault();

    if (content === '')
      return;

    onNoteCreated(content);
    setContent("");
    setShouldShowOnboarding(true);
    
    toast.success("Nota criada com sucesso !!!");
  }

  function handleStartRecording() {
    
    const isSpeechRecognitionAPIAvailable = 
      'SpeechRecognition' in window ||
      'webkitSpeechRecognition' in window;  

    if (!isSpeechRecognitionAPIAvailable){
      toast.error("Infelizmente seu navegador não suporta a API de gravação!");
      return;
    }
    console.log(langSpeechRecognation);
    if (!langSpeechRecognation) {
      toast.info("Seleciona um idioma para gravar susa nota!");
      return;
    }

    setIsRecording(true);
    setShouldShowOnboarding(false);

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    speechRecognition = new SpeechRecognitionAPI();

    speechRecognition.lang = langSpeechRecognation; // trazer um combobo de seleção de linguagem
    speechRecognition.continuous = true; 
    speechRecognition.maxAlternatives = 1;
    speechRecognition.interimResults = true; // resultados conforme vou falando

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, "");

      setContent(transcription);
    }

    speechRecognition.onerror = (event) => {
      console.log(event);
    }

    speechRecognition.start();
  }

  function handleStopRecording() {
    setIsRecording(false);
    setShouldShowOnboarding(true);
    speechRecognition?.stop();
  }

    return (
      <Dialog.Root>
          <Dialog.Trigger className=' flex flex-col rounded-md bg-slate-700 p-5 space-y-3 overflow-hidden relative text-left hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400 outline-none'>
            <span className='text-sm font-medium text-slate-200'>
              Adicionar nota
            </span>
            <p className='text-sm leading-6 text-slate-400'>
              Grave uma nota em aúdio que será convertida para texto automaticamente.
            </p>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className='inset-0 fixed bg-black/50'/>
            <Dialog.Content className='fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none overflow-hidden'>
              <Dialog.Close className='absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100' onClick={() => {  setIsRecording(false); setShouldShowOnboarding(true); }}>
                <X className='size-5'/>
              </Dialog.Close>

              <form className="flex-1 flex flex-col">
                <div className='flex flex-1 flex-col gap-3 p-5'>
                  <span className="text-sm font-medium text-slate-300 flex items-center gap-4">
                    Adicionando nota

                    <Select.Root value={langSpeechRecognation} onValueChange={setLangSpeechRecognation}>
                      <Select.Trigger className="bg-transparent text-slate-400 p-1 hover:ring-1 hover:ring-slate-600 outline-none rounded">
                        <Select.Value placeholder="Selecione uma língua..." />
                      </Select.Trigger>
                      <Select.Portal>
                        <Select.Content className="bg-slate-700 p-2 rounded border border-lime-500">
                          <Select.Viewport className="SelectViewport">
                          <Select.Group>
                            <Select.Item value='pt-br' className='w-full cursor-pointer hover:underline flex items-center gap-2'>
                              <img src={flagBR} alt="Lingua nativa do Brasil" className='h-6' /> 
                              <Select.ItemText>
                                Português
                              </Select.ItemText>
                            </Select.Item>

                            <Select.Item  value='en-US' className='w-full cursor-pointer hover:underline flex items-center gap-2'>
                              <img src={flagUSA} alt="Lingua nativa dos Estados Unidos" className='h-6'/> 
                              <Select.ItemText>
                                Inglês
                              </Select.ItemText>
                            </Select.Item>
                          </Select.Group>
                          </Select.Viewport>
                        </Select.Content>
                      </Select.Portal>
                    </Select.Root>
                  </span>
                  {
                    shouldShowOnboarding ? 
                    (
                      <p className="text-sm leading-6 text-slate-400">
                        Comece <button type="button" className='font-medium text-lime-400 hover:underline' onClick={handleStartRecording}>gravando uma nota</button> em aúdio ou se preferir <button type="button" className='font-medium text-lime-400 hover:underline' onClick={handleStartEditor}>utilize apenas texto</button>.
                      </p>
                    )
                    :
                    <textarea 
                      autoFocus 
                      className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
                      onChange={handleContentChange} value={content}>
                    </textarea> 
                  }
                </div>

                {isRecording ? 
                  <button 
                    type="button"  
                    onClick={handleStopRecording}
                    className='flex items-center justify-center gap-2 w-full font-medium bg-slate-900 py-4 text-center text-sm text-slate-400 outline-none group hover:bg-slate-500'>
                    <div className='size-3 rounded-full bg-red-500 animate-pulse'/>
                    Gravando! (clique p/ interromper)
                  </button>
                  :
                  <button 
                    type="button"  
                    onClick={handleSaveNote}
                    className='w-full font-medium bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none group hover:bg-lime-500'>
                    Salvar nota
                  </button>
                } 
                
              </form>
            </Dialog.Content>
          </Dialog.Portal>
      </Dialog.Root>
    );
}