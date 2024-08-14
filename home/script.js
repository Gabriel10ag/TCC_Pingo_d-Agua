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
window.onscroll = function() {
    var header = document.querySelector('header');
    if (window.pageYOffset > 0) {
        header.classList.add('sticky');
    } else {
        header.classList.remove('sticky');
    }
};
