const N8N_WEBHOOK_URL = "https://dev-academy.n8n.itelisoft.org/webhook/RecursosHumanos";

// Estado de la app
let demoMode = false;  // Cambiar a false para permitir envíos a n8n
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
  const message = `Modo demo: ${demoMode ? "Activado" : "Desactivado"}`;
  addMessage(message, "bot");
  console.log("=== MODO DEMO CAMBIADO ===");
  console.log("Estado actual:", demoMode);
  console.log("URL n8n:", N8N_WEBHOOK_URL);
});

// Verificar estado inicial al cargar
document.addEventListener("DOMContentLoaded", () => {
  console.log("=== CONFIGURACIÓN INICIAL ===");
  console.log("Modo demo:", demoMode);
  console.log("URL n8n:", N8N_WEBHOOK_URL);
  console.log("Perfil:", profile);
  
  addMessage("Sistema iniciado. Verifica que el modo demo esté desactivado para enviar a n8n.", "bot");
});

// Función para testear conexión con n8n
async function testConnection() {
  addMessage("🔄 Probando conexión con n8n...", "bot");
  
  const testData = {
    profile: profile,
    event: "test_connection",
    payload: { 
      message: "Test de conexión desde el chatbot",
      timestamp: new Date().toISOString(),
      test: true
    },
    timestamp: new Date().toISOString()
  };

  console.log("=== TEST DE CONEXIÓN ===");
  console.log("URL de prueba:", N8N_WEBHOOK_URL);
  console.log("Datos de prueba:", JSON.stringify(testData, null, 2));

  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(testData),
    });

    console.log("Status de respuesta:", res.status);
    console.log("Headers de respuesta:", Object.fromEntries(res.headers.entries()));

    if (res.ok) {
      try {
        const result = await res.json();
        console.log("Respuesta JSON:", result);
        addMessage("✅ Conexión exitosa con n8n", "bot");
        addMessage(`📡 Status: ${res.status} | Respuesta: ${JSON.stringify(result)}`, "bot");
      } catch (jsonError) {
        console.log("Respuesta no es JSON válido");
        const text = await res.text();
        console.log("Respuesta como texto:", text);
        addMessage("✅ Conexión exitosa (respuesta no-JSON)", "bot");
      }
    } else {
      const errorText = await res.text();
      console.log("Error response:", errorText);
      addMessage(`❌ Error de conexión: ${res.status} - ${res.statusText}`, "bot");
    }
  } catch (error) {
    console.error("Error de red:", error);
    addMessage(`❌ Error de red: ${error.message}`, "bot");
  }
}

// Agregar comando de test en el chat
function handleSpecialCommands(text) {
  if (text.toLowerCase() === '/test') {
    testConnection();
    return true;
  }
  if (text.toLowerCase() === '/status') {
    addMessage(`📊 Estado actual:
- Modo demo: ${demoMode ? 'Activado' : 'Desactivado'}
- URL n8n: ${N8N_WEBHOOK_URL}
- Perfil: ${profile.name || 'Sin configurar'} (${profile.id || 'Sin ID'})`, "bot");
    return true;
  }
  return false;
}

// Agregar botón de test (opcional)
// Puedes descomentar esto si quieres un botón de test
/*
document.addEventListener("DOMContentLoaded", () => {
  const testBtn = document.createElement("button");
  testBtn.textContent = "Test n8n";
  testBtn.onclick = testConnection;
  document.body.appendChild(testBtn);
});
*/

// Enviar acción rápida
function sendAction(event, payload = {}) {
  const msg = `Acción: ${event}`;
  addMessage(msg, "user");
  sendToN8N(event, payload);
}

// Enviar mensaje libre
function sendMessage(text) {
  if (!text.trim()) return;
  
  addMessage(text, "user");
  userInput.value = "";
  
  // Verificar comandos especiales
  if (handleSpecialCommands(text.trim())) {
    return;
  }
  
  // Enviar con más contexto para el flujo de n8n
  const payload = { 
    text: text.trim(),
    messageType: "chat",
    userId: profile.id || "guest",
    userName: profile.name || "Usuario",
    timestamp: new Date().toISOString()
  };
  
  sendToN8N("chat_message", payload);
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
  const data = { 
    profile, 
    event, 
    payload,
    timestamp: new Date().toISOString()
  };

  console.log("=== DEBUG N8N ===");
  console.log("URL:", N8N_WEBHOOK_URL);
  console.log("Modo demo:", demoMode);
  console.log("Datos a enviar:", JSON.stringify(data, null, 2));

  if (demoMode) {
    console.log("Ejecutando en modo DEMO - no se envía a n8n");
    setTimeout(() => {
      addMessage(`[DEMO] Respuesta para ${event}`, "bot");
    }, 600);
    return;
  }

  // Mostrar mensaje de "escribiendo..."
  const typingDiv = document.createElement("div");
  typingDiv.className = "message bot typing";
  typingDiv.textContent = "Escribiendo...";
  typingDiv.id = "typing-indicator";
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    console.log("Iniciando petición a n8n...");
    
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(data),
    });

    console.log("Respuesta HTTP status:", res.status);
    console.log("Respuesta HTTP headers:", res.headers);

    // Remover indicador de escritura
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status} - ${res.statusText}`);
    }

    // Leer la respuesta como texto primero, luego intentar parsear como JSON
    const responseText = await res.text();
    console.log("Respuesta cruda de n8n:", responseText);
    
    let result;
    try {
      result = JSON.parse(responseText);
      console.log("Respuesta parseada como JSON:", result);
    } catch (parseError) {
      result = responseText;
      console.log("Usando respuesta como texto plano:", result);
    }
    
    // Manejar diferentes tipos de respuesta
    if (typeof result === 'string') {
      // Es texto plano - remover comillas si las tiene
      const cleanText = result.replace(/^"(.*)"$/, '$1');
      addMessage(cleanText, "bot");
    } else if (result && (result.message || result.text || result.response)) {
      // Es JSON con propiedades específicas
      addMessage(result.message || result.text || result.response, "bot");
    } else if (result && typeof result === 'object') {
      // Es JSON pero sin propiedades conocidas, convertir a string
      addMessage(JSON.stringify(result), "bot");
    } else {
      console.log("Respuesta sin mensaje específico, mostrando confirmación");
      addMessage("✅ Mensaje enviado correctamente a n8n", "bot");
    }
    
  } catch (err) {
    console.error("ERROR completo:", err);
    console.error("Error stack:", err.stack);
    
    // Remover indicador de escritura en caso de error
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
    
    addMessage(`❌ Error: ${err.message}`, "bot");
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