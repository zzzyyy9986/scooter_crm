<?php

namespace App\Data;

/** Валидированные данные для создания аренды. */
final class RentalData
{
    public int $scooter_id;

    public string $phone;

    public string $name;

    /**
     * @param int $scooter_id ID самоката из таблицы scooters.
     * @param string $phone Телефон клиента аренды.
     * @param string $name Имя клиента (для нового клиента).
     */
    public function __construct(int $scooter_id, string $phone, string $name)
    {
        $this->scooter_id = $scooter_id;
        $this->phone = $phone;
        $this->name = $name;
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
            phone: $validated['phone'],
            name: $validated['name'],
        );
    }
}
