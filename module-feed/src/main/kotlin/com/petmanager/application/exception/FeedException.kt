package com.petmanager.application.exception

import com.petmanager.exception.BaseException
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode

class FeedException(
    statusCode: HttpStatusCode,
    code: String,
    message: String
) : BaseException(statusCode, code, message) {

    companion object {
        fun badRequest(message: String): FeedException {
            return FeedException(HttpStatus.BAD_REQUEST, "FEED_FAIL_01", message)
        }

        fun notFound(message: String): FeedException {
            return FeedException(HttpStatus.NOT_FOUND, "FEED_FAIL_02", message)
        }

        fun forbidden(message: String): FeedException {
            return FeedException(HttpStatus.FORBIDDEN, "FEED_FAIL_03", message)
        }
    }
}
