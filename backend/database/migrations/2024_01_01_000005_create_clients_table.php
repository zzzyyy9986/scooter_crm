<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Создаёт таблицу клиентов аренды и заменяет user_id на client_id в rentals.
     */
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone', 20)->unique();
            $table->timestamps();
        });

        Schema::table('rentals', function (Blueprint $table) {
            $table->foreignId('client_id')
                ->nullable()
                ->after('scooter_id')
                ->constrained()
                ->restrictOnDelete();
        });

        if (Schema::hasColumn('rentals', 'user_id')) {
            $this->migrateRentalsFromUsers();
        }

        Schema::table('rentals', function (Blueprint $table) {
            if (Schema::hasColumn('rentals', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
        });
    }

    /**
     * Переносит аренды с users на clients (для уже существующих данных).
     */
    private function migrateRentalsFromUsers(): void
    {
        $now = now();

        foreach (DB::table('rentals')->whereNotNull('user_id')->get() as $rental) {
            $user = DB::table('users')->where('id', $rental->user_id)->first();

            if ($user === null) {
                continue;
            }

            $phone = '+7900'.str_pad((string) $user->id, 7, '0', STR_PAD_LEFT);

            $clientId = DB::table('clients')->where('phone', $phone)->value('id');

            if ($clientId === null) {
                $clientId = DB::table('clients')->insertGetId([
                    'name' => $user->name,
                    'phone' => $phone,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            DB::table('rentals')->where('id', $rental->id)->update(['client_id' => $clientId]);
        }
    }

    /**
     * Откатывает изменения схемы.
     */
    public function down(): void
    {
        Schema::table('rentals', function (Blueprint $table) {
            if (! Schema::hasColumn('rentals', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('scooter_id')->constrained()->cascadeOnDelete();
            }
        });

        Schema::table('rentals', function (Blueprint $table) {
            $table->dropConstrainedForeignId('client_id');
        });

        Schema::dropIfExists('clients');
    }
};
