# PET_MANAGER_BE

반려동물 케어 서비스 **백엔드** 레포입니다.  
Gateway · Auth · Feed · Chat 4개 마이크로서비스로 구성되어 있으며,  Redis Stream 기반 이벤트 동기화를 진행합니다.
--- 


# Architecture
 [아키텍처.png](./아키텍처.png) 

# 서버 

## gatewayapi 
    - Spring Cloud Gateway ( Spring-Webflux (netty) ) 
   
    - 논블로킹 비동기 처리를 통해 최소한의 자원으로 빠르게 요청을 각서버로 라우팅 
   
    - jwt를 통한 인증로직 전담.

<br>

## auth
    - Spring + JAVA + MySQL + Redis 
    
    - 인증 / 인가 및 유저 관련 로직 처리 서버
        - JWT를 사용한 서버메모리 절약
        - OAuth2 인증방식을 통한 UX 최적화
        - RTR 방식을 통해 보안성 향상
        - SMTP를 활용한 메일 인증을 통해 보안성 향상
        - Bcrypt 암호화를 통한 보안성 향상 
    
    - DDD, Hexagonal 적용
    
    - Redis-Stream을 통해 feed, chat 서버에 유저 정보 발송 (EDA 적용)
        - 각 서버로 유저테이블에 쓰기작업이 발생할 경우 관련 정보 복사본을 각 서버에 전달   
    
    - Outbox를 적용하여 데이터 정합성 보장
        - Redis-Stream을 통해 이벤트를 발송하기 직전 서버 에러 발생으로 인한 데이터 동기화 방지
    
    - MySQL(RDB)를 활용하여 데이터 정합성 유지.

<br> 

## feed
    - Spring + kotlin + MongoDB + Redis
    
    - 게시글 조회 및 등록 로직 처리 서버

    - 가상스레드를 활용하여 복수의 파일 등록시 병렬로 데이터 저장 처리

    - MongoDB를 활용하여 JSON형식으로 게시글 데이터 처리 (불필요한 조인 방지) 

    - Redis-Stream을 통한 유저정보 동기화

<br>

## chat
    - Nest.js + Typescript + MongoDB + Redis 

    - node 기반 비동기 논블로킹 서버를 통해 최소한의 자원을 통해 WS 및 HTTP 통신 최적화

    
