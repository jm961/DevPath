# Database Integration

PHP has excellent support for various databases, with MySQL being the most commonly used.

## PDO (PHP Data Objects)

PDO provides a secure way to interact with databases:

```php
<?php
try {
    $pdo = new PDO(
        'mysql:host=localhost;dbname=mydb',
        'username',
        'password'
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
```

## Prepared Statements

Always use prepared statements to prevent SQL injection:

```php
<?php
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email");
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();
?>
```

## CRUD Operations

- **Create**: INSERT INTO
- **Read**: SELECT FROM
- **Update**: UPDATE SET
- **Delete**: DELETE FROM

## Resources

- [PHP PDO Documentation](https://www.php.net/manual/en/book.pdo.php)
- [MySQL Documentation](https://dev.mysql.com/doc/)
