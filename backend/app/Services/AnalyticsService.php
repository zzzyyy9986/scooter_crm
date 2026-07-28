<?php

namespace App\Services;

use App\Models\Rental;
use App\Models\Scooter;

class AnalyticsService
{
    /**
     * Формирует сводную аналитику по парку самокатов и арендам.
     *
     * @return array{
     *     scooters_by_status: \Illuminate\Support\Collection,
     *     active_rentals_count: int,
     *     average_battery_level: float,
     *     total_scooters: int
     * }
     */
    public function getSummary(): array
    {
        $statusCounts = Scooter::query()
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $scootersByStatus = collect(Scooter::STATUSES)
            ->mapWithKeys(fn (string $status) => [$status => (int) ($statusCounts[$status] ?? 0)]);

        return [
            'scooters_by_status' => $scootersByStatus,
            'active_rentals_count' => Rental::where('status', Rental::STATUS_ACTIVE)->count(),
            'average_battery_level' => round((float) Scooter::avg('battery_level'), 1),
            'total_scooters' => Scooter::count(),
        ];
    }
}
