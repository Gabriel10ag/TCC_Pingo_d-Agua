<link rel="stylesheet" href="pix.css">
<style>
  .link {
    text-decoration: none;
    font-size: 20px;
    color: white;
  }
</style>

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
$amount = (float)trim($_GET['vl']);

$curl = curl_init();

$idempotency_key = uniqid();

curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://api.mercadopago.com/v1/payments',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS => json_encode([
    'description' => 'Payment for product',
    'external_reference' => 'MP0001',
    'notification_url' => 'https://google.com',
    'payer' => [
      'email' => 'ilanaantunes02@gmail.com',
      'identification' => [
        'type' => 'CPF',
        'number' => '48397286829'
      ]
    ],
    'payment_method_id' => 'pix',
    'transaction_amount' => $amount
  ]),
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/json',
    'X-Idempotency-Key: ' . $idempotency_key,
    'Authorization: Bearer ' . $accesstoken
  ),
));

$response = curl_exec($curl);
curl_close($curl);

$obj = json_decode($response);

if (isset($obj->id) && $obj->id != null) {
  $payment_id = $obj->id;
  $copia_cola = $obj->point_of_interaction->transaction_data->qr_code;
  $img_qrcode = $obj->point_of_interaction->transaction_data->qr_code_base64;
  $link_externo = $obj->point_of_interaction->transaction_data->ticket_url;
  $transaction_amount = $obj->transaction_amount;

  echo "
  <div class='modal'>
    <img src='../../img/pix-106.png' class='logo'>
    <h1 class='titulo'>Pague o QR code e obtenha seu ingresso</h1>
    <h3>Valor: R$ {$transaction_amount}</h3>
    <img src='data:image/png;base64, {$img_qrcode}' class='pix' width='200'> <br/>
    <textarea>{$copia_cola}</textarea>
    <a href='{$link_externo}' class='link'>link externo</a>  
    <h3 id='status' class='status'>Verificando o status do pagamento...</h3>
  </div>
  <script type='module'>
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js';
  import { getAuth } from 'https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js';
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

  const paymentId = '{$payment_id}';
  const statusElement = document.getElementById('status');

  function verificarStatus(userId) {
    fetch('verificar_status.php?payment_id=' + paymentId)
      .then(response => response.json())
      .then(data => {
        const urlParams = new URLSearchParams(window.location.search);
        const eventId = urlParams.get('eventid');
        const quantidade = parseInt(urlParams.get('quantidade'));
        const valor = parseFloat(urlParams.get('vl'));

        if (data.status === 'approved') {
          statusElement.textContent = 'Pagamento aprovado! Redirecionando...';

          // Salvando no Firestore
          addDoc(collection(db, 'users', userId, 'pagamento'), {
            status: 'approved',
            metodoPag: 'pix',
            eventoid: eventId,
            quantidade: quantidade,
            valor: valor,
            timestamp: serverTimestamp()
          })
          .then(() => {
            console.log('Pagamento salvo com sucesso!');
            setTimeout(() => {
              window.location.href = '../eventos.html';
            }, 2000);
          })
          .catch((error) => {
            console.error('Erro ao salvar pagamento:', error);
            statusElement.textContent = 'Erro ao salvar o pagamento no banco de dados.';
          });
        } else if (data.status === 'in_process') {
          statusElement.textContent = 'Pagamento em processamento...';
        } else {
          statusElement.textContent = 'Status do pagamento: ' + data.status;
          setTimeout(() => verificarStatus(userId), 10000);
        }
      })
      .catch(error => {
        console.error('Erro ao verificar o status:', error);
        statusElement.textContent = 'Erro ao verificar o status do pagamento.';
      });
  }

  // Verifica o estado da autenticação do Firebase
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log('Usuário logado:', user.email);
      const userId = user.uid; // Agora temos o UID do usuário logado
      verificarStatus(userId); // Passando userId para a função verificarStatus
    } else {
      alert('Você precisa estar logado para acessar essa página.');
      window.location.href = '../../login/login.html'; // Redireciona para a página de login
    }
  });
  </script>
  ";

} else {
  echo "<h3>Erro ao processar o pagamento.</h3>";
}
?>
