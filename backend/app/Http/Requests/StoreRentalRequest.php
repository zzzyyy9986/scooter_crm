<?php

namespace App\Http\Requests;

use App\Data\RentalData;

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

    /**
     * Возвращает DTO с валидированными данными для создания аренды.
     */
    public function toRentalData(): RentalData
    {
        return RentalData::fromValidated($this->validated());
    }
}
