<?php

abstract class Transaction
{

    public static function begin()
    {
        Model::connectToDatabase();

        Model::dbConnection()->exec('START TRANSACTION');
    }

    public static function commit()
    {
        Model::connectToDatabase();

        Model::dbConnection()->exec('COMMIT');
    }

    public static function rollback()
    {
        Model::connectToDatabase();

        Model::dbConnection()->exec('ROLLBACK');
    }
}
