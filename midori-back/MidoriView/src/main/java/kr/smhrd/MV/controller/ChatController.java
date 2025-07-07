package kr.smhrd.MV.controller;

import kr.smhrd.MV.dto.ChatRequest;
import kr.smhrd.MV.dto.ChatResponse;
import kr.smhrd.MV.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {
    "http://49.50.134.156:3000",
    "http://49.50.134.156:5173", 
    "http://49.50.134.156:5174",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174"
})
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(@RequestBody ChatRequest request) {
        try {
            String aiResponse = chatService.processMessage(request.getMessage());
            
            ChatResponse response = new ChatResponse();
            response.setMessage(aiResponse);
            response.setSuccess(true);
            response.setTimestamp(System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            ChatResponse errorResponse = new ChatResponse();
            errorResponse.setMessage("죄송합니다. 처리 중 오류가 발생했습니다: " + e.getMessage());
            errorResponse.setSuccess(false);
            errorResponse.setTimestamp(System.currentTimeMillis());
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Chat service is running!");
    }
}