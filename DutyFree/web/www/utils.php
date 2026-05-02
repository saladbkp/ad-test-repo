<?php

error_reporting(E_ALL);
ini_set('display_errors', 'On');

use chillerlan\QRCode\Common\EccLevel;
use chillerlan\QRCode\Output\QROutputInterface;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;

spl_autoload_register(function ($class_name) {
    $filename = "models/$class_name.php";
    if (file_exists($filename)) {
        require_once($filename);
    }
});

function __GET_SECRET_KEY(string $usage)
{
    return hash('sha256', $usage . getenv('CUSTOM_SECRET'), true);
}


function REQUIRE_AUTH()
{
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        die;
    }
}

function REQUIRE_NO_AUTH()
{
    if (isset($_SESSION['user_id'])) {
        header('Location: /');
        die;
    }
}

function TEMPLATE(string $template, ?string $title, ?string $style = NULL, $extra_data = [])
{
    global $twig, $session;

    echo $twig->render("$template.html.twig", [...$session, 'page_style' => $style, 'title' => $title, ...$extra_data]);
    die;
}

function __404($title = 'Not found')
{
    TEMPLATE('404', $title, '/static/404.css');
}

function __validateFormData(array $keys)
{
    $result = [];

    foreach ($keys as $key) {
        if (!isset($_POST[$key])) {
            return [
                ...$_POST,
                'error' => 'Missing ' . $key
            ];
        }
        if (!is_string($_POST[$key])) {
            return [
                ...$_POST,
                'error' => 'Invalid ' . $key . ' value'
            ];
        }

        $value = $_POST[$key];
        $value = trim($value);

        if (strlen($value) === 0) {
            return [
                ...$_POST,
                'error' => 'Invalid ' . $key . ' value'
            ];
        }

        $result[$key] = $value;
    }

    return $result;
}

function __getQrCode()
{
    global $session;

    $options  = new QROptions();

    $options->readerIncreaseContrast      = true;
    $options->readerGrayscale             = true;
    $options->quietzoneSize               = 5;
    $options->scale                       = 1;
    $options->outputType = QROutputInterface::GDIMAGE_PNG;

    $qr = new QRCode($options);

    return $qr->render($session['user']->dump_to_json());
}


function __API_ERROR(int $code, string $message)
{
    http_response_code($code);

    header('Content-Type: application/json');

    die(json_encode([
        'error' => $message
    ]));
}

function __API_RESPONSE(mixed $data)
{
    header('Content-Type: application/json');

    die(json_encode($data));
}

function __API_REQ_BODY()
{
    if (!isset($_SERVER['HTTP_CONTENT_TYPE']) || $_SERVER['HTTP_CONTENT_TYPE'] !== 'application/json') {
        __API_ERROR(400, 'Invalid format');
    }

    try {
        return json_decode(file_get_contents('php://input'), true, 512, JSON_THROW_ON_ERROR);
    } catch (Exception $_) {
        __API_ERROR(400, 'Invalid data');
    } catch (Error $_) {
        __API_ERROR(400, 'Invalid data');
    }
}
