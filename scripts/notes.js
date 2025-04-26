let user = window.localStorage.getItem('userIdentify');
let textArea = document.getElementById("text");
let userIdent = window.localStorage.getItem('userIdentify');
let noteName = document.getElementById("first");
let submit = document.getElementById("saveButton");



if(!localStorage.getItem('loggedInStatus')){
    window.location.replace('/pages/login.html');
}
if(localStorage.getItem('loggedInStatus') == "false"){
    window.location.replace('/pages/login.html');
}

const db = supabase.createClient(
    'https://mvovikninvudypyuhdqg.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12b3Zpa25pbnZ1ZHlweXVoZHFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDg1NjAwNSwiZXhwIjoyMDYwNDMyMDA1fQ.GA5vPB-n9gkdpJfrSy2q10fLr9dVHMIEpKGk6ysdpU4'
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

submit.addEventListener('click', () =>{
    if(noteName.innerHTML != '<span class="placeholder">Title...</span>' && textArea.innerHTML != '<span class="placeholder">Begin creating . . . <br><br><br><br><br></span>' || ){
        newNotes();
    }

});