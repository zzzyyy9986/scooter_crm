<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Rental extends Model
{
    protected $table = 'rentals';

    public const STATUS_ACTIVE = 'active';
    public const STATUS_COMPLETED = 'completed';

    public const STATUSES = [
        self::STATUS_ACTIVE,
        self::STATUS_COMPLETED,
    ];

    protected $fillable = [
        'scooter_id',
        'client_id',
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
     * Связь: аренда принадлежит клиенту (арендатору самоката).
     *
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
