let currentImages = [];
let currentIndex = 0;

function showGallery(galleryNumber) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Limpa a galeria antes de inserir as novas imagens

    let images = [];

    // Define as imagens para cada galeria
    switch (galleryNumber) {
        case 1:
            images = [
                '../img/t-33/1.jpeg',
                '../img/t-33/2.jpeg',
                '../img/t-33/3.jpeg',
                '../img/t-33/4.jpeg',
                '../img/t-33/5.jpeg',
                '../img/t-33/6.jpeg',
                '../img/t-33/7.jpeg',
                '../img/t-33/8.jpeg',
            ];
            break;
        case 2:
            images = [
                '../img/parisjet/1.jpeg',
                '../img/parisjet/2.jpeg',
                '../img/parisjet/3.jpeg',
                '../img/parisjet/4.jpeg',
                '../img/parisjet/5.jpeg',
                '../img/parisjet/6.jpeg',
                '../img/parisjet/7.jpeg',
                '../img/parisjet/8.jpeg',
            ];
            break;
        case 3:
            images = [
                '../img/parisjet/2.jpeg',
                '../img/parisjet/1.jpeg',
                '../img/parisjet/5.jpeg',
                '../img/parisjet/3.jpeg',
                '../img/parisjet/6.jpeg',
                '../img/parisjet/4.jpeg',
                '../img/parisjet/8.jpeg',
                '../img/parisjet/7.jpeg',
            ];
            break;
        case 4:
            images = [
                '../img/natureza/1.jpg',
                '../img/natureza/2.jpg',
                '../img/natureza/3.jpg',
                '../img/natureza/4.jpeg',
                '../img/natureza/5.jpeg',
                '../img/natureza/6.jpeg',
                '../img/natureza/7.jpeg',
                '../img/natureza/8.jpeg',
            ];
            break;
        case 5:
            images = [
                '../img/fauna/1.jpg',
                '../img/fauna/2.jpg',
                '../img/fauna/3.jpg',
                '../img/fauna/4.jpg',
                '../img/fauna/5.jpg',
                '../img/fauna/6.jpg',
                '../img/fauna/7.jpg',
                '../img/fauna/8.jpg',
            ];
            break;
    }

    // Atualiza as imagens
    currentImages = images;

    // Insere as imagens na galeria
    images.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.dataset.index = index; // Salva o índice da imagem
        img.addEventListener('click', () => openLightbox(index)); // Adiciona o evento de clique para abrir a lightbox
        gallery.appendChild(img);
    });
}

function openLightbox(index) {
    currentIndex = index;
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = currentImages[currentIndex];
    lightbox.style.display = 'flex'; // Exibe a lightbox
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none'; // Oculta a lightbox
}
