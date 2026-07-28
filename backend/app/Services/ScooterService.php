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
     * @param string|null $search Поиск по номеру или названию модели (LIKE).
     * @param string|null $status Фильтр по статусу (available, in_use, maintenance, offline).
     * @return Collection<int, Scooter> Коллекция самокатов, отсортированная по номеру.
     */
    public function list(?string $search = null, ?string $status = null): Collection
    {
        $query = Scooter::with('scooterModel')->orderBy('number');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                    ->orWhereHas('scooterModel', function ($modelQuery) use ($search) {
                        $modelQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        return $query->get();
    }

    /**
     * Создаёт новый самокат с указанной моделью из справочника.
     *
     * @param array<string, mixed> $data Валидированные атрибуты самоката и scooter_model_id.
     * @return Scooter Созданная модель с загруженной моделью.
     */
    public function create(array $data): Scooter
    {
        return Scooter::create($data)->load('scooterModel');
    }

    /**
     * Возвращает самокат по модели (route model binding).
     *
     * @param Scooter $scooter Модель самоката.
     * @return Scooter Та же модель с relations.
     */
    public function find(Scooter $scooter): Scooter
    {
        return $scooter->load('scooterModel');
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
        if ($scooter->activeRental()->exists()) {
            if (isset($data['status']) && $data['status'] !== Scooter::STATUS_IN_USE) {
                throw new BusinessException(
                    'Нельзя изменить статус самоката, пока у него есть активная аренда.',
                );
            }

            $data['status'] = Scooter::STATUS_IN_USE;
        }

        $scooter->update($data);

        return $scooter->fresh()->load('scooterModel');
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
            throw new BusinessException('Нельзя удалить самокат с активной арендой.');
        }

        $scooter->delete();
    }
}
