<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Выносит модели самокатов в отдельную таблицу и связывает с scooters.
     */
    public function up(): void
    {
        Schema::create('scooter_models', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::table('scooters', function (Blueprint $table) {
            $table->foreignId('scooter_model_id')
                ->nullable()
                ->after('number')
                ->constrained()
                ->restrictOnDelete();
        });

        if (Schema::hasColumn('scooters', 'model')) {
            $this->migrateExistingScooterModels();

            Schema::table('scooters', function (Blueprint $table) {
                $table->dropColumn('model');
            });
        }
    }

    /**
     * Переносит строковое поле model в scooter_models и scooter_model_id.
     */
    private function migrateExistingScooterModels(): void
    {
        $now = now();

        $modelNames = DB::table('scooters')
            ->whereNotNull('model')
            ->distinct()
            ->pluck('model');

        foreach ($modelNames as $name) {
            DB::table('scooter_models')->insertOrIgnore([
                'name' => $name,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $modelIdsByName = DB::table('scooter_models')->pluck('id', 'name');

        foreach (DB::table('scooters')->get(['id', 'model']) as $scooter) {
            $modelId = $modelIdsByName[$scooter->model] ?? null;

            if ($modelId === null) {
                $modelId = DB::table('scooter_models')->insertGetId([
                    'name' => $scooter->model ?: 'Unknown',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $modelIdsByName[$scooter->model ?: 'Unknown'] = $modelId;
            }

            DB::table('scooters')
                ->where('id', $scooter->id)
                ->update(['scooter_model_id' => $modelId]);
        }
    }

    /**
     * Откатывает изменения схемы.
     */
    public function down(): void
    {
        Schema::table('scooters', function (Blueprint $table) {
            if (! Schema::hasColumn('scooters', 'model')) {
                $table->string('model')->default('Unknown')->after('number');
            }
        });

        foreach (DB::table('scooters')->whereNotNull('scooter_model_id')->get(['id', 'scooter_model_id']) as $scooter) {
            $modelName = DB::table('scooter_models')->where('id', $scooter->scooter_model_id)->value('name');

            if ($modelName !== null) {
                DB::table('scooters')->where('id', $scooter->id)->update(['model' => $modelName]);
            }
        }

        Schema::table('scooters', function (Blueprint $table) {
            $table->dropConstrainedForeignId('scooter_model_id');
        });

        Schema::dropIfExists('scooter_models');
    }
};
