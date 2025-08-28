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
    </tr>`
    )
    .join("");
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

  const obj = {
    id: Date.now() + "",
    nombre: $$("#cNombre").value.trim(),
    email: $$("#cEmail").value.trim(),
    rfc: $$("#cRfc").value.trim(),
    direccion: $$("#cDireccion").value.trim(),
    telefono: $$("#cTelefono").value.trim(),
    razon: $$("#cRazon").value.trim(),
  };
  state.clientes.push(obj);
  persist();
  renderClientes();
  renderOpps();
  renderActs();
  toast("Cliente agregado");
  e.target.reset();
});

// ===== CRUD Oportunidades =====
const renderOpps = () => {
  $$("#oppsTabla").innerHTML = state.opps
    .map(
      (o) =>
        `<tr>
      <td>${
        state.clientes.find((c) => c.id === o.clienteId)?.nombre || "?"
      }</td>
      <td>${o.titulo}</td>
      <td>${o.monto}</td>
      <td>${o.tipo}</td>
      <td>${o.descripcion}</td>
    </tr>`
    )
    .join("");
  $$("#oCliente").innerHTML = state.clientes
    .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
    .join("");
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
        state.clientes.find((c) => c.id === a.clienteId)?.nombre || "?"
      }</td>
      <td>${a.notas}</td>
      <td>${a.tipoCliente}</td>
      <td>${a.descCliente}</td>
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

// ===== Init =====
renderClientes();
renderOpps();
renderActs();
