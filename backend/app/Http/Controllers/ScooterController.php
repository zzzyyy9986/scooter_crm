<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreScooterRequest;
use App\Http\Requests\UpdateScooterRequest;
use App\Models\Scooter;
use App\Services\ScooterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScooterController extends Controller
{
    private ScooterService $scooterService;

    /**
     * @param ScooterService $scooterService Сервис управления самокатами.
     */
    public function __construct(ScooterService $scooterService)
    {
        $this->scooterService = $scooterService;
    }

    /**
     * GET /api/scooters — список самокатов с опциональной фильтрацией.
     *
     * @param Request $request Query-параметры: search (номер/модель), status.
     * @return JsonResponse Массив самокатов.
     */
    public function index(Request $request): JsonResponse
    {
        return $this->handleServiceCall(fn () => $this->scooterService->list(
            $request->query('search'),
            $request->query('status'),
        ));
    }

    /**
     * POST /api/scooters — создание нового самоката.
     *
     * @param StoreScooterRequest $request Валидированные данные самоката.
     * @return JsonResponse Созданный самокат (HTTP 201).
     */
    public function store(StoreScooterRequest $request): JsonResponse
    {
        return $this->handleServiceCall(
            fn () => $this->scooterService->create($request->validated()),
            201,
        );
    }

    /**
     * GET /api/scooters/{scooter} — просмотр самоката по ID.
     *
     * @param Scooter $scooter Модель самоката из route model binding.
     * @return JsonResponse Данные самоката.
     */
    public function show(Scooter $scooter): JsonResponse
    {
        return $this->handleServiceCall(fn () => $this->scooterService->find($scooter));
    }

    /**
     * PUT /api/scooters/{scooter} — обновление самоката.
     *
     * @param UpdateScooterRequest $request Валидированные поля для обновления.
     * @param Scooter $scooter Модель самоката из route model binding.
     * @return JsonResponse Обновлённые данные самоката.
     */
    public function update(UpdateScooterRequest $request, Scooter $scooter): JsonResponse
    {
        return $this->handleServiceCall(
            fn () => $this->scooterService->update($scooter, $request->validated()),
        );
    }

    /**
     * DELETE /api/scooters/{scooter} — удаление самоката.
     *
     * @param Scooter $scooter Модель самоката из route model binding.
     * @return JsonResponse Пустой ответ (HTTP 204).
     */
    public function destroy(Scooter $scooter): JsonResponse
    {
        return $this->handleServiceCall(function () use ($scooter) {
            $this->scooterService->delete($scooter);

            return null;
        });
    }
}
