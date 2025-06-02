let user = window.localStorage.getItem('userIdentify');
let textArea = document.getElementById("text");
let userIdent = window.localStorage.getItem('userIdentify');
let noteName = document.getElementById("first");
let submit = document.getElementById("saveButton");
let noteList = document.getElementById("pageList");

let currentNote;

if(!localStorage.getItem('loggedInStatus')){
    window.location.replace('/pages/signup.html');
}
if(localStorage.getItem('loggedInStatus') == "false"){
    window.location.replace('/pages/signup.html');
}

let db = supabase.createClient(
    'https://afqxanpmrvmdsthdqfap.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmcXhhbnBtcnZtZHN0aGRxZmFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODcyNDE4NiwiZXhwIjoyMDY0MzAwMTg2fQ.rucKLZxCP1u7Rhkq2Nb0OUjP9JbMeGtdQ-E67Z2pDYQ'
);


async function newNotes(){
    const { data, error } = await db.from('Notes').insert([
        {
           userId: userIdent,
           notes: textArea.innerHTML,
           title: noteName.innerHTML,
           date: new Date(),
        }
    ]);
}

async function updateNotes(id, updates) {
    const { data, error } = await db
      .from('Notes') 
      .update(updates) 
      .eq('noteId', id); 
  
    
  }

submit.addEventListener('click', () =>{
    if(noteName.innerHTML != '<span class="placeholder">Title...</span>' && textArea.innerHTML != '<span class="placeholder">Begin creating . . . <br><br><br><br><br></span>'){
        if(currentNote == null){
            newNotes();
        }else{
            updateNotes(currentNote, {
                title: noteName.innerHTML,
                notes: textArea.innerHTML,
                date: new Date(),
            });
        }
    }

});


async function showNotes(){
    const { data, error } = await db
        .from('Notes') 
        .select('*') 
        .eq('userId', userIdent); 

    const newest = data.reverse();

    for(const note of newest){
        if(note.title){
            const title = document.createElement("a");
            title.innerHTML = note.title;

            title.addEventListener("click", () =>{
                AdjustNote(note.noteId);
            });
            noteList.appendChild(title);
        }
    }
}

showNotes();


async function AdjustNote(id){
    const { data, error } = await db
        .from('Notes') 
        .select('*') 
        .eq('noteId', id); 


    for(const note of data){
        if(note.title){
            noteName.innerHTML = note.title;
        }
        if(note.notes){
            textArea.innerHTML = note.notes;
        }
        
    }
    currentNote = id;
}