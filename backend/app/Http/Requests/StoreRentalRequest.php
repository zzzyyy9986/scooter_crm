<?php

namespace App\Http\Requests;

class StoreRentalRequest extends AuthorizedApiRequest
{
    /**
     * Правила валидации данных для создания аренды.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'scooter_id' => ['required', 'integer', 'exists:scooters,id'],
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ];
    }
}
