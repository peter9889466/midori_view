package kr.smhrd.MV.service;

import java.util.LinkedHashMap;
import java.util.Map;

import org.json.JSONArray;
import org.json.JSONObject;

public class DataConverter {
	public static JSONArray alignByYear(JSONObject originalJson) {
		JSONArray items = originalJson.getJSONObject("response").getJSONObject("body").getJSONObject("items")
				.getJSONArray("item");

		// 결과를 담을 Map<연도, 합계정보>
		Map<String, JSONObject> yearTotals = new LinkedHashMap<>();

		for (int i = 0; i < items.length(); i++) {
			JSONObject item = items.getJSONObject(i);
			String year = item.get("year").toString();
			if (year.equals("총계"))
				continue; // 총계 제외

			int expDlr = item.optInt("expDlr", 0);
			int impDlr = item.optInt("impDlr", 0);
			int expWgt = item.optInt("expWgt", 0);
			int impWgt = item.optInt("impWgt", 0);
			int balPayments = item.optInt("balPayments", 0);

			JSONObject total = yearTotals.getOrDefault(year, new JSONObject().put("year", year).put("expDlr", 0)
					.put("impDlr", 0).put("expWgt", 0).put("impWgt", 0).put("balPayments", 0));

			total.put("expDlr", total.getInt("expDlr") + expDlr);
			total.put("impDlr", total.getInt("impDlr") + impDlr);
			total.put("expWgt", total.getInt("expWgt") + expWgt);
			total.put("impWgt", total.getInt("impWgt") + impWgt);
			total.put("balPayments", total.getInt("balPayments") + balPayments);

			yearTotals.put(year, total);
		}

		return new JSONArray(yearTotals.values());
	}
}
