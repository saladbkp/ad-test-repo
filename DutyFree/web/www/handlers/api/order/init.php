<?php

use kornrunner\Keccak;

require_once __DIR__ . '/../../../crypto_utils.php';

function __startAuth(string $order_id)
{
    $rng = __getRng();
    $key = __hex2bin(getenv('CUSTOM_SECRET'));
    $p = __getP();
    $p_bytes = intdiv(__gmpBitSize($p) + 7, 8);

    $orderShares = OrderShare::findAll(['order_id' => $order_id]);
    $auth_ids = array_map(fn($orderShare) => gmp_import($orderShare->auth_key), $orderShares);
    $auth_ids = [...$auth_ids, ...array_map(fn($x) => __gmpRandBelow($p), range(1, 10))];
    $auth_ids = $rng->shuffleArray($auth_ids);

    $tokens = [];
    foreach ($auth_ids as $auth_id) {
        $h = Keccak::shake($key . gmp_export($auth_id) . $order_id, 256, $p_bytes * 8);
        $tokens[] = gmp_import(__hex2bin($h));
    }

    $P = __lagrange($auth_ids, $tokens);
    $r = __gmpRandBelow($p);

    $masked = [];
    foreach ($tokens as $t) {
        $masked[] = gmp_mod(gmp_mul($r, $t), $p);
    }

    $resp = [
        'P'      => __gmpSerializeArray($P),
        'masked' => __gmpSerializeArray($masked)
    ];

    $_SESSION['auth'] = ['r' => $r, 'order_id' => $order_id];

    __API_RESPONSE($resp);
}

function POST()
{
    $client_data = __API_REQ_BODY();

    if (!isset($client_data['order_id']) || !is_string($client_data['order_id'])) {
        __API_ERROR(400, 'Invalid data');
    }

    $order_id = $client_data['order_id'];
    __startAuth($order_id);
}
