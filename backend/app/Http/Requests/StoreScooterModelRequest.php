<?php

namespace App\Http\Requests;

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
}
