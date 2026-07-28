<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreRentalRequest;
use App\Models\Rental;
use App\Services\RentalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RentalController extends Controller
{
    private RentalService $rentalService;

    /**
     * @param RentalService $rentalService Сервис управления арендами.
     */
    public function __construct(RentalService $rentalService)
    {
        $this->rentalService = $rentalService;
    }

    /**
     * GET /api/rentals — список аренд с загрузкой связанных самоката и пользователя.
     *
     * @param Request $request Query-параметр: status (active | completed).
     * @return JsonResponse Массив аренд.
     */
    public function index(Request $request): JsonResponse
    {
        return $this->handleServiceCall(fn () => $this->rentalService->list(
            $request->query('status'),
        ));
    }

    /**
     * POST /api/rentals — создание новой аренды.
     *
     * @param StoreRentalRequest $request Валидированные scooter_id, phone и name клиента.
     * @return JsonResponse Созданная аренда с relations (HTTP 201).
     */
    public function store(StoreRentalRequest $request): JsonResponse
    {
        $rentalData = $request->toRentalData();

        return $this->handleServiceCall(
            fn () => $this->rentalService->create($rentalData),
            201,
        );
    }

    /**
     * GET /api/rentals/{rental} — просмотр аренды по ID.
     *
     * @param Rental $rental Модель аренды из route model binding.
     * @return JsonResponse Аренда с самокатом и пользователем.
     */
    public function show(Rental $rental): JsonResponse
    {
        return $this->handleServiceCall(fn () => $this->rentalService->find($rental));
    }

    /**
     * POST /api/rentals/{rental}/complete — завершение активной аренды.
     *
     * @param Rental $rental Модель аренды из route model binding.
     * @return JsonResponse Завершённая аренда, самокат переводится в available.
     */
    public function complete(Rental $rental): JsonResponse
    {
        return $this->handleServiceCall(fn () => $this->rentalService->complete($rental));
    }
}
