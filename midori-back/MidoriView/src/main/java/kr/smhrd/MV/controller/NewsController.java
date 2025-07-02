package kr.smhrd.MV.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import kr.smhrd.MV.service.NewsService;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "http://localhost:5173") // 프론트엔드 포트 맞게
public class NewsController {

    @Autowired
    NewsService service;

    @GetMapping
    public ResponseEntity<String> getNews(
        @RequestParam(defaultValue = "100") int display,
        @RequestParam(defaultValue = "1") int start,
        @RequestParam(defaultValue = "sim") String sort
    ) {
        String result = service.getNaverNews(display, start, sort);
        return ResponseEntity
                .ok()
                .header("Content-Type", "application/json;charset=UTF-8")
                .body(result);
    }
}
