// Budget limit (you can make this editable later)
const BUDGET_LIMIT = 1400;

// Select elements
const expenseForm = document.getElementById("expense-form");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const historyList = document.getElementById("history-list");
const spentEl = document.getElementById("spent");
const remainingEl = document.getElementById("remaining");
const progressSpentEl = document.getElementById("progress-spent");
const circle = document.querySelector(".circle-progress");

// Load expenses from localStorage
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Render all expenses on load
renderExpenses();

// Handle form submission
expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;

  if (isNaN(amount) || amount <= 0) return;

  const expense = {
    id: Date.now(),
    amount,
    category,
    date: new Date().toLocaleDateString()
  };

  expenses.push(expense);
  localStorage.setItem("expenses", JSON.stringify(expenses));

  amountInput.value = "";
  renderExpenses();
});

// Render function
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
    li.innerHTML = `<span>${exp.category}</span><span>-$${exp.amount.toFixed(2)}</span>`;
    historyList.appendChild(li);
  });

  updateDashboard(total);
}

// Update dashboard + budget ring
function updateDashboard(totalSpent) {
  const remaining = BUDGET_LIMIT - totalSpent;

  spentEl.textContent = `$${totalSpent.toFixed(2)}`;
  remainingEl.textContent = `$${remaining.toFixed(2)}`;
  progressSpentEl.textContent = `$${totalSpent}`;

  // Progress circle (conic-gradient fill)
  const percent = Math.min((totalSpent / BUDGET_LIMIT) * 360, 360);
  circle.style.background = `conic-gradient(#007aff ${percent}deg, #eee ${percent}deg)`;
}
