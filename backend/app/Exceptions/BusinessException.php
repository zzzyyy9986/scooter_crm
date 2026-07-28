<?php

namespace App\Exceptions;

use Exception;

class BusinessException extends Exception
{
    public int $statusCode;

    /**
     * Создаёт бизнес-исключение с HTTP-кодом ответа.
     *
     * @param string $message Текст ошибки для клиента.
     * @param int $statusCode HTTP-статус (по умолчанию 422).
     */
    public function __construct(string $message, int $statusCode = 422)
    {
        parent::__construct($message);
        $this->statusCode = $statusCode;
    }
}
