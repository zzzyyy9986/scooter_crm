<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Базовый Form Request для защищённых API-маршрутов.
 * Аутентификация выполняется middleware auth:sanctum до вызова authorize().
 */
abstract class AuthorizedApiRequest extends FormRequest
{
    /**
     * Проверяет, что запрос выполнен аутентифицированным пользователем.
     * Дополнительная проверка поверх middleware auth:sanctum.
     *
     * @return bool
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }
}
