<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScooterModel extends Model
{
    protected $fillable = [
        'name',
    ];

    /**
     * Связь: модель может быть назначена нескольким самокатам.
     *
     * @return HasMany<Scooter, $this>
     */
    public function scooters(): HasMany
    {
        return $this->hasMany(Scooter::class);
    }
}
