package kr.smhrd.MV.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class NewsService {

    @Value("${NAVER_CLIENT_ID}")
    private String naverClientId;

    @Value("${NAVER_CLIENT_SECRET}")
    private String naverClientSecret;

    public String getNaverNews(int display, int start, String sort) {
        String query = "친환경";
        String naverUrl = "https://openapi.naver.com/v1/search/news.json"
                + "?query=" + query
                + "&display=" + display
                + "&start=" + start
                + "&sort=" + sort;

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Naver-Client-Id", naverClientId);
        headers.set("X-Naver-Client-Secret", naverClientSecret);

        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                naverUrl, HttpMethod.GET, entity, String.class);

        return response.getBody();
    }
}
