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
            'phone' => ['required', 'string', 'min:10', 'max:20'],
            'name' => ['required', 'string', 'max:255'],
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
