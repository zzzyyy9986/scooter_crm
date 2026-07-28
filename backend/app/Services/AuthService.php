<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Проверяет учётные данные и выдаёт Sanctum API-токен.
     *
     * @param string $email Email пользователя.
     * @param string $password Пароль в открытом виде.
     * @return array{user: User, token: string} Пользователь и plain-text токен.
     *
     * @throws ValidationException Если email или пароль неверны.
     */
    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
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
