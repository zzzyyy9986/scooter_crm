<?php

namespace App\Services;

use App\Data\ScooterModelData;
use App\Models\ScooterModel;
use Illuminate\Support\Collection;

class ScooterModelService
{
    /**
     * Возвращает список моделей самокатов из справочника.
     *
     * @return Collection<int, ScooterModel> Модели, отсортированные по названию.
     */
    public function list(): Collection
    {
        return ScooterModel::query()->orderBy('name')->get();
    }

    /**
     * Создаёт новую модель в справочнике.
     *
     * @param ScooterModelData $scooterModelData Название модели.
     * @return ScooterModel Созданная запись справочника.
     */
    public function create(ScooterModelData $scooterModelData): ScooterModel
    {
        return ScooterModel::create([
            'name' => $scooterModelData->name,
        ]);
    }
}
