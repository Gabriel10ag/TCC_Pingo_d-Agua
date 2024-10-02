<?php
require_once 'api/preference.php'; // Inclua aqui o seu arquivo de configuração do Mercado Pago

$amount = (float)trim($_GET['vl']);

// Não exiba o valor na tela
// echo "Valor passado para a API: $amount"; // Isso deve ser removido

$body = json_decode(file_get_contents("php://input")); // Obtém o body da requisição

if (isset($body->token)) {
    $curl = curl_init();

    $idempotency_key = uniqid(); // Gera uma chave única para idempotência

    // Configuração da requisição cURL para a API do Mercado Pago
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.mercadopago.com/v1/payments',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => json_encode([
            'payer' => [
                'email' => $body->payer->email,
                'identification' => [
                    'type' => $body->payer->identification->type,
                    'number' => $body->payer->identification->number,
                ],
            ],
            'issuer_id' => $body->issuer_id,
            'description' => $body->description ?? 'Descrição não disponível', // Garante que a descrição esteja definida
            'installments' => $body->installments,
            'payment_method_id' => $body->payment_method_id,
            'token' => $body->token,
            'transaction_amount' => $body->transaction_amount,
        ]),
        CURLOPT_HTTPHEADER => array(
            'Content-Type: application/json',
            'X-Idempotency-Key: ' . $idempotency_key,
            'Authorization: Bearer ' . $accesstoken // Token de acesso da sua aplicação
        ),
    ));

    $response = curl_exec($curl);
    curl_close($curl);

    // Certifique-se de que o retorno é um JSON válido
    header('Content-Type: application/json');
    echo $response; // Retorna o JSON da API Mercado Pago
    exit; // Encerra o script após a resposta JSON
}
?>


<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EVENTOS - Fazenda Eventos</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">

</head>

<body>
    <header>
        <div class="logo">
            <a href="../home/index.html">
                <img src="../img/Logo Branco PNG (1).png" alt="Logo">
            </a>
        </div>
        <nav>
            <a href="../estrutura/estrutura.html" class="menu-button">Estrutura</a>
            <a href="../historia/historia.html" class="menu-button">História</a>
            <a href="../eventos/eventos.html" class="menu-button">Eventos</a>
            <a href="../orcamento/orcamento.html" class="menu-button">Orçamento</a>
            <div id="login-menu">
                <a id="login-button" href="../login/login.html" class="menu-button">Login</a>
            </div>
            <div id="user-menu" class="d-none">
                <a href="#" id="profile-button" class="menu-button">Perfil</a>

                <button id="logout-button" class="menu-button esp">Sair</button>
            </div>

        </nav>
    </header>
    <div class="modal fade" id="inserir-evento-modal" tabindex="-1" aria-labelledby="inserirEventoModalLabel"
        aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="inserirEventoModalLabel">Inserir Novo Evento</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="evento-form">
                        <div class="mb-3">
                            <div class="mb-3">
                                <label for="imagem" class="form-label">Imagem do Evento</label>
                                <input type="file" class="form-control" id="imagem" accept="image/*" required>
                            </div>

                        </div>
                        <div class="mb-3">
                            <label for="titulo" class="form-label">Título</label>
                            <input type="text" class="form-control" id="titulo" required>
                        </div>
                        <div class="mb-3">
                            <label for="descricao" class="form-label">Descrição</label>
                            <textarea class="form-control" id="descricao" rows="3" required></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="data" class="form-label">Data</label>
                            <input type="date" class="form-control" id="data" required>
                        </div>
                        <div class="mb-3">
                            <label for="hora" class="form-label">Hora</label>
                            <input type="time" class="form-control" id="hora" required>
                        </div>
                        <div class="mb-3">
                            <label for="preco" class="form-label">Preço</label>
                            <input type="number" class="form-control" id="preco" required>
                        </div>
                        <div class="mb-3">
                            <label for="id" class="form-label">ID</label>
                            <input type="number" class="form-control" id="id" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Inserir Evento</button>
                    </form>
                </div>
            </div>
        </div>
    </div>



    <div class="modal fade" id="profile-modal" tabindex="-1" aria-labelledby="profileModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="profileModalLabel">Perfil do Usuário</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">

                    <form id="profile-form tamanho">
                        <div class="mb-3" id="admin-menu" style="display:none;">
                            <h5>Administração</h5>
                            <div class="botoes">
                                <a href="#" class="botao">Inserir Eventos </a>
                                <a href="#" class="botao">Excluir Eventos</a>
                            </div>
                        </div>
                    </form>




                    <form id="profile-form">
                        <div class="mb-3">
                            <label for="full-name" class="form-label">Nome Completo</label>
                            <div id="full-name-display" style="display:none;"></div>
                            <input type="text" class="form-control" id="full-name-input"
                                placeholder="Digite seu nome completo" style="display:none;">
                        </div>
                        <div class="mb-3">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="email" readonly>
                        </div>
                        <div class="mb-3">
                            <label for="ticket-icon" class="form-label">Ticket</label>
                            <div class="form-control" id="ticket-icon">
                                <i class="fa fa-ticket" aria-hidden="true"></i>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    </div>
    <!-- Modal de Pagamento -->
    <div class="modal fade" id="pagamento-modal" tabindex="-1" aria-labelledby="pagamentoModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="pagamentoModalLabel">Pagamento</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                
                    <div id="paymentBrick_container"></div>
                    
<div id="statusScreenBrick_container"></div>

                </div>
            </div>
        </div>
    </div>

    <input type="hidden" id="valor_payment" value="<?= $amount; ?>">
    <input type="hidden" id="preference_id" value="<?= $preference_id; ?>">



    <!-- Modal para excluir eventos -->
    <div class="modal fade" id="excluir-evento-modal" tabindex="-1" aria-labelledby="excluirEventoLabel"
        aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="excluirEventoLabel">Excluir Evento</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="lista-eventos-excluir" class="list-group">
                        <!-- Lista de eventos será inserida aqui -->
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    </div>

    <main class="container mt-4">
        <h1 class="text">Proximos Eventos</h1>
        <div id="eventos-container" class="row">

        </div>
    </main>


    <footer>
        <div class="linha1">
            <div class="footer-section contact-info">
                <p>Endereço: Rua Exemplo, 123 - Cidade, Estado</p>
                <p>Telefone: (00) 1234-5678</p>
                <p>Email: contato@fazendaeventos.com.br</p>
            </div>

            <div class="footer-section social-media">
                <a href="https://www.facebook.com" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor"
                        class="bi bi-facebook" viewBox="0 0 16 16">
                        <path
                            d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951" />
                    </svg>
                </a>
                <a href="https://www.instagram.com" target="_blank">
                    <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" fill="currentColor"
                        class="bi bi-instagram" viewBox="0 0 16 16">
                        <path
                            d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" />
                    </svg>
                </a>
            </div>

            <div class="footer-section logo">
                <img src="../img/Logo Branco PNG (1).png"alt="Logo da Empresa" class="teste">
                <img src="../img/Pingo D'água PNG.png" class="teste" alt="logo caetano">
            </div>
        </div>
        <div class="linha2">
            <div class="footer-section copyright">
                <p>&copy; 2024 Fazenda Eventos. Todos os direitos reservados.</p>
            </div>
        </div>
    </footer>
</body>

<script src="https://sdk.mercadopago.com/js/v2"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="app.js"></script>

<script type="module">
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
                ticket: "all",
                bankTransfer: "all",
                creditCard: "all",
                debitCard: "all",
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
                    fetch("http://localhost/api/api/evento.php?vl=" + valorPayment, { // Usa o valor dinâmico
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
                        return response.json(); // Obtemos a resposta como JSON
                    })
                    .then((jsonResponse) => {
                        console.log("Resposta da API:", jsonResponse);

                        // Verifica se a transação foi aprovada
                        if (jsonResponse.status === 'approved') {
                            renderStatusScreenBrick(jsonResponse.id); // Passa o ID do pagamento para renderizar a tela de status
                            resolve();
                        } else if (jsonResponse.status === 'pending') {
                            renderStatusScreenBrick(jsonResponse.id); // Passa o ID do pagamento para renderizar a tela de status
                            resolve();
                        } else if (jsonResponse.status === 'in_process') {
                            renderStatusScreenBrick(jsonResponse.id); // Passa o ID do pagamento para renderizar a tela de status
                            resolve();
                        } else if (jsonResponse.status === 'rejected') {
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
            paymentId: paymentId, // Agora passamos o paymentId corretamente
        },
        callbacks: {
            onReady: () => {
                // Callback chamado quando o Brick estiver pronto.
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

const handleRejectedPayment = (jsonResponse) => {
    if (jsonResponse.status_detail === 'cc_rejected_high_risk') {
        alert("Transação rejeitada devido ao alto risco. Tente um método de pagamento diferente.");
    } else {
        alert("Transação rejeitada: " + jsonResponse.status_detail);
    }
};

// Chama o renderPaymentBrick
renderPaymentBrick();

</script>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

<script type="module" src="./firebase-config.js"></script>

<script type="module" src="script.js"></script>


</body>

</html>