<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;

class UserService
{
    /**
     * Возвращает список пользователей для выбора арендатора (без паролей).
     *
     * @return Collection<int, User> Пользователи с полями id, name, email.
     */
    public function list(): Collection
    {
        return User::query()
            ->select(['id', 'name', 'email'])
            ->orderBy('name')
            ->get();
    }
}
