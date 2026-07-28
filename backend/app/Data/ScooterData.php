<?php

namespace App\Data;

/** Валидированные данные для создания самоката. */
final class ScooterData
{
    public string $number;

    public int $scooter_model_id;

    public string $status;

    public int $battery_level;

    public float $latitude;

    public float $longitude;

    /**
     * @param string $number Номер самоката (уникальный).
     * @param int $scooter_model_id ID модели из справочника scooter_models.
     * @param string $status Статус: available, in_use, maintenance, offline.
     * @param int $battery_level Уровень заряда (0–100).
     * @param float $latitude Широта.
     * @param float $longitude Долгота.
     */
    public function __construct(
        string $number,
        int $scooter_model_id,
        string $status,
        int $battery_level,
        float $latitude,
        float $longitude,
    ) {
        $this->number = $number;
        $this->scooter_model_id = $scooter_model_id;
        $this->status = $status;
        $this->battery_level = $battery_level;
        $this->latitude = $latitude;
        $this->longitude = $longitude;
    }

    /**
     * Создаёт DTO из массива, возвращённого Form Request после валидации.
     *
     * @param array<string, mixed> $validated Результат $request->validated().
     */
    public static function fromValidated(array $validated): self
    {
        return new self(
            number: $validated['number'],
            scooter_model_id: (int) $validated['scooter_model_id'],
            status: $validated['status'],
            battery_level: (int) $validated['battery_level'],
            latitude: (float) $validated['latitude'],
            longitude: (float) $validated['longitude'],
        );
    }

    /**
     * Преобразует DTO в массив для Eloquent::create().
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'number' => $this->number,
            'scooter_model_id' => $this->scooter_model_id,
            'status' => $this->status,
            'battery_level' => $this->battery_level,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
        ];
    }
}
