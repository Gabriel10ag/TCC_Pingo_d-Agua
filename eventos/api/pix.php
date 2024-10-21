<?php

if (!isset($_GET['vl'])) {
  die('vl nao existe');
} else {
  if ($_GET['vl'] == "" || !is_numeric($_GET['vl'])) {
    die('vl não pode ser vazio, e tem que ser numerico');
  } else {
    if ($_GET['vl'] < 1) {
      die('vl não pode ser menor que 1');
    }
  }
}

$config = require_once '../config.php';
$accesstoken = $config['accesstoken'];
// Verifique se o valor capturado está correto
$amount = (float)trim($_GET['vl']);
echo "Valor passado para a API: $amount"; // Isso deve exibir o valor correto (ex: 80)

$curl = curl_init();

$idempotency_key = uniqid(); // ou você pode usar outra forma de gerar uma chave única

curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://api.mercadopago.com/v1/payments',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS => '{
  "description": "Payment for product",
  "external_reference": "MP0001",
  "notification_url": "https://google.com",
  "payer": {
    "email": "ilanaantunes02@gmail.com",
    "identification": {
      "type": "CPF",
      "number": "48397286829"
    }
  },
  "payment_method_id": "pix",
  "transaction_amount": '.$amount.'
}
',
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/json',
    'X-Idempotency-Key: ' . $idempotency_key, // Use a chave gerada
    'Authorization: Bearer ' . $accesstoken
  ),
));


$response = curl_exec($curl);
curl_close($curl);

$obj = json_decode($response);

if (isset($obj->id) && $obj->id != null) {
    $copia_cola = $obj->point_of_interaction->transaction_data->qr_code;
    $img_qrcode = $obj->point_of_interaction->transaction_data->qr_code_base64;
    $link_externo = $obj->point_of_interaction->transaction_data->ticket_url;
    $transaction_amount = $obj->transaction_amount;

    echo "<h3>Valor: R$ {$transaction_amount}</h3>";
    echo "<img src='data:image/png;base64, {$img_qrcode}' width = '200' /> <br/>";
    echo "<textarea>{$copia_cola}</textarea>";
    echo "<a href='{$link_externo}'>link externo</a>";

    // Verificar o status do pagamento
    $payment_id = $obj->id;
    sleep(5); // Esperar um pouco antes de verificar o status

    // Consultar o status do pagamento
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_URL => "https://api.mercadopago.com/v1/payments/{$payment_id}",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => array(
            'Authorization: Bearer ' . $accesstoken,
        ),
    ));
    $response_status = curl_exec($curl);
    curl_close($curl);

    $payment_info = json_decode($response_status);

    if (isset($payment_info->status)) {
        echo "<h3>Status do pagamento: {$payment_info->status}</h3>";
    }
} else {
    echo "<h3>Erro ao processar o pagamento.</h3>";
}

echo ($obj);
