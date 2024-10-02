$(document).ready(function() {
    $('a.btn').on('click', function (e) {
        e.preventDefault(); // Evita o redirecionamento automático do link

        // Obtém o valor do input
        let vl = $("#valor").val();
        
        // Verifica se o valor foi preenchido
        if (!vl || vl <= 0) {
            alert('Por favor, insira um valor válido.');
            return;
        }

        // Obtém o href do link e adiciona o valor como parâmetro na URL
        let link = $(this).attr('href');
        location.href = link + '?vl='+vl;
    });
});
