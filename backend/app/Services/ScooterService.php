<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Scooter;
use Illuminate\Support\Collection;

class ScooterService
{
    /**
     * Возвращает список самокатов с опциональным поиском и фильтром по статусу.
     *
     * @param string|null $search Поиск по номеру или модели (LIKE).
     * @param string|null $status Фильтр по статусу (available, in_use, maintenance, offline).
     * @return Collection<int, Scooter> Коллекция самокатов, отсортированная по номеру.
     */
    public function list(?string $search = null, ?string $status = null): Collection
    {
        $query = Scooter::query()->orderBy('number');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        return $query->get();
    }

    /**
     * Создаёт новый самокат.
     *
     * @param array<string, mixed> $data Валидированные атрибуты самоката.
     * @return Scooter Созданная модель.
     */
    public function create(array $data): Scooter
    {
        return Scooter::create($data);
    }

    /**
     * Возвращает самокат по модели (route model binding).
     *
     * @param Scooter $scooter Модель самоката.
     * @return Scooter Та же модель.
     */
    public function find(Scooter $scooter): Scooter
    {
        return $scooter;
    }

    /**
     * Обновляет атрибуты самоката.
     *
     * @param Scooter $scooter Модель самоката.
     * @param array<string, mixed> $data Валидированные поля для обновления.
     * @return Scooter Обновлённая модель из БД.
     */
    public function update(Scooter $scooter, array $data): Scooter
    {
        $scooter->update($data);

        return $scooter->fresh();
    }

    /**
     * Удаляет самокат, если у него нет активной аренды.
     *
     * @param Scooter $scooter Модель самоката.
     *
     * @throws BusinessException Если у самоката есть активная аренда.
     */
    public function delete(Scooter $scooter): void
    {
        if ($scooter->activeRental()->exists()) {
            throw new BusinessException('Cannot delete scooter with active rental.');
        }

        $scooter->delete();
    }
}
