const bilForm = document.getElementById('bilForm');
const productList = document.getElementById('productList');
const feedbackModal = new bootstrap.Modal(document.getElementById('feedbackModal'));

// Funktion för att visa meddelande
function visaMeddelande(text) {
    document.getElementById('modalMessage').innerText = text;
    feedbackModal.show();
}

// 1. HÄMTA OCH VISA BILAR
async function fetchProducts() {
    const res = await fetch('/products');
    const products = await res.json();

    productList.innerHTML = ''; // Rensa listan innan vi ritar nytt

    products.forEach(p => {
        // Skapar HTML-kortet som syns på sidan
        productList.innerHTML += `
            <div class="col-md-4 mb-3">
                <div class="card shadow-sm" style="border-left: 10px solid ${p.color}">
                    <div class="card-body">
                        <h5 class="card-title">${p.name}</h5>
                        <p class="card-text text-muted">Årsmodell: ${p.price}</p>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteProduct(${p.id})">Ta bort</button>
                    </div>
                </div>
            </div>`;
    });
}

// 2. SPARA BIL
bilForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stoppa omladdning

    // Hämta värdena från rutorna
    const data = {
        name: document.getElementById('modell').value,
        color: document.getElementById('farg').value,
        price: document.getElementById('arsmodell').value
    };

    // Skicka till servern
    const res = await fetch('/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        bilForm.reset(); // Töm rutorna
        fetchProducts(); // UPPDATERA LISTAN DIREKT!
        visaMeddelande("Bilen sparad!");
    }
});

// 3. TA BORT BIL
async function deleteProduct(id) {
    if(confirm("Vill du ta bort bilen?")) {
        await fetch(`/products/${id}`, { method: 'DELETE' });
        fetchProducts(); // Uppdatera listan direkt
    }
}

// Körs när sidan laddas
fetchProducts();