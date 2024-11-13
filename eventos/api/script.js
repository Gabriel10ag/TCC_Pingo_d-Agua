const mp = new MercadoPago('TEST-40402515-dc10-4df4-a0a1-36279f278b92'); // Public Key de Teste
const bricksBuilder = mp.bricks();
const valorPayment = parseFloat($("#valor_payment").val()); // Captura o valor dinamicamente

const renderPaymentBrick = async () => {
    const settings = {
        initialization: {
            amount: valorPayment, // Obtém o valor do pagamento dinamicamente
            preferenceId: $("#preference_id").val(), // Obtém o ID da preferência
        },
        customization: {
            paymentMethods: {
                creditCard: "all",
            },
            visual: {
                style: {
                    customVariables: {
                        textPrimaryColor: "#6d1616",
                        textSecondaryColor: "#6d1616",
                        inputBackgroundColor: "#f7f7f7",
                        formBackgroundColor: "#ffffff",
                        baseColor: "#6d1616",
                        baseColorFirstVariant: "#6d1616",
                        baseColorSecondVariant: "#6d1616",
                        errorColor: "#d9534f",
                        successColor: "#5bc0de",
                        outlinePrimaryColor: "#6d1616",
                        outlineSecondaryColor: "#cccccc",
                        buttonTextColor: "#ffffff",
                        fontSizeExtraSmall: "12px",
                        fontSizeSmall: "14px",
                        fontSizeMedium: "16px",
                        fontSizeLarge: "18px",
                        fontSizeExtraLarge: "20px",
                        fontWeightNormal: "400",
                        fontWeightSemiBold: "600",
                        formInputsTextTransform: "none",
                        inputVerticalPadding: "10px",
                        inputHorizontalPadding: "15px",
                        inputFocusedBoxShadow: "0 0 0 0.2rem rgba(109, 22, 22, 0.5)",
                        inputErrorFocusedBoxShadow: "0 0 0 0.2rem rgba(217, 83, 79, 0.5)",
                        inputBorderWidth: "1px",
                        inputFocusedBorderWidth: "2px",
                        borderRadiusSmall: "4px",
                        borderRadiusMedium: "8px",
                        borderRadiusLarge: "12px",
                        borderRadiusFull: "50px",
                        formPadding: "20px"
                    },
                },
            },
        },
        callbacks: {
            onReady: () => {
                // Callback chamado quando o Brick estiver pronto.
            },
            onSubmit: ({ selectedPaymentMethod, formData }) => {
                console.log("Dados do formulário enviados:", formData); // Log para verificar o formData

                return new Promise((resolve, reject) => {
                    fetch("http://localhost/tcc_pingo_d-agua/eventos/api/card.php?vl=" + valorPayment, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(formData),
                    })
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error("Erro na resposta da API: " + response.statusText);
                            }
                            return response.json(); // Tenta converter a resposta para JSON
                        })
                        .then((jsonResponse) => {
                            console.log("Resposta da API:", jsonResponse);

                            // Verifica se a transação foi aprovada
                            if (jsonResponse.status === 'approved') {
                                renderStatusScreenBrick(jsonResponse.id);
                                // Aguarda 10 segundos antes de redirecionar para a página desejada
                                setTimeout(() => {
                                    window.location.href = "../eventos.html"; // Redireciona para eventos.html após 10 segundos
                                }, 10000); // 10000 milissegundos = 10 segundos
                            } else if (jsonResponse.status === 'pending' || jsonResponse.status === 'in_process' || jsonResponse.status === 'rejected') {
                                renderStatusScreenBrick(jsonResponse.id); // Passa o ID do pagamento para renderizar a tela de status
                                resolve();
                            } else {
                                reject(new Error("Status desconhecido: " + jsonResponse.status));
                            }

                            // Verifica se o ID do pagamento foi retornado
                            if (!jsonResponse.id) {
                                throw new Error("ID do pagamento não foi retornado pela API.");
                            }
                        })
                        .catch((error) => {
                            console.error("Erro ao tentar criar o pagamento:", error); // Log do erro
                            alert("Ocorreu um erro ao processar o pagamento. Tente novamente."); // Alerta para o usuário
                            reject(error); // Rejeita a Promise com o erro
                        });
                });
            },
            onError: (error) => {
                console.error("Erro no pagamento:", error);
            },
        },
    };

    // Adiciona validação do valor de pagamento antes de renderizar
    if (valorPayment < 1) { // Altere 1 para o valor mínimo necessário para o seu caso
        alert("O valor da transação é muito baixo para os métodos de pagamento selecionados.");
        return;
    }

    window.paymentBrickController = await bricksBuilder.create(
        "payment",
        "paymentBrick_container",
        settings
    );
};

const renderStatusScreenBrick = async (paymentId) => {
    const settings = {
        initialization: {
            paymentId: paymentId, // Passa o ID do pagamento para o Status Brick
        },
        callbacks: {
            onReady: () => {
                // Oculta o Payment Brick
                document.getElementById("paymentBrick_container").style.display = "none";
            },
            onError: (error) => {
                console.error("Erro ao renderizar o Status Screen Brick:", error);
            },
        },
    };

    window.statusScreenBrickController = await bricksBuilder.create(
        'statusScreen',
        'statusScreenBrick_container',
        settings
    );
};

// Chama o renderPaymentBrick
renderPaymentBrick();
