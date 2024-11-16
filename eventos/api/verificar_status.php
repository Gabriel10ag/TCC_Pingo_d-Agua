<?php

$config = require_once '../config.php';
$accesstoken = $config['accesstoken'];

if (!isset($_GET['payment_id'])) {
  echo json_encode(['status' => 'error', 'message' => 'ID de pagamento não fornecido']);
  exit;
}

$payment_id = $_GET['payment_id'];

$curl = curl_init();
curl_setopt_array($curl, array(
  CURLOPT_URL => "https://api.mercadopago.com/v1/payments/{$payment_id}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => array(
    'Authorization: Bearer ' . $accesstoken,
  ),
));

$response = curl_exec($curl);
curl_close($curl);

$payment_info = json_decode($response, true);

if (isset($payment_info['status'])) {
  echo json_encode(['status' => $payment_info['status']]);
} else {
  echo json_encode(['status' => 'error', 'message' => 'Não foi possível obter o status']);
}
