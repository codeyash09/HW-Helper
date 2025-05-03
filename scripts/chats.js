import {db} from '/scripts/createChat.js';





let userId = window.localStorage.getItem("userIdentify");
let chatMess = document.getElementById("chat-messages")
let chatList = document.getElementById("pageList");


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


async function showChats(){
    const { data, error } = await db
        .from('Chats') 
        .select('*') 
        .or(`members.cs.{"${username}"},host.eq."${userId}"`);

    if (error || !data || data.length === 0) {
        console.error("No chats found or error fetching chats:", error);
        return;
    }

    const newest = data.reverse(); // Sorting chats newest first

    if (newest.length > 0 && newest[0].chat_id) { // ✅ Check before accessing
        openChat(newest[0].chat_id);
    } else {
        console.warn("No valid chat ID found.");
    }

    for (const chat of newest) {
        const title = document.createElement("a");

        if(chat.groupchat){
            title.innerHTML = chat.title;
        }else{
            if(chat.host == "" + userId + ""){
                title.innerHTML = chat.members[0];

            }else{
                let hoster = fetchUsers(chat.host);
                hoster.then(result =>{
                    if(result[0] != undefined){
                        hoster = result[0].username;
                        
                        title.innerHTML = hoster;

                    }
                });

            }
        }
         

        title.addEventListener("click", () => {
            openChat(chat.chat_id);
        });

        chatList.appendChild(title);
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
            .select("messages, times, senders")
            .eq("chat_id", chatId)
            .single();

        if (error || !data) {
            console.error("Failed to fetch chat:", error ?? "Chat not found");
            return;
        }

        const updatedMessages = Array.isArray(data.messages) ? [...data.messages, messageText] : [messageText];
        const updatedTimes = Array.isArray(data.times) ? [...data.times, timestamp] : [timestamp];
        const updatedSenders = Array.isArray(data.senders) ? [...data.senders, sender] : [sender];


        const { error: updateError } = await db
            .from("Chats")
            .update({ messages: updatedMessages, times: updatedTimes, senders: updatedSenders })
            .eq("chat_id", chatId);

        if (updateError) {
            console.error("Error updating chat:", updateError);
            return;
        }

        
        messageInput.value = ""; 

    } catch (err) {
        console.error("Unexpected error:", err);
    }

    document.location.replace("/pages/chats.html");
});


async function openChat(id) {
    currentChat = id;
    let chat = await fetchChat(id);
    const chatMess = document.querySelector(".chat-messages");
    chatMess.innerHTML = ""; 

    chat = chat[0];

   
    for (let i = chat.messages.length - 1; i >= 0; i--) {
        const message = document.createElement("div");
        message.classList.add("message");

  
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
}

setInterval(() => {
    const parent = document.getElementById("parentElement");

    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
    showChats();
}, 2000); // Runs every 2 seconds

setInterval(() => {
    openChat(currentChat);
}, 500); // Runs every 0.5 seconds
