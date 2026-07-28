<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Scooter extends Model
{
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
        'model',
        'status',
        'battery_level',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'battery_level' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

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
}
