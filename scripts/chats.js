import { db } from '/scripts/createChat.js';

let count = 0;
let read = 10;

let userId = window.localStorage.getItem("userIdentify");

if (userId == null || userId == "null") {
    window.location.replace('/pages/signup.html');
}

let chatMess = document.getElementById("chat-messages");
let chatList = document.getElementById("pageList");
let chatHeader = document.getElementById("chat-header");
let chatInput = document.getElementById("chatInput");
const sendButton = document.querySelector(".fa-paper-plane");
const messageInput = document.querySelector(".chat-input input");

let chatOpened = false;
let chatsSys;
let rowSys;
let oldCurrent;
let savedScrollPosition;
let username;
let currentChat;

function convertToLocalTime(isoTimestamp) {
    if (!isoTimestamp) return "Unknown Time";
    let date = new Date(isoTimestamp);
    let rn = new Date();
    let daysApart = Math.floor((rn - date) / (1000 * 60 * 60 * 24));

    if (daysApart > 6) {
        return date.toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    let timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    let dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let dayDiff = rn.getDay() - date.getDay();
    if (dayDiff < 0) dayDiff += 7;

    return dayDiff === 0 ? `Today at ${timeStr}` :
           dayDiff === 1 ? `Yesterday at ${timeStr}` :
           `${dayNames[date.getDay()]} at ${timeStr}`;
}

async function fetchUser() {
    const { data, error } = await db
        .from('Users')
        .select('username')
        .eq('id', userId);
    console.log(`fetchUser count: ${count++}`);

    if (error) {
        console.error('Error fetching data:', error);
        return null;
    }
    return data;
}

async function fetchUsers(id) {
    const { data, error } = await db
        .from('Users')
        .select('username')
        .eq('id', id);
    console.log(`fetchUsers count: ${count++}`);

    if (error) {
        console.error('Error fetching data:', error);
        return null;
    }
    return data;
}

username = fetchUser();
username.then(result => {
    if (result && result[0] !== undefined) {
        username = result[0].username;
        showChats();
    } else {
        console.error("Username not found or error fetching user data.");
    }
});

async function showChats() {
    console.log("showChats Hi");
    const { data, error } = await db
        .from('Chats')
        .select('*')
        .or(`members.cs.{"${username}"},host.eq."${userId}"`);

    if (error || !data || data.length === 0) {
        console.error("No chats found or error fetching chats:", error);
        chatList.innerHTML = '';
        return;
    }

    const sortedChats = data.sort((a, b) => {
        const lastMessageTimeA = new Date(a.times?.slice(-1)[0] || 0);
        const lastMessageTimeB = new Date(b.times?.slice(-1)[0] || 0);
        return lastMessageTimeB - lastMessageTimeA;
    });

    rowSys = sortedChats;

    const savedChatListScrollPosition = chatList.scrollTop;

    chatList.innerHTML = '';

    for (const chat of sortedChats) {
        const tab = document.createElement("a");
        tab.setAttribute("data-chat-id", chat.chat_id);
        tab.classList.add("chat-list-item");

        let userNum;
        if ("" + userId === chat.host) {
            userNum = chat.members.length;
        } else {
            userNum = chat.members.indexOf(username);
        }

        let readNum = chat.read?.[userNum] || 0;

        if (chat.groupchat) {
            tab.innerHTML = chat.title;
        } else {
            if (chat.host === "" + userId) {
                tab.innerHTML = chat.members[0];
            } else {
                let hoster = await fetchUsers(chat.host);
                if (hoster && hoster[0]) {
                    tab.innerHTML = hoster[0].username;
                }
            }
        }

        if (readNum > 0) {
            tab.innerHTML += ` <span class='read-notification'>${readNum}</span>`;
        }

        tab.addEventListener("click", () => openChat(chat.chat_id));
        chatList.appendChild(tab);
    }

    requestAnimationFrame(() => {
        chatList.scrollTop = savedChatListScrollPosition;
    });

    if (!chatOpened && sortedChats.length > 0) {
        openChat(sortedChats[0].chat_id);
        chatOpened = true;
    } else if (currentChat) {
        openChat(currentChat);
    }

    if (currentChat) {
        document.querySelectorAll('a[data-chat-id]').forEach(element => {
            element.classList.remove("currentTab");
        });
        const currentElement = document.querySelector(`a[data-chat-id="${currentChat}"]`);
        if (currentElement) {
            currentElement.classList.add("currentTab");
        }
    }
}

async function fetchChat(id) {
    if (id === undefined || id === null || id === "") {
        console.error('fetchChat called with an undefined or invalid ID:', id);
        return null;
    }
    const { data, error } = await db
        .from('Chats')
        .select('*')
        .eq('chat_id', id);
    console.log(`fetchChat count: ${count++}`);

    if (error) {
        console.error('Error fetching data:', error);
        return null;
    }
    return data && data.length > 0 ? data[0] : null;
}

async function sendMessage() {
    const messageText = messageInput.value.trim();
    if (!messageText || !currentChat || !username) return;

    const chatId = currentChat;
    const sender = username;
    const timestamp = new Date().toISOString();

    try {
        const { data, error } = await db
            .from("Chats")
            .select("messages, times, senders, read, host, members")
            .eq("chat_id", chatId)
            .single();
        console.log(`sendMessage fetch chat count: ${count++}`);

        if (error || !data) {
            console.error("Failed to fetch chat for sending message:", error?.message ?? "Chat not found");
            return;
        }

        const updatedMessages = Array.isArray(data.messages) ? [...data.messages, messageText] : [messageText];
        const updatedTimes = Array.isArray(data.times) ? [...data.times, timestamp] : [timestamp];
        const updatedSenders = Array.isArray(data.senders) ? [...data.senders, sender] : [sender];

        let updatedRead = Array.isArray(data.read) ? [...data.read] : [];

        let senderIndex = -1;
        if ("" + userId === data.host) {
            senderIndex = data.members.length;
        } else {
            senderIndex = data.members.indexOf(username);
        }

        for (let i = 0; i < updatedRead.length; i++) {
            if (i !== senderIndex) {
                updatedRead[i]++;
            }
        }

        const { error: updateError } = await db
            .from("Chats")
            .update({ messages: updatedMessages, times: updatedTimes, senders: updatedSenders, read: updatedRead })
            .eq("chat_id", chatId);
        console.log(`sendMessage update chat count: ${count++}`);

        if (updateError) {
            console.error("Error updating chat with new message:", updateError);
            return;
        }

        messageInput.value = "";

    } catch (err) {
        console.error("Unexpected error during message send:", err);
    }
}

messageInput.addEventListener("keydown", async function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        await sendMessage();
    }
});

sendButton.addEventListener("click", async () => {
    await sendMessage();
});

async function openChat(id, chatler = null) {
    if (id === undefined || id === null || id === "") {
        console.error('openChat called with an undefined or invalid ID:', id);
        return;
    }

    if (currentChat && chatMess) {
        savedScrollPosition = chatMess.scrollTop;
    }

    currentChat = id;

    document.querySelectorAll('a[data-chat-id]').forEach(element => {
        element.classList.remove("currentTab");
    });
    const currentTabElement = document.querySelector(`a[data-chat-id="${id}"]`);
    if (currentTabElement) {
        currentTabElement.classList.add("currentTab");
        const badge = currentTabElement.querySelector('.read-notification');
        if (badge) {
            badge.remove();
        }
    }

    let chat;
    if (chatler) {
        chat = chatler;
    } else {
        chat = await fetchChat(id);
    }

    if (!chat) {
        console.error("Chat data not found for ID:", id);
        return;
    }

    chatMess.innerHTML = "";
    chatsSys = chat;

    let userNum;
    if ("" + userId === chat.host) {
        userNum = chat.members.length;
    } else {
        userNum = chat.members.indexOf(username);
    }

    if (chat.groupchat) {
        chatHeader.innerHTML = chat.title;
        chatInput.placeholder = `Message ${chat.title}`;
    } else {
        if (chat.host === "" + userId) {
            chatHeader.innerHTML = chat.members[0];
            chatInput.placeholder = `Message ${chat.members[0]}`;
        } else {
            let hoster = await fetchUsers(chat.host);
            if (hoster && hoster[0]) {
                chatHeader.innerHTML = hoster[0].username;
                chatInput.placeholder = `Message ${hoster[0].username}`;
            }
        }
    }

    if (chat && chat.messages && chat.messages.length > 0) {
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
            time.innerHTML = convertToLocalTime(chat.times?.[i]);

            if (chat.senders[i] === username) {
                message.classList.add("own-message");
            }

            message.appendChild(avatar);
            message.appendChild(content);
            content.appendChild(usernameElement);
            content.appendChild(text);
            content.appendChild(time);

            chatMess.insertBefore(message, chatMess.firstChild);
        }
    }

    if (oldCurrent !== currentChat) {
        chatMess.scrollTop = chatMess.scrollHeight;
        oldCurrent = currentChat;
    } else {
        chatMess.scrollTop = savedScrollPosition;
    }

    const markChatAsRead = async () => {
        const threshold = 100;
        const atBottom = (chatMess.scrollHeight - chatMess.scrollTop - chatMess.clientHeight) <= threshold;

        const latestChat = await fetchChat(currentChat);
        if (!latestChat) return;

        let currentUserNum;
        if ("" + userId === latestChat.host) {
            currentUserNum = latestChat.members.length;
        } else {
            currentUserNum = latestChat.members.indexOf(username);
        }

        if (atBottom && latestChat.read?.[currentUserNum] > 0) {
            let updatedRead = [...latestChat.read];
            updatedRead[currentUserNum] = 0;

            await updateRead(updatedRead, currentChat, currentUserNum);
        }
    };

    chatMess.removeEventListener("scroll", markChatAsRead);
    chatMess.addEventListener("scroll", markChatAsRead);

    markChatAsRead();
}

async function updateRead(updatedReadArray, chatIdToUpdate, userIdx) {
    const currentReadCount = updatedReadArray[userIdx];
    if (currentReadCount === 0) {
        return;
    }

    const { error: updateError } = await db
        .from("Chats")
        .update({ read: updatedReadArray })
        .eq("chat_id", chatIdToUpdate);

    if (updateError) {
        console.error("Error updating chat read status:", updateError);
        return;
    }
    console.log(`Read status updated for chat ${chatIdToUpdate}. Count set to 0 for user at index ${userIdx}`);

    showChats();
}

db
    .channel('realtime-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Chats' }, (payload) => {
        console.log("Realtime INSERT detected:", payload.new);
        changeRow();
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'Chats' }, (payload) => {
        console.log("Realtime UPDATE detected:", payload.new);
        if (payload.new.chat_id === currentChat) {
            openChat(currentChat, payload.new);
        } else {
            changeRow();
        }
    })
    .subscribe();


async function changeRow() {
    const { data, error } = await db
        .from('Chats')
        .select('*')
        .or(`members.cs.{"${username}"},host.eq."${userId}"`);
    console.log(`changeRow fetch chats count: ${count++}`);

    if (error || !data || data.length === 0) {
        console.error("No chats found or error fetching chats in changeRow:", error);
        chatList.innerHTML = '';
        return;
    }

    const sortedNewest = data.sort((a, b) => {
        const lastMessageTimeA = new Date(a.times?.slice(-1)[0] || 0);
        const lastMessageTimeB = new Date(b.times?.slice(-1)[0] || 0);
        return lastMessageTimeB - lastMessageTimeA;
    });

    if (JSON.stringify(sortedNewest) !== JSON.stringify(rowSys)) {
        await showChats();

        rowSys = sortedNewest;
    }
}

export { currentChat, username, userId, count };