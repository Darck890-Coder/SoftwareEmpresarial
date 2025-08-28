const $$ = (s) => document.querySelector(s);
const $$$ = (s) => document.querySelectorAll(s);
const toast = (msg) => {
  const t = $$("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
};

// ===== Estado =====
let state = {
  clientes: JSON.parse(localStorage.getItem("clientes") || "[]"),
  opps: JSON.parse(localStorage.getItem("opps") || "[]"),
  acts: JSON.parse(localStorage.getItem("acts") || "[]"),
  cfg: JSON.parse(
    localStorage.getItem("cfg") || '{"n8nEmail":"","n8nReport":"","n8nCsat":""}'
  ),
};

const persist = () => {
  localStorage.setItem("clientes", JSON.stringify(state.clientes));
  localStorage.setItem("opps", JSON.stringify(state.opps));
  localStorage.setItem("acts", JSON.stringify(state.acts));
  localStorage.setItem("cfg", JSON.stringify(state.cfg));
};

// ===== Navegación =====
$$$(".tab-btn").forEach((b) =>
  b.addEventListener("click", () => {
    $$$(".tab-btn").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    $$$("section.tab").forEach((sec) => (sec.hidden = true));
    $$("#tab-" + b.dataset.tab).hidden = false;
  })
);

// ===== CRUD Clientes =====
const renderClientes = () => {
  $$("#clientesTabla").innerHTML = state.clientes
    .map(
      (c) =>
        `<tr>
                <td>${c.nombre}</td>
                <td>${c.email}</td>
                <td>${c.rfc || ""}</td>
                <td>${c.razon || ""}</td>
                <td class="acciones-tabla">
                    <button class="btn edit btn-tabla" onclick="editarCliente('${
                      c.id
                    }')">Editar</button>
                    <button class="btn danger btn-tabla" onclick="eliminarCliente('${
                      c.id
                    }')">Eliminar</button>
                </td>
            </tr>`
    )
    .join("");
};

const editarCliente = (id) => {
  const cliente = state.clientes.find((c) => c.id === id);
  if (!cliente) return;

  $$("#clienteId").value = cliente.id;
  $$("#cNombre").value = cliente.nombre;
  $$("#cEmail").value = cliente.email;
  $$("#cRfc").value = cliente.rfc;
  $$("#cDireccion").value = cliente.direccion;
  $$("#cTelefono").value = cliente.telefono;
  $$("#cRazon").value = cliente.razon;

  toast("Cliente cargado para editar");
};

const eliminarCliente = (id) => {
  if (!confirm("¿Estás seguro de eliminar este cliente?")) return;

  state.clientes = state.clientes.filter((c) => c.id !== id);
  // También eliminar oportunidades y actividades relacionadas
  state.opps = state.opps.filter((o) => o.clienteId !== id);
  state.acts = state.acts.filter((a) => a.clienteId !== id);

  persist();
  renderClientes();
  renderOpps();
  renderActs();
  toast("Cliente eliminado");
};

$$("#clienteForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (
    !$$("#cNombre").value.trim() ||
    !$$("#cEmail").value.trim() ||
    !$$("#cRfc").value.trim() ||
    !$$("#cDireccion").value.trim()
  ) {
    return toast(
      "Completa todos los campos obligatorios (Nombre, Email, RFC, Dirección)"
    );
  }

  const id = $$("#clienteId").value || Date.now() + "";
  const obj = {
    id: id,
    nombre: $$("#cNombre").value.trim(),
    email: $$("#cEmail").value.trim(),
    rfc: $$("#cRfc").value.trim(),
    direccion: $$("#cDireccion").value.trim(),
    telefono: $$("#cTelefono").value.trim(),
    razon: $$("#cRazon").value.trim(),
  };

  if ($$("#clienteId").value) {
    // Editar cliente existente
    const index = state.clientes.findIndex((c) => c.id === id);
    if (index !== -1) {
      state.clientes[index] = obj;
      toast("Cliente actualizado");
    }
  } else {
    // Nuevo cliente
    state.clientes.push(obj);
    toast("Cliente agregado");
  }

  persist();
  renderClientes();
  renderOpps();
  renderActs();
  e.target.reset();
  $$("#clienteId").value = "";
});

// ===== CRUD Oportunidades =====
const renderOpps = () => {
  $$("#oppsTabla").innerHTML = state.opps
    .map(
      (o) =>
        `<tr>
                <td>${
                  state.clientes.find((c) => c.id === o.clienteId)?.nombre ||
                  "?"
                }</td>
                <td>${o.titulo}</td>
                <td>${o.monto}</td>
                <td>${o.tipo}</td>
                <td>${o.descripcion}</td>
                <td class="acciones-tabla">
                    <button class="btn edit btn-tabla" onclick="editarOpp('${
                      o.id
                    }')">Editar</button>
                    <button class="btn danger btn-tabla" onclick="eliminarOpp('${
                      o.id
                    }')">Eliminar</button>
                </td>
            </tr>`
    )
    .join("");
  $$("#oCliente").innerHTML = state.clientes
    .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
    .join("");
};

const editarOpp = (id) => {
  const opp = state.opps.find((o) => o.id === id);
  if (!opp) return;

  $$("#oCliente").value = opp.clienteId;
  $$("#oTitulo").value = opp.titulo;
  $$("#oMonto").value = opp.monto;
  $$("#oTipo").value = opp.tipo;
  $$("#oDesc").value = opp.descripcion;

  toast("Oportunidad cargada para editar");
};

const eliminarOpp = (id) => {
  if (!confirm("¿Estás seguro de eliminar esta oportunidad?")) return;

  state.opps = state.opps.filter((o) => o.id !== id);
  persist();
  renderOpps();
  toast("Oportunidad eliminada");
};

$$("#oppForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (
    !$$("#oCliente").value ||
    !$$("#oTitulo").value.trim() ||
    !$$("#oMonto").value.trim() ||
    !$$("#oTipo").value
  ) {
    return toast("Completa todos los campos de la oportunidad");
  }

  const obj = {
    id: Date.now() + "",
    clienteId: $$("#oCliente").value,
    titulo: $$("#oTitulo").value.trim(),
    monto: $$("#oMonto").value.trim(),
    tipo: $$("#oTipo").value,
    descripcion: $$("#oDesc").value.trim(),
  };
  state.opps.push(obj);
  persist();
  renderOpps();
  toast("Oportunidad agregada");
  e.target.reset();
});

// ===== CRUD Actividades =====
const renderActs = () => {
  $$("#actsTabla").innerHTML = state.acts
    .map(
      (a) =>
        `<tr>
                <td>${a.tipo}</td>
                <td>${
                  state.clientes.find((c) => c.id === a.clienteId)?.nombre ||
                  "?"
                }</td>
                <td>${a.notas}</td>
                <td>${a.tipoCliente}</td>
                <td>${a.descCliente}</td>
                <td class="acciones-tabla">
                    <button class="btn edit btn-tabla" onclick="editarAct('${
                      a.id
                    }')">Editar</button>
                    <button class="btn danger btn-tabla" onclick="eliminarAct('${
                      a.id
                    }')">Eliminar</button>
                </td>
            </tr>`
    )
    .join("");
  $$("#aCliente").innerHTML = state.clientes
    .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
    .join("");
  $$("#csatCliente").innerHTML = state.clientes
    .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
    .join("");
};

const editarAct = (id) => {
  const act = state.acts.find((a) => a.id === id);
  if (!act) return;

  $$("#aTipo").value = act.tipo;
  $$("#aCliente").value = act.clienteId;
  $$("#aTipoCliente").value = act.tipoCliente;
  $$("#aDescCliente").value = act.descCliente;
  $$("#aNotas").value = act.notas;

  toast("Actividad cargada para editar");
};

const eliminarAct = (id) => {
  if (!confirm("¿Estás seguro de eliminar esta actividad?")) return;

  state.acts = state.acts.filter((a) => a.id !== id);
  persist();
  renderActs();
  toast("Actividad eliminada");
};

$$("#actForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (
    !$$("#aTipo").value ||
    !$$("#aCliente").value ||
    !$$("#aTipoCliente").value ||
    !$$("#aDescCliente").value.trim()
  ) {
    return toast("Completa todos los campos de la actividad");
  }

  const obj = {
    id: Date.now() + "",
    tipo: $$("#aTipo").value,
    clienteId: $$("#aCliente").value,
    tipoCliente: $$("#aTipoCliente").value,
    descCliente: $$("#aDescCliente").value.trim(),
    notas: $$("#aNotas").value.trim(),
  };
  state.acts.push(obj);
  persist();
  renderActs();
  toast("Actividad guardada");
  e.target.reset();
});

// ===== n8n Conexión (solo CSAT se conserva) =====
$$("#btnEnviarCsat").addEventListener("click", async () => {
  if (!state.cfg.n8nCsat)
    return toast("Configura el webhook de CSAT en Configuración");
  if (!$$("#csatCliente").value || !$$("#csatScore").value.trim()) {
    return toast("Cliente y calificación son obligatorios");
  }

  const payload = {
    cliente: $$("#csatCliente").value,
    score: $$("#csatScore").value,
    tiempo: $$("#csatTiempo").value,
    atencion: $$("#csatAtencion").value,
    comment: $$("#csatComment").value,
    mejora: $$("#csatMejora").value,
  };
  await fetch(state.cfg.n8nCsat, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  toast("CSAT enviado a n8n");
});

// ===== Chat =====
const chatToggle = document.getElementById("chat-toggle");
const chatBox = document.getElementById("chat-box");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");

chatToggle.addEventListener("click", () => {
  chatBox.classList.toggle("show");
});

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = chatInput.value.trim();
  if (text === "") return;

  // Mensaje del usuario
  const userMsg = document.createElement("div");
  userMsg.classList.add("msg", "user");
  userMsg.textContent = text;
  chatMessages.appendChild(userMsg);

  chatInput.value = "";
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Respuesta automática simple
  setTimeout(() => {
    const botMsg = document.createElement("div");
    botMsg.classList.add("msg", "bot");
    botMsg.textContent = "Gracias por tu mensaje, pronto te responderemos. ☀️";
    chatMessages.appendChild(botMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }, 800);
}

// ===== Init =====
renderClientes();
renderOpps();
renderActs();

// Agregar marca de agua a las tablas
$$$("table").forEach((table) => {
  table.classList.add("table-watermark");
});
