# PET_MANAGER_BE

반려동물 케어 서비스 **백엔드** 레포입니다.  
Gateway · Auth · Feed · Chat 4개 마이크로서비스로 구성되어 있으며,  Redis Stream 기반 이벤트 동기화를 진행합니다.
--- 


# Architecture
##전체 아키텍쳐
![전체 아키텍처](./아키텍처.png)

##채팅 아키텍쳐 
![채팅 아키텍처](./채팅%20아키텍처.png)
---

<br>

# 서비스 설명

## gatewayapi 
    - Spring Cloud Gateway ( Spring-Webflux (netty) ) 

    - 앱의 단일 진입점 역할
   
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
        - 각 서버에 필요한 유저 정보를 Redis-Stream을 통해 이벤트 발행 
    
    - Outbox를 적용하여 데이터 정합성 보장
        - Redis-Stream을 통해 이벤트를 발송하기 직전 서버 에러 발생으로 인한 데이터 동기화 문제 방지
    
    - MySQL(RDB)를 활용하여 데이터 정합성 유지.

<br> 

## feed
    - Spring + kotlin + MongoDB + Redis
    
    - 게시글 조회 및 등록 로직 처리 서버

    - 가상스레드를 활용하여 복수의 파일 등록시 병렬로 데이터 저장 처리

    - MongoDB를 활용하여 JSON형식으로 게시글 데이터 처리 (불필요한 조인 방지) 

    - Redis-Stream을 통한 유저정보 동기화

    - Redis-Stream을 통해 chat 서버에 피드 정보 발송 (EDA 적용)
        - 채팅 서버에 필요한 피드 정보를 Redis-Stream을 통해 이벤트 발행 
    
    - Outbox를 적용하여 데이터 정합성 보장
        - Redis-Stream을 통해 이벤트를 발송하기 직전 서버 에러 발생으로 인한 데이터 동기화 문제 방지
    

<br>

## chat
    - Nest.js + Typescript + MongoDB + Redis 

    - node 기반 비동기 논블로킹 서버를 통해 최소한의 자원을 통해 WS 및 HTTP 통신 최적화

    - Redis Pub/Sub을 사용하여 스케일 아웃시에도 실시간으로 채팅이 가능하도록 구현



---

<br>

# 메시지 브로커 

## Redis-Stream

(이미지) ~~~~

- Auth 서버 -> Feed 서버
   - Auth 서버는 데이터 Create, Update, Delete 상황에서 해당 정보를 Outbox테이블에 저장 후, 스케줄러를 통해 레디스 스트림에 이벤트 발행
   - auth-events 키 아래에 여러 이벤트를 로그형식 (append only)로 쌓아둠
   - consumer-group으로 feed-service-group을 두고 feed-consumer 과 feed-consumer-retry 컨슈머 두가지를 둠
   - feed-consumer의 경우 auth-events의 로그를 가져와 pel에 저장하고 xack 처리
   - 만약 1분간 xack 처리 되지않는다면 서버에 문제가 생긴것으로 간주.
   - feed-consumer-retry가 xclaim으로 가져와 해당 이벤트 처리후 xack
   - 만약 pel 횟수가 10회 이상일경우 dlq 스트림에 저장.
 

 <br>

 이미지 ~~~

 - Auth 서버 -> Feed 서버
   - Auth 서버는 데이터 Create, Update, Delete 상황에서 해당 정보를 Outbox테이블에 저장 후, 스케줄러를 통해 레디스 스트림에 이벤트 발행
   - auth-events 키 아래에 여러 이벤트를 로그형식 (append only)로 쌓아둠
   - consumer-group으로 chat-service-group을 두고 chat-consumer 과 chat-consumer-retry 컨슈머 두가지를 둠
   - chat-consumer의 경우 auth-events의 로그를 가져와 pel에 저장하고 xack 처리
   - 만약 1분간 xack 처리 되지않는다면 서버에 문제가 생긴것으로 간주.
   - chat-consumer-retry가 xclaim으로 가져와 해당 이벤트 처리후 xack
   - 만약 pel 횟수가 10회 이상일경우 dlq 스트림에 저장.

 <br>

 이미지 ~~~
 - feed 서버 -> chat 서버 
   - Feed 서버는 데이터 Create, Update, Delete 상황에서 해당 정보를 Outbox테이블에 저장 후, 스케줄러를 통해 레디스 스트림에 이벤트 발행
   - feed-chat-events 키 아래에 여러 이벤트를 로그형식 (append only)로 쌓아둠
   - consumer-group으로 chat-feed-sync-group을 두고 chat-feed-sync 과 chat-consumer-retry 컨슈머 두가지를 둠
   - chat-feed-sync의 경우 feed-chat-events의 로그를 가져와 pel에 저장하고 xack 처리
   - 만약 1분간 xack 처리 되지않는다면 서버에 문제가 생긴것으로 간주.
   - chat-consumer-retry가 xclaim으로 가져와 해당 이벤트 처리후 xack
   - 만약 pel 횟수가 10회 이상일경우 dlq 스트림에 저장.
