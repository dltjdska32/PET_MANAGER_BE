# 빌드 스테이지
FROM gradle:8-jdk21 AS build
WORKDIR /app

# Gradle 캐시를 활용하기 위해 의존성 파일 먼저 복사
COPY build.gradle settings.gradle ./
COPY module-global/build.gradle ./module-global/
COPY module-feed/build.gradle ./module-feed/

# 의존성 다운로드 (캐시 활용)
RUN gradle :module-feed:dependencies --no-daemon || true

# 소스 코드 복사
COPY . .

# JAR 빌드
RUN gradle :module-feed:bootJar --no-daemon

# 실행 스테이지
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# 빌드된 JAR 복사
COPY --from=build /app/module-feed/build/libs/*.jar app.jar

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "app.jar"]

