<?php

require_once __DIR__ . '/Model.php';

class Order extends Model
{
    protected string $__table_name = 'orders';

    public string $user_id;
    public int $total;
    public int $loyalty_discount;
}
