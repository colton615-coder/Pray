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
  { name: "🍔 Food", subcategories: [] },
  { name: "✈️ Travel", subcategories: [] },
  { name: "🛍️ Shopping", subcategories: [] },
  { name: "💳 Subscriptions", subcategories: [] }
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
const subcategorySelect = document.getElementById("subcategory");
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

    navLinks.forEach(n => n.classList.remove("active"));
    link.classList.add("active");
  });
});

// ===== CATEGORIES =====
function renderCategories() {
  // Category dropdown
  categorySelect.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.textContent = cat.name;
    categorySelect.appendChild(option);
  });

  // Filter dropdown
  filterCategory.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.name;
    option.textContent = cat.name;
    filterCategory.appendChild(option);
  });

  // Settings list
  categoriesList.innerHTML = "";
  categories.forEach((cat, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span>${cat.name}</span>
        <button onclick="deleteCategory(${index})">Delete</button>
      </div>
      <ul class="subcategory-list" id="sub-list-${index}">
        ${cat.subcategories.map((sub, subIndex) => `
          <li>
            <span>${sub}</span>
            <button onclick="deleteSubcategory(${index}, ${subIndex})">X</button>
          </li>
        `).join("")}
      </ul>
      <form class="add-subcategory-form" onsubmit="addSubcategory(event, ${index})">
        <input type="text" placeholder="Add subcategory..." required>
        <button type="submit">+</button>
      </form>
    `;
    categoriesList.appendChild(li);
  });

  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

addCategoryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const emoji = categoryEmojiInput.value.trim();
  const name = categoryNameInput.value.trim();
  if (!emoji || !name) return;
  categories.push({ name: `${emoji} ${name}`, subcategories: [] });
  categoryEmojiInput.value = "";
  categoryNameInput.value = "";
  renderCategories();
});

function deleteCategory(index) {
  categories.splice(index, 1);
  renderCategories();
}

function addSubcategory(event, catIndex) {
  event.preventDefault();
  const input = event.target.querySelector("input");
  const subName = input.value.trim();
  if (!subName) return;
  categories[catIndex].subcategories.push(subName);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  renderCategories();
}

function deleteSubcategory(catIndex, subIndex) {
  categories[catIndex].subcategories.splice(subIndex, 1);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  renderCategories();
}

// ===== SUBCATEGORY DROPDOWN BEHAVIOR =====
categorySelect.addEventListener("change", () => {
  const selected = categories.find(c => c.name === categorySelect.value);
  if (selected && selected.subcategories.length > 0) {
    subcategorySelect.style.display = "block";
    subcategorySelect.innerHTML = "";
    selected.subcategories.forEach(sub => {
      const option = document.createElement("option");
      option.textContent = sub;
      subcategorySelect.appendChild(option);
    });
  } else {
    subcategorySelect.style.display = "none";
    subcategorySelect.innerHTML = "";
  }
});

// ===== EXPENSES =====
expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = parseFloat(amountInput.value);
  const categoryName = categorySelect.value;
  const type = typeSelect.value;
  const subcategory = subcategorySelect.style.display === "block" 
    ? subcategorySelect.value 
    : "";

  if (isNaN(amount) || amount <= 0) return;

  const expense = { 
    id: Date.now(), 
    amount, 
    category: categoryName, 
    subcategory, 
    type, 
    date: new Date().toISOString() 
  };

  expenses.push(expense);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  amountInput.value = "";
  renderExpenses();
});

function getFilteredExpenses() {
  let filtered = [...expenses];
  if (filterCategory
