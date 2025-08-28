// URL del webhook de n8n
const N8N_WEBHOOK_URL = "https://dev-academy.n8n.itelisoft.org/webhook/RecursosHumanos";

// Configuración de Supabase - REEMPLAZA CON TUS DATOS REALES
const SUPABASE_URL = "https://buplrfnkqevhxeprikoi.supabase.co"; // Reemplaza con tu URL de Supabase
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1cGxyZm5rcWV2aHhlcHJpa29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1NzE1NjksImV4cCI6MjA0NjE0NzU2OX0.-mfJyfNvEDzAxSqJqfUSwlMWLDfO-ac__QfpiuX6VDo"; // Reemplaza con tu clave anónima
const TABLA_EMPLEADOS = "Empleados_alta"; // Nombre de tu tabla en Supabase

// Elementos DOM
const chatBox = document.getElementById("chat-box");
const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Elementos del modal
const openFormBtn = document.getElementById("openEmployeeForm");
const modal = document.getElementById("employeeModal");
const closeModalBtn = document.getElementById("closeModal");
const cancelFormBtn = document.getElementById("cancelForm");
const employeeForm = document.getElementById("employeeForm");
const submitBtn = document.getElementById("submitForm");

// Elemento del botón de tema
const themeBtn = document.getElementById("toggleTheme");

// Elementos de la vista de empleados
const viewEmployeesBtn = document.getElementById("viewEmployees");
const employeesModal = document.getElementById("employeesModal");
const closeEmployeesModalBtn = document.getElementById("closeEmployeesModal");
const refreshEmployeesBtn = document.getElementById("refreshEmployees");
const retryLoadBtn = document.getElementById("retryLoad");

// Función para hacer scroll automático
function scrollToBottom() {
  const container = chatContainer || chatBox;
  
  // Múltiples intentos para asegurar el scroll
  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 10);
  
  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 100);
  
  // También usar smooth scroll como respaldo
  setTimeout(() => {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  }, 200);
}

// Función para agregar mensajes al chat
function addMessage(text, sender = "bot") {
  const msg = document.createElement("div");
  msg.className = `msg ${sender}`;

  if (sender === "bot") {
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    msg.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;

  msg.appendChild(bubble);
  chatBox.appendChild(msg);
  
  // Forzar scroll inmediato y después con delay
  const container = chatContainer || chatBox;
  container.scrollTop = container.scrollHeight;
  scrollToBottom();
}

// Animación de "escribiendo"
let typingEl = null;
function showTyping() {
  if (typingEl) return;
  typingEl = document.createElement("div");
  typingEl.className = "msg bot";
  typingEl.innerHTML = `
    <div class="avatar"></div>
    <div class="bubble typing">
      <span class="dot-typing"></span>
    </div>`;
  chatBox.appendChild(typingEl);
  scrollToBottom();
}

function hideTyping() {
  if (typingEl) { 
    typingEl.remove(); 
    typingEl = null; 
  }
}

// Función para enviar mensaje a n8n
async function sendToN8N(message) {
  try {
    showTyping();

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: message })
    });

    hideTyping();

    const result = await response.text();
    let botResponse;
    
    try {
      botResponse = JSON.parse(result);
    } catch {
      botResponse = result;
    }

    // Mostrar respuesta del bot
    if (typeof botResponse === "string") {
      addMessage(botResponse, "bot");
    } else if (botResponse && (botResponse.message || botResponse.text || botResponse.response)) {
      addMessage(botResponse.message || botResponse.text || botResponse.response, "bot");
    } else {
      addMessage("Mensaje procesado correctamente", "bot");
    }
  } catch (error) {
    hideTyping();
    addMessage("Error de conexión con el bot", "bot");
  }
}

// Función para enviar mensaje
function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Mostrar mensaje del usuario
  addMessage(message, "user");
  userInput.value = "";

  // Enviar a n8n
  sendToN8N(message);
}

// Event listeners
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Event listeners del modal
openFormBtn.addEventListener("click", mostrarModal);
closeModalBtn.addEventListener("click", ocultarModal);
cancelFormBtn.addEventListener("click", ocultarModal);
employeeForm.addEventListener("submit", manejarEnvioFormulario);

// Event listener del botón de tema
themeBtn.addEventListener("click", toggleTheme);

// Event listeners de la vista de empleados
viewEmployeesBtn.addEventListener("click", mostrarVistaEmpleados);
closeEmployeesModalBtn.addEventListener("click", ocultarVistaEmpleados);
refreshEmployeesBtn.addEventListener("click", cargarEmpleados);
retryLoadBtn.addEventListener("click", cargarEmpleados);

// Cerrar modal al hacer clic fuera
modal.addEventListener("click", (e) => {
  if (e.target === modal) ocultarModal();
});

employeesModal.addEventListener("click", (e) => {
  if (e.target === employeesModal) ocultarVistaEmpleados();
});

// ===== FUNCIONES DE TEMA =====

// Función para alternar tema
function toggleTheme() {
  console.log("🌙 Cambiando tema...");
  
  // Alternar clase dark en el body
  document.body.classList.toggle("dark");
  
  // Verificar si está en modo oscuro
  const isDarkMode = document.body.classList.contains("dark");
  
  // Cambiar el ícono del botón
  themeBtn.textContent = isDarkMode ? "☀️" : "🌙";
  
  // Guardar preferencia en localStorage
  localStorage.setItem("darkMode", isDarkMode ? "true" : "false");
  
  console.log(`🎨 Tema cambiado a: ${isDarkMode ? "Oscuro" : "Claro"}`);
  
  
}

// Función para cargar tema guardado
function loadSavedTheme() {
  const savedTheme = localStorage.getItem("darkMode");
  
  if (savedTheme === "true") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️";
    console.log("🌙 Tema oscuro cargado desde localStorage");
  } else {
    document.body.classList.remove("dark");
    themeBtn.textContent = "🌙";
    console.log("☀️ Tema claro cargado desde localStorage");
  }
}

// ===== FUNCIONES DE VISTA DE EMPLEADOS =====

// Mostrar vista de empleados
function mostrarVistaEmpleados() {
  console.log("👥 Abriendo vista de empleados");
  employeesModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  cargarEmpleados();
}

// Ocultar vista de empleados
function ocultarVistaEmpleados() {
  console.log("❌ Cerrando vista de empleados");
  employeesModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

// Función para obtener empleados de Supabase
async function obtenerEmpleadosSupabase() {
  try {
    console.log("🔄 Obteniendo empleados de Supabase...");
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLA_EMPLEADOS}?select=*&order=created_at.desc`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Error en respuesta de Supabase:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const empleados = await response.json();
    console.log("✅ Empleados obtenidos exitosamente:", empleados);
    return { success: true, data: empleados };

  } catch (error) {
    console.error("❌ Error al obtener empleados:", error);
    return { success: false, error: error.message };
  }
}

// Cargar y mostrar empleados
async function cargarEmpleados() {
  console.log("📋 Cargando lista de empleados...");
  
  const loadingEl = document.getElementById('employeesLoading');
  const listEl = document.getElementById('employeesList');
  const errorEl = document.getElementById('employeesError');
  const countEl = document.getElementById('employeeCount');
  
  // Mostrar loading
  loadingEl.classList.remove('hidden');
  listEl.innerHTML = '';
  errorEl.classList.add('hidden');
  
  try {
    const resultado = await obtenerEmpleadosSupabase();
    
    loadingEl.classList.add('hidden');
    
    if (resultado.success) {
      const empleados = resultado.data;
      
      // Actualizar contador
      countEl.textContent = `${empleados.length} empleado${empleados.length !== 1 ? 's' : ''} registrado${empleados.length !== 1 ? 's' : ''}`;
      
      if (empleados.length === 0) {
        listEl.innerHTML = `
          <div class="empty-state">
            <h3>👤 No hay empleados registrados</h3>
            <p>Utiliza el botón "👤" para registrar el primer empleado.</p>
          </div>
        `;
      } else {
        listEl.innerHTML = empleados.map(empleado => crearTarjetaEmpleado(empleado)).join('');
      }
      
      console.log(`✅ ${empleados.length} empleados mostrados`);
      
    } else {
      throw new Error(resultado.error);
    }
    
  } catch (error) {
    console.error("💥 Error al cargar empleados:", error);
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
    countEl.textContent = 'Error al cargar';
  }
}

// Crear tarjeta de empleado
function crearTarjetaEmpleado(empleado) {
  const iniciales = (empleado.nombre.charAt(0) + empleado.apellido.charAt(0)).toUpperCase();
  const fechaFormateada = formatearFecha(empleado.created_at);
  
  return `
    <div class="employee-card">
      <div class="employee-header">
        <div class="employee-avatar">${iniciales}</div>
        <div class="employee-info">
          <h3>${empleado.nombre} ${empleado.apellido}</h3>
          <span class="employee-id">ID: ${empleado.id}</span>
        </div>
      </div>
      
      <div class="employee-details">
        <div class="employee-detail">
          <span class="detail-icon">📧</span>
          <span class="detail-text">${empleado.correo}</span>
        </div>
        
        <div class="employee-detail">
          <span class="detail-icon">📞</span>
          <span class="detail-text">${empleado.telefono}</span>
        </div>
        
        <div class="employee-detail">
          <span class="detail-icon">📍</span>
          <span class="detail-text">${empleado.direccion}</span>
        </div>
      </div>
      
      <div class="employee-date">
        📅 Registrado: ${fechaFormateada}
      </div>
    </div>
  `;
}

// Formatear fecha
function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ===== FUNCIONES DE SUPABASE =====

// Función para guardar empleado en Supabase
async function guardarEmpleadoSupabase(empleado) {
  try {
    console.log("🔄 Iniciando guardado en Supabase...", empleado);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLA_EMPLEADOS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(empleado)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("❌ Error en respuesta de Supabase:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("✅ Empleado guardado exitosamente:", result);
    return { success: true, data: result };

  } catch (error) {
    console.error("❌ Error al guardar empleado:", error);
    return { success: false, error: error.message };
  }
}

// ===== FUNCIONES DEL MODAL =====

// Mostrar modal
function mostrarModal() {
  console.log("📝 Abriendo formulario de empleado");
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// Ocultar modal
function ocultarModal() {
  console.log("❌ Cerrando formulario de empleado");
  modal.classList.add('hidden');
  document.body.style.overflow = 'auto';
  limpiarFormulario();
}

// Limpiar formulario
function limpiarFormulario() {
  employeeForm.reset();
  setLoadingState(false);
}

// Estado de carga del botón
function setLoadingState(loading) {
  const submitText = submitBtn.querySelector('.submit-text');
  const loadingText = submitBtn.querySelector('.loading');
  
  if (loading) {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    submitText.classList.add('hidden');
    loadingText.classList.remove('hidden');
  } else {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    submitText.classList.remove('hidden');
    loadingText.classList.add('hidden');
  }
}

// Validar formulario
function validarFormulario(formData) {
  const errores = [];
  
  if (!formData.nombre.trim()) errores.push("El nombre es requerido");
  if (!formData.apellido.trim()) errores.push("El apellido es requerido");
  if (!formData.correo.trim()) errores.push("El correo es requerido");
  if (!formData.telefono.trim()) errores.push("El teléfono es requerido");
  if (!formData.direccion.trim()) errores.push("La dirección es requerida");
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (formData.correo && !emailRegex.test(formData.correo)) {
    errores.push("El formato del correo no es válido");
  }
  
  return errores;
}

// Manejar envío del formulario
async function manejarEnvioFormulario(e) {
  e.preventDefault();
  
  console.log("📋 Procesando envío de formulario...");
  setLoadingState(true);
  
  try {
    // Recopilar datos del formulario (solo los campos requeridos)
    const formData = {
      nombre: document.getElementById('nombre').value.trim(),
      apellido: document.getElementById('apellido').value.trim(),
      correo: document.getElementById('correo').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      direccion: document.getElementById('direccion').value.trim()
      // No incluir id ni fecha ya que son automáticos
    };
    
    console.log("📊 Datos del formulario:", formData);
    
    // Validar datos
    const errores = validarFormulario(formData);
    if (errores.length > 0) {
      console.warn("⚠️ Errores de validación:", errores);
      alert("Errores de validación:\n" + errores.join("\n"));
      setLoadingState(false);
      return;
    }
    
    // Guardar en Supabase
    const resultado = await guardarEmpleadoSupabase(formData);
    
    if (resultado.success) {
      console.log("🎉 Empleado registrado exitosamente");
      alert("✅ Empleado registrado exitosamente");
      addMessage(`✅ Nuevo empleado registrado: ${formData.nombre} ${formData.apellido}`, "bot");
      ocultarModal();
    } else {
      console.error("💥 Error al registrar empleado:", resultado.error);
      alert("❌ Error al registrar empleado: " + resultado.error);
    }
    
  } catch (error) {
    console.error("💥 Error inesperado:", error);
    alert("❌ Error inesperado: " + error.message);
  } finally {
    setLoadingState(false);
  }
}

// Mensaje inicial
document.addEventListener("DOMContentLoaded", () => {
  // Cargar tema guardado primero
  loadSavedTheme();
  
  // Mostrar mensaje inicial
  addMessage("🤖 Chatbot de Recursos Humanos iniciado", "bot");
});