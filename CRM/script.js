const $$ = s => document.querySelector(s);
const $$$ = s => document.querySelectorAll(s);
const toast = msg => {
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
cfg: JSON.parse(localStorage.getItem("cfg") || '{"n8nEmail":"","n8nReport":"","n8nCsat":""}')
};

const persist = () => {
localStorage.setItem("clientes", JSON.stringify(state.clientes));
localStorage.setItem("opps", JSON.stringify(state.opps));
localStorage.setItem("acts", JSON.stringify(state.acts));
localStorage.setItem("cfg", JSON.stringify(state.cfg));
};

// ===== Navegación =====
$$$(".tab-btn").forEach(b => b.addEventListener("click", () => {
$$$(".tab-btn").forEach(x => x.classList.remove("active"));
b.classList.add("active");
$$$("section.tab").forEach(sec => sec.hidden = true);
$$("#tab-" + b.dataset.tab).hidden = false;
}));

// ===== CRUD Clientes =====
const renderClientes = () => {
$$("#clientesTabla").innerHTML = state.clientes.map(c =>
    `<tr><td>${c.nombre}</td><td>${c.email}</td></tr>`).join("");
};

$$("#clienteForm").addEventListener("submit", e => {
e.preventDefault();
const obj = {id: Date.now()+"", nombre: $$("#cNombre").value, email:$$("#cEmail").value};
state.clientes.push(obj);
persist(); renderClientes(); toast("Cliente agregado");
e.target.reset();
});

// ===== CRUD Oportunidades =====
const renderOpps = () => {
$$("#oppsTabla").innerHTML = state.opps.map(o =>
    `<tr><td>${state.clientes.find(c=>c.id===o.clienteId)?.nombre||"?"}</td><td>${o.titulo}</td><td>${o.monto}</td></tr>`).join("");
$$("#oCliente").innerHTML = state.clientes.map(c=>`<option value="${c.id}">${c.nombre}</option>`).join("");
};

$$("#oppForm").addEventListener("submit", e => {
e.preventDefault();
const obj = {id:Date.now()+"", clienteId:$$("#oCliente").value, titulo:$$("#oTitulo").value, monto:$$("#oMonto").value};
state.opps.push(obj); persist(); renderOpps(); toast("Oportunidad agregada"); e.target.reset();
});

// ===== CRUD Actividades =====
const renderActs = () => {
$$("#actsTabla").innerHTML = state.acts.map(a =>
    `<tr><td>${a.tipo}</td><td>${state.clientes.find(c=>c.id===a.clienteId)?.nombre||"?"}</td><td>${a.notas}</td></tr>`).join("");
$$("#aCliente").innerHTML = state.clientes.map(c=>`<option value="${c.id}">${c.nombre}</option>`).join("");
$$("#csatCliente").innerHTML = state.clientes.map(c=>`<option value="${c.id}">${c.nombre}</option>`).join("");
};

$$("#actForm").addEventListener("submit", e => {
e.preventDefault();
const obj = {id:Date.now()+"", tipo:$$("#aTipo").value, clienteId:$$("#aCliente").value, notas:$$("#aNotas").value};
state.acts.push(obj); persist(); renderActs(); toast("Actividad guardada"); e.target.reset();
});

// ===== n8n Conexión =====
$$("#guardarCfg").addEventListener("click",()=>{
state.cfg = { n8nEmail:$$("#n8nEmail").value, n8nReport:$$("#n8nReport").value, n8nCsat:$$("#n8nCsat").value };
persist(); toast("Configuración guardada");
});

// Enviar correo de actividad
$$("#btnEmailActividad").addEventListener("click", async()=>{
if(!state.cfg.n8nEmail) return toast("Configura el webhook de email en Configuración");
const payload = {cliente:$$("#aCliente").value, notas:$$("#aNotas").value};
await fetch(state.cfg.n8nEmail,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
toast("Correo enviado a n8n");
});

// Enviar reporte
$$("#btnEnviarReporte").addEventListener("click", async()=>{
if(!state.cfg.n8nReport) return toast("Configura el webhook de reportes en Configuración");
const payload = {clientes:state.clientes,opps:state.opps,acts:state.acts};
await fetch(state.cfg.n8nReport,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
toast("Reporte enviado a n8n");
});

// Enviar CSAT
$$("#btnEnviarCsat").addEventListener("click", async()=>{
if(!state.cfg.n8nCsat) return toast("Configura el webhook de CSAT en Configuración");
const payload = {cliente:$$("#csatCliente").value, score:$$("#csatScore").value, comment:$$("#csatComment").value};
await fetch(state.cfg.n8nCsat,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
toast("CSAT enviado a n8n");
});

// ===== Init =====
renderClientes(); renderOpps(); renderActs();
