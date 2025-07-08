document.getElementById("chat-send").addEventListener("click", sendMessage);
document.getElementById("chat-input").addEventListener("keypress", function(e) {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (!message) return;

  appendMessage("Utente", message);
  input.value = "";

  // Simula la risposta del bot per ora
  setTimeout(() => {
    appendMessage("SettecolliBot", "Grazie per la tua domanda! Stiamo preparando una risposta...");
  }, 1000);
}

function appendMessage(sender, text) {
  const chatBody = document.getElementById("chat-body");
  const messageElement = document.createElement("div");
  messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBody.appendChild(messageElement);
  chatBody.scrollTop = chatBody.scrollHeight;
}
