package kr.smhrd.MV.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
public class ChatService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ChatService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String processMessage(String userMessage) {
        try {
            // 1. 요청 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // 2. 요청 바디 구성
            Map<String, String> requestBody = Map.of("message", userMessage);
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

            // 3. FastAPI 서버로 POST 요청
            String pythonApiUrl = "http://localhost:8000/chat";
            ResponseEntity<String> response = restTemplate.postForEntity(pythonApiUrl, entity, String.class);

            // 4. 응답 JSON 파싱
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());

                // "response" 필드가 있는 경우 해당 메시지 반환
                if (root.has("response")) {
                    return root.get("response").asText();
                } else {
                    return "⚠️ FastAPI 응답에 'response' 필드가 없습니다.";
                }
            } else {
                return "⚠️ FastAPI 서버로부터 유효한 응답을 받지 못했습니다.";
            }

        } catch (Exception e) {
            return "❌ 처리 중 오류가 발생했습니다: " + e.getMessage();
        }
    }
}
