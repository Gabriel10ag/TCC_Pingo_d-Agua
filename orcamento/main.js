
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

document.addEventListener('DOMContentLoaded', () => {
    const servicePrices = {
        'servico1': 100, // Buffet
        'servico2': 200, // Quiosque
        'servico3': 150  // Salão
    };

    const serviceNames = {
        'servico1': 'Buffet',
        'servico2': 'Quiosque',
        'servico3': 'Salão'
    };

    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="servicos"]');
    const totalInput = document.getElementById('total');

    function calculateTotal() {
        let total = 0;

        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                total += servicePrices[checkbox.value];
            }
        });

        totalInput.value = `R$ ${total.toFixed(2)}`;
    }

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculateTotal);
    });

    totalInput.value = 'R$ 0.00';

    // Evento ao clicar no botão "Enviar Orçamento"
    document.getElementById('enviar').addEventListener('click', function (e) {
        e.preventDefault();

        // Coleta os dados do formulário
        const nome = document.getElementById('nome').value || "Nome não informado";
        const telefone = document.getElementById('telefone').value || "Telefone não informado";
        const cpf = document.getElementById('cpf').value || "CPF não informado";

        let total = 0;
        let servicosSelecionados = [];

        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                servicosSelecionados.push(serviceNames[checkbox.value]);
                total += servicePrices[checkbox.value];
            }
        });

        let listaServicos = servicosSelecionados.length > 0 ? servicosSelecionados.join(', ') : 'Nenhum serviço selecionado';

        // Formatação da mensagem para o WhatsApp
        const mensagem = `Olá, gostaria de solicitar um orçamento. Aqui estão meus dados:%0A
                        Nome: ${nome}%0A
                        Telefone: ${telefone}%0A
                        CPF: ${cpf}%0A
                        Serviços Selecionados: ${listaServicos}%0A
                        Total: R$ ${total.toFixed(2)}`;

        // Número de WhatsApp da empresa 
        const numeroWhatsApp = '5515996684528'; 

        // Cria o link para o WhatsApp
        const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensagem}`;

        // Redireciona para o WhatsApp
        window.open(linkWhatsApp, '_blank');
    });
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
