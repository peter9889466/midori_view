import requests
import os
from dotenv import load_dotenv

load_dotenv()

NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")

url = "https://openapi.naver.com/v1/search/news.json"
headers = {
    "X-Naver-Client-Id": NAVER_CLIENT_ID,
    "X-Naver-Client-Secret": NAVER_CLIENT_SECRET
}
params = {
    "query": "친환경",
    "display": 100,
    "start": 1,
    "sort": "date"
}

resp = requests.get(url, headers=headers, params=params)

if resp.status_code == 200:
    data = resp.json()
    for item in data["items"]:
        print(item["title"], item["originallink"])
else:
    print("❌ 오류 발생:", resp.status_code, resp.text)
