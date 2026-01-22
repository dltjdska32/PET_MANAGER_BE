package com.petmanager.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;

@Getter
@NoArgsConstructor
public class SendOtpDto extends SimpleMailMessage {

    private String toEmail;
    private OtpDto otp;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public SendOtpDto (String toEmail, OtpDto otp) {
        super();

        this.toEmail = toEmail;
        this.otp = otp;

        this.setTo(toEmail);
        this.setFrom(fromEmail);
        this.setSubject("[PET MANAGER] 이메일 인증 번호입니다.");
        this.setText("인증 번호: " + otp.getOtp() + "\n\n3분 이내에 입력해주세요.");
    }
}
