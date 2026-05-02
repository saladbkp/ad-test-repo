<?php

function __getId()
{
    global $parsed_path;

    if (isset($parsed_path['query'])) {
        parse_str($parsed_path['query'], $query);
    }

    if (!isset($query) || !array_key_exists('id', $query) || !is_string($query['id'])) {
        return NULL;
    }

    return $query['id'];
}

function __getPublicLoyaltyPage()
{
    if (($user = User::findById(__getId())) === NULL) {
        __404();
    }

    TEMPLATE('loyalty', 'Loyalty card', '/static/user.css', ['loyalty_points' => $user->loyalty_points, 'user_id' => $user->id]);
}

function __getPrivateLoyaltyPage()
{
    if (($user = User::findById(__getId())) === NULL) {
        __404();
    }

    $qr = __getQrCode();
    $orders = Order::findAll(['user_id' => $user->id], 20);

    TEMPLATE('private-loyalty', 'Loyalty card', '/static/user.css', ['user' => $user, 'qr' => $qr, 'orders' => $orders]);
}

function GET()
{
    $user_id = __getId();

    if (isset($_SESSION['user_id']) && $_SESSION['user_id'] === $user_id) {
        __getPrivateLoyaltyPage();
    } else {
        __getPublicLoyaltyPage();
    }
}
