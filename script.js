const BUDGET_KEY = "budgetLimit";
const CURRENCY_KEY = "currencySymbol";
const EXPENSES_KEY = "expenses";

let budgetLimit = parseFloat(localStorage.getItem(BUDGET_KEY)) || 1400;
let currencySymbol = localStorage.getItem(CURRENCY_KEY) || "$";
let expenses = JSON.parse(localStorage.getItem(EXPENSES_KEY)) || [];

// Elements
const screens = document.querySelectorAll(".screen");
const navLinks = document.querySelectorAll(".app-footer a");
const spentEl = document.getElementById("spent");
const remainingEl = document.getElementById("remaining");
const progressSpentEl = document.getElementById("progress-spent");
const budgetLimitEl = document.getElementById("budget-limit");
const historyList = document.getElementById("history-list");
const circle = document.querySelector(".circle-progress");

// Settings
const budgetInput = document.getElementById("budget-input");
const currencyInput = document.getElementById("currency-input");
const saveSettingsBtn = document.getElementById("save-settings");
const resetDataBtn = document.getElementById("reset-data");

// Expense Form
const expenseForm = document.getElementById("expense-form");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");

// Tab Navigation
navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const screenId = link.dataset.screen;
    screens.forEach(s => s.classList.remove("active"));
    document.getElementById(screenId).classList.add("active");
  });
});

// Render Expenses
function renderExpenses() {
  historyList.innerHTML = "";

  if (expenses.length === 0) {
    historyList.innerHTML = "<li>No expenses yet</li>";
    updateDashboard(0);
    return;
  }

  let total = 0;
  expenses.slice().reverse().forEach(exp => {
    total += exp.amount;
    const li = document.createElement("li");
    li.innerHTML = `<span>${exp.category}</span><span>- ${currencySymbol}${exp.amount.toFixed(2)}</span>`;
    historyList.appendChild(li);
  });

  updateDashboard(total);
}

// Update Dashboard
function updateDashboard(totalSpent) {
  const remaining = budgetLimit - totalSpent;
  spentEl.textContent = `${currencySymbol}${totalSpent.toFixed(2)}`;
  remainingEl.textContent = `${currencySymbol}${remaining.toFixed(2)}`;
  progressSpentEl.textContent = `${currencySymbol}${totalSpent}`;
  budgetLimitEl.textContent = `${currencySymbol}${budgetLimit}`;

  // Circle
  const percent = Math.min((totalSpent / budgetLimit) * 360, 360);
  circle.style.background = `conic-gradient(#007aff ${percent}deg, #eee ${percent}deg)`;
}

// Handle Expense Add
expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  if (isNaN(amount) || amount <= 0) return;
  const expense = { id: Date.now(), amount, category };
  expenses.push(expense);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  amountInput.value = "";
  renderExpenses();
});

// Save Settings
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

// Reset Data
resetDataBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to reset all data?")) {
    expenses = [];
    localStorage.clear();
    budgetLimit = 1400;
    currencySymbol = "$";
    renderExpenses();
  }
});

// Init
renderExpenses();
