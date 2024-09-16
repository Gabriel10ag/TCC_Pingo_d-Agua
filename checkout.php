<?php
require __DIR__ . '/vendor/autoload.php';

MercadoPago\SDK::setAccessToken('APP_USR-1921502923835686-091213-97c6f25f6625cd85c3d9cdf3191addb9-494550751');

// Crie uma preferência
$preference = new MercadoPago\Preference();

// Adicione os itens à preferência
$item = new MercadoPago\Item();
$item->title = 'Nome do Produto';
$item->quantity = 1;
$item->unit_price = 100.00;
$preference->items = array($item);

// Salve e obtenha o ID da preferência
$preference->save();

echo json_encode(['id' => $preference->id]);
?>
