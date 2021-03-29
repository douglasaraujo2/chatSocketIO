const socket = io();
let userName = "";
let userList = [];

let loginPage = document.querySelector("#loginPage");
let chatPage = document.querySelector("#chatPage");

let loginNameInput = document.querySelector("#loginNameInput");
let chatTextInput = document.querySelector("#chatTextInput");

loginPage.style.display = "flex";
chatPage.style.display = "none";

function renderUserList() {
  let ul = document.querySelector(".userList");
  ul.innerHTML = "";
  userList.forEach((i) => {
    ul.innerHTML += `<li>${i}</li>`;
  });
}

function addMessage(type, user, msg) {
  let ul = document.querySelector(".chatList");
  switch (type) {
    case "status":
      ul.innerHTML += `<li class="m-status">${msg}</li>`;
      break;
    case "msg":
      ul.innerHTML += `<li class="m-txt"><span class="${
        user === userName ? "me" : ""
      }">${user}</span> ${msg}</li>`;
      break;
  }
}

loginNameInput.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    let name = loginNameInput.value.trim();
    if (name != "") {
      userName = name;
      document.title = `Chat (${userName})`;

      socket.emit("join-request", userName);
    }
  }
});

let buttonEntrar = document.querySelector("#button-entrar");
buttonEntrar.addEventListener("click", () => {
  let name = loginNameInput.value.trim();
  if (name != "") {
    userName = name;
    document.title = `Chat (${userName})`;

    socket.emit("join-request", userName);
  }
});

chatTextInput.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    let txt = chatTextInput.value.trim();
    chatTextInput.value = "";
    if (txt) {
      addMessage("msg", userName, txt);
      socket.emit("send-msg", txt);
    }
  }
});

socket.on("user-ok", (list) => {
  loginPage.style.display = "none";
  chatPage.style.display = "flex";
  chatTextInput.focus();

  addMessage("status", "", "Conectado!");
  userList = list;
  renderUserList();
});

socket.on("list-update", (data) => {
  if (data.joined) {
    addMessage("status", "", `${data.joined} entrou no chat`);
  } else if (data.left) {
    addMessage("status", "", `${data.left} saiu do chat`);
  }
  userList = data.list;
  renderUserList();
});

socket.on("show-msg", (data) => {
  addMessage("msg", data.userName, data.message);
});

socket.on("disconnect", () => {
  addMessage("status", null, "Você foi desconectado");
});

socket.on("connect_error", () => {
  addMessage("status", null, "Tentando reconectar...");
});
