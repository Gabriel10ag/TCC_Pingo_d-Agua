
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
import { db } from './firebase-config.js';
import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

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
