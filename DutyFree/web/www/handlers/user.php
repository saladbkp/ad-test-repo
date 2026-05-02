<?php

function __getOrders()
{
    $orders = Order::findAll(['user_id' => $_SESSION['user_id']], 20);

    return $orders;
}

function GET()
{
    global $session;

    REQUIRE_AUTH();

    $qr = __getQrCode();
    $orders = __getOrders();
    // really? no twig filter for hex?
    $auth_key = bin2hex($session['user']->auth_key);

    TEMPLATE('user', 'User', '/static/user.css', ['qr' => $qr, 'orders' => $orders, 'auth_key' => $auth_key]);
}
