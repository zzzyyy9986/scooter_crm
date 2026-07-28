<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Создаёт таблицу самокатов.
     */
    public function up(): void
    {
        Schema::create('scooters', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->string('model');
            $table->enum('status', ['available', 'in_use', 'maintenance', 'offline'])->default('available');
            $table->unsignedTinyInteger('battery_level')->default(100);
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->timestamps();
        });
    }

    /**
     * Удаляет таблицу самокатов.
     */
    public function down(): void
    {
        Schema::dropIfExists('scooters');
    }
};
