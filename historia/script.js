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
        console.log('Usuário autenticado:', user);
        const emailInput = document.getElementById('email');
        const fullNameDisplay = document.getElementById('full-name-display');
        const fullNameInput = document.getElementById('full-name-input');

        emailInput.value = user.email;

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const displayName = userData.fullName || user.displayName;
            console.log('Nome completo do usuário:', displayName);
            if (displayName) {
                fullNameDisplay.textContent = displayName;
                fullNameDisplay.style.display = 'block';
                fullNameInput.style.display = 'none';
            } else {
                fullNameDisplay.style.display = 'none';
                fullNameInput.style.display = 'block';
                fullNameInput.value = '';
            }
        } else {
            console.log('Documento do usuário não encontrado.');
        }
    } else {
        console.log('Nenhum usuário autenticado.');
    }
}

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
