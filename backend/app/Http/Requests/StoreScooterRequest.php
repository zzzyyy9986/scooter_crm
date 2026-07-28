<?php

namespace App\Http\Requests;

use App\Models\Scooter;
use Illuminate\Validation\Rule;

class StoreScooterRequest extends AuthorizedApiRequest
{
    /**
     * Правила валидации данных для создания самоката.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'number' => ['required', 'string', 'max:50', 'unique:scooters,number'],
            'scooter_model_id' => ['required', 'integer', 'exists:scooter_models,id'],
            'status' => ['required', Rule::in(Scooter::STATUSES)],
            'battery_level' => ['required', 'integer', 'min:0', 'max:100'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ];
    }
}
