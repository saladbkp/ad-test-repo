<?php

abstract class Model
{
    protected static ?PDO $__dbConnection = NULL;

    public static function dbConnection()
    {
        return Model::$__dbConnection;
    }

    protected string $__table_name;

    public string $id;
    public string $created_at;

    protected function __construct() {}

    public function dump_to_json(): string
    {
        $data = [];
        $ref = new ReflectionClass(static::class);
        $properties = $ref->getProperties();

        foreach ($properties as $prop) {
            if ($prop->isStatic()) continue;
            $name = $prop->getName();
            $data[$name] = $this->$name;
        }

        $data = static::__dump($data);

        return json_encode($data);
    }

    public static function load_from_json(string $json): static
    {
        $data = json_decode($json, true);

        $data = static::__load($data);

        $clazz = new static();

        $ref = new ReflectionClass(static::class);
        $properties = $ref->getProperties();

        foreach ($properties as $prop) {
            if ($prop->isStatic()) continue;
            $name = $prop->getName();
            $clazz->$name = $data[$name];
        }

        return $clazz;
    }

    protected static function __load(array $values): array
    {
        return $values;
    }

    protected static function __dump(array $values): array
    {
        return $values;
    }

    public static function connectToDatabase()
    {
        if (Model::$__dbConnection !== NULL) {
            return;
        }

        $DB_HOST = getenv('DB_HOST');
        $DB_USER = getenv('DB_USER');
        $DB_PASSWORD = getenv('DB_PASSWORD');
        $DB_DATABASE = getenv('DB_DATABASE');

        try {
            $db = new PDO("mysql:host=$DB_HOST;dbname=$DB_DATABASE;charset=utf8mb4", $DB_USER, $DB_PASSWORD, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]);

            Model::$__dbConnection = $db;
        } catch (Exception $_) {
            die('Cannot connect to the database. Unlucky :\\');
        }
    }

    static function findById(string $id)
    {
        Model::connectToDatabase();

        return static::find(['id' => $id]);
    }

    static function find($where = [])
    {
        Model::connectToDatabase();

        $clazz = new static();

        $where_str = "WHERE ";
        $where_values = [];

        $where = static::__dump($where);

        foreach ($where as $key => $value) {
            $where_str .= "$key = ? AND ";
            $where_values[] = $value;
        }

        $where_str = substr($where_str, 0, -5);

        if (count($where) > 0) {
            $query = "SELECT * FROM `" . $clazz->__table_name . "` " . $where_str . " ORDER BY `created_at` DESC LIMIT 1";
        } else {
            $query = "SELECT * FROM `" . $clazz->__table_name . "` ORDER BY `created_at` DESC LIMIT 1";
        }

        $stmt = Model::$__dbConnection->prepare($query);
        $stmt->execute($where_values);

        $data = $stmt->fetch();

        if ($data === false) {
            return NULL;
        }

        $data = static::__load($data);

        foreach ($data as $key => $value) {
            if (property_exists(static::class, $key)) {
                $clazz->$key = $value;
            }
        }

        return $clazz;
    }

    static function findAll($where = [], ?int $limit = NULL)
    {
        Model::connectToDatabase();

        $clazz = new static();

        $where_str = "WHERE ";
        $where_values = [];

        foreach ($where as $key => $value) {
            $where_str .= "$key = ? AND ";
            $where_values[] = $value;
        }

        $where_str = substr($where_str, 0, -5);
        $limit_str = '';

        if ($limit !== NULL) {
            $limit_str = " LIMIT $limit";
        }

        if (count($where) > 0) {
            $query = "SELECT * FROM `" . $clazz->__table_name . "` " . $where_str . " ORDER BY `created_at` DESC" . $limit_str;
        } else {
            $query = "SELECT * FROM `" . $clazz->__table_name . "`" . " ORDER BY `created_at` DESC" . $limit_str;
        }

        $stmt = Model::$__dbConnection->prepare($query);
        $stmt->execute($where_values);

        $data = $stmt->fetchAll();

        $clazzes = [];

        foreach ($data as $row) {
            $clazz = new static();

            $row = static::__load($row);

            foreach ($row as $key => $value) {
                if (property_exists(static::class, $key)) {
                    $clazz->$key = $value;
                }
            }

            $clazzes[] = $clazz;
        }

        return $clazzes;
    }

    function refresh()
    {
        Model::connectToDatabase();

        $query = "SELECT * FROM `" . $this->__table_name . "` WHERE id = ? LIMIT 1";

        $stmt = Model::$__dbConnection->prepare($query);
        $stmt->execute([$this->id]);

        $data = $stmt->fetch();

        if ($data === NULL) {
            throw new Exception('This model instance no longer exists');
        }

        $data = static::__load($data);

        foreach ($data as $key => $value) {
            if (property_exists(static::class, $key)) {
                $this->$key = $value;
            }
        }
    }

    static function create($values = []): static
    {
        Model::connectToDatabase();

        $values = static::__dump($values);

        $clazz = new static();

        $query_insert_string = '(';
        $query_values = [];

        $properties = array_diff(array_keys(get_class_vars(static::class)), array_keys(get_class_vars('Model')));

        $ref = new ReflectionClass(static::class);

        foreach ($properties as $prop) {
            $type = $ref->getProperty($prop)->getType();

            if (($type && !$type->allowsNull()) && !array_key_exists($prop, $values)) {
                throw new Exception('Missing required value for model ' . static::class . ': ' . $prop);
            }

            if (array_key_exists($prop, $values)) {
                $query_insert_string .= "`$prop`, ";
                $query_values[] = $values[$prop];
            }
        }

        $query_insert_string = substr($query_insert_string, 0, -2) . ")";

        $query = "INSERT INTO `" . $clazz->__table_name . "` $query_insert_string VALUES (" . implode(', ', array_map(fn() => '?', $query_values)) . ") RETURNING `id`";

        $stmt = Model::$__dbConnection->prepare($query);
        $stmt->execute($query_values);

        $data = $stmt->fetch();

        return static::findById($data['id']);
    }

    function save(?array $whitelist = NULL)
    {
        Model::connectToDatabase();

        $query_update_string = '';
        $update_values = [];

        $properties = array_diff(array_keys(get_class_vars(static::class)), array_keys(get_class_vars('Model')));

        $values = [];

        if ($whitelist === NULL) {
            $whitelist = [...$properties];
        }

        foreach ($properties as $prop) {
            if ($prop !== 'id' && in_array($prop, $whitelist)) {
                $values[$prop] = $this->$prop;
            }
        }

        $values = static::__dump($values);

        foreach ($values as $key => $value) {
            $query_update_string .= "`$key` = ?, ";
            $update_values[] = $value;
        }

        $query_insert_string = substr($query_update_string, 0, -2);

        $query = "UPDATE `" . $this->__table_name . "` SET " . $query_insert_string . " WHERE id = ?";

        $stmt = Model::$__dbConnection->prepare($query);
        $stmt->execute([...$update_values, $this->id]);

        // Shouldn't be necessary, but why not
        $this->refresh();
    }

    function delete()
    {
        Model::connectToDatabase();

        $query = "DELETE FROM `" . $this->__table_name . "` WHERE id = ?";

        $stmt = Model::$__dbConnection->prepare($query);
        $stmt->execute([$this->id]);
    }
}
