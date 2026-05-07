let ws;
let currentUserId = null;

let users = [];
let onlineUsers = new Set();

// ---------- AUTH ----------
async function auth() {
    const res = await fetch("http://localhost:3000/users/me", {
        credentials: "include"
    });

    if (!res.ok) {
        window.location.href = "./login.html";
        return false;
    }

    const user = await res.json();
    currentUserId = user.id;
    return true;
}

// ---------- USERS ----------
async function getUsers() {
    const res = await fetch("http://localhost:3000/users", {
        credentials: "include"
    });

    const data= await res.json();
    users=data;
}

// ---------- RENDER ----------
function renderUsers() {
    const ul = document.getElementById("users");
    ul.innerHTML = "";

    for (const u of users) {
        const li = document.createElement("li");
        li.id = `user-${u.id}`;
        applyUserUI(li, u);
        ul.appendChild(li);
    }
}

function updateUserUI(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const li = document.getElementById(`user-${userId}`);
    if (!li) return;

    applyUserUI(li, user);
}

function applyUserUI(li, user) {
    li.textContent = `${user.email} - ${onlineUsers.has(user.id) ? "online" : "offline"
        }`;

    if (user.id === currentUserId) {
        li.style.color = "#6D28D9";
        li.style.fontWeight = "bold";
    }
}

// ---------- WS ----------
function openWS() {
    ws = new WebSocket("ws://localhost:3000");

    ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        console.log(msg)

        if (msg.type === "USER_ONLINE") {
            onlineUsers.add(msg.userId);
            updateUserUI(msg.userId);
        }

        if (msg.type === "USER_OFFLINE") {
            onlineUsers.delete(msg.userId);
            updateUserUI(msg.userId);
        }

        if(msg.type==="INIT"){
            onlineUsers.clear();
            onlineUsers = new Set(msg.onlineUsers);
            renderUsers()
        }
    };
    ws.onerror = (err) => {
        console.error("WebSocket error:", err);
    }


    ws.onclose = () => {
        console.log("WebSocket connection closed");
    };
}

// ---------- LOGOUT ----------
async function logout() {
    await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include"
    });

    window.location.href = "./login.html";
}

// ---------- START ----------
async function start() {
    const ok = await auth();
    if (!ok) return;

    await getUsers();
    renderUsers();
    openWS();
}

start();