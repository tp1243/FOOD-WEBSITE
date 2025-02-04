// orders-page.js
document.addEventListener('DOMContentLoaded', loadOrders);

document.getElementById('clearOrdersButton').addEventListener('click', clearOrders);

async function loadOrders() {
    if (!window.db) {
        console.error("❌ Firestore (db) is not initialized yet!");
        return;
    }

    const tableBody = document.querySelector('tbody');

    try {
        const ordersRef = window.db.collection('orders');
        const snapshot = await ordersRef.orderBy('timestamp', 'desc').get();

        tableBody.innerHTML = ''; // Clear existing rows

        snapshot.forEach((doc) => {
            const order = doc.data();

            let formattedDate = order.date;
            let formattedTime = order.time;

            if (order.timestamp && order.timestamp.toDate) {
                const timestampDate = order.timestamp.toDate();
                formattedDate = timestampDate.toLocaleDateString();
                formattedTime = timestampDate.toLocaleTimeString();
            }

            const tr = document.createElement('tr');
            const orderItemsList = document.createElement('ul');
            orderItemsList.classList.add('item-list');

            order.items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = `${item.name} x${item.quantity}`;
                orderItemsList.appendChild(listItem);
            });

            const feedbackDiv = createStarRating(doc.id, order.feedback); // Pass existing feedback

            tr.innerHTML = `
                <td>${order.orderNo}</td>
                <td></td>
                <td>₹${order.totalAmount.toFixed(2)}</td>
                <td>${formattedDate}<br>${formattedTime}</td>
                <td>${order.paymentMethod}</td>
                <td></td> <!-- Feedback cell -->
                <td><button class="view-details" data-order-id="${doc.id}">View Details</button></td>
            `;

            tr.querySelector('td:nth-child(2)').appendChild(orderItemsList);
            tr.querySelector('td:nth-child(6)').appendChild(feedbackDiv); // Append star rating
            tableBody.appendChild(tr);

            const viewDetailsButton = tr.querySelector('.view-details');
            viewDetailsButton.addEventListener('click', () => {
                showOrderDetails(doc.id);
            });
        });
    } catch (error) {
        console.error("❌ Error loading orders:", error);
        alert('Error loading orders data. Please try again.');
    }
}

function createStarRating(orderId, existingFeedback = 0) {
    const starDiv = document.createElement('div');
    starDiv.classList.add('star-rating');

    // Add stars with existing feedback (if any)
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement('span');
        star.classList.add('star');
        star.dataset.value = i;
        star.innerHTML = '★';

        // Check if the star should be filled (based on existing feedback)
        if (i <= existingFeedback) {
            star.classList.add('filled');
        }

        // Add click event for rating
        star.addEventListener('click', function() {
            submitFeedback(orderId, i);
            updateStarRating(starDiv, i);
        });

        starDiv.appendChild(star);
    }

    return starDiv;
}

function updateStarRating(starDiv, rating) {
    const stars = starDiv.querySelectorAll('.star');
    stars.forEach(star => {
        if (parseInt(star.dataset.value) <= rating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
}

function submitFeedback(orderId, rating) {
    // Save feedback to Firebase or process accordingly
    console.log(`Feedback for Order ${orderId}: ${rating} stars`);

    // Here you can send the feedback to Firebase or update the order in your database
    window.db.collection('orders').doc(orderId).update({
        feedback: rating  // Update the feedback field in Firestore
    }).then(() => {
        console.log("Feedback submitted successfully.");
    }).catch((error) => {
        console.error("Error updating feedback:", error);
        alert('Failed to submit feedback. Please try again.');
    });
}

function showOrderDetails(orderId) {
    const modal = document.getElementById('orderDetailsModal');
    const modalOrderNo = document.getElementById('modalOrderNo');
    const modalOrderItems = document.getElementById('modalOrderItems');
    const modalOrderTotal = document.getElementById('modalOrderTotal');
    const modalOrderDateTime = document.getElementById('modalOrderDateTime');
    const modalOrderPayment = document.getElementById('modalOrderPayment');

    window.db.collection('orders').doc(orderId).get().then(doc => {
        if (doc.exists) {
            const order = doc.data();
            modalOrderNo.textContent = `Order No: ${order.orderNo}`;
            modalOrderItems.innerHTML = '';

            const itemList = document.createElement('ul');
            itemList.classList.add('item-list');
            order.items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = `${item.name} x${item.quantity}`;
                itemList.appendChild(listItem);
            });
            modalOrderItems.appendChild(itemList);

            modalOrderTotal.textContent = `Total: ₹${order.totalAmount.toFixed(2)}`;

            let formattedDate = order.date;
            let formattedTime = order.time;
            if (order.timestamp && order.timestamp.toDate) {
                const timestampDate = order.timestamp.toDate();
                formattedDate = timestampDate.toLocaleDateString();
                formattedTime = timestampDate.toLocaleTimeString();
            }
            modalOrderDateTime.textContent = `Date: ${formattedDate} Time: ${formattedTime}`;
            modalOrderPayment.textContent = `Payment: ${order.paymentMethod}`;
            modal.style.display = 'block';
        } else {
            console.error("No such document!");
        }
    }).catch(error => {
        console.error("Error getting document:", error);
    });
}

function closeModal() {
    document.getElementById('orderDetailsModal').style.display = 'none';
}

// Close the modal if the user clicks outside of it.
window.onclick = function(event) {
    const modal = document.getElementById('orderDetailsModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Clear Orders Button Event Listener
async function clearOrders() {
    if (!window.db) {
        console.error("❌ Firestore (db) is not initialized yet!");
        return;
    }

    try {
        const ordersRef = window.db.collection('orders');
        const snapshot = await ordersRef.get();

        // Check if there are orders to delete
        if (snapshot.empty) {
            alert('No orders to delete.');
            return;
        }

        // Delete all orders in Firestore
        const batch = window.db.batch();
        snapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        // Commit the batch delete operation
        await batch.commit();

        console.log("All orders have been cleared.");

        // Clear the orders from the UI
        document.querySelector('tbody').innerHTML = '';
        alert('All orders have been cleared from both the website and the database.');
    } catch (error) {
        console.error("❌ Error clearing orders:", error);
        alert('Error clearing orders. Please try again.');
    }
}