<?php

use Random\Engine\Secure;
use Random\Randomizer;

function __getRng(): Randomizer
{
    static $rng = NULL;
    if ($rng === NULL) {
        $rng = new Randomizer(new Secure());
    }
    return $rng;
}

function __gmpRandBits(int $bits): GMP
{
    $rng = __getRng();
    $bytes = intdiv($bits + 7, 8);
    $mask = gmp_sub(gmp_pow(2, $bits), 1);
    $gmp = gmp_import($rng->getBytes($bytes));
    return gmp_and($gmp, $mask);
}

function __gmpBitSize(GMP $x): int
{
    return strlen(gmp_strval($x, 2));
}

function __hex2bin(string $x): string
{
    return hex2bin(((strlen($x) % 2) !== 0) ? "0$x" : $x);
}

function __getP(): GMP
{
    static $p = NULL;
    if ($p === NULL) {
        $p = gmp_import(__hex2bin(getenv('PRIME')));
    }
    return $p;
}

function __gmpRandBelow(GMP $n): GMP
{
    $n_bits = __gmpBitSize($n);
    $check = false;
    while (!$check) {
        $x = __gmpRandBits($n_bits);
        if (gmp_cmp($x, $n) < 0) {
            $check = true;
        }
    }
    return $x;
}

function __gmpPolyMul(array $P, array $Q): array
{
    $p = __getP();
    $res = array_fill(0, count($P) + count($Q) - 1, gmp_init(0));
    foreach ($P as $i => $Pi) {
        foreach ($Q as $j => $Qj) {
            $res[$i + $j] = gmp_mod(gmp_add($res[$i + $j], gmp_mul($Pi, $Qj)), $p);
        }
    }
    return $res;
}

function __gmpPolyAdd(array $P, array $Q): array
{
    $p = __getP();
    $n = max(count($P), count($Q));
    $res = [];
    for ($i = 0; $i < $n; $i++) {
        $res[] = gmp_mod(gmp_add($P[$i] ?? 0, $Q[$i] ?? 0), $p);
    }
    return $res;
}

function __gmpPolyScalarmul(array $P, GMP $k): array
{
    $p = __getP();
    return array_map(fn($Pi) => gmp_mod(gmp_mul($k, $Pi), $p), $P);
}

function __lagrange(array $x, array $y): array
{
    $p = __getP();
    $res = array_fill(0, count($x), gmp_init(0));
    foreach ($x as $j => $xj) {
        $num = [gmp_init(1)];
        $d = gmp_init(1);
        foreach ($x as $m => $xm) {
            if ($m === $j) continue;
            $num = __gmpPolyMul($num, [gmp_neg($xm), gmp_init(1)]);
            $d = gmp_mod(gmp_mul($d, gmp_invert(gmp_sub($xj, $xm), $p)), $p);
        }
        $lj = __gmpPolyScalarmul($num, gmp_mod(gmp_mul($d, $y[$j]), $p));
        $res = __gmpPolyAdd($res, $lj);
    }
    return $res;
}

function __gmpSerializeArray(array $a)
{
    return array_map(fn($ai) => bin2hex(gmp_export($ai)), $a);
}

function __gmpUnserializeArray(array $a)
{
    $res = [];
    foreach ($a as $ai) {
        if (!is_string($ai) || !ctype_xdigit($ai)) {
            return NULL;
        }
        $bin_ai = __hex2bin($ai);
        if ($bin_ai === false) {
            return NULL;
        }
        $res[] = gmp_import($bin_ai);
    }
    return $res;
}
