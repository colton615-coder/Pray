// ===== KEYS =====
const BUDGET_KEY = "budget";
const CURRENCY_KEY = "currency";
const EXPENSES_KEY = "expenses";
const CATEGORIES_KEY = "categories";

// ===== DATA =====
let budget = parseFloat(localStorage.getItem(BUDGET_KEY)) || 0;
let currency = localStorage.getItem(CURRENCY_KEY) || "$";
let expenses = JSON.parse(localStorage.getItem(EXPENSES_KEY)) || [];
let categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [
  { name: "🍔 Food", subcategories: [] },
  { name: "✈️ Travel", subcategories: [] },
  { name: "🛍️ Shopping", subcategories: [] }
];

// ===== ELEMENTS =====
const spentEl = document.getElementById("spent");
const remainingEl = document.getElementById("remaining");
const budgetEl = document.getElementById("budget-limit");
const historyList = document.getElementById("history-list");

const expenseForm = document.getElementById("expense-form");
const amountInput = document.getElementById("amount");
const categorySelect = document.getElementById("category");
const subcategorySelect = document.getElementById("subcategory");
const typeSelect = document.getElementById("type");

const budgetInput = document.getElementById("budget-input");
const currencyInput = document.getElementById("currency-input");
const categoriesList = document.getElementById("categories-list");
const addCategoryForm = document.getElementById("add-category-form");
const categoryEmojiInput = document.getElementById("category-emoji");
const categoryNameInput = document.getElementById("category-name");

const saveSettingsBtn = document.getElementById("save-settings");
const resetDataBtn = document.getElementById("reset-data");

// ===== NAVIGATION =====
document.querySelectorAll("nav button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
    document.getElementById(btn.dataset.screen).classList.add("active");
  });
});

// ===== RENDER CATEGORIES =====
function renderCategories() {
  // Populate category dropdown
  categorySelect.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });

  // Render categories + subcategories in settings
  categoriesList.innerHTML = "";
  categories.forEach((cat, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${cat.name}</strong>
      <ul>
        ${cat.subcategories.map((sub, subIdx) => 
          `<li>${sub} <button onclick="deleteSubcategory(${idx}, ${subIdx})">X</button></li>`
        ).join("")}
      </ul>
      <form onsubmit="addSubcategory(event, ${idx})">
        <input type="text" placeholder="Add subcategory" required>
        <button type="submit">+</button>
      </form>
      <button onclick="deleteCategory(${idx})">Delete Category</button>
    `;
    categoriesList.appendChild(li);
  });

  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

function addSubcategory(e, idx) {
  e.preventDefault();
  const input = e.target.querySelector("input");
  categories[idx].subcategories.push(input.value);
  input.value = "";
  renderCategories();
}

function deleteSubcategory(catIdx, subIdx) {
  categories[catIdx].subcategories.splice(subIdx, 1);
  renderCategories();
}

function deleteCategory(idx) {
  categories.splice(idx, 1);
  renderCategories();
}

// ===== SUBCATEGORY DROPDOWN =====
categorySelect.addEventListener("change", () => {
  const cat = categories.find(c => c.name === categorySelect.value);
  if (cat && cat.subcategories.length > 0) {
    subcategorySelect.style.display = "block";
    subcategorySelect.innerHTML = "";
    cat.subcategories.forEach(sub => {
      const option = document.createElement("option");
      option.textContent = sub;
      subcategorySelect.appendChild(option);
    });
  } else {
    subcategorySelect.style.display = "none";
    subcategorySelect.innerHTML = "";
  }
});

// ===== EXPENSE FORM =====
expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) return;

  const category = categorySelect.value;
  const subcategory = subcategorySelect.style.display === "block" ? subcategorySelect.value : "";
  const type = typeSelect.value;

  const tx = { 
    id: Date.now(), 
    amount, 
    category, 
    subcategory, 
    type, 
    date: new Date().toISOString() 
  };
  expenses.push(tx);

  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  amountInput.value = "";
  renderExpenses();
});

// ===== RENDER EXPENSES =====
function renderExpenses() {
  historyList.innerHTML = "";
  if (expenses.length === 0) {
    historyList.innerHTML = "<li>No transactions yet</li>";
    updateDashboard();
    return;
  }
  expenses.slice().reverse().forEach(tx => {
    const li = document.createElement("li");
    const label = tx.subcategory ? `${tx.category} → ${tx.subcategory}` : tx.category;
    const sign = tx.type === "income" ? "+" : "-";
    li.textContent = `${label}: ${sign}${currency}${tx.amount}`;
    historyList.appendChild(li);
  });
  updateDashboard();
}

// ===== DASHBOARD =====
function updateDashboard() {
  let spent = 0;
  expenses.forEach(tx => { if (tx.type === "expense") spent += tx.amount; });
  const remaining = budget > 0 ? budget - spent : 0;
  spentEl.textContent = `${currency}${spent.toFixed(2)}`;
  remainingEl.textContent = `${currency}${remaining.toFixed(2)}`;
  budgetEl.textContent = budget > 0 ? `${currency}${budget}` : "Not set";
}

// ===== SETTINGS =====
saveSettingsBtn.addEventListener("click", () => {
  budget = parseFloat(budgetInput.value) || 0;
  currency = currencyInput.value || "$";
  localStorage.setItem(BUDGET_KEY, budget);
  localStorage.setItem(CURRENCY_KEY, currency);
  renderExpenses();
});

resetDataBtn.addEventListener("click", () => {
  if (!confirm("Reset all data?")) return;
  budget = 0;
  currency = "$";
  expenses = [];
  categories = [
    { name: "🍔 Food", subcategories: [] },
    { name: "✈️ Travel", subcategories: [] },
    { name: "🛍️ Shopping", subcategories: [] }
  ];
  localStorage.clear();
  renderCategories();
  renderExpenses();
});

// ===== INIT =====
renderCategories();
renderExpenses();
budgetInput.value = budget || "";
currencyInput.value = currency;
