<?php

function __getOrder()
{
    global $parsed_path;

    if (isset($parsed_path['query']))
        parse_str($parsed_path['query'], $query);

    if (!isset($query) || !array_key_exists('id', $query) || !is_string($query['id'])) {
        return NULL;
    }

    $order = Order::find(['id' => $query['id'], 'user_id' => $_SESSION['user_id']]);

    return $order;
}

function __shareWithUser(Order $order)
{
    $form_data = __validateFormData(['username']);

    if (array_key_exists('error', $form_data)) {
        TEMPLATE('order', 'Order #' . $order->id, '/static/order.css', ['order' => $order, ...$form_data]);
    }

    $username = $form_data['username'];

    $user = User::find(['username' => $username]);
    if ($user === NULL) {
        TEMPLATE('order', 'Order #' . $order->id, '/static/order.css', ['order' => $order, ...$form_data, 'error' => 'No user with such username']);
    }

    try {
        OrderShare::create([
            'order_id' => $order->id,
            'auth_key' => $user->auth_key
        ]);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000' || $e->getCode() === '23505') {
            TEMPLATE('order', 'Order #' . $order->id, '/static/order.css', ['order' => $order, ...$form_data, 'error' => 'Already shared with this user']);
        }
        throw $e;
    }

    GET();
}

function __deleteShare($order)
{
    global $session;

    $form_data = __validateFormData(['delete']);

    if (array_key_exists('error', $form_data)) {
        TEMPLATE('order', 'Order #' . $order->id, '/static/order.css', ['order' => $order, ...$form_data]);
    }

    $username = $form_data['delete'];

    if ($username === $session['user']->username) {
        http_response_code(400);
        die;
    }

    $user = User::find(['username' => $username]);
    if ($user === NULL) {
        http_response_code(400);
        die;
    }

    $order_share = OrderShare::find([
        'order_id' => $order->id,
        'auth_key' => $user->auth_key
    ]);

    if ($order_share !== NULL) {
        $order_share->delete();
    }

    GET();
}

function POST()
{
    REQUIRE_AUTH();

    $order = __getOrder();

    if ($order === NULL) {
        http_response_code(400);
        die;
    }

    if (isset($_POST['username'])) {
        __shareWithUser($order);
    } else if (isset($_POST['delete'])) {
        __deleteShare($order);
    } else {
        http_response_code(400);
        die;
    }
}

function GET()
{
    global $session;

    REQUIRE_AUTH();

    $order = __getOrder();
    if ($order === NULL) {
        __404('Order not found');
    }

    $shares = OrderShare::findAll(['order_id' => $order->id]);
    $shared_users = [];
    foreach ($shares as $share) {
        if ($share->auth_key === $session['user']->auth_key) {
            continue;
        }
        $shared_users[] = User::find(['auth_key' => $share->auth_key]);
    }

    TEMPLATE('order', 'Order #' . $order->id, '/static/order.css', ['order' => $order, 'shared_users' => $shared_users]);
}
