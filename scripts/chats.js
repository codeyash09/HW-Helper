import {db} from '/scripts/createChat.js';





let userId = window.localStorage.getItem("userIdentify");
let chatMess = document.getElementById("chat-messages")
let chatList = document.getElementById("pageList");
let chatHeader = document.getElementById("chat-header");
let chatInput = document.getElementById("chatInput");

let chatOpened = false;
let chatsSys;
let rowSys;
let oldCurrent;
let savedScrollPosition;
let username;
async function fetchUser() {
  const { data, error } = await db
    .from('Users')
    .select('username')
    .eq('id', userId);

  if (error) {
    console.error('Error fetching data:', error);
    return null;
  }

  return data;
}

let currentChat;



async function fetchUsers(id) {
    const { data, error } = await db
      .from('Users')
      .select('username')
      .eq('id', id);
  
    if (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  
    return data;
}


username = fetchUser();
username.then(result =>{
    if(result[0] != undefined){
        username = result[0].username;
        
        showChats();

    }
});


async function showChats() {
    const { data, error } = await db
        .from('Chats')
        .select('*')
        .or(`members.cs.{"${username}"},host.eq."${userId}"`);

    if (error || !data || data.length === 0) {
        console.error("No chats found or error fetching chats:", error);
        return;
    }

    // Sort chats by the most recent message timestamp
    const sortedChats = data.sort((a, b) => {
        const lastMessageTimeA = new Date(a.times?.slice(-1)[0] || 0);
        const lastMessageTimeB = new Date(b.times?.slice(-1)[0] || 0);
        return lastMessageTimeB - lastMessageTimeA; // Recent messages first
    });

    rowSys = sortedChats;

    // Preserve scroll position before updating the list
    const savedScrollPosition = chatList.scrollTop;

    const existingChatIds = new Set(Array.from(chatList.children).map(el => el.getAttribute("data-chat-id")));

    for (const chat of sortedChats) {
        if (!existingChatIds.has(chat.chat_id)) {
            const title = document.createElement("a");
            title.setAttribute("data-chat-id", chat.chat_id);

            let userNum;
            if ("" + userId === chat.host) {
                userNum = chat.members.length;
            } else {
                userNum = chat.members.indexOf(username);
            }

            let readNum = chat.read[userNum];

            if (chat.groupchat) {
                title.innerHTML = chat.title;
            } else {
                if (chat.host === "" + userId) {
                    title.innerHTML = chat.members[0];
                } else {
                    let hoster = await fetchUsers(chat.host);
                    if (hoster[0]) {
                        title.innerHTML = hoster[0].username;
                    }
                }
            }

            if (readNum > 0) {
                title.innerHTML += ` <span class='read-notification'>${readNum}</span>`;
            }

            title.addEventListener("click", () => openChat(chat.chat_id));

            chatList.appendChild(title);
        }
    }

    // Restore scroll position after update
    requestAnimationFrame(() => {
        chatList.scrollTop = savedScrollPosition;
    });

    // Open the latest chat automatically if none is opened
    if (!chatOpened && sortedChats.length > 0 && sortedChats[0].chat_id) {
        openChat(sortedChats[0].chat_id);
        chatOpened = true;
    } else {
        openChat(currentChat);
    }
}





async function fetchChat(id) {
    const { data, error } = await db
      .from('Chats')
      .select('*')
      .eq('chat_id', id);
  
    if (error) {
      console.error('Error fetching data:', error);
      return null;
    }
    
    return data;
}


const sendButton = document.querySelector(".fa-paper-plane");
const messageInput = document.querySelector(".chat-input input");

sendButton.addEventListener("click", async () => {
    const messageText = messageInput.value.trim();
    if (!messageText) return; 

    const chatId = currentChat; 
    const sender = username; 
    const timestamp = new Date().toISOString();

    try {

        const { data, error } = await db
            .from("Chats")
            .select("*")
            .eq("chat_id", chatId)
            .single();

        if (error || !data) {
            console.error("Failed to fetch chat:", error ?? "Chat not found");
            return;
        }

        const updatedMessages = Array.isArray(data.messages) ? [...data.messages, messageText] : [messageText];
        const updatedTimes = Array.isArray(data.times) ? [...data.times, timestamp] : [timestamp];
        const updatedSenders = Array.isArray(data.senders) ? [...data.senders, sender] : [sender];
        
        
        let updatedRead = [];



        updatedRead = data.read.map(Number);

        if(Array.isArray(data.read)){
            if("" + userId + "" == data.host){
                for(let i = 0; i<data.members.length; i++){
                    if(data.members[i] != "" + username + ""){  
                        updatedRead[i]++;
                    }   
                }
            }else{
                for(let i = 0; i<data.members.length; i++){
                    if(data.members[i] != "" + username + ""){  
                        updatedRead[i]++;
                    }   
                }
                updatedRead[data.members.length]++;
            }
            
        }else{
            console.log("Errenous read");
        }



   

        const { error: updateError } = await db
            .from("Chats")
            .update({ messages: updatedMessages, times: updatedTimes, senders: updatedSenders, read: updatedRead })
            .eq("chat_id", chatId);

        if (updateError) {
            console.error("Error updating chat:", updateError);
            return;
        }

        
        messageInput.value = ""; 

    } catch (err) {
        console.error("Unexpected error:", err);
    }

    
});


async function openChat(id) {



    


    currentChat = id;
    let chat = await fetchChat(id);
    const chatMess = document.querySelector(".chat-messages");
    chatMess.innerHTML = ""; 
    

    chat = chat[0];
    chatsSys = chat;
    


    let userNum;

    if("" + userId + "" == chat.host){
        userNum = chat.members.length;
    }else{
        for(let i = 0; i < chat.members.length; i++){
            if(chat.members[i] == "" + username + ""){
                userNum = i;
            }
        }
    }
    
    let readNum = chat.read[userNum];

    
        

    if(chat.groupchat){
        chatHeader.innerHTML = chat.title;
        chatInput.placeholder = "Message " + chat.title;
    }else{
        if(chat.host == "" + userId + ""){
            chatHeader.innerHTML = chat.members[0];
            chatInput.placeholder = "Message " + chat.members[0];


        }else{
            let hoster = fetchUsers(chat.host);
            hoster.then(result =>{
                if(result[0] != undefined){
                    hoster = result[0].username;
                    
                    chatHeader.innerHTML = hoster;
                    chatInput.placeholder = "Message " + hoster;


                }
            });

        }
    }
   
    for (let i = chat.messages.length - 1; i >= 0; i--) {
        const message = document.createElement("div");
        message.classList.add("message");


     

        // Extract script content
        const scriptMatch = chat.messages[i].match(/<script>([\s\S]*?)<\/script>/);
        if (scriptMatch && scriptMatch[1]) {
            // Create and execute script dynamically
            let blob = new Blob([scriptMatch[1]], { type: "text/javascript" });
            let scriptUrl = URL.createObjectURL(blob);
            let scripture = document.createElement("script");
            scripture.src = scriptUrl;
            document.body.appendChild(scripture);

        
        }

  
        const avatar = document.createElement("div");
        avatar.classList.add("avatar");
        const content = document.createElement("div");
        content.classList.add("content");
        const usernameElement = document.createElement("div");
        usernameElement.classList.add("username");
        usernameElement.innerHTML = chat.senders?.[i] || "Unknown User";
        const text = document.createElement("div");
        text.classList.add("text");
        text.innerHTML = chat.messages?.[i] || "No message";
        const time = document.createElement("div");
        time.classList.add("timestamp");
        time.innerHTML = chat.times?.[i] || "Unknown Time";

        if (chat.senders[i] === username) {
            message.classList.add("own-message");
        }

        message.appendChild(avatar);
        message.appendChild(content);
        content.appendChild(usernameElement);
        content.appendChild(text);
        content.appendChild(time);

        chatMess.appendChild(message);
    }

    let updatedRead = chat.read;

    if(oldCurrent != currentChat){
        chatMess.scrollTop = chatMess.scrollHeight;
        oldCurrent = currentChat;
        


    }else{
        chatMess.scrollTop = savedScrollPosition;
    
    }

    chatMess.addEventListener("scroll", () => {
        
        const threshold = 100; // Adjust this value to control how close to the bottom is considered "read"
        const atThreshold = chatMess.scrollTop >= -threshold;

        if (atThreshold) {
  


            
            updatedRead[userNum] = 0;
            
            updateRead(updatedRead);



            
            
        }

    });

    const threshold = 100; // Adjust this value to control how close to the bottom is considered "read"
    const atThreshold = chatMess.scrollTop >= -threshold;

    if (atThreshold) {
        

        updatedRead[userNum] = 0;
        
        updateRead(updatedRead);
        
    }



    

    

}


async function updateRead(updatedRead){
    const { error: updateError } = await db
        .from("Chats")
        .update({ read: updatedRead })
        .eq("chat_id", currentChat);

    if (updateError) {
        console.error("Error updating chat:", updateError);
        return;
    }

    
}






setInterval(() => {
    
    changeChats();
}, 500); // Runs every 0.5 seconds


setInterval(() => {
    
    changeRow();
}, 500); // Runs every 0.5 seconds


async function changeChats(){
    
   
    let chat = await fetchChat(currentChat);

    chat = chat[0];
    

    if(JSON.stringify(chat.messages) != JSON.stringify(chatsSys.messages)){
        openChat(currentChat);
        chatsSys = chat;


        
    }
    
}


async function changeRow() {
    const { data, error } = await db
        .from('Chats')
        .select('*')
        .or(`members.cs.{"${username}"},host.eq."${userId}"`);

    if (error || !data || data.length === 0) {
        console.error("No chats found or error fetching chats:", error);
        return;
    }

    const newest = data.reverse(); 

    // Save the current scroll position before clearing
    savedScrollPosition = chatMess.scrollTop;

    if (JSON.stringify(newest) !== JSON.stringify(rowSys)) {
        // Instead of completely rebuilding, first hold the position
        

        while (chatList.firstChild) {
            chatList.removeChild(chatList.firstChild);
        }
        

        // Update the list
        await showChats();

        // Restore scroll position after content is replaced
        setTimeout(() => {
            chatMess.scrollTop = savedScrollPosition;
            
        }, 0); // Small delay ensures DOM is fully updated

        rowSys = newest;
    }
}


