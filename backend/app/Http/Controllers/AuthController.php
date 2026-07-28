<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    private AuthService $authService;

    /**
     * @param AuthService $authService Сервис аутентификации.
     */
    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * POST /api/login — вход пользователя и выдача Bearer-токена.
     *
     * @param LoginRequest $request Валидированные email и password.
     * @return JsonResponse Объект user и token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        return $this->handleServiceCall(function () use ($request) {
            $result = $this->authService->login($request->toLoginData());

            return [
                'user' => $result['user'],
                'token' => $result['token'],
            ];
        });
    }

    /**
     * POST /api/logout — отзыв текущего API-токена авторизованного пользователя.
     *
     * @param Request $request Запрос с Bearer-токеном.
     * @return JsonResponse Сообщение об успешном выходе.
     */
    public function logout(Request $request): JsonResponse
    {
        return $this->handleServiceCall(function () use ($request) {
            $this->authService->logout($request->user());

            return ['message' => 'Logged out.'];
        });
    }

    /**
     * GET /api/user — данные текущего авторизованного пользователя.
     *
     * @param Request $request Запрос с Bearer-токеном.
     * @return JsonResponse Профиль пользователя.
     */
    public function user(Request $request): JsonResponse
    {
        return $this->handleServiceCall(function () use ($request) {
            return $this->authService->user($request->user());
        });
    }
}
