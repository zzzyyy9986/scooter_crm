<?php

namespace App\Services;

use App\Data\LoginData;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Проверяет учётные данные и выдаёт Sanctum API-токен.
     *
     * @param LoginData $loginData Email и пароль пользователя.
     * @return array{user: User, token: string} Пользователь и plain-text токен.
     *
     * @throws ValidationException Если email или пароль неверны.
     */
    public function login(LoginData $loginData): array
    {
        $user = User::where('email', $loginData->email)->first();

        if (! $user || ! Hash::check($loginData->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Отзывает текущий API-токен пользователя.
     *
     * @param User $user Авторизованный пользователь.
     */
    public function logout(User $user): void
    {
        $token = $user->currentAccessToken();
        if ($token) {
            $token->delete();
        }
    }

    /**
     * Возвращает профиль авторизованного пользователя.
     *
     * @param User $user Авторизованный пользователь.
     * @return User Модель пользователя.
     */
    public function user(User $user): User
    {
        return $user;
    }
}
