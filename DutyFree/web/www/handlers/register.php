<?php

function GET()
{
    REQUIRE_NO_AUTH();

    TEMPLATE('register', 'Register', '/static/login.css');
}

function __register(array $form_data)
{
    $user = User::create([
        'full_name' => $form_data['full_name'],
        'username' => $form_data['username'],
        'password' => md5($form_data['password']),
        'loyalty_points' => 0,
        'auth_key' => random_bytes(32)
    ]);

    echo $_SESSION['user_id'] = $user->id;
}

function POST()
{
    REQUIRE_NO_AUTH();

    $form_data = __validateFormData(['full_name', 'username', 'password']);

    if (array_key_exists('error', $form_data)) {
        TEMPLATE('register', 'Register', '/static/login.css', $form_data);
    }

    try {
        __register($form_data);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000' || $e->getCode() === '23505') {
            TEMPLATE('register', 'Register', '/static/login.css', [...$form_data, 'error' => 'This username is already taken']);
        }
        throw $e;
    }

    header('Location: /');
    die;
}
