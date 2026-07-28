<?php

namespace App\Services;

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
     * @param array{name: string} $data Название модели.
     * @return ScooterModel Созданная модель.
     */
    public function create(array $data): ScooterModel
    {
        return ScooterModel::create($data);
    }
}
