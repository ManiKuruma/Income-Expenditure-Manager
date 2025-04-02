document.addEventListener('DOMContentLoaded', () => {
    const transactionDateInput = document.getElementById('transaction-date');
    const transactionTypeSelect = document.getElementById('transaction-type');
    const amountInput = document.getElementById('amount');
    const descriptionInput = document.getElementById('description');
    const addTransactionBtn = document.getElementById('add-transaction-btn');
    const transactionTableBody = document.getElementById('transaction-table').querySelector('tbody');
    const currentBalanceSpan = document.getElementById('current-balance');
    const exportPdfBtn = document.getElementById('export-pdf-btn');

    let transactions = loadTransactions();
    updateBalance();
    renderTransactions();

    // Initialize date picker
    flatpickr(transactionDateInput, {
        dateFormat: "d-m-Y",
        defaultDate: "today"
    });

    addTransactionBtn.addEventListener('click', () => {
        const date = transactionDateInput.value;
        const type = transactionTypeSelect.value;
        const amount = parseFloat(amountInput.value);
        const description = descriptionInput.value.trim();

        if (!date || isNaN(amount) || description === '') {
            alert('Please enter a valid date, amount, and description.');
            return;
        }

        const newTransaction = {
            id: Date.now(),
            date: date,
            type: type,
            description: description,
            amount: amount
        };

        transactions.push(newTransaction);
        saveTransactions();
        updateBalance();
        renderTransactions();

        // Clear input fields
        transactionDateInput.value = '';
        amountInput.value = '';
        descriptionInput.value = '';
    });

    function renderTransactions() {
        transactionTableBody.innerHTML = '';
        transactions.forEach((transaction, index) => {
            const row = transactionTableBody.insertRow();
            row.insertCell().textContent = index + 1;
            const dateCell = row.insertCell();
            dateCell.textContent = transaction.date;
            dateCell.classList.add('editable-date'); // Add class for editing
            dateCell.dataset.transactionId = transaction.id;

            row.insertCell().textContent = transaction.type === 'credit' ? 'Credit' : 'Debit';
            row.insertCell().textContent = transaction.description;
            row.insertCell().textContent = `₹ ${transaction.amount.toFixed(2)}`;
            row.insertCell().textContent = `₹ ${calculateBalanceUpTo(index).toFixed(2)}`;

            const actionsCell = row.insertCell();
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.classList.add('actions-btn', 'edit');
            editButton.addEventListener('click', () => editTransaction(transaction.id));

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('actions-btn', 'delete');
            deleteButton.addEventListener('click', () => deleteTransaction(transaction.id));

            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);
        });

        // Add event listener for editing date
        document.querySelectorAll('.editable-date').forEach(cell => {
            cell.addEventListener('click', editDate);
        });
    }

    function editDate(event) {
        const cell = event.target;
        const transactionId = parseInt(cell.dataset.transactionId);
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction) return;

        const currentDate = transaction.date;
        const newDate = prompt('Enter new date (DD-MM-YYYY):', currentDate);

        if (newDate && newDate !== currentDate) {
            // Basic date format validation (you might want a more robust one)
            const dateParts = newDate.split('-');
            if (dateParts.length === 3 && dateParts.every(part => !isNaN(part) && parseInt(part) > 0)) {
                transaction.date = newDate;
                saveTransactions();
                renderTransactions(); // Re-render to update the table
            } else {
                alert('Invalid date format. Please use DD-MM-YYYY.');
            }
        }
    }

    function editTransaction(id) {
        const transactionToEdit = transactions.find(transaction => transaction.id === id);
        if (transactionToEdit) {
            const newDate = prompt('Enter new date (DD-MM-YYYY):', transactionToEdit.date);
            const newDescription = prompt('Enter new description:', transactionToEdit.description);
            const newAmount = parseFloat(prompt('Enter new amount:', transactionToEdit.amount));
            const newType = prompt('Enter new type (credit/debit):', transactionToEdit.type);

            if (newDate !== null && newDescription !== null && !isNaN(newAmount) && newType !== null && (newType === 'credit' || newType === 'debit')) {
                // Basic date format validation
                const dateParts = newDate.split('-');
                if (dateParts.length === 3 && dateParts.every(part => !isNaN(part) && parseInt(part) > 0)) {
                    transactionToEdit.date = newDate;
                    transactionToEdit.description = newDescription;
                    transactionToEdit.amount = newAmount;
                    transactionToEdit.type = newType;
                    saveTransactions();
                    updateBalance();
                    renderTransactions();
                } else {
                    alert('Invalid date format. Please use DD-MM-YYYY.');
                }
            } else {
                alert('Invalid input for edit.');
            }
        }
    }

    function deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            transactions = transactions.filter(transaction => transaction.id !== id);
            saveTransactions();
            updateBalance();
            renderTransactions();
        }
    }

    function updateBalance() {
        let balance = 0;
        transactions.forEach(transaction => {
            if (transaction.type === 'credit') {
                balance += transaction.amount;
            } else {
                balance -= transaction.amount;
            }
        });
        currentBalanceSpan.textContent = balance.toFixed(2);
    }

    function calculateBalanceUpTo(index) {
        let balance = 0;
        for (let i = 0; i <= index; i++) {
            if (transactions[i].type === 'credit') {
                balance += transactions[i].amount;
            } else {
                balance -= transactions[i].amount;
            }
        }
        return balance;
    }

    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function loadTransactions() {
        const storedTransactions = localStorage.getItem('transactions');
        return storedTransactions ? JSON.parse(storedTransactions) : [];
    }

    exportPdfBtn.addEventListener('click', () => {
        window.print();
    });
});