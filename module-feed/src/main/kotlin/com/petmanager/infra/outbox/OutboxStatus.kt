package com.petmanager.infra.outbox

enum class OutboxStatus {
    PENDING,
    PUBLISHED,
    FAILED,
}
