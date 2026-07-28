<?php

namespace App\Data;

/** Валидированные данные для создания модели самоката в справочнике. */
final class ScooterModelData
{
    public string $name;

    /**
     * @param string $name Название модели (уникальное).
     */
    public function __construct(string $name)
    {
        $this->name = $name;
    }

    /**
     * Создаёт DTO из массива, возвращённого Form Request после валидации.
     *
     * @param array<string, mixed> $validated Результат $request->validated().
     */
    public static function fromValidated(array $validated): self
    {
        return new self(name: $validated['name']);
    }

    /**
     * Преобразует DTO в массив для Eloquent::create().
     *
     * @return array<string, string>
     */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
        ];
    }
}
