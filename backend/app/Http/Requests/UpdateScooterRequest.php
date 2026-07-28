<?php

namespace App\Http\Requests;

use App\Models\Scooter;
use Illuminate\Validation\Rule;

class UpdateScooterRequest extends AuthorizedApiRequest
{
    /**
     * Правила валидации данных для частичного обновления самоката.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $scooter = $this->route('scooter');
        $scooterId = $scooter ? $scooter->id : null;

        return [
            'number' => ['sometimes', 'string', 'max:50', Rule::unique('scooters', 'number')->ignore($scooterId)],
            'scooter_model_id' => ['sometimes', 'integer', 'exists:scooter_models,id'],
            'status' => ['sometimes', Rule::in(Scooter::STATUSES)],
            'battery_level' => ['sometimes', 'integer', 'min:0', 'max:100'],
            'latitude' => ['sometimes', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'numeric', 'between:-180,180'],
        ];
    }
}
