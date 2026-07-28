<?php

namespace App\Http\Controllers;

use App\Services\UserService;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    private UserService $userService;

    /**
     * @param UserService $userService Сервис пользователей.
     */
    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * GET /api/users — список пользователей для выбора арендатора.
     *
     * @return JsonResponse Массив пользователей (id, name, email).
     */
    public function index(): JsonResponse
    {
        return $this->handleServiceCall(fn () => $this->userService->list());
    }
}
