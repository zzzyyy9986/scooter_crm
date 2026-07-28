<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Регистрирует сервисы приложения в контейнере.
     */
    public function register(): void
    {
        //
    }

    /**
     * Выполняет bootstrap-логику после регистрации всех сервисов.
     */
    public function boot(): void
    {
        //
    }
}
