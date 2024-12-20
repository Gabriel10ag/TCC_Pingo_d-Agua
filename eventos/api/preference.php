<?php
$config = require_once '../config.php';
$accesstoken = $config['accesstoken'];
$body = json_decode(file_get_contents("php://input"));

// Verifica se o token está presente
if (!isset($body->token)) {
    // Verifica se 'vl' foi passado na requisição
    if (!isset($_GET['vl'])) {
        die('O valor (vl) não existe.');
    } else {
        // Valida se 'vl' é numérico e maior que 0
        if ($_GET['vl'] === "" || !is_numeric($_GET['vl']) || $_GET['vl'] < 1) {
            die('O valor (vl) deve ser um número e não pode ser menor que 1.');
        }
    }

    // Captura e valida o valor
    $amount = (float)trim($_GET['vl']);
 

    // Inicia o cURL para criar a preferência
    $curl = curl_init();

    // Configura a requisição cURL
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.mercadopago.com/checkout/preferences',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS => json_encode([
            "items" => [
                [
                    "id" => "Sound system",
                    "title" => "Dummy Title",
                    "description" => "Dummy description",
                    "picture_url" => "http://www.myapp.com/myimage.jpg",
                    "category_id" => "car_electronics",
                    "quantity" => 1,
                    "currency_id" => "BRL",
                    "unit_price" => $amount
                ]
            ],
            "back_urls" => [
                "success" => "http://test.com/success",
                "pending" => "http://test.com/pending",
                "failure" => "http://test.com/failure"
            ],
            "notification_url" => "http://notificationurl.com",
            "auto_return" => "approved",
            "external_reference" => ""
        ]),
        CURLOPT_HTTPHEADER => array(
            'Content-Type: application/json',
            'Authorization: Bearer ' . $accesstoken
        ),
    ));

    // Executa a requisição e fecha o cURL
    $response = curl_exec($curl);
    curl_close($curl);

    // Decodifica a resposta JSON
    $obj = json_decode($response);

    // Verifica se o ID da preferência foi retornado
    if (isset($obj->id)) {
        // Se o ID for válido, armazena o ID da preferência
        $preference_id = $obj->id;

        // Exibe o link de pagamento
        if (isset($obj->init_point)) {
            $init_point = $obj->init_point;

        } else {
            echo "Erro ao gerar o link de pagamento.";
        }
    } else {
        // Se não houve erro no retorno, exibe um erro genérico
        echo "Erro ao criar a preferência.";
    }
}
?>
