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
  const obj = {
    id: Date.now() + "",
    nombre: $$("#cNombre").value,
    email: $$("#cEmail").value,
    rfc: $$("#cRfc").value,
    direccion: $$("#cDireccion").value,
    telefono: $$("#cTelefono").value,
    razon: $$("#cRazon").value,
  };
  state.clientes.push(obj);
  persist();
  renderClientes();
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
  const obj = {
    id: Date.now() + "",
    clienteId: $$("#oCliente").value,
    titulo: $$("#oTitulo").value,
    monto: $$("#oMonto").value,
    tipo: $$("#oTipo").value,
    descripcion: $$("#oDesc").value,
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
  const obj = {
    id: Date.now() + "",
    tipo: $$("#aTipo").value,
    clienteId: $$("#aCliente").value,
    tipoCliente: $$("#aTipoCliente").value,
    descCliente: $$("#aDescCliente").value,
    notas: $$("#aNotas").value,
  };
  state.acts.push(obj);
  persist();
  renderActs();
  toast("Actividad guardada");
  e.target.reset();
});

// ===== CSAT extra fields =====
$$("#btnEnviarCsat").addEventListener("click", async () => {
  if (!state.cfg.n8nCsat)
    return toast("Configura el webhook de CSAT en Configuración");
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
