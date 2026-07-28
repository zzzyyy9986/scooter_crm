<?php

namespace App\Data;

/** Валидированные данные для входа в систему. */
final class LoginData
{
    public string $email;

    public string $password;

    /**
     * @param string $email Email пользователя.
     * @param string $password Пароль в открытом виде.
     */
    public function __construct(string $email, string $password)
    {
        $this->email = $email;
        $this->password = $password;
    }

    /**
     * Создаёт DTO из массива, возвращённого Form Request после валидации.
     *
     * @param array<string, mixed> $validated Результат $request->validated().
     */
    public static function fromValidated(array $validated): self
    {
        return new self(
            email: $validated['email'],
            password: $validated['password'],
        );
    }
}
