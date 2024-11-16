<?php
require_once 'preference.php'; // Inclua aqui o seu arquivo de configuração do Mercado Pago

$amount = (float)trim($_GET['vl']); // Obtém o valor do pagamento da URL

// Não exiba o valor na tela, pois é uma boa prática em produção
// echo "Valor passado para a API: $amount"; 

$body = json_decode(file_get_contents("php://input")); // Obtém o corpo da requisição

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

    // Verifica se houve erro na requisição cURL
    if ($response === false) {
        $error_message = curl_error($curl);
        curl_close($curl);
        echo json_encode(["error" => "Erro na requisição cURL", "message" => $error_message]);
        exit;
    }

    curl_close($curl);

    // Verifica se a resposta da API do Mercado Pago é válida
    $responseData = json_decode($response, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(["error" => "Erro ao decodificar JSON da resposta", "message" => json_last_error_msg()]);
        exit;
    }

    // Retorna a resposta da API Mercado Pago como JSON
    header('Content-Type: application/json');
    echo json_encode($responseData); // Retorna a resposta da API
    exit; // Encerra o script após a resposta
}
?>




<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cartão</title>
    <script src="https://sdk.mercadopago.com/js/v2"></script>
    <link rel="stylesheet" href="card.css">
</head>
<body>
    <input type="hidden" id="valor_payment" value="<?= $amount; ?>">
    <input type="hidden" id="preference_id" value="<?= $preference_id; ?>">

    <div class="container">
        <div id="statusScreenBrick_container"></div>
        <div id="paymentBrick_container"></div>
    </div>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script type="module" src="script.js"></script>
    
</body>
</html>
