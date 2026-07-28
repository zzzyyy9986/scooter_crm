<?php

namespace Database\Seeders;

use App\Models\Rental;
use App\Models\Scooter;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Заполняет БД тестовыми пользователями, самокатами и арендами.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@scooter-crm.local'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
            ],
        );

        $ivan = User::firstOrCreate(
            ['email' => 'ivan@example.com'],
            [
                'name' => 'Иван Петров',
                'password' => Hash::make('password'),
            ],
        );

        $maria = User::firstOrCreate(
            ['email' => 'maria@example.com'],
            [
                'name' => 'Мария Сидорова',
                'password' => Hash::make('password'),
            ],
        );

        if (Scooter::exists()) {
            return;
        }

        $scooters = [
            ['number' => 'SC-001', 'model' => 'Xiaomi Pro 2', 'status' => 'available', 'battery_level' => 85, 'latitude' => 55.7558, 'longitude' => 37.6173],
            ['number' => 'SC-002', 'model' => 'Ninebot Max', 'status' => 'in_use', 'battery_level' => 62, 'latitude' => 55.7512, 'longitude' => 37.6184],
            ['number' => 'SC-003', 'model' => 'Xiaomi Pro 2', 'status' => 'maintenance', 'battery_level' => 15, 'latitude' => 55.7490, 'longitude' => 37.6200],
            ['number' => 'SC-004', 'model' => 'Bird One', 'status' => 'available', 'battery_level' => 92, 'latitude' => 55.7600, 'longitude' => 37.6100],
            ['number' => 'SC-005', 'model' => 'Ninebot Max', 'status' => 'offline', 'battery_level' => 0, 'latitude' => 55.7450, 'longitude' => 37.6250],
            ['number' => 'SC-006', 'model' => 'Bird One', 'status' => 'available', 'battery_level' => 78, 'latitude' => 55.7520, 'longitude' => 37.6150],
        ];

        foreach ($scooters as $data) {
            Scooter::create($data);
        }

        Rental::create([
            'scooter_id' => 2,
            'user_id' => $ivan->id,
            'started_at' => now()->subHours(2),
            'status' => 'active',
        ]);

        Rental::create([
            'scooter_id' => 1,
            'user_id' => $maria->id,
            'started_at' => now()->subDays(1),
            'ended_at' => now()->subHours(20),
            'status' => 'completed',
        ]);
    }
}
