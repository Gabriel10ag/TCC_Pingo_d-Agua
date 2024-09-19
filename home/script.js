
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


import { db } from './firebase-config.js'; // Certifique-se de que o caminho está correto
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

document.getElementById('show-events').addEventListener('click', async () => {
    const eventsListDiv = document.getElementById('events-list');
    eventsListDiv.innerHTML = ''; // Limpa a div antes de mostrar novos eventos

    // Obter a data atual no formato yyyy-mm-dd
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Meses de 0-11, por isso +1
    const dd = String(today.getDate()).padStart(2, '0');
    const currentDate = `${yyyy}-${mm}-${dd}`;

    // Verificar se o db foi corretamente inicializado
    if (!db) {
        console.error("Firestore (db) não foi inicializado corretamente.");
        return;
    }

    // Consultar a coleção "eventos" no Firestore
    try {
        const eventosRef = collection(db, 'eventos'); // Não coloque uma barra no final do nome da coleção
        const q = query(eventosRef, where('data', '==', currentDate));

        // Executar a consulta e mostrar os resultados
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            eventsListDiv.innerHTML = '<p>Nenhum evento encontrado para hoje.</p>';
        } else {
            querySnapshot.forEach(doc => {
                const eventData = doc.data();
                eventsListDiv.innerHTML += `
                    <div class="col-md-2 m-5">
                        <div class="card">
                            <img class="card-img-top" src="${eventData.imagemUrl || ''}" alt="Imagem do evento" style="width: 100%; max-width: 300px;">
                            <div class="card-body">
                                <h3 class="card-title">${eventData.titulo || 'Título não disponível'}</h3>
                                <p class="card-text">Descrição: ${eventData.descricao || 'Descrição não disponível'}</p>
                                <p class="card-text">Data: ${eventData.data || 'Data não disponível'}</p>
                                <p class="card-text">Hora: ${eventData.hora || 'Hora não disponível'}</p>
                                <p class="card-text">Preço: R$${eventData.preco || 'Preço não disponível'}</p>
                            </div>
                        </div>
                    </div>
                </div> 
                `;
            });

            function criarCardDeEvento(evento, id) {
            const cardHtml = `
                <div class="col-md-4 mb-4">
                <div class="card">
                    <img src="${eventData.imagemUrl}" class="card-img-top" alt="${eventData.titulo}">
                    <div class="card-body">
                        <h5 class="card-title" id="titulocard">${eventData.titulo}</h5>
                        <p class="card-text" id="textocard">${eventData.descricao}</p>
                        <p class="card-text"><small class="text-muted">${eventData.data} às ${eventData.hora}</small></p>
                    </div>
                    <div class="mb-5 d-flex justify-content-around">
                        <h3 class="card-preco" id="precocard"><p class="card-text">Preço: R$ ${eventData.preco.toFixed(2)}</p></h3>
                        <button class="btn btn-success btn-comprar" data-id="${id}" data-preco="${eventData.preco}">Comprar</button>
                    </div>
                </div>
            </div>
            `;
            eventosContainer.insertAdjacentHTML('beforeend', cardHtml);
        }

        }
    } catch (error) {
        console.error("Erro ao buscar eventos: ", error);
        eventsListDiv.innerHTML = '<p>Erro ao carregar os eventos.</p>';
    }
});


