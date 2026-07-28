<?php

namespace App\Services;

use App\Models\Client;
use Illuminate\Support\Collection;

class ClientService
{
    /**
     * Ищет клиента по полному номеру телефона.
     *
     * @param string $phone Номер телефона (будет нормализован).
     * @return Client|null Клиент или null, если не найден.
     */
    public function findByPhone(string $phone): ?Client
    {
        $normalizedPhone = $this->normalizePhone($phone);

        if ($normalizedPhone === '') {
            return null;
        }

        return Client::query()->where('phone', $normalizedPhone)->first();
    }

    /**
     * Ищет клиентов по началу номера телефона (для автодополнения).
     *
     * @param string $phone Частичный номер (+7, 8, +7900…).
     * @param int $limit Максимум записей в ответе.
     * @return Collection<int, Client> Подходящие клиенты.
     */
    public function searchByPhone(string $phone, int $limit = 10): Collection
    {
        $likePrefix = $this->buildPhoneSearchPrefix($phone);

        if ($likePrefix === null) {
            return collect();
        }

        return Client::query()
            ->where('phone', 'like', $likePrefix.'%')
            ->orderBy('phone')
            ->limit($limit)
            ->get();
    }

    /**
     * Возвращает существующего клиента или создаёт нового по телефону.
     *
     * @param string $phone Номер телефона.
     * @param string $name Имя (используется только при создании).
     * @return Client Найденный или созданный клиент.
     */
    public function findOrCreateByPhone(string $phone, string $name): Client
    {
        $normalizedPhone = $this->normalizePhone($phone);

        $existingClient = Client::query()->where('phone', $normalizedPhone)->first();

        if ($existingClient !== null) {
            return $existingClient;
        }

        return Client::create([
            'phone' => $normalizedPhone,
            'name' => $name,
        ]);
    }

    /**
     * Строит префикс для LIKE-поиска по частичному вводу телефона.
     *
     * @param string $phone Частичный номер из формы.
     * @return string|null Префикс (+7…) или null, если искать рано.
     */
    private function buildPhoneSearchPrefix(string $phone): ?string
    {
        $trimmed = trim($phone);

        if ($trimmed === '') {
            return null;
        }

        if ($trimmed === '+') {
            return null;
        }

        if ($trimmed === '8' || str_starts_with($trimmed, '+7') || str_starts_with($trimmed, '8')) {
            $digits = preg_replace('/\D+/', '', $trimmed) ?? '';

            if ($trimmed === '8' || $digits === '8') {
                return '+7';
            }

            if (str_starts_with($digits, '8')) {
                $digits = '7'.substr($digits, 1);
            }

            if ($digits === '') {
                return '+7';
            }

            return '+'.$digits;
        }

        return null;
    }

    /**
     * Нормализует телефон: оставляет только цифры и ведущий «+».
     *
     * @param string $phone Исходный номер.
     * @return string Нормализованный номер.
     */
    private function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', $phone) ?? '';

        if ($digits === '') {
            return '';
        }

        if (str_starts_with($digits, '8') && strlen($digits) === 11) {
            $digits = '7'.substr($digits, 1);
        }

        return '+'.$digits;
    }
}
