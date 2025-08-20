const N8N_WEBHOOK_URL = "";

// Estado de la app
let demoMode = true;
let profile = { id: "", name: "" };

// Elementos
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Enviar mensaje manual
sendBtn.addEventListener("click", () => sendMessage(userInput.value));
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage(userInput.value);
});

// Guardar perfil
document.getElementById("saveProfile").addEventListener("click", () => {
  profile.id = document.getElementById("employeeId").value;
  profile.name = document.getElementById("employeeName").value;
  addMessage("Perfil guardado.", "bot");
});

// Cambiar tema
document.getElementById("toggleTheme").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

// Activar/desactivar modo demo
document.getElementById("toggleDemo").addEventListener("click", () => {
  demoMode = !demoMode;
  addMessage(`Modo demo: ${demoMode ? "Activado" : "Desactivado"}`, "bot");
});

// Enviar acción rápida
function sendAction(event, payload = {}) {
  const msg = `Acción: ${event}`;
  addMessage(msg, "user");
  sendToN8N(event, payload);
}

// Enviar mensaje libre
function sendMessage(text) {
  if (!text) return;
  addMessage(text, "user");
  userInput.value = "";
  sendToN8N("chat", { text });
}

// Mostrar mensajes en pantalla
function addMessage(text, sender = "bot") {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Enviar al webhook de n8n
async function sendToN8N(event, payload) {
  const data = { profile, event, payload };

  if (demoMode) {
    setTimeout(() => {
      addMessage(`[DEMO] Respuesta para ${event}`, "bot");
    }, 600);
    return;
  }

  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    addMessage(result.text || "Sin respuesta", "bot");
  } catch (err) {
    addMessage("Error al conectar con n8n", "bot");
  }
}

// ----- Manejo de Modales -----
function openModal(type) {
  const modal = document.getElementById("modal");
  const form = document.getElementById("modal-form");
  const title = document.getElementById("modal-title");
  form.innerHTML = "";

  if (type === "register") {
    title.textContent = "Alta de empleado";
    form.innerHTML = `
      <input name="id" placeholder="ID">
      <input name="name" placeholder="Nombre">
      <input name="role" placeholder="Puesto">
      <input name="area" placeholder="Área">
      <input type="date" name="date">
    `;
  } else if (type === "vacation") {
    title.textContent = "Solicitud de vacaciones";
    form.innerHTML = `
      <input type="date" name="from">
      <input type="date" name="to">
    `;
  } else if (type === "permission") {
    title.textContent = "Solicitud de permiso";
    form.innerHTML = `
      <input name="reason" placeholder="Motivo">
      <input type="date" name="date">
    `;
  }

  form.onsubmit = (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    sendAction(type === "register" ? "employee_register" : `${type}_request`, payload);
    closeModal();
  };

  modal.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}
