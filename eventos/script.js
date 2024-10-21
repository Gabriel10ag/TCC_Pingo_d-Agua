import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/9.1.3/firebase-storage.js';
import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js';
import { getFirestore, doc, getDoc, collection, addDoc, getDocs, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyDjbdj0Q2GLbTQZK4Qw-I2PZh2Foa0ObPI",
    authDomain: "fazendapingod-agua.firebaseapp.com",
    projectId: "fazendapingod-agua",
    storageBucket: "fazendapingod-agua.appspot.com",
    messagingSenderId: "273265835920",
    appId: "1:273265835920:web:4e7e5f50b13c44b4817d15"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const userMenu = document.getElementById('user-menu');
const loginMenu = document.getElementById('login-menu');
const logoutButton = document.getElementById('logout-button');
const profileButton = document.getElementById('profile-button');

const handleAuthStateChange = (user) => {
    if (user) {
        userMenu.classList.remove('d-none');
        loginMenu.classList.add('d-none');

        logoutButton.addEventListener('click', () => {
            signOut(auth).then(() => {
                window.location.href = '../login/login.html';
            }).catch((error) => {
                console.error('Erro ao sair:', error);
            });
        });

        profileButton.addEventListener('click', () => {
            const profileModal = new bootstrap.Modal(document.getElementById('profile-modal'));
            populateProfileModal();
            profileModal.show();
        });
    } else {
        userMenu.classList.add('d-none');
        loginMenu.classList.remove('d-none');
    }
};

auth.onAuthStateChanged(handleAuthStateChange);

async function populateProfileModal() {
    const user = auth.currentUser;

    if (user) {
        const emailInput = document.getElementById('email');
        const fullNameDisplay = document.getElementById('full-name-display');
        const fullNameInput = document.getElementById('full-name-input');

        emailInput.value = user.email;

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const displayName = userData.fullName || user.displayName;
            if (displayName) {
                fullNameDisplay.textContent = displayName;
                fullNameDisplay.style.display = 'block';
                fullNameInput.style.display = 'none';
            } else {
                fullNameDisplay.style.display = 'none';
                fullNameInput.style.display = 'block';
                fullNameInput.value = '';
            }
        }
    }
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            document.getElementById('email').value = user.email;

            if (userData.isAdmin) {
                document.getElementById('admin-menu').style.display = 'block';
            }
        }
    }
});

const inserirEventosButton = document.querySelector('.botao[href="#"]');
const inserirEventoModal = new bootstrap.Modal(document.getElementById('inserir-evento-modal'));

inserirEventosButton.addEventListener('click', () => {
    inserirEventoModal.show();
});

const eventoForm = document.getElementById('evento-form');

eventoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = e.submitter;
    submitButton.disabled = true;

    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    const preco = document.getElementById('preco').value;
    const imagemFile = document.getElementById('imagem').files[0];
    const id = document.getElementById('id').value;

    try {
        const storageRef = ref(storage, `eventos/${imagemFile.name}`);
        await uploadBytes(storageRef, imagemFile);
        const imageUrl = await getDownloadURL(storageRef);

        await addDoc(collection(db, "eventos"), {
            titulo: titulo,
            descricao: descricao,
            data: data,
            hora: hora,
            id: id,
            preco: parseFloat(preco),
            imagemUrl: imageUrl,
            criadoEm: new Date()
        });

        alert("Evento inserido com sucesso!");
        eventoForm.reset();
        inserirEventoModal.hide();

    } catch (error) {
        console.error("Erro ao inserir evento: ", error);
        alert("Erro ao inserir evento.");
    } finally {
        submitButton.disabled = false;
    }
});

const eventosContainer = document.getElementById('eventos-container');

async function carregarEventos() {
    try {
        const querySnapshot = await getDocs(collection(db, "eventos"));
        querySnapshot.forEach((doc) => {
            const evento = doc.data();
            criarCardDeEvento(evento, doc.id);
        });
    } catch (error) {
        console.error("Erro ao carregar eventos: ", error);
    }
}

function criarCardDeEvento(evento, id) {
    const cardHtml = `
    <div class="col-md-4 mb-4">
        <div class="card">
            <img src="${evento.imagemUrl}" class="card-img-top" alt="${evento.titulo}">
            <div class="card-body">
                <h5 class="card-title">${evento.titulo}</h5>
                <p class="card-text">${evento.descricao}</p>
                <p class="card-text"><small class="text-muted">${evento.data} às ${evento.hora}</small></p>
            </div>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h3 class="card-preco"><p class="card-text">Preço: R$ ${evento.preco.toFixed(2)}</p></h3>
                <input type="number" class="form-control quantidade-ingressos" min="1" value="1" style="width: 100;" data-preco="${evento.preco}">
            </div>
          
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <p class="total-preco">Total: R$ ${evento.preco.toFixed(2)}</p>
                    <input type="hidden" name="vl" class="input-total-preco" value="${evento.preco.toFixed(2)}">
                    <input type="hidden" name="eventId" value="${id}">
                    <input type="hidden" name="quantidade" class="input-quantidade" value="1">
                    <button type="submit" class="btn btn-success btn-comprar">Comprar</button>
                </div>
       
        </div>
    </div>
    `;
    eventosContainer.insertAdjacentHTML('beforeend', cardHtml);

    // Adiciona o evento para atualizar o preço total e a quantidade
    const cardElement = eventosContainer.lastElementChild;
    const quantidadeInput = cardElement.querySelector('.quantidade-ingressos');
    const totalPrecoElement = cardElement.querySelector('.total-preco');
    const totalInput = cardElement.querySelector('.input-total-preco');
    const quantidadeHiddenInput = cardElement.querySelector('.input-quantidade');

    quantidadeInput.addEventListener('input', function () {
        const quantidade = parseInt(this.value, 10) || 1;
        const preco = parseFloat(this.getAttribute('data-preco'));
        const total = preco * quantidade;
        totalPrecoElement.textContent = `Total: R$ ${total.toFixed(2)}`;

        // Atualiza os inputs ocultos com o valor total e a quantidade
        totalInput.value = total.toFixed(2);
        quantidadeHiddenInput.value = quantidade;
    });
}

async function excluirEvento(eventId, imagemUrl) {
    try {
        await deleteDoc(doc(db, "eventos", eventId));
        const storageRef = ref(storage, imagemUrl);
        await deleteObject(storageRef);
        alert("Evento excluído com sucesso!");
        eventosContainer.innerHTML = '';
        carregarEventos();
    } catch (error) {
        console.error("Erro ao excluir evento: ", error);
        alert("Erro ao excluir evento.");
    }
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-excluir')) {
        const eventId = e.target.getAttribute('data-event-id');
        const imagemUrl = e.target.getAttribute('data-event-imagem-url');
        excluirEvento(eventId, imagemUrl);
    }
});

// Exibir o modal de pagamento ao clicar no botão "Comprar"
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-comprar')) {
        e.preventDefault(); // Impede o envio imediato do formulário

        // Exibe o modal de pagamento
        const pagamentoModal = new bootstrap.Modal(document.getElementById('pagamento-modal'));
        pagamentoModal.show();

        // Captura o valor total do evento (amount)
        const card = e.target.closest('.card'); // Seleciona o card do evento
        const valorTotal = card.querySelector('.input-total-preco').value; // Captura o valor total do input

        // Atualiza o valor total no modal
        const valorTotalPagamentoElement = document.getElementById('valor-total-pagamento');
        valorTotalPagamentoElement.textContent = `R$ ${valorTotal}`; // Exibe o valor total na tag <span>

        // Atualiza o input hidden com o valor total
        document.getElementById('valor').value = valorTotal; // Atribui o valor ao input hidden
    }
});




// Carregar eventos ao carregar a página
window.addEventListener('DOMContentLoaded', carregarEventos);
