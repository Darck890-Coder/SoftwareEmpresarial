// URL del webhook de n8n
const N8N_WEBHOOK_URL = "https://dev-academy.n8n.itelisoft.org/webhook/RecursosHumanos";

const SUPABASE_URL = "https://buplrfnkqevhxeprikoi.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1cGxyZm5rcWV2aHhlcHJpa29pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1NzE1NjksImV4cCI6MjA0NjE0NzU2OX0.-mfJyfNvEDzAxSqJqfUSwlMWLDfO-ac__QfpiuX6VDo";
const TABLA_EMPLEADOS = "Empleados_alta"; 
const TABLA_VACACIONES = "Vacaciones_empleados";
const TABLA_PERMISOS = "Permisos"; 

// Elementos DOM
const chatBox = document.getElementById("chat-box");
const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Elementos del modal de empleados
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

// Elementos del modal de permisos
const permissionsBtn = document.getElementById("permissionsBtn");
const permissionsModal = document.getElementById("permissionsModal");
const closePermissionsModalBtn = document.getElementById("closePermissionsModal");
const permissionsForm = document.getElementById("permissionsForm");
const employeeSelect = document.getElementById("employeeSelect");
const submitPermissionsBtn = document.getElementById("submitPermissions");

// Elementos del modal de vacaciones
const vacationsBtn = document.getElementById("vacationsBtn");
const vacationsModal = document.getElementById("vacationsModal");
const closeVacationsModalBtn = document.getElementById("closeVacationsModal");
const vacationsForm = document.getElementById("vacationsForm");
const vacationEmployeeSelect = document.getElementById("vacationEmployeeSelect");
const submitVacationsBtn = document.getElementById("submitVacations");

// ===== FUNCIONES BÁSICAS =====

function addMessage(message, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    messageDiv.innerHTML = `<div class="message-content">${message}</div>`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("message", "bot", "typing-indicator");
    typingDiv.id = "typing-indicator";
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-animation">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
            <span class="typing-text">Escribiendo...</span>
        </div>
    `;
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingDiv;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function sendMessage() {
    const message = userInput.value.trim();
    console.log("📤 Enviando mensaje:", message);
    console.log("🔗 URL del webhook:", N8N_WEBHOOK_URL);
    
    if (message) {
        addMessage(message, "user");
        userInput.value = "";
        
        // Mostrar animación de escribiendo
        const typingIndicator = showTypingIndicator();
        
        try {
            console.log("🚀 Iniciando petición fetch...");
            const requestBody = { message: message };
            console.log("📦 Body de la petición:", requestBody);
            
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log("📥 Respuesta recibida:", response);
            console.log("✅ Estado de la respuesta:", response.status);
            console.log("🔍 Response.ok:", response.ok);

            // Quitar indicador de escribiendo
            removeTypingIndicator();

            if (response.ok) {
                // Leer la respuesta como texto primero
                const responseText = await response.text();
                console.log("📋 Respuesta como texto:", responseText);
                
                try {
                    // Intentar parsear como JSON
                    const data = JSON.parse(responseText);
                    console.log("📋 Datos parseados como JSON:", data);
                    console.log("💬 Respuesta del bot:", data.response);
                    
                    addMessage(data.response || "Mensaje recibido correctamente", "bot");
                } catch (jsonError) {
                    console.log("⚠️ La respuesta no es JSON válido, usando texto directamente");
                    console.log("� Respuesta del bot (texto):", responseText);
                    
                    // Si no es JSON, usar el texto directamente
                    addMessage(responseText || "Mensaje recibido correctamente", "bot");
                }
            } else {
                console.error("❌ Error en la respuesta:", response.status, response.statusText);
                const errorText = await response.text();
                console.error("📄 Texto del error:", errorText);
                addMessage("Error al enviar mensaje. Por favor intenta nuevamente.", "bot");
            }
        } catch (error) {
            // Quitar indicador de escribiendo en caso de error
            removeTypingIndicator();
            
            console.error('💥 Error en fetch:', error);
            console.error('🔍 Tipo de error:', error.name);
            console.error('📝 Mensaje de error:', error.message);
            addMessage("Error de conexión. Por favor verifica tu internet.", "bot");
        }
    } else {
        console.log("⚠️ Mensaje vacío, no se envía");
    }
}

// ===== FUNCIONES DE EMPLEADOS =====

async function cargarEmpleados() {
    try {
        console.log("🔄 Cargando empleados desde Supabase...");
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLA_EMPLEADOS}?select=*`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (response.ok) {
            const empleados = await response.json();
            console.log("✅ Empleados cargados:", empleados);
            return { success: true, data: empleados };
        } else {
            const errorText = await response.text();
            console.error("❌ Error al cargar empleados:", response.status, errorText);
            return { success: false, error: `Error ${response.status}: ${errorText}` };
        }
    } catch (error) {
        console.error("💥 Error de conexión:", error);
        return { success: false, error: error.message };
    }
}

async function guardarEmpleado(datosEmpleado) {
    try {
        console.log("💾 Guardando empleado en Supabase...", datosEmpleado);
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLA_EMPLEADOS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(datosEmpleado)
        });

        if (response.ok) {
            console.log("✅ Empleado guardado exitosamente");
            return { success: true };
        } else {
            const errorText = await response.text();
            console.error("❌ Error al guardar empleado:", response.status, errorText);
            return { success: false, error: `Error ${response.status}: ${errorText}` };
        }
    } catch (error) {
        console.error("💥 Error de conexión:", error);
        return { success: false, error: error.message };
    }
}

// ===== FUNCIONES DE MODALES =====

function abrirModal() {
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function cerrarModal() {
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (employeeForm) {
            employeeForm.reset();
        }
    }
}

function abrirModalEmpleados() {
    if (employeesModal) {
        employeesModal.classList.remove('hidden');
        employeesModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        cargarListaEmpleados();
    }
}

function cerrarModalEmpleados() {
    if (employeesModal) {
        employeesModal.classList.add('hidden');
        employeesModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function abrirModalPermisos() {
    console.log("🔓 Abriendo modal de permisos...");
    console.log("permissionsModal:", permissionsModal);
    if (permissionsModal) {
        permissionsModal.classList.remove('hidden');
        permissionsModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        cargarEmpleadosEnSelect();
        console.log("✅ Modal de permisos abierto");
    } else {
        console.error("❌ No se encontró el modal de permisos");
    }
}

function cerrarModalPermisos() {
    console.log("🔒 Cerrando modal de permisos...");
    if (permissionsModal) {
        permissionsModal.classList.add('hidden');
        permissionsModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (permissionsForm) {
            permissionsForm.reset();
        }
        console.log("✅ Modal de permisos cerrado");
    }
}

function abrirModalVacaciones() {
    console.log("🏖️ Abriendo modal de vacaciones...");
    console.log("vacationsModal:", vacationsModal);
    if (vacationsModal) {
        vacationsModal.classList.remove('hidden');
        vacationsModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        cargarEmpleadosEnVacaciones();
        console.log("✅ Modal de vacaciones abierto");
    } else {
        console.error("❌ No se encontró el modal de vacaciones");
    }
}

function cerrarModalVacaciones() {
    console.log("🔒 Cerrando modal de vacaciones...");
    if (vacationsModal) {
        vacationsModal.classList.add('hidden');
        vacationsModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (vacationsForm) {
            vacationsForm.reset();
        }
        console.log("✅ Modal de vacaciones cerrado");
    }
}

async function cargarEmpleadosEnSelect() {
    const resultado = await cargarEmpleados();
    if (resultado.success && employeeSelect) {
        employeeSelect.innerHTML = '<option value="">Seleccionar empleado...</option>';
        resultado.data.forEach(empleado => {
            const option = document.createElement('option');
            option.value = empleado.id;
            option.textContent = `${empleado.nombre} ${empleado.apellido}`;
            option.dataset.empleado = JSON.stringify(empleado);
            employeeSelect.appendChild(option);
        });
    }
}

async function cargarEmpleadosEnVacaciones() {
    const resultado = await cargarEmpleados();
    if (resultado.success && vacationEmployeeSelect) {
        vacationEmployeeSelect.innerHTML = '<option value="">Seleccionar empleado...</option>';
        resultado.data.forEach(empleado => {
            const option = document.createElement('option');
            option.value = empleado.id;
            option.textContent = `${empleado.nombre} ${empleado.apellido}`;
            option.dataset.empleado = JSON.stringify(empleado);
            vacationEmployeeSelect.appendChild(option);
        });
    }
}

async function cargarListaEmpleados() {
    const employeeList = document.getElementById('employeeList');
    const loadingDiv = document.getElementById('loadingEmployees');
    const errorDiv = document.getElementById('errorLoadingEmployees');
    const employeeCount = document.getElementById('employeeCount');
    
    if (loadingDiv) loadingDiv.classList.remove('hidden');
    if (errorDiv) errorDiv.classList.add('hidden');
    if (employeeList) employeeList.innerHTML = '';
    if (employeeCount) employeeCount.textContent = 'Cargando...';
    
    const resultado = await cargarEmpleados();
    
    if (loadingDiv) loadingDiv.classList.add('hidden');
    
    if (resultado.success) {
        if (employeeList && employeeCount) {
            const totalEmpleados = resultado.data.length;
            employeeCount.innerHTML = `📊 Total de empleados: <strong>${totalEmpleados}</strong>`;
            
            if (totalEmpleados === 0) {
                employeeList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">👥</div>
                        <h3>No hay empleados registrados</h3>
                        <p>Comienza registrando tu primer empleado usando el botón "👤" en la parte superior.</p>
                    </div>
                `;
            } else {
                resultado.data.forEach((empleado, index) => {
                    const employeeCard = document.createElement('div');
                    employeeCard.className = 'employee-card';
                    employeeCard.innerHTML = `
                        <div class="employee-header">
                            <div class="employee-avatar">${empleado.nombre.charAt(0)}${empleado.apellido.charAt(0)}</div>
                            <div class="employee-number">#${(index + 1).toString().padStart(3, '0')}</div>
                        </div>
                        <div class="employee-info">
                            <h3>${empleado.nombre} ${empleado.apellido}</h3>
                            <div class="employee-details">
                                <div class="detail-item">
                                    <span class="detail-icon">✉️</span>
                                    <span class="detail-label">Email:</span>
                                    <span class="detail-value">${empleado.correo}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-icon">📞</span>
                                    <span class="detail-label">Teléfono:</span>
                                    <span class="detail-value">${empleado.telefono}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="detail-icon">📍</span>
                                    <span class="detail-label">Dirección:</span>
                                    <span class="detail-value">${empleado.direccion}</span>
                                </div>
                            </div>
                        </div>
                    `;
                    employeeList.appendChild(employeeCard);
                });
            }
        }
    } else {
        if (errorDiv && employeeCount) {
            errorDiv.classList.remove('hidden');
            errorDiv.textContent = `Error al cargar empleados: ${resultado.error}`;
            employeeCount.textContent = '❌ Error al cargar';
        }
    }
}

// ===== FUNCIONES DE RESUMEN =====

function actualizarResumenVacaciones() {
    const startDate = document.getElementById('vacationStartDate')?.value;
    const endDate = document.getElementById('vacationEndDate')?.value;
    const summaryElement = document.getElementById('vacationPeriodSummary');
    
    if (startDate && endDate && summaryElement) {
        const fechaInicio = new Date(startDate);
        const fechaFin = new Date(endDate);
        
        if (fechaFin >= fechaInicio) {
            const diffTime = Math.abs(fechaFin - fechaInicio);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir el día de inicio
            
            const formatearFecha = (fecha) => {
                return fecha.toLocaleDateString('es-ES', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
            };
            
            summaryElement.innerHTML = `
                <strong>${diffDays} día${diffDays !== 1 ? 's' : ''}</strong><br>
                <small>Del ${formatearFecha(fechaInicio)} al ${formatearFecha(fechaFin)}</small>
            `;
        } else {
            summaryElement.innerHTML = '<span style="color: var(--error-color);">❌ Fecha de fin debe ser posterior al inicio</span>';
        }
    } else if (summaryElement) {
        summaryElement.innerHTML = '<span style="color: var(--text-secondary);">Selecciona las fechas</span>';
    }
}

function actualizarResumenPermisos() {
    const estimatedDays = document.getElementById('estimatedDays')?.value;
    const permissionType = document.getElementById('permissionType')?.value;
    const permissionStatus = document.getElementById('permissionStatus')?.value;
    
    const durationSummary = document.getElementById('permissionDurationSummary');
    const typeSummary = document.getElementById('permissionTypeSummary');
    const statusSummary = document.getElementById('permissionStatusSummary');
    
    // Actualizar duración
    if (durationSummary) {
        if (estimatedDays) {
            durationSummary.innerHTML = `<strong>${estimatedDays} día${estimatedDays !== '1' ? 's' : ''}</strong>`;
        } else {
            durationSummary.innerHTML = '<span style="color: var(--muted);">No especificado</span>';
        }
    }
    
    // Actualizar tipo
    if (typeSummary) {
        const typeSelect = document.getElementById('permissionType');
        const selectedOption = typeSelect?.options[typeSelect.selectedIndex];
        if (selectedOption && selectedOption.value) {
            typeSummary.innerHTML = `<strong>${selectedOption.textContent}</strong>`;
        } else {
            typeSummary.innerHTML = '<span style="color: var(--muted);">No seleccionado</span>';
        }
    }
    
    // Actualizar estado
    if (statusSummary) {
        const statusSelect = document.getElementById('permissionStatus');
        const selectedStatusOption = statusSelect?.options[statusSelect.selectedIndex];
        if (selectedStatusOption && selectedStatusOption.value) {
            statusSummary.innerHTML = `<strong>${selectedStatusOption.textContent}</strong>`;
        } else {
            statusSummary.innerHTML = '<span style="color: var(--muted);">No seleccionado</span>';
        }
    }
}

function mostrarInfoEmpleadoSeleccionado(selectElement, infoContainerId, nameElementId, emailElementId) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const infoContainer = document.getElementById(infoContainerId);
    const nameElement = document.getElementById(nameElementId);
    const emailElement = document.getElementById(emailElementId);
    
    if (selectedOption.value && selectedOption.dataset.empleado) {
        const empleado = JSON.parse(selectedOption.dataset.empleado);
        if (nameElement) nameElement.textContent = `${empleado.nombre} ${empleado.apellido}`;
        if (emailElement) emailElement.textContent = empleado.correo;
        if (infoContainer) infoContainer.classList.remove('hidden');
        
        // Actualizar avatar en la info card
        const avatar = infoContainer.querySelector('.employee-avatar-small');
        if (avatar) {
            avatar.textContent = `${empleado.nombre.charAt(0)}${empleado.apellido.charAt(0)}`;
        }
    } else {
        if (infoContainer) infoContainer.classList.add('hidden');
    }
}

async function guardarPermisosSupabase(datosPermisos) {
  try {
    console.log("💾 Guardando permiso en Supabase...", datosPermisos);
    console.log("🔗 URL:", `${SUPABASE_URL}/rest/v1/${TABLA_PERMISOS}`);
    console.log("📄 Body JSON:", JSON.stringify(datosPermisos, null, 2));
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLA_PERMISOS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(datosPermisos)
    });

    if (response.ok) {
      console.log("✅ Permiso guardado exitosamente en Supabase");
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error("❌ Error al guardar en Supabase:", response.status, errorText);
      return { success: false, error: `Error ${response.status}: ${errorText}` };
    }
  } catch (error) {
    console.error("💥 Error de conexión con Supabase:", error);
    return { success: false, error: error.message };
  }
}

// ===== FUNCIÓN PARA GUARDAR VACACIONES EN SUPABASE =====

async function guardarVacacionesSupabase(datosVacaciones) {
  try {
    console.log("💾 Guardando vacaciones en Supabase...", datosVacaciones);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLA_VACACIONES}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(datosVacaciones)
    });

    if (response.ok) {
      console.log("✅ Vacaciones guardadas exitosamente en Supabase");
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error("❌ Error al guardar vacaciones en Supabase:", response.status, errorText);
      return { success: false, error: `Error ${response.status}: ${errorText}` };
    }
  } catch (error) {
    console.error("💥 Error de conexión con Supabase:", error);
    return { success: false, error: error.message };
  }
}

// ===== MANEJAR ENVÍO DE FORMULARIOS =====

async function manejarEnvioEmpleado(e) {
    e.preventDefault();
    
    const submitText = submitBtn.querySelector('.submit-text');
    const loading = submitBtn.querySelector('.loading');
    
    // Mostrar loading
    if (submitText) submitText.style.opacity = '0';
    if (loading) loading.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;
    
    try {
        const formData = new FormData(employeeForm);
        const empleado = {
            nombre: formData.get('name'),
            apellido: formData.get('surname'),
            correo: formData.get('email'),
            telefono: formData.get('phone'),
            direccion: formData.get('address')
        };
        
        const resultado = await guardarEmpleado(empleado);
        
        if (resultado.success) {
            addMessage(`✅ Empleado ${empleado.nombre} ${empleado.apellido} registrado exitosamente`, "bot");
            cerrarModal();
        } else {
            throw new Error(resultado.error);
        }
        
    } catch (error) {
        console.error("Error al registrar empleado:", error);
        addMessage(`❌ Error al registrar empleado: ${error.message}`, "bot");
    } finally {
        // Restaurar botón
        if (submitText) submitText.style.opacity = '1';
        if (loading) loading.classList.add('hidden');
        if (submitBtn) submitBtn.disabled = false;
    }
}

async function manejarEnvioVacaciones(e) {
    e.preventDefault();
    
    const submitText = submitVacationsBtn.querySelector('.submit-text');
    const loading = submitVacationsBtn.querySelector('.loading');
    
    // Mostrar loading
    if (submitText) submitText.style.opacity = '0';
    if (loading) loading.classList.remove('hidden');
    if (submitVacationsBtn) submitVacationsBtn.disabled = true;
    
    try {
        const formData = new FormData(vacationsForm);
        const empleadoId = formData.get('vacationEmployee');
        const inicioVacaciones = formData.get('startDate');
        const finVacaciones = formData.get('endDate');
        const estado = formData.get('vacationStatus');
        const tipoVacaciones = formData.get('vacationType');
        const motivo = formData.get('vacationReason');
        
        if (!empleadoId || !inicioVacaciones || !finVacaciones || !estado || !tipoVacaciones || !motivo) {
            throw new Error("Por favor completa todos los campos obligatorios");
        }
        
        const selectedOption = vacationEmployeeSelect.options[vacationEmployeeSelect.selectedIndex];
        if (!selectedOption.dataset.empleado) {
            throw new Error("Error al obtener información del empleado");
        }
        
        const empleado = JSON.parse(selectedOption.dataset.empleado);
        
        const datosVacaciones = {
            nombre: empleado.nombre,
            apellido: empleado.apellido,
            inicio_vacaciones: inicioVacaciones,
            fin_vacaciones: finVacaciones,
            Estado: estado,
            Tipo_vacaciones: tipoVacaciones,
            "Motivo/observaciones": motivo
        };
        
        const resultado = await guardarVacacionesSupabase(datosVacaciones);
        
        if (resultado.success) {
            addMessage(`📅 Vacaciones registradas para ${empleado.nombre} ${empleado.apellido}`, "bot");
            cerrarModalVacaciones();
        } else {
            throw new Error(resultado.error);
        }
        
    } catch (error) {
        console.error("Error al registrar vacaciones:", error);
        addMessage(`❌ Error al registrar vacaciones: ${error.message}`, "bot");
    } finally {
        // Restaurar botón
        if (submitText) submitText.style.opacity = '1';
        if (loading) loading.classList.add('hidden');
        if (submitVacationsBtn) submitVacationsBtn.disabled = false;
    }
}

// ===== FUNCIONES DE TEMA =====

function toggleTheme() {
    const body = document.body;
    const isDark = body.classList.contains('dark-theme');
    
    if (isDark) {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
        if (themeBtn) themeBtn.textContent = '🌙';
    } else {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        if (themeBtn) themeBtn.textContent = '☀️';
    }
}

// Cargar tema guardado
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        if (themeBtn) themeBtn.textContent = '☀️';
    }
}

async function manejarEnvioPermisos(e) {
  e.preventDefault();
  
  console.log("📝 Procesando registro de permiso...");
  
  const submitText = submitPermissionsBtn.querySelector('.submit-text');
  const loading = submitPermissionsBtn.querySelector('.loading');
  
  // Mostrar loading
  submitText.style.opacity = '0';
  loading.classList.remove('hidden');
  submitPermissionsBtn.disabled = true;
  
  try {
    // Recopilar datos del formulario
    const formData = new FormData(permissionsForm);
    const empleadoId = formData.get('employeeSelect');
    const tipoPermiso = formData.get('permissionType');
    const estado = formData.get('permissionStatus');
    const motivo = formData.get('permissionReason');
    const diasEstimados = formData.get('estimatedDays');
    
    if (!empleadoId || !tipoPermiso || !estado || !motivo || !diasEstimados) {
      throw new Error("Por favor completa todos los campos obligatorios");
    }
    
    // Obtener información del empleado seleccionado
    const selectedOption = employeeSelect.options[employeeSelect.selectedIndex];
    if (!selectedOption.dataset.empleado) {
      throw new Error("Error al obtener información del empleado");
    }
    
    const empleado = JSON.parse(selectedOption.dataset.empleado);
    console.log("👤 Empleado seleccionado para permiso:", empleado);
    
    // Preparar datos para la base de datos con las columnas correctas
    const datosPermiso = {
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      dias_estimados: parseInt(diasEstimados),
      tipo_permiso: tipoPermiso,
      estado: estado,
      "motivo/justificacion": motivo
    };
    
    console.log("📝 Datos de permiso a enviar a Supabase:", datosPermiso);
    console.log("🔍 Verificando estructura del objeto:");
    console.log("- nombre:", datosPermiso.nombre);
    console.log("- apellido:", datosPermiso.apellido);
    console.log("- dias_estimados:", datosPermiso.dias_estimados);
    console.log("- tipo_permiso:", datosPermiso.tipo_permiso);
    console.log("- estado:", datosPermiso.estado);
    console.log("- motivo/justificacion:", datosPermiso["motivo/justificacion"]);
    
    // Guardar en Supabase
    const resultado = await guardarPermisosSupabase(datosPermiso);
    
    if (resultado.success) {
      console.log("✅ Permiso guardado exitosamente en la base de datos");
      addMessage(`📝 Permiso registrado para ${empleado.nombre} ${empleado.apellido}. Días: ${diasEstimados}. Tipo: ${tipoPermiso}`, "bot");
      
      // Limpiar formulario y cerrar modal
      permissionsForm.reset();
      permissionsModal.style.display = 'none';
    } else {
      throw new Error(resultado.error);
    }
    
  } catch (error) {
    console.error("💥 Error al registrar permiso:", error);
    addMessage(`❌ Error al registrar permiso: ${error.message}`, "bot");
  } finally {
    // Restaurar botón
    submitText.style.opacity = '1';
    loading.classList.add('hidden');
    submitPermissionsBtn.disabled = false;
  }
}

// ===== EVENT LISTENERS =====

// Event listeners básicos
if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
}

if (userInput) {
    userInput.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
}

// Event listeners del modal de empleados
if (openFormBtn) {
    openFormBtn.addEventListener("click", abrirModal);
}

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", cerrarModal);
}

if (cancelFormBtn) {
    cancelFormBtn.addEventListener("click", cerrarModal);
}

if (employeeForm) {
    employeeForm.addEventListener("submit", manejarEnvioEmpleado);
}

// Event listeners de la vista de empleados
if (viewEmployeesBtn) {
    viewEmployeesBtn.addEventListener("click", abrirModalEmpleados);
}

if (closeEmployeesModalBtn) {
    closeEmployeesModalBtn.addEventListener("click", cerrarModalEmpleados);
}

if (refreshEmployeesBtn) {
    refreshEmployeesBtn.addEventListener("click", cargarListaEmpleados);
}

if (retryLoadBtn) {
    retryLoadBtn.addEventListener("click", cargarListaEmpleados);
}

// Event listeners del modal de permisos
if (permissionsBtn) {
    console.log("✅ Configurando evento para botón de permisos");
    permissionsBtn.addEventListener("click", function() {
        console.log("🖱️ Click en botón de permisos detectado");
        abrirModalPermisos();
    });
} else {
    console.error("❌ No se encontró el botón de permisos (permissionsBtn)");
}

if (closePermissionsModalBtn) {
    closePermissionsModalBtn.addEventListener("click", cerrarModalPermisos);
} else {
    console.error("❌ No se encontró el botón cerrar permisos");
}

if (permissionsForm) {
    permissionsForm.addEventListener("submit", manejarEnvioPermisos);
} else {
    console.error("❌ No se encontró el formulario de permisos");
}

// Event listeners del modal de vacaciones
if (vacationsBtn) {
    console.log("✅ Configurando evento para botón de vacaciones");
    vacationsBtn.addEventListener("click", function() {
        console.log("🖱️ Click en botón de vacaciones detectado");
        abrirModalVacaciones();
    });
} else {
    console.error("❌ No se encontró el botón de vacaciones (vacationsBtn)");
}

if (closeVacationsModalBtn) {
    closeVacationsModalBtn.addEventListener("click", cerrarModalVacaciones);
} else {
    console.error("❌ No se encontró el botón cerrar vacaciones");
}

if (vacationsForm) {
    vacationsForm.addEventListener("submit", manejarEnvioVacaciones);
} else {
    console.error("❌ No se encontró el formulario de vacaciones");
}

// Event listeners para resumen de vacaciones
const vacStartDate = document.getElementById('vacationStartDate');
const vacEndDate = document.getElementById('vacationEndDate');

if (vacStartDate) {
    vacStartDate.addEventListener('change', actualizarResumenVacaciones);
}

if (vacEndDate) {
    vacEndDate.addEventListener('change', actualizarResumenVacaciones);
}

// Event listeners para resumen de permisos
const estimatedDaysInput = document.getElementById('estimatedDays');
const permissionTypeSelect = document.getElementById('permissionType');
const permissionStatusSelect = document.getElementById('permissionStatus');

if (estimatedDaysInput) {
    estimatedDaysInput.addEventListener('input', actualizarResumenPermisos);
}

if (permissionTypeSelect) {
    permissionTypeSelect.addEventListener('change', actualizarResumenPermisos);
}

if (permissionStatusSelect) {
    permissionStatusSelect.addEventListener('change', actualizarResumenPermisos);
}

if (vacationEmployeeSelect) {
    vacationEmployeeSelect.addEventListener('change', function() {
        mostrarInfoEmpleadoSeleccionado(
            this, 
            'selectedVacationEmployeeInfo', 
            'selectedVacationEmployeeName', 
            'selectedVacationEmployeeEmail'
        );
    });
}

if (employeeSelect) {
    employeeSelect.addEventListener('change', function() {
        mostrarInfoEmpleadoSeleccionado(
            this, 
            'selectedEmployeeInfo', 
            'selectedEmployeeName', 
            'selectedEmployeeEmail'
        );
    });
}

// Event listener del botón de tema
if (themeBtn) {
    themeBtn.addEventListener("click", toggleTheme);
}

// Cerrar modales al hacer clic fuera
window.addEventListener("click", function(e) {
    if (e.target === modal) {
        cerrarModal();
    }
    if (e.target === employeesModal) {
        cerrarModalEmpleados();
    }
    if (e.target === permissionsModal) {
        cerrarModalPermisos();
    }
    if (e.target === vacationsModal) {
        cerrarModalVacaciones();
    }
});

// ===== INICIALIZACIÓN =====

// Cargar tema guardado al iniciar
loadSavedTheme();

// Agregar mensaje de bienvenida al cargar
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Iniciando aplicación RRHH...");
    
    // Debug: verificar que los elementos existen
    console.log("🔍 Verificando elementos:");
    console.log("permissionsBtn:", permissionsBtn);
    console.log("vacationsBtn:", vacationsBtn);
    console.log("permissionsModal:", permissionsModal);
    console.log("vacationsModal:", vacationsModal);
    
    addMessage("¡Hola! Soy el asistente de Recursos Humanos. ¿En qué puedo ayudarte hoy?", "bot");
    console.log("✅ Mensaje de bienvenida enviado");
});

// Event listener para el formulario de permisos
if (permissionsForm) {
  permissionsForm.addEventListener("submit", manejarEnvioPermisos);
}

console.log("✅ JavaScript cargado correctamente con todas las funcionalidades");
console.log("🕐 Versión actualizada:", new Date().toISOString());
