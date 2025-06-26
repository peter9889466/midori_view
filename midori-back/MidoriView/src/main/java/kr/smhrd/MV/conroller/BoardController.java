package kr.smhrd.MV.conroller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import kr.smhrd.MV.service.BoardService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @GetMapping("/data")
    public ResponseEntity<String> getTradeData(
            @RequestParam String start,
            @RequestParam String end,
            @RequestParam String country,
            @RequestParam(required = false) String hs
    ) {
        try {
            String result = boardService.fetchTradeData(start, end, country, hs);
            result = boardService.convertXmlToJson(result);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json;charset=UTF-8")
                    .body(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
    
    @GetMapping("/totalExport")
    public ResponseEntity<?> getExportTotal(
            @RequestParam String start,
            @RequestParam String end,
            @RequestParam String country,
            @RequestParam(required = false) String hs,
            @RequestParam(required = false) String data
    ) {
    	data = "expDlr";
        try {
            int totalExport = boardService.getTotalExportAmount(start, end, country, hs,data);
            String result = Integer.toString(totalExport);
            result = boardService.convertXmlToJson(result);
            return ResponseEntity.ok().body(Map.of("totalExport", totalExport));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
