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
        document.addEventListener('DOMContentLoaded', function() {
            var galleryItems = document.querySelectorAll('.gallery-item');
            var lightbox = document.getElementById('lightbox');
            var lightboxImg = document.getElementById('lightbox-img');
            var closeBtn = document.querySelector('.close');

            galleryItems.forEach(function(item) {
                item.addEventListener('click', function() {
                    lightbox.style.display = 'flex';
                    lightboxImg.src = item.src;
                });
            });

            closeBtn.addEventListener('click', function() {
                lightbox.style.display = 'none';
            });

            lightbox.addEventListener('click', function(event) {
                if (event.target === lightbox) {
                    lightbox.style.display = 'none';
                }
            });
        });
 window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    const logo = document.querySelector('.logo img');
    
    if (window.scrollY > 50) {
        header.style.padding = '10px 20px';
        header.style.backgroundColor = '#6d1616';
        logo.style.height = '80px';
        logo.style.width = '160px'
    } else {
        header.style.padding = '20px';
        header.style.backgroundColor = 'transparent';
        logo.style.height = '100px';
    }
});

document.getElementById('show-events').addEventListener('click', async () => {
    const eventsListDiv = document.getElementById('events-list');
    eventsListDiv.innerHTML = ''; // Limpa a div antes de mostrar novos eventos

    // Adicionar uma div com a classe 'row'
    const rowDiv = document.createElement('div');
    rowDiv.className = 'row justify-content-center'; // Centra os cards na row
    eventsListDiv.appendChild(rowDiv); // Insere a div 'row' dentro de 'events-list'

    // Obter a data atual
    const today = new Date();
    
    // Obter o primeiro e o último dia do mês
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Último dia do mês

    // Formatar as datas no formato yyyy-mm-dd
    const yyyyFirst = firstDayOfMonth.getFullYear();
    const mmFirst = String(firstDayOfMonth.getMonth() + 1).padStart(2, '0');
    const ddFirst = String(firstDayOfMonth.getDate()).padStart(2, '0');
    const startDate = `${yyyyFirst}-${mmFirst}-${ddFirst}`;
    
    const yyyyLast = lastDayOfMonth.getFullYear();
    const mmLast = String(lastDayOfMonth.getMonth() + 1).padStart(2, '0');
    const ddLast = String(lastDayOfMonth.getDate()).padStart(2, '0');
    const endDate = `${yyyyLast}-${mmLast}-${ddLast}`;

    // Verificar se o db foi corretamente inicializado
    if (!db) {
        console.error("Firestore (db) não foi inicializado corretamente.");
        return;
    }

    // Consultar a coleção "eventos" no Firestore para eventos do mês
    try {
        const eventosRef = collection(db, 'eventos');
        const q = query(eventosRef, where('data', '>=', startDate), where('data', '<=', endDate));

        // Executar a consulta e mostrar os resultados
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            eventsListDiv.innerHTML = '<p>Nenhum evento encontrado para este mês.</p>';
        } else {
            querySnapshot.forEach(doc => {
                const eventData = doc.data();
                rowDiv.innerHTML += `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 shadow-lg rounded" style="border: 1px solid #ddd;"> <!-- Adiciona borda e sombra -->
                            <img class="card-img-top rounded-top" src="${eventData.imagemUrl || 'default-image.jpg'}" alt="Imagem do evento" style="height: 250px; object-fit: cover;">
                            <div class="card-body d-flex flex-column">
                                <h3 class="card-title text-primary font-weight-bold">${eventData.titulo || 'Título não disponível'}</h3>
                                <p class="card-text text-muted mb-4">${eventData.descricao || 'Descrição não disponível'}</p>
                                <ul class="list-unstyled mt-auto">
                                    <li><strong>Data:</strong> ${eventData.data || 'Data não disponível'}</li>
                                    <li><strong>Hora:</strong> ${eventData.hora || 'Hora não disponível'}</li>
                                    <li><strong>Preço:</strong> <span class="text-success">R$${eventData.preco || 'Preço não disponível'}</span></li>
                                </ul>
                            </div>
                            <div class="card-footer text-center bg-light">
                                <button class="btn btn-primary btn-block">Saiba Mais</button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
    } catch (error) {
        console.error("Erro ao buscar eventos: ", error);
        eventsListDiv.innerHTML = '<p>Erro ao carregar os eventos.</p>';
    }
});



const images = document.querySelectorAll('.gallery-item');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');

let currentIndex = 0;

images.forEach((img, index) => {
    img.addEventListener('click', () => {
        currentIndex = index;
        openLightbox(img.src);
    });
});

function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.style.display = 'flex';
}

prevButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Impede o fechamento do lightbox
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
    lightboxImg.src = images[currentIndex].src;
});

nextButton.addEventListener('click', (event) => {
    event.stopPropagation(); // Impede o fechamento do lightbox
    currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
    lightboxImg.src = images[currentIndex].src;
});

lightbox.addEventListener('click', () => {
    lightbox.style.display = 'none';
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
