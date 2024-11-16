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

    const submitButton = e.submitter;  // Captura o botão que foi clicado
    submitButton.disabled = true;  // Desativa o botão para evitar múltiplas submissões

    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    const preco = document.getElementById('preco').value;
    const imagemFile = document.getElementById('imagem').files[0];

    try {
        const storageRef = ref(storage, `eventos/${imagemFile.name}`);
        await uploadBytes(storageRef, imagemFile);
        const imageUrl = await getDownloadURL(storageRef);

        await addDoc(collection(db, "eventos"), {
            titulo: titulo,
            descricao: descricao,
            data: data,
            hora: hora,
           
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
        submitButton.disabled = false;  // Reativa o botão após a tentativa de submissão
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
                <h5 class="card-title" id="titulocard">${evento.titulo}</h5>
                <p class="card-text" id="textocard">${evento.descricao}</p>
                <p class="card-text"><small class="text-muted">${evento.data} às ${evento.hora}</small></p>
            </div>
            <div class="mb-5 d-flex justify-content-around">
                <h3 class="card-preco" id="precocard"><p class="card-text">Preço: R$ ${evento.preco.toFixed(2)}</p></h3>
                <button class="btn btn-success btn-comprar" data-id="${id}" data-preco="${evento.preco}">Comprar</button>

            </div>
        </div>
    </div>
    `;
    eventosContainer.insertAdjacentHTML('beforeend', cardHtml);
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
        const eventId = e.target.getAttribute('data-id');
        const imagemUrl = e.target.getAttribute('data-imagem');
        excluirEvento(eventId, imagemUrl);
    }
});

const excluirEventosButton = document.querySelector('#admin-menu .botoes .botao:nth-child(2)');

excluirEventosButton.addEventListener('click', async () => {
    const listaEventosExcluir = document.getElementById('lista-eventos-excluir');
    listaEventosExcluir.innerHTML = '';

    const eventosSnapshot = await getDocs(collection(db, 'eventos'));
    eventosSnapshot.forEach((doc) => {
        const evento = doc.data();
        const eventoItem = document.createElement('a');
        eventoItem.href = "#";
        eventoItem.classList.add('list-group-item', 'list-group-item-action');
        eventoItem.textContent = `${evento.titulo} - ${evento.data}`;

        eventoItem.addEventListener('click', async () => {
            if (confirm(`Tem certeza que deseja excluir o evento "${evento.titulo}"?`)) {
                await excluirEvento(doc.id, evento.imagemUrl);
                eventoItem.remove();
            }
        });

        listaEventosExcluir.appendChild(eventoItem);
    });

    const excluirEventoModal = new bootstrap.Modal(document.getElementById('excluir-evento-modal'));
    excluirEventoModal.show();
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

function abrirModalPagamento(event) {
    const eventId = event.target.getAttribute('data-id');
    const preco = parseFloat(event.target.getAttribute('data-preco'));

    const eventIdInput = document.getElementById('eventid');
    const valorInput = document.getElementById('valor');
    const quantidadeInput = document.getElementById('quantidade');
    const qtInput = document.getElementById('qt'); // Input oculto para quantidade
    const totalInput = document.getElementById('total');
    const valorTotalPagamentoElement = document.getElementById('valor-total-pagamento');

    if (eventIdInput) eventIdInput.value = eventId;
    if (valorInput) valorInput.value = preco.toFixed(2);
    if (qtInput) qtInput.value = quantidadeInput.value; // Inicializa com o valor inicial de quantidade

    quantidadeInput.value = 1;
    totalInput.value = `R$ ${preco.toFixed(2)}`;
    valorTotalPagamentoElement.textContent = `R$ ${preco.toFixed(2)}`;

    // Atualiza o total e o valor oculto 'qt' ao alterar a quantidade
    quantidadeInput.addEventListener('input', function () {
        const quantidade = parseInt(this.value, 10);
        const total = preco * quantidade;

        totalInput.value = `R$ ${total.toFixed(2)}`;
        valorTotalPagamentoElement.textContent = `R$ ${total.toFixed(2)}`;
        valorInput.value = total.toFixed(2);

        if (qtInput) {
            qtInput.value = quantidade; // Atualiza o input oculto
        }
    });

    document.querySelectorAll('button[data-link]').forEach(button => {
        button.addEventListener('click', function () {
            const linkBase = this.getAttribute('data-link');
            const valor = valorInput.value;
            const quantidade = qtInput.value; // Usa o valor atualizado do input oculto
            window.location.href = `${linkBase}?vl=${valor}&eventid=${eventId}&quantidade=${quantidade}`;
        });
    });

    const pagamentoModal = new bootstrap.Modal(document.getElementById('pagamento-modal'));
    pagamentoModal.show();
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-comprar')) {
        e.preventDefault();
        abrirModalPagamento(e);
    }
});
function mostrarTickets(userId) {
    // Referência para a subcoleção de pagamentos do usuário
    const pagamentoRef = collection(db, 'users', userId, 'pagamento');
    
    // Buscando todos os documentos na subcoleção de pagamentos
    getDocs(pagamentoRef)
      .then((querySnapshot) => {
        // Verifica se há documentos na coleção
        if (querySnapshot.empty) {
          // Exibe a mensagem dentro do ticket-container
          const ticketContainer = document.getElementById('ticket-container');
          ticketContainer.innerHTML = ''; // Limpa o container
          const mensagem = document.createElement('p');
          mensagem.textContent = 'Nenhum pagamento encontrado para este usuário.';
          ticketContainer.appendChild(mensagem); // Adiciona a mensagem ao container
          return;
        }
  
        // Container para exibir os tickets
        const ticketContainer = document.getElementById('ticket-container');
        ticketContainer.innerHTML = ''; // Limpa o container antes de adicionar novos elementos
  
        // Iterando por todos os pagamentos
        querySnapshot.forEach((docSnapshot) => {
          const pagamentoData = docSnapshot.data(); // Obtém os dados do pagamento
          const eventId = pagamentoData.eventoid; // Obtém o ID do evento
          const quantidade = pagamentoData.quantidade || 1; // Obtém a quantidade ou assume 1 como padrão
  
          // Buscando o evento correspondente na coleção "eventos"
          const eventoRef = doc(db, 'eventos', eventId);
          getDoc(eventoRef)
            .then((eventoDoc) => {
              if (eventoDoc.exists()) {
                const eventoData = eventoDoc.data();
                const titulo = eventoData.titulo;
                const imagemUrl = eventoData.imagemUrl;
                const preco = eventoData.preco;
                const data = eventoData.data; // Data do evento
                const total = preco * quantidade; // Calcula o preço total baseado na quantidade
  
                // Criando um elemento HTML para o ticket
                const ticketHtml = `
                  <div class="ticket-card">
                    <h5>${titulo}</h5>
                    <img src="${imagemUrl}" alt="${titulo}" style="width: 100px; height: auto;">
                    <p>Data do Evento: ${data}</p>
                    <p>Preço unitário: R$ ${preco.toFixed(2)}</p>
                    <p>Quantidade: ${quantidade}</p>
                    <p>Total: R$ ${total.toFixed(2)}</p>
                  </div>
                `;
                ticketContainer.insertAdjacentHTML('beforeend', ticketHtml); // Adiciona o ticket ao container
              } else {
                console.log('Evento não encontrado para o ID:', eventId);
              }
            })
            .catch((error) => {
              console.error('Erro ao buscar evento:', error);
            });
        });
      })
      .catch((error) => {
        console.error('Erro ao buscar pagamentos:', error);
      });
  }
  
  


// Verifica o estado de autenticação do usuário
auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('Usuário logado:', user.email);
      const userId = user.uid; // Obtendo o UID do usuário logado
      mostrarTickets(userId); // Chama a função para mostrar o ticket do usuário
    } else {
      alert('Você precisa estar logado para acessar esta página.');
      window.location.href = '../../login/login.html'; // Redireciona para a página de login
    }
});


document.addEventListener('DOMContentLoaded', carregarEventos);
