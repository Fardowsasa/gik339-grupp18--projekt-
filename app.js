const bilForm = document.getElementById('bilForm');
const productList = document.getElementById('productList');
const feedbackModal = new bootstrap.Modal(document.getElementById('feedbackModal'));

// Visa meddelande i modal
function visaMeddelande(text) {
    document.getElementById('modalMessage').innerText = text;
    feedbackModal.show();
}

// HÄMTA OCH VISA BILAR
async function fetchBilar() {
    const res = await fetch('/bilar');
    const bilar = await res.json();

    productList.innerHTML = ''; // Rensa innehållet

    bilar.forEach(bil => {
        productList.innerHTML += `
            <div class="col-md-4 mb-3">
                <div class="card shadow-sm" style="border-left: 10px solid ${bil.farg}">
                    <div class="card-body">
                        <h5 class="card-title">${bil.modell}</h5>
                        <p class="card-text text-muted">Årsmodell: ${bil.arsmodell}</p>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteBil(${bil.id})">Ta bort</button>
                    </div>
                </div>
            </div>`;
    });
}

// SKAPA NY BIL
bilForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        modell: document.getElementById('modell').value,
        farg: document.getElementById('farg').value,
        arsmodell: document.getElementById('arsmodell').value
    };

    const res = await fetch('/bilar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        bilForm.reset();
        fetchBilar();
        visaMeddelande("Bilen sparad!");
    } else {
        const fel = await res.json();
        visaMeddelande("Fel: " + fel.message);
    }
});

// TA BORT BIL
async function deleteBil(id) {
    if (confirm("Vill du ta bort bilen?")) {
        const res = await fetch(`/bilar/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchBilar();
            visaMeddelande("Bilen raderad.");
        }
    }
}

// Kör vid start
fetchBilar();
