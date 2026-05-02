<?php

function GET()
{
    $products = Product::findAll();

    TEMPLATE('index', NULL, NULL, ['products' => $products]);
}
