<?php

function __getCart(): array
{
    if (isset($_SESSION['cart'])) {
        return $_SESSION['cart'];
    }
    return [];
}

function __createOrder(array $cart, bool $use_loyalty_points)
{
    global $session;

    $total = array_reduce($cart, fn($carry, $x) => $carry + $x['quantity'] * $x['price'], 0);
    $loyalty_discount = 0;
    if ($use_loyalty_points) {
        $loyalty_discount = min($session['user']->loyalty_points, floor($total));
    }

    $order = Order::create([
        'user_id' => $_SESSION['user_id'],
        'total' => $total,
        'loyalty_discount' => $loyalty_discount
    ]);

    foreach ($cart as $prod) {
        $data = [
            'product_id' => $prod['id'],
            'order_id' => $order->id,
            'quantity' => $prod['quantity'],
        ];
        if (isset($prod['customization'])) {
            $data['customization'] = $prod['customization'];
        }

        ProductOrder::create($data);
    }

    OrderShare::create([
        'order_id' => $order->id,
        'auth_key' => $session['user']->auth_key
    ]);

    $session['user']->loyalty_points += floor($total) - $loyalty_discount - $loyalty_discount;
    $session['user']->save(['loyalty_points']);
}

function GET()
{
    $cart = __getCart();
    $is_logged = isset($_SESSION['user_id']);

    TEMPLATE('cart', 'Cart', '/static/cart.css', ['cart' => $cart, 'is_logged' => $is_logged]);
}

function POST()
{
    REQUIRE_AUTH();

    $cart = __getCart();

    if (count($cart) === 0) {
        http_response_code(400);
        die;
    }

    $form_data = __validateFormData(['use_loyalty']);
    $use_loyalty_points = isset($form_data['use_loyalty']) && $form_data['use_loyalty'] === 'on';

    Transaction::begin();
    try {
        __createOrder($cart, $use_loyalty_points);
        Transaction::commit();

        $_SESSION['cart'] = [];
        header('Location: /user');
    } catch (Exception $e) {
        Transaction::rollback();

        echo 'There was an error finalizing your order';
        throw $e;
    }
}
