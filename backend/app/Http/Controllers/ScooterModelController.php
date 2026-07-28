<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreScooterModelRequest;
use App\Services\ScooterModelService;
use Illuminate\Http\JsonResponse;

class ScooterModelController extends Controller
{
    private ScooterModelService $scooterModelService;

    /**
     * @param ScooterModelService $scooterModelService Сервис справочника моделей самокатов.
     */
    public function __construct(ScooterModelService $scooterModelService)
    {
        $this->scooterModelService = $scooterModelService;
    }

    /**
     * GET /api/scooter-models — список моделей самокатов.
     *
     * @return JsonResponse Массив моделей.
     */
    public function index(): JsonResponse
    {
        return $this->handleServiceCall(fn () => $this->scooterModelService->list());
    }

    /**
     * POST /api/scooter-models — добавление модели в справочник.
     *
     * @param StoreScooterModelRequest $request Валидированное название модели.
     * @return JsonResponse Созданная модель (HTTP 201).
     */
    public function store(StoreScooterModelRequest $request): JsonResponse
    {
        return $this->handleServiceCall(
            fn () => $this->scooterModelService->create($request->toScooterModelData()),
            201,
        );
    }
}
