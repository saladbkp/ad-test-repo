<?php

require_once __DIR__ . '/../../../crypto_utils.php';

function __finishAuth($masked_server, $masked_client)
{
    $p = __getP();
    $r = $_SESSION['auth']['r'];
    unset($_SESSION['auth']);
    $r_inv = gmp_invert($r, $p);

    foreach ($masked_server as $ms) {
        $ms = gmp_mod($ms, $p);
        if (gmp_cmp($ms, 0) === 0) {
            return false;
        }
        $ms = gmp_mod(gmp_mul($ms, $r_inv), $p);
        foreach ($masked_client as $mc) {
            $mc = gmp_mod($mc, $p);
            if (gmp_cmp($ms, $mc) === 0) {
                return true;
            }
        }
    }

    return false;
}

function POST()
{
    if (!isset($_SESSION['auth'])) {
        __API_ERROR(401, 'Unauthorized');
    }
    
    $client_data = __API_REQ_BODY();

    if (!isset($client_data['masked_server']) || !isset($client_data['masked_client'])) {
        __API_ERROR(400, 'Invalid data');
    }

    $masked_server = __gmpUnserializeArray($client_data['masked_server']);
    $masked_client = __gmpUnserializeArray($client_data['masked_client']);

    if ($masked_server === NULL || $masked_client === NULL) {
        __API_ERROR(400, 'Invalid data');
    }

    $order_id = $_SESSION['auth']['order_id'];
    if (__finishAuth($masked_server, $masked_client)) {
        $orders = ProductOrder::findAll(['order_id' => $order_id]);
        $resp = array_map(fn($order) => ['product_id' => $order->product_id, 'quantity' => $order->quantity, 'customization' => ($order->customization !== NULL) ? $order->customization : ''], $orders);
        __API_RESPONSE($resp);
    } else {
        __API_ERROR(401, 'Something went wrong');
    }
}
