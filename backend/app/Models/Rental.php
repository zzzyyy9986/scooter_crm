<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rental extends Model
{
    public const STATUS_ACTIVE = 'active';
    public const STATUS_COMPLETED = 'completed';

    public const STATUSES = [
        self::STATUS_ACTIVE,
        self::STATUS_COMPLETED,
    ];

    protected $fillable = [
        'scooter_id',
        'user_id',
        'started_at',
        'ended_at',
        'status',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    /**
     * Связь: аренда принадлежит одному самокату.
     *
     * @return BelongsTo<Scooter, $this>
     */
    public function scooter(): BelongsTo
    {
        return $this->belongsTo(Scooter::class);
    }

    /**
     * Связь: аренда принадлежит одному пользователю-арендатору.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
