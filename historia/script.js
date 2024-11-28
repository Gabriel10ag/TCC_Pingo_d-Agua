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

              <img src="${imagemUrl}" alt="${titulo}" class="fotocard">
              <div class="ctnc">
               <h5>${titulo}</h5>
              <p class="datacard">Data do Evento: ${data}</p>
              <p class="precocard">Preço unitário: R$ ${preco.toFixed(2)}</p>
              <p class="qtcard">Quantidade: ${quantidade}</p>
              <p class="totalcard">Total: R$ ${total.toFixed(2)}</p>
              
              </div>
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




//// Função para exibir o modal com uma mensagem
function showModal(message, redirectUrl = null) {
  const modal = document.createElement('div');
  modal.classList.add('modal');
  modal.style.position = 'fixed';
  modal.style.top = 0;
  modal.style.left = 0;
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = 1000;

  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = '#fff';
  modalContent.style.padding = '20px';
  modalContent.style.borderRadius = '8px';
  modalContent.style.color = '#5b1414';
  modalContent.style.fontSize = '30px';
  modalContent.style.textAlign = 'center';
  modalContent.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.2)';
  modalContent.style.width = '300px';

  const messageParagraph = document.createElement('p');
  messageParagraph.textContent = message;

  const closeButton = document.createElement('button');
  closeButton.textContent = 'Fechar';
  closeButton.style.marginTop = '10px';
  closeButton.style.padding = '10px 20px';
  closeButton.style.backgroundColor = '#ccc';
  closeButton.style.color = '#5b1414';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '5px';
  closeButton.style.cursor = 'pointer';

  closeButton.onclick = () => {
      modal.remove();
      if (redirectUrl) {
          window.location.href = redirectUrl;
      }
  };

  modalContent.appendChild(messageParagraph);
  modalContent.appendChild(closeButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

// Verifica o estado de autenticação do usuário
auth.onAuthStateChanged((user) => {
  if (user) {
      console.log('Usuário logado:', user.email);
      const userId = user.uid; // Obtendo o UID do usuário logado
      mostrarTickets(userId); // Chama a função para mostrar o ticket do usuário
  } else {
      showModal(
          'Você precisa estar logado para acessar esta página.',
          '../login/login.html'
      );
  }
});
