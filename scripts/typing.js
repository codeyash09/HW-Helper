import {db} from '/scripts/createChat.js';
import {currentChat,username,userId} from '/scripts/chats.js';


let chatMess = document.getElementById("chat-messages")
let chatList = document.getElementById("pageList");
let chatHeader = document.getElementById("chat-header");
let chatInput = document.getElementById("chatInput");

let typing = false;
let oldCurrent = currentChat;
let counter = 0;
let numId;

chatInput.addEventListener("input", async () => {
    if(chatInput.value != "" && chatInput.value != " " && chatInput.value != null){
        if(typing == false){
            await fixTyping(currentChat, true);
        }
    }else{
        typing = false;
        await fixTyping(currentChat, false);
        
    }

});


setInterval(afk, 200);

async function afk(){
 
    if(oldCurrent != currentChat){
        await fixTyping(oldCurrent, false);
        typing = false;

        oldCurrent = currentChat;
    }
}

chatInput.addEventListener('blur', async (event) =>{
    event.preventDefault();
    await fixTyping(currentChat, false);
    typing = false;
});

//First: Host Then Others
      
async function fixTyping(currentChat, onOrOff){
    
    if(currentChat != undefined){
        numId;

        const { data, error } = await db
            .from('Chats') 
            .select('*') 
            .eq('chat_id', currentChat); 

      
        console.log('Typing: ' + counter++)
        if(userId == data[0].host){
            numId = 0;

        }else{
            
            for(let i = 0; i<data[0].members.length;i++){
                if(data[0].members[i] == "" + username + ""){
                    numId = i + 1;
                }
            }
        }
        let typingNew = data[0].typing;
        typingNew[numId] = onOrOff;
        

        const { error: updateError } = await db
            .from("Chats")
            .update({ typing: typingNew })
            .eq("chat_id", currentChat);
 

        if (updateError) {
            console.error("Error updating chat:", updateError);
            return;
        }
       
        typing = onOrOff;
        
    }
 
}


db
  .channel('realtime-changes')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Chats' }, (payload) => {
    
    if(payload.new.chat_id == currentChat){

        displayTyping(payload.new);
     

    }

    
  })
  .subscribe();

async function displayTyping(payload){
    let typing = payload.typing;
    console.log("hi");

    if(typing){
        
        
        if(userId == payload.host){
            numId = 0;

        }else{
            
            for(let i = 0; i<payload.members.length;i++){
                if(payload.members[i] == "" + username + ""){
                    numId = i + 1;
                }
            }
        }
        
        for(let i = 0; i< typing.length; i++){
            if(i != numId){
                if(i == 0 && typing[i] == true){
                    console.log(fetchUser(payload.host));
                }
            }
        }

    }else{
        console.log("no typing");
    }
}

async function fetchUser() {
  const { data, error } = await db
    .from('Users')
    .select('username')
    .eq('id', userId);
  console.log("Typing: " + counter++);
  
  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }

  return data;
}