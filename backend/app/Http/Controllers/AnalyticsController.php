<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    private AnalyticsService $analyticsService;

    /**
     * @param AnalyticsService $analyticsService Сервис аналитики.
     */
    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * GET /api/analytics — сводная статистика по самокатам и арендам.
     *
     * @return JsonResponse Количество самокатов по статусам, активные аренды, средний заряд.
     */
    public function index(): JsonResponse
    {
        return $this->handleServiceCall(fn () => $this->analyticsService->getSummary());
    }
}
