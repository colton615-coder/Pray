// ===== KEYS =====
const BUDGET_KEY = "budgetLimit";
const CURRENCY_KEY = "currencySymbol";
const EXPENSES_KEY = "expenses";
const CATEGORIES_KEY = "categories";

// ===== DATA =====
let budgetLimit = parseFloat(localStorage.getItem(BUDGET_KEY)) || 0;
let currencySymbol = localStorage.getItem(CURRENCY_KEY) || "$";
let expenses = JSON.parse(localStorage.getItem(EXPENSES_KEY)) || [];
let categories = JSON.parse(localStorage.getItem(CATEGORIES_KEY)) || [
  "🍔 Food", "✈️ Travel", "🛍️ Shopping", "📌 Other"
];

// ===== ELEMENTS =====
const spentEl = document.getElementById("spent");
const remainingEl = document.getElementById("remaining");
const progressSpentEl = document.getElementById("progress-spent");
const budgetLimitEl = document.getElementById("budget-limit");
const circle = document.querySelector(".circle-progress");
const historyList = document.getElementById("history-list");
const filterCategory = document.getElementById("filter-category");
const filterTime = document.getElementById("filter-time");
const expenseForm = document.getElementById("expense-form");
const amountInput = document.getElementById("amount");
const categorySelect = document.getElementById("category");
const typeSelect = document.getElementById("type");
const budgetInput = document.getElementById("budget-input");
const currencyInput = document.getElementById("currency-input");
const saveSettingsBtn = document.getElementById("save-settings");
const resetDataBtn = document.getElementById("reset-data");
const categoriesList = document.getElementById("categories-list");
const addCategoryForm = document.getElementById("add-category-form");
const categoryEmojiInput = document.getElementById("category-emoji");
const categoryNameInput = document.getElementById("category-name");

// ===== NAVIGATION =====
const screens = document.querySelectorAll(".screen");
const navLinks = document.querySelectorAll(".app-footer a");
navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const screenId = link.dataset.screen;
    screens.forEach(s => s.classList.remove("active"));
    document.getElementById(screenId).classList.add("active");

    // highlight active nav
    navLinks.forEach(n => n.classList.remove("active"));
    link.classList.add("active");
  });
});

// ===== CATEGORIES =====
function renderCategories() {
  // Expense dropdown
  categorySelect.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  // Filter dropdown
  filterCategory.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filterCategory.appendChild(option);
  });

  // Settings list
  categoriesList.innerHTML = "";
  categories.forEach((cat, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${cat}</span>
      <button onclick="deleteCategory(${index})">Delete</button>`;
    categoriesList.appendChild(li);
  });

  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

addCategoryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const emoji = categoryEmojiInput.value.trim();
  const name = categoryNameInput.value.trim();
  if (!emoji || !name) return;
  categories.push(`${emoji} ${name}`);
  categoryEmojiInput.value = "";
  categoryNameInput.value = "";
  renderCategories();
});

function deleteCategory(index) {
  categories.splice(index, 1);
  renderCategories();
}

// ===== EXPENSES / INCOME =====
expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = parseFloat(amountInput.value);
  const category = categorySelect.value;
  const type = typeSelect.value;
  if (isNaN(amount) || amount <= 0) return;

  const expense = { 
    id: Date.now(), 
    amount, 
    category, 
    type, // "expense" or "income"
    date: new Date().toISOString() 
  };

  expenses.push(expense);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));

  amountInput.value = "";
  renderExpenses();
});

function getFilteredExpenses() {
  let filtered = [...expenses];
  if (filterCategory.value !== "all") {
    filtered = filtered.filter(exp => exp.category === filterCategory.value);
  }
  const now = new Date();
  if (filterTime.value === "week") {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(now.getDate() - 7);
    filtered = filtered.filter(exp => new Date(exp.date) >= oneWeekAgo);
  }
  if (filterTime.value === "month") {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);
    filtered = filtered.filter(exp => new Date(exp.date) >= oneMonthAgo);
  }
  return filtered;
}

function renderExpenses() {
  historyList.innerHTML = "";
  const filteredExpenses = getFilteredExpenses();
  if (filteredExpenses.length === 0) {
    historyList.innerHTML = "<li>No transactions yet</li>";
    updateDashboard(0, 0);
    return;
  }
  let expenseTotal = 0;
  let incomeTotal = 0;

  filteredExpenses.slice().reverse().forEach(exp => {
    if (exp.type === "expense") expenseTotal += exp.amount;
    if (exp.type === "income") incomeTotal += exp.amount;

    const li = document.createElement("li");
    const sign = exp.type === "income" ? "+" : "-";
    const cssClass = exp.type === "income" ? "income" : "expense";

    li.innerHTML = `<span>${exp.category}</span>
      <span class="${cssClass}">${sign} ${currencySymbol}${exp.amount.toFixed(2)}</span>`;
    historyList.appendChild(li);
  });

  updateDashboard(expenseTotal, incomeTotal);
}

// ===== DASHBOARD =====
function updateDashboard(expenseTotal, incomeTotal) {
  const remaining = budgetLimit > 0 ? budgetLimit - expenseTotal : 0;
  spentEl.textContent = `${currencySymbol}${expenseTotal.toFixed(2)}`;
  remainingEl.textContent = budgetLimit > 0 ? `${currencySymbol}${remaining.toFixed(2)}` : `${currencySymbol}0.00`;
  progressSpentEl.textContent = `${currencySymbol}${expenseTotal.toFixed(0)}`;
  budgetLimitEl.textContent = budgetLimit > 0 ? `${currencySymbol}${budgetLimit}` : "Set budget";

  const percent = budgetLimit > 0 ? Math.min((expenseTotal / budgetLimit) * 360, 360) : 0;
  circle.style.background = `conic-gradient(#007aff ${percent}deg, rgba(255,255,255,0.2) ${percent}deg)`;
}

// ===== SETTINGS =====
saveSettingsBtn.addEventListener("click", () => {
  const newBudget = parseFloat(budgetInput.value);
  const newCurrency = currencyInput.value || currencySymbol;
  if (!isNaN(newBudget) && newBudget > 0) {
    budgetLimit = newBudget;
    localStorage.setItem(BUDGET_KEY, budgetLimit);
  }
  currencySymbol = newCurrency;
  localStorage.setItem(CURRENCY_KEY, currencySymbol);
  renderExpenses();
  alert("Settings saved!");
});

resetDataBtn.addEventListener("click", () => {
  if (confirm("Reset all data?")) {
    expenses = [];
    categories = ["🍔 Food","✈️ Travel","🛍️ Shopping","📌 Other"];
    localStorage.clear();
    budgetLimit = 0;
    currencySymbol = "$";
    renderCategories();
    renderExpenses();
  }
});

// ===== INIT =====
renderCategories();
renderExpenses();
budgetInput.value = budgetLimit || "";
currencyInput.value = currencySymbol;
