<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Scooter extends Model
{
    protected $table = 'scooters';

    public const STATUS_AVAILABLE = 'available';
    public const STATUS_IN_USE = 'in_use';
    public const STATUS_MAINTENANCE = 'maintenance';
    public const STATUS_OFFLINE = 'offline';

    public const STATUSES = [
        self::STATUS_AVAILABLE,
        self::STATUS_IN_USE,
        self::STATUS_MAINTENANCE,
        self::STATUS_OFFLINE,
    ];

    protected $fillable = [
        'number',
        'scooter_model_id',
        'status',
        'battery_level',
        'latitude',
        'longitude',
    ];

    protected $appends = [
        'model',
    ];

    protected $casts = [
        'battery_level' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    /**
     * Название модели для API (из связанного справочника).
     */
    public function getModelAttribute(): ?string
    {
        return $this->scooterModel?->name;
    }

    /**
     * Связь: самокат может иметь множество аренд.
     *
     * @return HasMany<Rental, $this>
     */
    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }

    /**
     * Связь: текущая активная аренда самоката (если есть).
     *
     * @return HasOne<Rental, $this>
     */
    public function activeRental(): HasOne
    {
        return $this->hasOne(Rental::class)->where('status', Rental::STATUS_ACTIVE);
    }

    /**
     * Связь: модель самоката из справочника.
     *
     * @return BelongsTo<ScooterModel, $this>
     */
    public function scooterModel(): BelongsTo
    {
        return $this->belongsTo(ScooterModel::class);
    }
}
