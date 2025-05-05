let currentUser = null;
let allUsers = JSON.parse(localStorage.getItem("users")) || {};
let expenses = [];

// Auto-login if user is saved
window.onload = function () {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser && allUsers[savedUser]) {
    loginUser(savedUser);
  }

  // Set dark mode
  const isDark = localStorage.getItem("theme") === "dark";
  if (isDark) {
    document.body.classList.add("dark");
    document.getElementById("themeToggle").textContent = "☀️ Light Mode";
  }
};

// Register new user
function register() {
  const username = document.getElementById("usernameInput").value.trim();
  if (!username) return alert("Username required.");

  if (allUsers[username]) {
    return alert("Username already exists.");
  }

  allUsers[username] = [];
  localStorage.setItem("users", JSON.stringify(allUsers));
  alert("Registered successfully!");
}

// Login existing user
function login() {
  const username = document.getElementById("usernameInput").value.trim();
  if (!allUsers[username]) {
    return alert("User not found. Please register.");
  }

  loginUser(username);
}

// Handle login
function loginUser(username) {
  currentUser = username;
  expenses = allUsers[username] || [];

  document.getElementById("authSection").style.display = "none";
  document.getElementById("appSection").style.display = "block";
  document.getElementById("currentUserName").textContent = username;

  localStorage.setItem("currentUser", username);
  renderExpenses();
  updateTotal();
  updateMonthlySummary();
}

// Logout
function logout() {
  localStorage.removeItem("currentUser");
  document.getElementById("authSection").style.display = "block";
  document.getElementById("appSection").style.display = "none";
  expenses = [];
  currentUser = null;
}

// Add expense
function addExpense() {
  const desc = document.getElementById("descInput").value;
  const amount = parseFloat(document.getElementById("amountInput").value);
  const category = document.getElementById("categoryInput").value;

  if (!desc || isNaN(amount) || amount <= 0) {
    return alert("Enter valid description and amount.");
  }

  const expense = {
    id: Date.now(),
    desc,
    amount,
    category,
    time: new Date().toLocaleString()
  };

  expenses.push(expense);
  saveAndRender();
  clearInputs();
}

// Delete by ID
function removeExpense(id) {
  expenses = expenses.filter(exp => exp.id !== id);
  saveAndRender();
}

// Clear all
function clearAllExpenses() {
  if (confirm("Delete all expenses?")) {
    expenses = [];
    saveAndRender();
  }
}

// Save data and render UI
function saveAndRender() {
  if (currentUser) {
    allUsers[currentUser] = expenses;
    localStorage.setItem("users", JSON.stringify(allUsers));
  }
  renderExpenses();
  updateTotal();
  updateMonthlySummary();
}

// Show all expenses
function renderExpenses() {
  const list = document.getElementById("expenseList");
  list.innerHTML = "";

  expenses.forEach(exp => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${exp.desc}</strong> - ₹${exp.amount.toFixed(2)}<br>
      <small>${exp.time}</small><br>
      <span>${exp.category}</span>
      <button onclick="removeExpense(${exp.id})">Delete</button>
    `;
    list.appendChild(li);
  });
}

// Clear inputs
function clearInputs() {
  document.getElementById("descInput").value = "";
  document.getElementById("amountInput").value = "";
}

// Filter by search
function filterExpenses() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const list = document.getElementById("expenseList");
  list.innerHTML = "";

  expenses
    .filter(exp => exp.desc.toLowerCase().includes(query))
    .forEach(exp => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${exp.desc}</strong> - ₹${exp.amount.toFixed(2)}<br>
        <small>${exp.time}</small>
        <button onclick="removeExpense(${exp.id})">Delete</button>
      `;
      list.appendChild(li);
    });
}

// Filter by date
function filterByDate() {
  const selectedDate = document.getElementById("dateInput").value;
  const list = document.getElementById("expenseList");

  if (!selectedDate) return renderExpenses();

  list.innerHTML = "";

  expenses
    .filter(exp => new Date(exp.time).toISOString().split("T")[0] === selectedDate)
    .forEach(exp => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${exp.desc}</strong> - ₹${exp.amount.toFixed(2)}<br>
        <small>${exp.time}</small>
        <button onclick="removeExpense(${exp.id})">Delete</button>
      `;
      list.appendChild(li);
    });
}

// Total calculation
function updateTotal() {
  const sum = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const total = document.getElementById("total");
  total.textContent = sum.toFixed(2);
  total.className = sum >= 0 ? "positive" : "negative";
}

// Monthly summary
function updateMonthlySummary() {
  const summary = {};

  expenses.forEach(exp => {
    const date = new Date(exp.time);
    const key = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
    summary[key] = (summary[key] || 0) + exp.amount;
  });

  const list = document.getElementById("monthlyList");
  list.innerHTML = "";

  for (let month in summary) {
    const li = document.createElement("li");
    li.textContent = `${month}: ₹${summary[month].toFixed(2)}`;
    list.appendChild(li);
  }
}

// Theme toggle
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const darkModeOn = document.body.classList.contains("dark");
  localStorage.setItem("theme", darkModeOn ? "dark" : "light");
  document.getElementById("themeToggle").textContent = darkModeOn ? "☀️ Light Mode" : "🌙 Dark Mode";
});

// Export to CSV
function exportToCSV() {
  if (expenses.length === 0) return alert("No expenses to export.");

  const headers = ["Description", "Amount", "Category", "Date"];
  const rows = expenses.map(exp => [exp.desc, exp.amount, exp.category, exp.time]);

  const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "expenses.csv";
  link.click();
}
