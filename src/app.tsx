import { ChangeEvent, useState } from 'react';
import logo from './assets/Logo.svg';
import { NewNoteCard } from './components/new-note-card';
import { NoteCard } from './components/note-card';

interface Note {
  id: string
  date: Date
  content: string
}

export function App() {
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<Note[]>(() => {
    const notesOnStorage = localStorage.getItem('notes');

    if (notesOnStorage)
      return JSON.parse(notesOnStorage);

    return [];
  });

  function onNoteCreated(content: string) {
    const newNote = {
      id: crypto.randomUUID(),
      date: new Date(),
      content
    };

    const notesArray = [newNote, ...notes] 

    setNotes(notesArray);

    localStorage.setItem('notes', JSON.stringify(notesArray));
  }

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {

    const query = event.target.value;

    setSearch(query);

  }

  function onNoteDeleted(id: string) {
    // criar um novo array com a alteração modificada
    const notesArray = notes.filter(note => note.id !== id);
    
    setNotes(notesArray);

    localStorage.setItem('notes', JSON.stringify(notesArray));
  }

  const filteredNotes = search != '' 
    ? notes.filter(notes => notes.content.toLowerCase().includes(search.toLowerCase()))
    : notes;

  return (
    <div className="mx-auto max-w-6xl my-12 space-y-6 px-5">
      <img src={logo} alt="Logo da aplicação" />

      <form className='w-full'>
        <input 
          type="text" 
          placeholder='Busque em suas notas...'
          className='w-full bg-transparent text-3xl font-semibold tracking-tight placeholder:text-slate-500 outline-none' 
          onChange={handleSearch}
        />
      </form>

      <div className='h-px bg-slate-700'/>

      <div className='grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[250px] gap-6'>
        <NewNoteCard onNoteCreated={onNoteCreated}/>
        {
          filteredNotes.map(note => {
            return  <NoteCard key={note.id} note={note} onNoteDeleted={onNoteDeleted} />
          })
        }
      </div>
    </div>
  );
  
}
