package com.petmanager.infra.outbox;

public enum OutboxStatus {
    PENDING,
    PUBLISHED,
    FAILED;
}
