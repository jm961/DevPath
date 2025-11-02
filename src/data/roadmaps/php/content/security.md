# PHP Security Best Practices

Security is crucial in PHP development. Follow these best practices to protect your applications.

## Common Vulnerabilities

### SQL Injection
Always use prepared statements:
```php
// Bad
$query = "SELECT * FROM users WHERE id = " . $_GET['id'];

// Good
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$_GET['id']]);
```

### XSS (Cross-Site Scripting)
Sanitize output:
```php
echo htmlspecialchars($userInput, ENT_QUOTES, 'UTF-8');
```

### CSRF (Cross-Site Request Forgery)
Use CSRF tokens in forms:
```php
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));
```

## Password Security

```php
// Hashing passwords
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Verifying passwords
if (password_verify($inputPassword, $hashedPassword)) {
    // Password is correct
}
```

## Resources

- [OWASP PHP Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/PHP_Configuration_Cheat_Sheet.html)
- [PHP Security Best Practices](https://www.php.net/manual/en/security.php)
