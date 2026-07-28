<?php

namespace App\Http\Requests;

use App\Data\ScooterModelData;

class StoreScooterModelRequest extends AuthorizedApiRequest
{
    /**
     * Правила валидации для создания модели самоката.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', 'unique:scooter_models,name'],
        ];
    }

    /**
     * Возвращает DTO с валидированными данными для создания модели самоката.
     */
    public function toScooterModelData(): ScooterModelData
    {
        return ScooterModelData::fromValidated($this->validated());
    }
}
