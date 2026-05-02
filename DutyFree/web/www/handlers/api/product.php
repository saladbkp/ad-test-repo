<?php

function __getFilter()
{
    global $parsed_path;

    if (isset($parsed_path['query'])) {
        parse_str($parsed_path['query'], $query);
    }

    if (isset($query) && array_key_exists('tag', $query) && $query['tag'] === 'food') {
        return ['tag' => 'food'];
    }

    if (isset($query) && array_key_exists('tag', $query) && $query['tag'] === 'gift') {
        return ['tag' => 'gift'];
    }

    if (isset($query) && array_key_exists('tag', $query) && $query['tag'] === 'jewelry') {
        return ['tag' => 'jewelry'];
    }

    return [];
}

function GET()
{
    $filter = __getFilter();
    $products = Product::findAll($filter);

    $data = [];
    foreach ($products as $product) {
        $data[] = [
            'id' => $product->id,
            'name' => $product->name,
            'image' => $product->image,
            'price' => $product->price,
            'description' => $product->description,
            'tag' => $product->tag,
            'is_customizable' => $product->is_customizable
        ];
    }

    __API_RESPONSE($data);
}
