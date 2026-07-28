<?php

namespace App\Services;

use App\Data\RentalData;
use App\Exceptions\BusinessException;
use App\Models\Rental;
use App\Models\Scooter;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RentalService
{
    private ClientService $clientService;

    /**
     * @param ClientService $clientService Сервис клиентов аренды.
     */
    public function __construct(ClientService $clientService)
    {
        $this->clientService = $clientService;
    }

    /**
     * Возвращает список аренд с загруженными самокатом и клиентом.
     *
     * @param string|null $status Фильтр по статусу (active | completed).
     * @return Collection<int, Rental> Коллекция аренд, от новых к старым.
     */
    public function list(?string $status = null): Collection
    {
        $query = Rental::with(['scooter.scooterModel', 'client'])->orderByDesc('started_at');

        if ($status) {
            $query->where('status', $status);
        }

        return $query->get();
    }

    /**
     * Создаёт аренду в транзакции: находит или создаёт клиента, блокирует самокат.
     *
     * @param RentalData $rentalData ID самоката, телефон и имя клиента.
     * @return Rental Созданная аренда с relations scooter и client.
     *
     * @throws ValidationException Если самокат недоступен или уже в аренде.
     */
    public function create(RentalData $rentalData): Rental
    {
        return DB::transaction(function () use ($rentalData) {
            $client = $this->clientService->findOrCreateByPhone(
                $rentalData->phone,
                $rentalData->name,
            );

            $scooter = Scooter::lockForUpdate()->findOrFail($rentalData->scooter_id);

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
                'client_id' => $client->id,
                'started_at' => now(),
                'status' => Rental::STATUS_ACTIVE,
            ])->load(['scooter.scooterModel', 'client']);
        });
    }

    /**
     * Возвращает аренду с загруженными самокатом и клиентом.
     *
     * @param Rental $rental Модель аренды.
     * @return Rental Аренда с relations.
     */
    public function find(Rental $rental): Rental
    {
        return $rental->load(['scooter.scooterModel', 'client']);
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

        return $rental->fresh()->load(['scooter.scooterModel', 'client']);
    }
}
