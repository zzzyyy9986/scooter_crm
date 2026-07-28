<?php

namespace App\Http\Controllers;

use App\Exceptions\BusinessException;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Throwable;

abstract class Controller
{
    /**
     * Выполняет callback сервиса и формирует JSON-ответ.
     * ValidationException пробрасывается дальше, BusinessException — в JSON с кодом ошибки.
     *
     * @param callable $callback Бизнес-логика сервиса, возвращающая данные или null.
     * @param int $successStatus HTTP-код успешного ответа (по умолчанию 200).
     * @return JsonResponse JSON-ответ с данными или сообщением об ошибке.
     */
    protected function handleServiceCall(callable $callback, int $successStatus = 200): JsonResponse
    {
        try {
            $result = $callback();

            if ($result === null) {
                return response()->json(null, $successStatus === 200 ? 204 : $successStatus);
            }

            return response()->json($result, $successStatus);
        } catch (ValidationException $e) {
            throw $e;
        } catch (BusinessException $e) {
            return response()->json(['message' => $e->getMessage()], $e->statusCode);
        } catch (Throwable $e) {
            report($e);

            return response()->json(['message' => 'Server error.'], 500);
        }
    }
}
