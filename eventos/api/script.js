import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: 'AIzaSyDjbdj0Q2GLbTQZK4Qw-I2PZh2Foa0ObPI',
    authDomain: 'fazendapingod-agua.firebaseapp.com',
    projectId: 'fazendapingod-agua',
    storageBucket: 'fazendapingod-agua.appspot.com',
    messagingSenderId: '273265835920',
    appId: '1:273265835920:web:4e7e5f50b13c44b4817d15'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const mp = new MercadoPago('TEST-40402515-dc10-4df4-a0a1-36279f278b92'); // Public Key de Teste
const bricksBuilder = mp.bricks();

// Pega os parâmetros da URL
const urlParams = new URLSearchParams(window.location.search);
const valorPayment = parseFloat(urlParams.get('vl')); // Valor do pagamento
const eventId = urlParams.get('eventid'); // ID do evento
const quantidade = parseInt(urlParams.get('quantidade')); // Quantidade

console.log("Valor do pagamento:", valorPayment);
console.log("Event ID:", eventId);
console.log("Quantidade:", quantidade);

const renderPaymentBrick = async () => {
    // Verificar se o usuário está logado
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuário está logado, podemos continuar com o pagamento
            const userId = user.uid; // Pega o ID do usuário logado
            const userEmail = user.email; // Pega o email do usuário logado
            console.log("Usuário logado: " + userEmail); // Exibe o email no console

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

                                    if (jsonResponse.status === 'approved') {
                                        renderStatusScreenBrick(jsonResponse.id);
                                        
                                        // Salvando o pagamento no Firestore com o userId
                                        addDoc(collection(db, 'users', userId, 'pagamento'), {
                                            status: 'approved',
                                            metodoPag: 'cartão',
                                            eventoid: eventId,
                                            quantidade: quantidade,
                                            valor: valorPayment,
                                            timestamp: serverTimestamp()
                                        })
                                        .then(() => {
                                            console.log('Pagamento salvo com sucesso!');
                                            
                                            // Agora, aguarda 10 segundos antes de redirecionar para eventos.html
                                            setTimeout(() => {
                                                window.location.href = "../eventos.html"; // Redireciona para eventos.html após 10 segundos
                                            }, 2000); // 10000 milissegundos = 10 segundos
                                        })
                                        .catch((error) => {
                                            console.error("Erro ao salvar o pagamento no Firestore: ", error);
                                        });
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

            window.paymentBrickController = bricksBuilder.create(
                "payment",
                "paymentBrick_container",
                settings
            );

        } else {
            // Usuário não está logado
            alert("Você precisa estar logado para realizar um pagamento.");
            window.location.href = "../login.html"; // Redireciona para a página de login
        }
    });
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
