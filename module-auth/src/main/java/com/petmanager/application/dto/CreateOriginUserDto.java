package com.petmanager.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.Length;

import java.util.List;


public record CreateOriginUserDto (@NotBlank(message = "닉네임은 필수 입니다.")
                                   @Length(min = 5, max = 30)
                                   String nickName,
                                   @NotBlank(message = "아이디는 필수 입니다.")
                                   @Length(min = 5, max = 30)
                                   String username,
                                   @NotBlank(message = "패스워드는 필수 입니다.")
                                   @Pattern(
                                           regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,30}$",
                                           message = "비밀번호는 영문, 숫자, 특수문자를 포함하여 8~30자여야 합니다."
                                   )
                                   String password,
                                   @NotBlank(message = "이메일은 필수 입력값입니다.")
                                   @Email(message = "이메일 형식이 올바르지 않습니다.")
                                   String email,
                                   @Size(max = 3, message = "추가 지역은 최대 3개까지 가능합니다.")
                                   List<Long> regionIds){
}
