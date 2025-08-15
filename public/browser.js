// public/browser.js
const listEl = document.getElementById("list-item");
const form = document.getElementById("create-form");
const input = document.getElementById("input");
const totalEl = document.getElementById("total");
const btnDeleteAll = document.getElementById("delete-all");

let items = Array.isArray(window.__ITEMS__) ? window.__ITEMS__ : [];

function render() {
  listEl.innerHTML = items
    .map(
      (item) => `
    <li class="list-group-item d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center" style="gap:.5rem">
        <input type="text" class="form-control form-control-sm" style="min-width:220px"
               value="${escapeHtml(item.text)}" data-id="${item._id}" />
      </div>
      <div>
        <button class="btn btn-sm btn-success mr-2" data-action="save" data-id="${item._id}">Salvar</button>
        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${item._id}">Excluir</button>
      </div>
    </li>`
    )
    .join("");
  totalEl.textContent = `Total: ${items.length} tarefa(s)`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const { data } = await axios.post("/create-item", { text });
  items.push(data);
  input.value = "";
  render();
});

listEl.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.getAttribute("data-id");

  if (btn.getAttribute("data-action") === "save") {
    const inputEl = listEl.querySelector(`input[data-id="${id}"]`);
    const text = inputEl.value.trim();
    await axios.post("/update-item", { id, text });
    const i = items.findIndex((x) => String(x._id) === String(id));
    if (i >= 0) items[i].text = text;
    render();
  }

  if (btn.getAttribute("data-action") === "delete") {
    await axios.post("/delete-item", { id });
    items = items.filter((x) => String(x._id) !== String(id));
    render();
  }
});

btnDeleteAll.addEventListener("click", async () => {
  if (!confirm("Tem certeza que deseja apagar tudo?")) return;
  await axios.post("/delete-all");
  items = [];
  render();
});

render();
