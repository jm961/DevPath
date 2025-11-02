# Laravel Framework

Laravel is the most popular PHP framework, known for its elegant syntax and powerful features.

## Why Laravel?

- **MVC Architecture**: Clean code organization
- **Eloquent ORM**: Beautiful database interactions
- **Blade Templating**: Intuitive template engine
- **Authentication**: Built-in user authentication
- **Artisan CLI**: Powerful command-line tool

## Installation

```bash
composer create-project laravel/laravel example-app
cd example-app
php artisan serve
```

## Basic Routing

```php
// routes/web.php
Route::get('/', function () {
    return view('welcome');
});

Route::get('/users', [UserController::class, 'index']);
```

## Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Laracasts](https://laracasts.com)
- [Laravel News](https://laravel-news.com)
