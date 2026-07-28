<?php

namespace App\Data;

/** Валидированные данные для создания аренды. */
final class RentalData
{
    public int $scooter_id;

    public int $user_id;

    /**
     * @param int $scooter_id ID самоката из таблицы scooters.
     * @param int $user_id ID пользователя-арендатора из таблицы users.
     */
    public function __construct(int $scooter_id, int $user_id)
    {
        $this->scooter_id = $scooter_id;
        $this->user_id = $user_id;
    }

    /**
     * Создаёт DTO из массива, возвращённого Form Request после валидации.
     *
     * @param array<string, mixed> $validated Результат $request->validated().
     */
    public static function fromValidated(array $validated): self
    {
        return new self(
            scooter_id: (int) $validated['scooter_id'],
            user_id: (int) $validated['user_id'],
        );
    }
}
