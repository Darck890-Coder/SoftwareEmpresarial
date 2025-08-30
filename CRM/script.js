// =============== Utils/State =================
const $$ = (s) => document.querySelector(s);
const $$$ = (s) => document.querySelectorAll(s);

const toast = (msg) => {
  const t = $$("#toast");
  if (t) {
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2500);
  } else {
    alert(msg);
  }
};

const state = {
  clientes: [],
  opps: [],
  acts: [],
  csat: [],
  // Config por defecto: cambia por tus credenciales/URLs
  cfg: {
    supabaseUrl: "https://vgzsksthdrorfmbqswea.supabase.co",
    supabaseKey:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnenNrc3RoZHJvcmZtYnFzd2VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzNTIxNDcsImV4cCI6MjA3MTkyODE0N30.Gj9rUDiRJ8YAkShJaj5WiYUHlH-vh4rfRHz8DfceuTQ",
    n8nCsat: "https://mdev.app.n8n.cloud/webhook/csat-endpoint",
    n8nChat:
      "https://mdev.app.n8n.cloud/webhook/b1f95f46-ed11-405b-be53-36f1e4afec77",
  },
  // para controlar ediciones sin tocar el HTML
  editing: {
    oppId: null,
    actId: null,
  },
};

// =============== Navegación por tabs =================
const setupTabs = () => {
  $$$(".tab-btn").forEach((b) =>
    b.addEventListener("click", () => {
      $$$(".tab-btn").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      const tab = b.dataset.tab;
      $$$("section.tab").forEach((sec) => (sec.hidden = true));
      const target = $$("#tab-" + tab);
      if (target) target.hidden = false;
    })
  );
};

// =============== Supabase REST helpers =================
const supabaseFetch = async (
  table,
  method = "GET",
  body = null,
  query = ""
) => {
  const url = `${state.cfg.supabaseUrl}/rest/v1/${table}${query}`;
  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      apikey: state.cfg.supabaseKey,
      Authorization: `Bearer ${state.cfg.supabaseKey}`,
      Prefer: "return=representation",
    },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`${method} ${table} failed: ${txt}`);
  }
  return res.json();
};

// =============== Carga inicial =================
const loadData = async () => {
  try {
    const [clientes, opps, acts, csat] = await Promise.all([
      supabaseFetch("clientes"),
      supabaseFetch("opps"),
      supabaseFetch("acts"),
      supabaseFetch("csat"),
    ]);
    state.clientes = clientes;
    state.opps = opps;
    state.acts = acts;
    state.csat = csat;

    renderClientes();
    renderOpps();
    renderActs();
    // Dropdowns dependientes de clientes
    hydrateClientSelects();
  } catch (e) {
    console.error(e);
    toast("Error cargando datos desde Supabase");
  }
};

// =============== Render: Clientes =================
const renderClientes = () => {
  const tbody = $$("#clientesTabla");
  if (!tbody) return;
  tbody.innerHTML = state.clientes
    .map(
      (c) => `
    <tr>
      <td>${c.nombre || ""}</td>
      <td>${c.email || ""}</td>
      <td>${c.rfc || ""}</td>
      <td>${c.razon || ""}</td>
      <td class="acciones-tabla">
        <button class="btn edit btn-tabla" data-action="edit" data-id="${
          c.id
        }">Editar</button>
        <button class="btn danger btn-tabla" data-action="del" data-id="${
          c.id
        }">Eliminar</button>
      </td>
    </tr>`
    )
    .join("");

  // Delegación de eventos para acciones
  tbody.onclick = async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === "edit") editarCliente(id);
    if (action === "del") eliminarCliente(id);
  };
};

const hydrateClientSelects = () => {
  // Rellena selects de cliente en oportunidades, actividades y CSAT
  const options = state.clientes
    .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
    .join("");
  const oCliente = $$("#oCliente");
  const aCliente = $$("#aCliente");
  const csatCliente = $$("#csatCliente");
  if (oCliente) oCliente.innerHTML = options;
  if (aCliente) aCliente.innerHTML = options;
  if (csatCliente) csatCliente.innerHTML = options;
};

// =============== Render: Oportunidades =================
const renderOpps = () => {
  const tbody = $$("#oppsTabla");
  if (!tbody) return;
  tbody.innerHTML = state.opps
    .map((o) => {
      const cli =
        state.clientes.find((c) => c.id === o.clienteId)?.nombre || "?";
      return `
      <tr>
        <td>${cli}</td>
        <td>${o.titulo || ""}</td>
        <td>${o.monto || ""}</td>
        <td>${o.tipo || ""}</td>
        <td>${o.descripcion || ""}</td>
        <td class="acciones-tabla">
          <button class="btn edit btn-tabla" data-action="edit-opp" data-id="${
            o.id
          }">Editar</button>
          <button class="btn danger btn-tabla" data-action="del-opp" data-id="${
            o.id
          }">Eliminar</button>
        </td>
      </tr>`;
    })
    .join("");

  tbody.onclick = async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === "edit-opp") editarOpp(id);
    if (action === "del-opp") eliminarOpp(id);
  };
};

// =============== Render: Actividades =================
const renderActs = () => {
  const tbody = $$("#actsTabla");
  if (!tbody) return;
  tbody.innerHTML = state.acts
    .map((a) => {
      const cli =
        state.clientes.find((c) => c.id === a.clienteId)?.nombre || "?";
      return `
      <tr>
        <td>${a.tipo || ""}</td>
        <td>${cli}</td>
        <td>${a.notas || ""}</td>
        <td>${a.tipoCliente || ""}</td>
        <td>${a.descCliente || ""}</td>
        <td class="acciones-tabla">
          <button class="btn edit btn-tabla" data-action="edit-act" data-id="${
            a.id
          }">Editar</button>
          <button class="btn danger btn-tabla" data-action="del-act" data-id="${
            a.id
          }">Eliminar</button>
        </td>
      </tr>`;
    })
    .join("");

  tbody.onclick = async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === "edit-act") editarAct(id);
    if (action === "del-act") eliminarAct(id);
  };
};

// =============== Clientes: CRUD =================
$$("#clienteForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = $$("#cNombre")?.value.trim();
  const email = $$("#cEmail")?.value.trim();
  const rfc = $$("#cRfc")?.value.trim();
  const direccion = $$("#cDireccion")?.value.trim();
  const telefono = $$("#cTelefono")?.value.trim();
  const razon = $$("#cRazon")?.value.trim();
  const idField = $$("#clienteId");
  if (!nombre || !email || !rfc || !direccion) {
    return toast(
      "Completa todos los campos obligatorios (Nombre, Email, RFC, Dirección)"
    );
  }

  const id = idField?.value || Date.now().toString();
  const obj = {
    id,
    nombre,
    email,
    rfc,
    direccion,
    telefono,
    razon,
  };

  try {
    if (idField?.value) {
      await supabaseFetch("clientes", "PATCH", obj, `?id=eq.${id}`);
      toast("Cliente actualizado");
    } else {
      await supabaseFetch("clientes", "POST", obj);
      toast("Cliente agregado");
    }
    await loadData();
    e.target.reset();
    if (idField) idField.value = "";
  } catch (err) {
    console.error(err);
    toast("Error guardando cliente");
  }
});

const editarCliente = (id) => {
  const c = state.clientes.find((x) => x.id === id);
  if (!c) return;
  $$("#clienteId").value = c.id;
  $$("#cNombre").value = c.nombre || "";
  $$("#cEmail").value = c.email || "";
  $$("#cRfc").value = c.rfc || "";
  $$("#cDireccion").value = c.direccion || "";
  $$("#cTelefono").value = c.telefono || "";
  $$("#cRazon").value = c.razon || "";
  toast("Cliente cargado para editar");
};

const eliminarCliente = async (id) => {
  if (!confirm("¿Estás seguro de eliminar este cliente?")) return;
  try {
    // Borrar relaciones para evitar huérfanos (si no tienes FK con ON DELETE CASCADE)
    await supabaseFetch("opps", "DELETE", null, `?clienteId=eq.${id}`);
    await supabaseFetch("acts", "DELETE", null, `?clienteId=eq.${id}`);
    await supabaseFetch("clientes", "DELETE", null, `?id=eq.${id}`);
    await loadData();
    toast("Cliente eliminado");
  } catch (err) {
    console.error(err);
    toast("Error eliminando cliente");
  }
};

// =============== Oportunidades: CRUD =================
$$("#oppForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const clienteId = $$("#oCliente")?.value;
  const titulo = $$("#oTitulo")?.value.trim();
  const monto = $$("#oMonto")?.value.trim();
  const tipo = $$("#oTipo")?.value;
  const descripcion = $$("#oDesc")?.value.trim();

  if (!clienteId || !titulo || !monto || !tipo) {
    return toast("Completa todos los campos de la oportunidad");
  }

  const isEditing = !!state.editing.oppId;
  const obj = {
    id: isEditing ? state.editing.oppId : Date.now().toString(),
    clienteId,
    titulo,
    monto,
    tipo,
    descripcion,
  };

  try {
    if (isEditing) {
      await supabaseFetch("opps", "PATCH", obj, `?id=eq.${obj.id}`);
      toast("Oportunidad actualizada");
    } else {
      await supabaseFetch("opps", "POST", obj);
      toast("Oportunidad agregada");
    }
    state.editing.oppId = null;
    await loadData();
    e.target.reset();
  } catch (err) {
    console.error(err);
    toast("Error guardando oportunidad");
  }
});

const editarOpp = (id) => {
  const o = state.opps.find((x) => x.id === id);
  if (!o) return;
  $$("#oCliente").value = o.clienteId || "";
  $$("#oTitulo").value = o.titulo || "";
  $$("#oMonto").value = o.monto || "";
  $$("#oTipo").value = o.tipo || "";
  $$("#oDesc").value = o.descripcion || "";
  state.editing.oppId = id;
  toast("Oportunidad cargada para editar");
};

const eliminarOpp = async (id) => {
  if (!confirm("¿Estás seguro de eliminar esta oportunidad?")) return;
  try {
    await supabaseFetch("opps", "DELETE", null, `?id=eq.${id}`);
    await loadData();
    toast("Oportunidad eliminada");
  } catch (err) {
    console.error(err);
    toast("Error eliminando oportunidad");
  }
};

// =============== Actividades: CRUD =================
$$("#actForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const tipo = $$("#aTipo")?.value;
  const clienteId = $$("#aCliente")?.value;
  const tipoCliente = $$("#aTipoCliente")?.value;
  const descCliente = $$("#aDescCliente")?.value.trim();
  const notas = $$("#aNotas")?.value.trim();

  if (!tipo || !clienteId || !tipoCliente || !descCliente) {
    return toast("Completa todos los campos de la actividad");
  }

  const isEditing = !!state.editing.actId;
  const obj = {
    id: isEditing ? state.editing.actId : Date.now().toString(),
    tipo,
    clienteId,
    tipoCliente,
    descCliente,
    notas,
  };

  try {
    if (isEditing) {
      await supabaseFetch("acts", "PATCH", obj, `?id=eq.${obj.id}`);
      toast("Actividad actualizada");
    } else {
      await supabaseFetch("acts", "POST", obj);
      toast("Actividad guardada");
    }
    state.editing.actId = null;
    await loadData();
    e.target.reset();
  } catch (err) {
    console.error(err);
    toast("Error guardando actividad");
  }
});

const editarAct = (id) => {
  const a = state.acts.find((x) => x.id === id);
  if (!a) return;
  $$("#aTipo").value = a.tipo || "";
  $$("#aCliente").value = a.clienteId || "";
  $$("#aTipoCliente").value = a.tipoCliente || "";
  $$("#aDescCliente").value = a.descCliente || "";
  $$("#aNotas").value = a.notas || "";
  state.editing.actId = id;
  toast("Actividad cargada para editar");
};

const eliminarAct = async (id) => {
  if (!confirm("¿Estás seguro de eliminar esta actividad?")) return;
  try {
    await supabaseFetch("acts", "DELETE", null, `?id=eq.${id}`);
    await loadData();
    toast("Actividad eliminada");
  } catch (err) {
    console.error(err);
    toast("Error eliminando actividad");
  }
};

// =============== n8n Utils + CSAT =================
const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const sendToN8N = async (url, payload, successMsg = "Datos enviados") => {
  if (!url || !validateUrl(url)) {
    toast("URL de n8n no configurada o inválida");
    return false;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = { rawResponse: await res.text() };
    }
    toast(successMsg);
    return data;
  } catch (e) {
    console.error(e);
    toast("Error al conectar con n8n");
    return false;
  }
};

// Botón enviar CSAT en la pestaña Reportes
$$("#btnEnviarCsat")?.addEventListener("click", async () => {
  const clienteId = $$("#csatCliente")?.value;
  const score = $$("#csatScore")?.value;
  const tiempo = $$("#csatTiempo")?.value;
  const atencion = $$("#csatAtencion")?.value;
  const comment = $$("#csatComment")?.value.trim();
  const mejora = $$("#csatMejora")?.value.trim();

  if (!clienteId || score === "" || score === null) {
    return toast("Cliente y calificación son obligatorios");
  }

  const cliente = state.clientes.find((c) => c.id === clienteId);
  if (!cliente) return toast("Cliente no encontrado");

  const payload = {
    id: Date.now().toString(),
    cliente: cliente.nombre,
    cliente_id: cliente.id,
    cliente_email: cliente.email || "",
    score: Number(score),
    tiempo: tiempo ? Number(tiempo) : null,
    atencion: atencion || "",
    comment,
    mejora,
    timestamp: new Date().toISOString(),
  };

  // 1) Enviar a n8n (opcional)
  await sendToN8N(state.cfg.n8nCsat, payload, "CSAT enviado a n8n");

  // 2) Guardar en Supabase (tabla csat)
  try {
    await supabaseFetch("csat", "POST", payload);
    toast("CSAT guardado en Supabase");
    await loadData();
    // limpiar
    $$("#csatScore").value = "";
    $$("#csatTiempo").value = "";
    $$("#csatAtencion").value = "Excelente";
    $$("#csatComment").value = "";
    $$("#csatMejora").value = "";
  } catch (e) {
    console.error(e);
    toast("Error guardando CSAT en Supabase");
  }
});

// =============== Chat burbuja + n8n Chat =================
const chatToggle = $$("#chat-toggle");
const chatBox = $$("#chat-box");
const chatMessages = $$("#chat-messages");
const chatInput = $$("#chat-input");
const sendBtn = $$("#send-btn");

chatToggle?.addEventListener("click", () => {
  chatBox?.classList.toggle("show");
});

const appendMsg = (who, text) => {
  const div = document.createElement("div");
  div.classList.add("msg", who);
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

const sendMessage = async () => {
  const text = chatInput.value.trim();
  if (!text) return;
  appendMsg("user", text);
  chatInput.value = "";

  const typing = document.createElement("div");
  typing.classList.add("msg", "bot", "typing");
  typing.textContent = "Escribiendo...";
  chatMessages.appendChild(typing);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // n8n webhook si está configurado
  if (state.cfg.n8nChat && validateUrl(state.cfg.n8nChat)) {
    const payload = {
      message: text,
      timestamp: new Date().toISOString(),
      type: "chat_message",
    };
    const res = await sendToN8N(state.cfg.n8nChat, payload, "Mensaje enviado");
    chatMessages.removeChild(typing);
    let reply = "Gracias por tu mensaje. ¿En qué más puedo ayudarte?";
    if (res) {
      if (typeof res === "object") {
        reply =
          res.reply ||
          res.message ||
          (res.data &&
            (res.data.reply || res.data.response || res.data.message)) ||
          res.rawResponse ||
          JSON.stringify(res);
      } else if (typeof res === "string") {
        reply = res;
      }
    }
    appendMsg("bot", reply);
  } else {
    setTimeout(() => {
      chatMessages.removeChild(typing);
      appendMsg("bot", "Gracias por tu mensaje. Pronto te responderemos. ☀️");
    }, 700);
  }
};

sendBtn?.addEventListener("click", sendMessage);
chatInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// =============== Email actividad (botón decorativo) =================
$$("#btnEmailActividad")?.addEventListener("click", () => {
  // Aquí puedes integrar tu webhook/emailer real
  toast("Función de envío de email: integra tu n8n/emailer aquí.");
});

// =============== Init =================
document.addEventListener("DOMContentLoaded", async () => {
  setupTabs();
  await loadData();
});
