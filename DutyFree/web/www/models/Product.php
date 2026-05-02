<?php

require_once __DIR__ . '/Model.php';

class Product extends Model
{
    protected string $__table_name = 'products';

    public string $name;
    public string $image;
    public string $description;
    public int $price;
    public bool $is_customizable;
    public ?string $tag;
}
