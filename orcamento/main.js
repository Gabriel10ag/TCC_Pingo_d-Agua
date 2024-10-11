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

