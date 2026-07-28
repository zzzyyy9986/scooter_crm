<?php

namespace App\Services;

use App\Exceptions\BusinessException;
use App\Models\Rental;
use App\Models\Scooter;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RentalService
{
    /**
     * Возвращает список аренд с загруженными самокатом и пользователем.
     *
     * @param string|null $status Фильтр по статусу (active | completed).
     * @return Collection<int, Rental> Коллекция аренд, от новых к старым.
     */
    public function list(?string $status = null): Collection
    {
        $query = Rental::with(['scooter', 'user'])->orderByDesc('started_at');

        if ($status) {
            $query->where('status', $status);
        }

        return $query->get();
    }

    /**
     * Создаёт аренду в транзакции: блокирует самокат, проверяет доступность, меняет статус на in_use.
     *
     * @param array{scooter_id: int, user_id: int} $data ID самоката и пользователя-арендатора.
     * @return Rental Созданная аренда с relations scooter и user.
     *
     * @throws ValidationException Если самокат недоступен или уже в аренде.
     */
    public function create(array $data): Rental
    {
        return DB::transaction(function () use ($data) {
            $scooter = Scooter::lockForUpdate()->findOrFail($data['scooter_id']);

            if ($scooter->status !== Scooter::STATUS_AVAILABLE) {
                throw ValidationException::withMessages([
                    'scooter_id' => ['Scooter is not available for rental.'],
                ]);
            }

            if ($scooter->activeRental()->exists()) {
                throw ValidationException::withMessages([
                    'scooter_id' => ['Scooter already has an active rental.'],
                ]);
            }

            $scooter->update(['status' => Scooter::STATUS_IN_USE]);

            return Rental::create([
                'scooter_id' => $scooter->id,
                'user_id' => $data['user_id'],
                'started_at' => now(),
                'status' => Rental::STATUS_ACTIVE,
            ])->load(['scooter', 'user']);
        });
    }

    /**
     * Возвращает аренду с загруженными самокатом и пользователем.
     *
     * @param Rental $rental Модель аренды.
     * @return Rental Аренда с relations.
     */
    public function find(Rental $rental): Rental
    {
        return $rental->load(['scooter', 'user']);
    }

    /**
     * Завершает активную аренду и возвращает самокат в статус available.
     *
     * @param Rental $rental Модель аренды.
     * @return Rental Завершённая аренда с relations.
     *
     * @throws BusinessException Если аренда уже завершена.
     */
    public function complete(Rental $rental): Rental
    {
        if ($rental->status !== Rental::STATUS_ACTIVE) {
            throw new BusinessException('Rental is already completed.');
        }

        DB::transaction(function () use ($rental) {
            $rental->update([
                'status' => Rental::STATUS_COMPLETED,
                'ended_at' => now(),
            ]);

            $rental->scooter->update(['status' => Scooter::STATUS_AVAILABLE]);
        });

        return $rental->fresh()->load(['scooter', 'user']);
    }
}
