<?php

namespace App\Http\Controllers;

use App\Services\ClientService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    private ClientService $clientService;

    /**
     * @param ClientService $clientService Сервис клиентов аренды.
     */
    public function __construct(ClientService $clientService)
    {
        $this->clientService = $clientService;
    }

    /**
     * GET /api/clients/search — поиск клиентов по началу номера (до 10 записей).
     *
     * @param Request $request Query-параметр phone.
     * @return JsonResponse Список клиентов.
     */
    public function search(Request $request): JsonResponse
    {
        return $this->handleServiceCall(function () use ($request) {
            $phone = $request->query('phone', '');

            if (! is_string($phone)) {
                return [];
            }

            return $this->clientService->searchByPhone($phone)->values();
        });
    }

    /**
     * GET /api/clients/by-phone — точный поиск клиента по телефону.
     *
     * @param Request $request Query-параметр phone.
     * @return JsonResponse Данные клиента или null.
     */
    public function findByPhone(Request $request): JsonResponse
    {
        return $this->handleServiceCall(function () use ($request) {
            $phone = $request->query('phone', '');

            if (! is_string($phone) || trim($phone) === '') {
                return null;
            }

            return $this->clientService->findByPhone($phone);
        });
    }
}
