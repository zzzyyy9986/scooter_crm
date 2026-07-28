<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Rental;
use App\Models\Scooter;
use App\Models\ScooterModel;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Заполняет БД тестовыми пользователями CRM, клиентами, самокатами и арендами.
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

        $ivan = Client::firstOrCreate(
            ['phone' => '+79001234567'],
            ['name' => 'Иван Петров'],
        );

        $maria = Client::firstOrCreate(
            ['phone' => '+79007654321'],
            ['name' => 'Мария Сидорова'],
        );

        Client::firstOrCreate(
            ['phone' => '+79003112233'],
            ['name' => 'Алексей Козлов'],
        );

        if (Scooter::exists()) {
            return;
        }

        $xiaomi = ScooterModel::firstOrCreate(['name' => 'Xiaomi Pro 2']);
        $ninebot = ScooterModel::firstOrCreate(['name' => 'Ninebot Max']);
        $bird = ScooterModel::firstOrCreate(['name' => 'Bird One']);

        $scooters = [
            ['number' => 'SC-001', 'scooter_model_id' => $xiaomi->id, 'status' => 'available', 'battery_level' => 85, 'latitude' => 55.7558, 'longitude' => 37.6173],
            ['number' => 'SC-002', 'scooter_model_id' => $ninebot->id, 'status' => 'in_use', 'battery_level' => 62, 'latitude' => 55.7512, 'longitude' => 37.6184],
            ['number' => 'SC-003', 'scooter_model_id' => $xiaomi->id, 'status' => 'maintenance', 'battery_level' => 15, 'latitude' => 55.7490, 'longitude' => 37.6200],
            ['number' => 'SC-004', 'scooter_model_id' => $bird->id, 'status' => 'available', 'battery_level' => 92, 'latitude' => 55.7600, 'longitude' => 37.6100],
            ['number' => 'SC-005', 'scooter_model_id' => $ninebot->id, 'status' => 'offline', 'battery_level' => 0, 'latitude' => 55.7450, 'longitude' => 37.6250],
            ['number' => 'SC-006', 'scooter_model_id' => $bird->id, 'status' => 'available', 'battery_level' => 78, 'latitude' => 55.7520, 'longitude' => 37.6150],
        ];

        foreach ($scooters as $data) {
            Scooter::create($data);
        }

        Rental::create([
            'scooter_id' => 2,
            'client_id' => $ivan->id,
            'started_at' => now()->subHours(2),
            'status' => 'active',
        ]);

        Rental::create([
            'scooter_id' => 1,
            'client_id' => $maria->id,
            'started_at' => now()->subDays(1),
            'ended_at' => now()->subHours(20),
            'status' => 'completed',
        ]);
    }
}
