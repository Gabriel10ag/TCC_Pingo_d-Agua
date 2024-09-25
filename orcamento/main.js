


document.addEventListener('DOMContentLoaded', () => {
    const servicePrices = {
        'servico1': 100, // Buffet
        'servico2': 200, // Quiosque
        'servico3': 150  // Salão
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
});
