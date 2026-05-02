<?php

require_once __DIR__ . '/Model.php';

class ProductOrder extends Model
{
    protected string $__table_name = 'product_orders';

    public string $product_id;
    public string $order_id;
    public int $quantity;
    public ?string $customization = NULL;

    protected static function __dump(array $values): array
    {
        if (!isset($values['customization']) || $values['customization'] === NULL) {
            return $values;
        }

        $key = __GET_SECRET_KEY('customization');

        return [
            ...$values,
            'customization' => openssl_encrypt($values['customization'], 'aes-256-ecb', $key),
        ];
    }

    protected static function __load(array $values): array
    {
        if (!isset($values['customization']) || $values['customization'] === NULL) {
            return $values;
        }

        $key = __GET_SECRET_KEY('customization');

        return [
            ...$values,
            'customization' => openssl_decrypt($values['customization'], 'aes-256-ecb', $key)
        ];
    }
}
