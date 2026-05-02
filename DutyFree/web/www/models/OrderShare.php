<?php

require_once __DIR__ . '/Model.php';

class OrderShare extends Model
{
    protected string $__table_name = 'order_shares';

    public string $order_id;
    public string $auth_key;

    protected static function __dump(array $values): array
    {
        if (!isset($values['auth_key']) || $values['auth_key'] === NULL) {
            return $values;
        }

        $key = __GET_SECRET_KEY('auth_key');

        return [
            ...$values,
            'auth_key' => openssl_encrypt($values['auth_key'], 'aes-256-ecb', $key),
        ];
    }

    protected static function __load(array $values): array
    {
        if (!isset($values['auth_key']) || $values['auth_key'] === NULL) {
            return [
                ...$values,
                'auth_key' => NULL,
            ];
        }

        $key = __GET_SECRET_KEY('auth_key');

        return [
            ...$values,
            'auth_key' => openssl_decrypt($values['auth_key'], 'aes-256-ecb', $key)
        ];
    }
}
