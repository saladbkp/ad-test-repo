<?php

function __getProduct()
{
    global $parsed_path;

    if (isset($parsed_path['query']))
        parse_str($parsed_path['query'], $query);

    if (!isset($query) || !array_key_exists('id', $query) || !is_string($query['id'])) {
        return NULL;
    }

    $product = Product::findById($query['id']);

    return $product;
}

function __array_find_key(array $array, callable $fn)
{
    foreach ($array as $key => $value) {
        if ($fn($value)) {
            return $key;
        }
    }

    return NULL;
}

function __addItemToCart(Product $product, array $form_data)
{
    if (!isset($_SESSION['cart'])) {
        $_SESSION['cart'] = [];
    }

    $existing_item = __array_find_key($_SESSION['cart'], fn($x) => $x['id'] === $product->id && (!$product->is_customizable || ($x['customization'] === $form_data['customization'])));

    if ($existing_item !== NULL) {
        $item = $_SESSION['cart'][$existing_item];
        $item['quantity'] += intval($form_data['quantity']);
        $_SESSION['cart'][$existing_item] = $item;
    } else {
        $data = [
            'id' => $product->id,
            'name' => $product->name,
            'price' => $product->price,
            'image' => $product->image,
            'quantity' => intval($form_data['quantity'])
        ];

        if ($product->is_customizable) {
            $data['customization'] = $form_data['customization'];
        }

        $_SESSION['cart'][] = $data;
    }
}

function POST()
{
    $product = __getProduct();

    if ($product === NULL) {
        http_response_code(400);
        die;
    }

    $form_data = __validateFormData($product->is_customizable ? ['customization', 'quantity'] : ['quantity']);

    if (!array_key_exists('error', $form_data)) {
        if (!ctype_digit($form_data['quantity']) || intval($form_data['quantity']) < 0 || intval($form_data['quantity']) > 100) {
            $form_data['error'] = 'Invalid quantity value';
        }
    }

    if (array_key_exists('error', $form_data)) {
        TEMPLATE('product-page', $product->name, '/static/product.css', ['product' => $product, ...$form_data]);
    }

    __addItemToCart($product, $form_data);

    header('Location: /cart');
}

function GET()
{
    $product = __getProduct();

    if ($product === NULL) {
        __404('Product not found');
    }

    TEMPLATE('product-page', $product->name, '/static/product.css', ['product' => $product]);
}
