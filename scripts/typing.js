import {db} from '/scripts/createChat.js';
import {currentChat,username,userId} from '/scripts/chats.js';


let chatMess = document.getElementById("chat-messages")
let chatList = document.getElementById("pageList");
let chatHeader = document.getElementById("chat-header");
let chatInput = document.getElementById("chatInput");

typing = false;


chatInput.addEventListener("input", () => {
    if(chatInput.value != ""){
        
    }

});

      
async function fixTyping(currentChat){
    const { data, error } = await db
        .from('Chats') 
        .select('*') 
        .eq('chat_id', currentChat); 


    for(const chat of data){
        
        
    }
    
}
