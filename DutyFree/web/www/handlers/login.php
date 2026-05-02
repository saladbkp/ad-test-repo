<?php

function GET()
{
    REQUIRE_NO_AUTH();

    TEMPLATE('login', 'Login', '/static/login.css');
}

function __login(array $form_data)
{
    $user = User::find([
        'username' => $form_data['username'],
        'password' => md5($form_data['password'])
    ]);

    if ($user !== NULL) {
        $_SESSION['user_id'] = $user->id;
    }

    return $user !== NULL;
}

function POST()
{
    REQUIRE_NO_AUTH();

    $form_data = __validateFormData(['username', 'password']);

    if (array_key_exists('error', $form_data)) {
        TEMPLATE('login', 'Login', '/static/login.css', $form_data);
    }

    $logged = __login($form_data);

    if (!$logged) {
        TEMPLATE('login', 'Login', '/static/login.css', [...$form_data, 'error' => 'Invalid credentials']);
    }

    header('Location: /');
    die;
}
