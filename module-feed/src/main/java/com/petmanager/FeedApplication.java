package com.petmanager;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FeedApplication {



    public static void main(String[] args) {
        SpringApplication.run(FeedApplication.class, args);
    }
}
