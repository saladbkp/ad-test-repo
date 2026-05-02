<?php

function __getFilter()
{
    global $parsed_path;

    if (isset($parsed_path['query'])) {
        parse_str($parsed_path['query'], $query);
    }

    if (isset($query) && array_key_exists('tag', $query) && $query['tag'] === 'food') {
        return [['tag' => 'food'], 'Food products'];
    }

    if (isset($query) && array_key_exists('tag', $query) && $query['tag'] === 'gift') {
        return [['tag' => 'gift'], 'Gift products'];
    }

    if (isset($query) && array_key_exists('tag', $query) && $query['tag'] === 'jewelry') {
        return [['tag' => 'jewelry'], 'Jewelry products'];
    }

    return [[], 'Newest products'];
}

function GET()
{
    [$filter, $text] = __getFilter();
    $products = Product::findAll($filter);

    TEMPLATE('products', $text, NULL, ['products' => $products, 'category' => $text]);
}
