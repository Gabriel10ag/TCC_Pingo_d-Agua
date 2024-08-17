        // script.js

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

 // Adicione ao script do HTML ou um arquivo separado .js
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
        header.style.backgroundColor = 'transparent'; // Define transparente ao rolar para cima
        logo.style.height = '100px';
    }
});


