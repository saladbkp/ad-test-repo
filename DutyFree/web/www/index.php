<?php
session_start();

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/utils.php';

// initializing template engine
$loader = new \Twig\Loader\FilesystemLoader(__DIR__ . '/templates');
$twig = new \Twig\Environment($loader, getenv('MODE') === 'development' ? [] : [
    'cache' => '/tmp/compilation_cache',
]);

// session
$session = ['venue' => getenv('VENUE') ? getenv('VENUE') : 'CC.IT'];
if (isset($_SESSION['user_id'])) {
    $user = User::findById($_SESSION['user_id']);

    if ($user === NULL) {
        unset($_SESSION['user_id']);
    } else {
        $session['user'] = $user;
    }
}

// handling the request
$method = $_SERVER['REQUEST_METHOD'];

$full_path = 'http://' . $_SERVER['SERVER_NAME'] . $_SERVER['REQUEST_URI'];
$parsed_path = parse_url($full_path);

$path = $parsed_path['path'];
if (str_ends_with($path, 'index.php')) {
    $path = substr($path, 0, -9);
}
if (str_ends_with($path, '/')) {
    $path = substr($path, 0, -1);
}

if (strlen($path) === 0 || !preg_match('/^[a-z\/\-]+$/', $path)) {
    require_once('handlers/home.php');
} else {
    $filename = "handlers$path.php";
    if (file_exists($filename)) {
        require_once($filename);
    } else {
        __404();
    }
}

if (function_exists($method)) {
    $method();
} else {
    http_response_code(405);
    die('Method not allowed');
}
