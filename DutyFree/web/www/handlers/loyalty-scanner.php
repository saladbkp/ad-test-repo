<?php

use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QRCodeException;
use chillerlan\QRCode\QROptions;

function GET()
{
    TEMPLATE('loyalty-scanner', 'Loyalty card scanner', '/static/loyalty-scanner.css');
}

function __errorPage()
{
    TEMPLATE('loyalty', 'Loyalty card', '/static/user.css', ['loyalty_points' => 'Invalid loyalty card scan']);
}

function __validateUploadedImage(): string
{
    if (!isset($_FILES['loyalty_card']) || $_FILES['loyalty_card']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        die;
    }

    $image = $_FILES['loyalty_card'];

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $image['tmp_name']);
    finfo_close($finfo);

    if ($mime !== 'image/png') {
        http_response_code(400);
        die;
    }

    $size = getimagesize($image['tmp_name']);
    if ($size[0] < 10 || $size[0] > 100 || $size[1] < 10 || $size[1] > 100) {
        // invalid image size
        http_response_code(400);
        die;
    }

    return $image['tmp_name'];
}

function POST()
{
    $image = __validateUploadedImage();

    try {
        $qr_data = (new QRCode())->readFromFile($image)->data;
    } catch (QRCodeException $_) {
        __errorPage();
    }

    try {
        $user = User::load_from_json($qr_data);
        $user->refresh();
        TEMPLATE('loyalty', 'Loyalty card', '/static/user.css', ['user_id' => $user->id, 'loyalty_points' => $user->loyalty_points]);
    } catch (Error $_) {
        __errorPage();
    } catch (Exception $_) {
        __errorPage();
    }
}
