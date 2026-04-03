package com.petmanager.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class S3ImgUploader {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${cloud.aws.region.static}")
    private String region;

    // 💡 가상 스레드 풀 생성
    private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

    /**
     * 단일 저장
     */
    public String uploadFile(MultipartFile file, String dirName) {
        /// 이미지파일인지 확인
        validateImageFile(file);

        String fileName = generateFileName(file.getOriginalFilename(), dirName);

        try {
            s3Client.putObject(PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            return buildS3Url(fileName);
        } catch (IOException e) {
            log.error("S3 단일 업로드 실패: {}", e.getMessage());
            throw new RuntimeException("S3 업로드 에러 발생", e);
        }
    }

    /**
     * 복수 저장
     * 가상 스레드를 이용해 병렬로 실행
     */
    public List<String> uploadFiles(List<MultipartFile> files, String dirName) {
        ///  suplyasync()  비동기로 시작
        List<CompletableFuture<String>> futures = files.stream()
                .map(file -> CompletableFuture.supplyAsync(() -> uploadFile(file, dirName), executor))
                .toList();

        ///  join() 메서드는 해당 작업을 던진 가상 스레드가 결과를
        ///  반환할 때까지 현재 실행 중인 메인 스레드를 대기시킴 -> 이후 저장한 결과를 받아 이미지 url을 저장해야하기 때문에
        return futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList());
    }

    /**
     * 단일 삭제 (Single Delete)
     * S3 URL에서 Key를 추출하여 삭제
     */
    public void deleteFile(String s3Url) {
        String key = extractKeyFromUrl(s3Url);
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .build());
        } catch (Exception e) {
            log.error("S3 파일 삭제 실패: {}", e.getMessage());
        }
    }

    /**
     * 복수 삭제 (Bulk Delete)
     * AWS S3의 'DeleteObjects 배치 API를 한 번 쏴서 해결
     */
    public void deleteFiles(List<String> s3Urls) {
        if (s3Urls == null || s3Urls.isEmpty())
            return;

        List<ObjectIdentifier> keys = s3Urls.stream()
                .map(url -> ObjectIdentifier.builder().key(extractKeyFromUrl(url)).build())
                .collect(Collectors.toList());

        try {
            s3Client.deleteObjects(DeleteObjectsRequest.builder()
                    .bucket(bucket)
                    .delete(Delete.builder().objects(keys).build())
                    .build());
        } catch (Exception e) {
            log.error("S3 복수 삭제 실패: {}", e.getMessage());
        }
    }

    /**
     * 이미지 파일 검증 (MIME 타입 및 확장자)
     */
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("업로드할 파일이 없습니다.");
        }

        // MIME 타입 체크
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            log.warn("이미지 파일이 아닌 업로드 시도: {}", contentType);
            throw new RuntimeException("이미지 파일만 업로드 가능합니다.");
        }

        // 확장자 체크
        String originalName = file.getOriginalFilename();
        if (originalName == null || !isSupportedExtension(originalName.toLowerCase())) {
            log.warn("지원하지 않는 확장자 업로드 시도: {}", originalName);
            throw new RuntimeException("지원하지 않는 이미지 형식입니다. (jpg, jpeg, png, webp 허용)");
        }

        // 매직 바이트(파일 헤더) DNA 검증 -> 실제 바이트코드를 확인해서 jpg jpeg png webp등인지 확인
        validateMagicBytes(file);
    }

    /**
     * 파일의 매직 바이트(Magic Bytes)를 직접 읽어 진짜 이미지인지 확인
     */
    private void validateMagicBytes(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[8];
            int bytesRead = is.read(header);

            if (bytesRead < 4) {
                throw new RuntimeException("파일 형식이 너무 짧아 유효하지 않습니다.");
            }

            // 16진수 문자열 변환
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 4; i++) {
                sb.append(String.format("%02X", header[i]));
            }
            String hex = sb.toString();

            // 주요 이미지 포맷 시그니처 체크
            boolean isImage = hex.startsWith("FFD8FF") || // JPEG
                    hex.startsWith("89504E47") || // PNG
                    hex.startsWith("47494638") || // GIF
                    (hex.startsWith("52494646") && new String(header).contains("WEBP")); // WEBP

            if (!isImage) {
                log.warn("변조 의심: {}", hex);
                throw new RuntimeException("이미지 파일의 실제 데이터가 유효하지 않습니다.");
            }
        } catch (IOException e) {
            log.error("파일 분석 중 오류 발생: {}", e.getMessage());
            throw new RuntimeException("파일 정체성 확인 중 에러가 발생했습니다.");
        }
    }

    private boolean isSupportedExtension(String fileName) {
        return fileName.endsWith(".jpg") ||
                fileName.endsWith(".jpeg") ||
                fileName.endsWith(".png") ||
                fileName.endsWith(".webp");
    }

    private String generateFileName(String originalName, String dirName) {
        return dirName + "/" + UUID.randomUUID() + "-" + (originalName != null ? originalName : "unnamed");
    }

    private String buildS3Url(String fileName) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, fileName);
    }

    private String extractKeyFromUrl(String s3Url) {
        String splitStr = ".amazonaws.com/";
        return s3Url.substring(s3Url.lastIndexOf(splitStr) + splitStr.length());
    }
}
