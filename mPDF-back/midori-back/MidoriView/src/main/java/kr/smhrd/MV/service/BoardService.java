package kr.smhrd.MV.service;

import kr.smhrd.MV.components.ApiKeyProvider;
import org.json.JSONObject;
import org.json.XML;
import org.springframework.stereotype.Service;
import org.w3c.dom.*;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.*;
import java.net.*;

@Service
public class BoardService {

    private final ApiKeyProvider apiKeyProvider;

    public BoardService(ApiKeyProvider apiKeyProvider) {
        this.apiKeyProvider = apiKeyProvider;
    }

    // API에서 XML 문자열 받아오기
    private String fetchRawXml(String start, String end, String country, String hsCode) throws IOException {
        String serviceKey = apiKeyProvider.getApiKey();
        StringBuilder urlBuilder = new StringBuilder("http://apis.data.go.kr/1220000/nitemtrade/getNitemtradeList");

        urlBuilder.append("?" + URLEncoder.encode("serviceKey", "UTF-8") + "=" + URLEncoder.encode(serviceKey, "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("strtYymm", "UTF-8") + "=" + URLEncoder.encode(start, "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("endYymm", "UTF-8") + "=" + URLEncoder.encode(end, "UTF-8"));
        urlBuilder.append("&" + URLEncoder.encode("cntyCd", "UTF-8") + "=" + URLEncoder.encode(country, "UTF-8"));
        if (hsCode != null && !hsCode.isEmpty()) {
            urlBuilder.append("&" + URLEncoder.encode("hsSgn", "UTF-8") + "=" + URLEncoder.encode(hsCode, "UTF-8"));
        }

        URL url = new URL(urlBuilder.toString());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Content-type", "application/json");

        BufferedReader rd;
        if (conn.getResponseCode() >= 200 && conn.getResponseCode() <= 300) {
            rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        } else {
            rd = new BufferedReader(new InputStreamReader(conn.getErrorStream()));
        }

        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = rd.readLine()) != null) {
            sb.append(line);
        }
        rd.close();
        conn.disconnect();

        return sb.toString(); // XML 문자열 반환
    }

    // XML 그대로 반환
    public String fetchTradeData(String start, String end, String country, String hsCode) throws IOException {
        return fetchRawXml(start, end, country, hsCode);
    }

    

    // 수출 수입 금액 합계 계산
    public int getTotalExportAmount(String start, String end, String country, String hsCode, String data) throws Exception {
        String xml = fetchRawXml(start, end, country, hsCode);

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(new ByteArrayInputStream(xml.getBytes()));

        NodeList items = doc.getElementsByTagName("item");
        int totalExpDlr = 0;

        for (int i = 0; i < items.getLength(); i++) {
            Element item = (Element) items.item(i);     // data : 원하는 수출입 항목
            String expDlrStr = item.getElementsByTagName(data).item(0).getTextContent();
            try {
                totalExpDlr += Integer.parseInt(expDlrStr);
            } catch (NumberFormatException e) {
                
            }
        }

        return totalExpDlr;
    }
    
    // XML → JSON 변환
    public String convertXmlToJson(String xmlString) {
        JSONObject jsonObject = XML.toJSONObject(xmlString);
        return jsonObject.toString(2);
    }
}