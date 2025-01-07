document.addEventListener("DOMContentLoaded", () => {
    const itemNameInput = document.getElementById("item-name");
    const itemPriceInput = document.getElementById("item-price");
    const addItemButton = document.getElementById("add-item");
    const monthSelect = document.getElementById("month-select");
    const transactionList = document.getElementById("transaction-list");
    const monthTotalDisplay = document.getElementById("month-total");
  
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const budgetDataKey = "budget-data";
    let budgetData = JSON.parse(localStorage.getItem(budgetDataKey)) || {};
  
    function formatIndianDate(dateStr) {
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-IN", options);
    }
  
    function formatIndianMonth(monthStr) {
      const options = { month: "long", year: "numeric" };
      const date = new Date(`${monthStr}-01`);
      return date.toLocaleDateString("en-IN", options);
    }
  
    function updateMonthDropdown() {
      monthSelect.innerHTML = "";
      const months = Object.keys(budgetData).sort();
      months.forEach((month) => {
        const option = document.createElement("option");
        option.value = month;
        option.textContent = formatIndianMonth(month);
        if (month === currentMonth) {
          option.selected = true;
        }
        monthSelect.appendChild(option);
      });
      if (!months.includes(currentMonth)) {
        const currentOption = document.createElement("option");
        currentOption.value = currentMonth;
        currentOption.textContent = formatIndianMonth(currentMonth);
        currentOption.selected = true;
        monthSelect.appendChild(currentOption);
      }
    }
  
    function updateTransactionList() {
      const selectedMonth = monthSelect.value;
      const monthData = budgetData[selectedMonth] || {};
  
      transactionList.innerHTML = "";
      let monthTotal = 0;
  
      Object.entries(monthData).forEach(([date, items]) => {
        const formattedDate = formatIndianDate(date);
        let dailyTotal = 0;
  
        const dateHeader = document.createElement("div");
        dateHeader.classList.add("transaction-date");
        dateHeader.innerHTML = `<span>${formattedDate}</span><span id="daily-total-${date}">Daily Total: ₹0</span>`;
        transactionList.appendChild(dateHeader);
  
        items.forEach((item, index) => {
          const transaction = document.createElement("div");
          transaction.classList.add("transaction");
  
          const deleteButton = document.createElement("button");
          deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
          deleteButton.classList.add("delete-button");
          deleteButton.addEventListener("click", () =>
            confirmDelete(selectedMonth, date, index)
          );
  
          const details = document.createElement("div");
          details.classList.add("transaction-details");
          details.textContent = item.name;
  
          const amount = document.createElement("div");
          amount.classList.add("transaction-amount");
          amount.textContent = `₹${item.price}`;
  
          transaction.appendChild(deleteButton);
          transaction.appendChild(details);
          transaction.appendChild(amount);
          transactionList.appendChild(transaction);
  
          dailyTotal += item.price;
          monthTotal += item.price;
        });
  
        const dailyTotalElement = document.getElementById(`daily-total-${date}`);
        if (dailyTotalElement) {
          dailyTotalElement.textContent = `Daily Total: ₹${dailyTotal}`;
        }
      });
  
      monthTotalDisplay.textContent = `Month Total: ₹${monthTotal}`;
    }
  
    function confirmDelete(month, date, index) {
      const isConfirmed = confirm(
        "Are you sure you want to delete this item?"
      );
      if (isConfirmed) {
        deleteItem(month, date, index);
      }
    }
  
    function deleteItem(month, date, index) {
      budgetData[month][date].splice(index, 1);
  
      if (budgetData[month][date].length === 0) {
        delete budgetData[month][date];
      }
  
      if (Object.keys(budgetData[month]).length === 0) {
        delete budgetData[month];
      }
  
      localStorage.setItem(budgetDataKey, JSON.stringify(budgetData));
      updateTransactionList();
    }
  
    function addItem() {
      const itemName = itemNameInput.value.trim();
      const itemPrice = parseFloat(itemPriceInput.value);
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  
      if (!itemName || isNaN(itemPrice)) {
        alert("Please enter a valid item name and price.");
        return;
      }
  
      const selectedMonth = currentMonth;
      if (!budgetData[selectedMonth]) {
        budgetData[selectedMonth] = {};
      }
  
      if (!budgetData[selectedMonth][today]) {
        budgetData[selectedMonth][today] = [];
      }
  
      budgetData[selectedMonth][today].push({
        name: itemName,
        price: itemPrice,
      });
      localStorage.setItem(budgetDataKey, JSON.stringify(budgetData));
  
      itemNameInput.value = "";
      itemPriceInput.value = "";
      updateTransactionList();
    }
  
    addItemButton.addEventListener("click", addItem);
    monthSelect.addEventListener("change", updateTransactionList);
  
    itemNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        itemPriceInput.focus();
      }
    });
  
    itemPriceInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        addItemButton.focus();
      }
    });
  
    updateMonthDropdown();
    updateTransactionList();
  });
  
