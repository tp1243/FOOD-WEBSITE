// sales-page.js

function goToSales() {
    window.location.href = "breakfast.html"; // Redirect to sales recording page
}

// Load sales when the page is ready
document.addEventListener('DOMContentLoaded', loadSales);

async function loadSales() {
    if (!window.db) {
        console.error("❌ Firestore (db) is not initialized yet!");
        return;
    }

    const tableBody = document.querySelector('tbody');
    const todayTotalElement = document.querySelector('.summary-card:first-child p');
    const monthTotalElement = document.querySelector('.summary-card:last-child p');

    try {
        const salesRef = window.db.collection('sales');
        const snapshot = await salesRef.orderBy('timestamp', 'desc').get();

        let todayTotal = 0;
        let monthTotal = 0;
        const today = new Date().toLocaleDateString();
        const currentMonth = new Date().getMonth();

        tableBody.innerHTML = ''; // Clear existing rows

        snapshot.forEach((doc) => {
            const sale = doc.data();
            const saleDate = sale.timestamp?.toDate(); 

            if (sale.date === today) {
                todayTotal += sale.totalAmount;
            }
            if (saleDate && saleDate.getMonth() === currentMonth) {
                monthTotal += sale.totalAmount;
            }

            const tr = document.createElement('tr');
            const paymentStatus = sale.paymentStatus || 'Pending';

            tr.innerHTML = `
                <td>${sale.orderNo}</td>
                <td>${sale.items.map(item => `${item.name} x${item.quantity}`).join('<br>')}</td>
                <td>₹${sale.totalAmount.toFixed(2)}</td>
                <td>${sale.date}<br>${sale.time}</td>
                <td>${sale.paymentMethod}</td>
                <td>
                    ${paymentStatus === 'Pending'
                        ? `<button class="pay-now-btn" onclick="payNow('${doc.id}', ${sale.totalAmount})">Pay Now</button>`
                        : `<span class="paid-status">${paymentStatus}</span>`}
                </td>
                <td><button class="delete-btn" onclick="deleteSale('${doc.id}')">Delete</button></td>
            `;

            tableBody.appendChild(tr);
        });

        todayTotalElement.textContent = `₹${todayTotal.toFixed(2)}`;
        monthTotalElement.textContent = `₹${monthTotal.toFixed(2)}`;

    } catch (error) {
        console.error("❌ Error loading sales:", error);
        alert('Failed to load sales data. Please check your connection.');
    }
}

async function deleteSale(saleId) {
    if (!window.db) {
        console.error("❌ Firestore (db) is not initialized yet!");
        return;
    }

    if (confirm('Are you sure you want to delete this sale?')) {
        try {
            await window.db.collection('sales').doc(saleId).delete();
            alert('Sale deleted successfully!');
            loadSales(); // Refresh table
        } catch (error) {
            console.error("❌ Error deleting sale:", error);
            alert('Could not delete sale. Please try again.');
        }
    }
}

// 🔹 Razorpay Integration
async function payNow(saleId, amount) {
    if (!window.db) {
        console.error("❌ Firestore (db) is not initialized yet!");
        return;
    }

    try {
        const saleRef = window.db.collection('sales').doc(saleId);
        const saleDoc = await saleRef.get();
        const saleData = saleDoc.data();

        if (!saleDoc.exists) {
            alert('Sale not found.');
            return;
        }

        if (saleData.paymentStatus === 'Paid') {
            alert('Payment already completed.');
            return;
        }

        var options = {
            "key": "rzp_test_TfvSBMDZ96l5FS", // Replace with your Razorpay API Key
            "amount": amount * 100,  // Convert to paisa (₹500 → 50000)
            "currency": "INR",
            "name": "PlatefulParadise",
            "description": `Order #${saleData.orderNo}`,
            "handler": async function (response) {
                // After successful payment, update Firestore
                try {
                    await saleRef.update({ paymentStatus: 'Paid' });
                    await window.db.collection('orders').add(saleData); // Move to 'orders'

                    alert("Payment Successful! Order recorded.");
                    loadSales(); // Refresh sales list
                } catch (error) {
                    console.error("❌ Error updating payment status:", error);
                    alert("Payment successful, but error recording order.");
                }
            },
            "prefill": {
                "name": saleData.customerName || "John Doe",
                "email": saleData.customerEmail || "john@example.com",
                "contact": saleData.customerPhone || "9876543210"
            },
            "theme": {
                "color": "#FF0000"  // Customize button color
            }
        };

        var rzp1 = new Razorpay(options);
        rzp1.open();

    } catch (error) {
        console.error("❌ Error processing payment:", error);
        alert('Error processing payment. Please try again.');
    }
}
