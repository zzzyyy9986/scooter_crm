<?php

namespace App\Data;

/** Валидированные данные для частичного обновления самоката. */
final class UpdateScooterData
{
    public ?string $number = null;

    public ?int $scooter_model_id = null;

    public ?string $status = null;

    public ?int $battery_level = null;

    public ?float $latitude = null;

    public ?float $longitude = null;

    /**
     * @param string|null $number Номер самоката.
     * @param int|null $scooter_model_id ID модели из справочника.
     * @param string|null $status Статус самоката.
     * @param int|null $battery_level Уровень заряда (0–100).
     * @param float|null $latitude Широта.
     * @param float|null $longitude Долгота.
     */
    public function __construct(
        ?string $number = null,
        ?int $scooter_model_id = null,
        ?string $status = null,
        ?int $battery_level = null,
        ?float $latitude = null,
        ?float $longitude = null,
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
            number: $validated['number'] ?? null,
            scooter_model_id: isset($validated['scooter_model_id'])
                ? (int) $validated['scooter_model_id']
                : null,
            status: $validated['status'] ?? null,
            battery_level: isset($validated['battery_level'])
                ? (int) $validated['battery_level']
                : null,
            latitude: isset($validated['latitude']) ? (float) $validated['latitude'] : null,
            longitude: isset($validated['longitude']) ? (float) $validated['longitude'] : null,
        );
    }

    /**
     * Преобразует DTO в массив только с переданными полями.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $data = [];

        if ($this->number !== null) {
            $data['number'] = $this->number;
        }

        if ($this->scooter_model_id !== null) {
            $data['scooter_model_id'] = $this->scooter_model_id;
        }

        if ($this->status !== null) {
            $data['status'] = $this->status;
        }

        if ($this->battery_level !== null) {
            $data['battery_level'] = $this->battery_level;
        }

        if ($this->latitude !== null) {
            $data['latitude'] = $this->latitude;
        }

        if ($this->longitude !== null) {
            $data['longitude'] = $this->longitude;
        }

        return $data;
    }
}
