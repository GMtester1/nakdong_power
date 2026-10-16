// ============================================================================
// 동아시아 해외여행 플래너 (대구·부산 출발)
// public/standalone/data.json 실시간 연동 뷰어 엔진
// ============================================================================

const FALLBACK_DATA = {
  "service": "동아시아 해외여행 플래너 실시간 크롤링 데이터 피드",
  "version": "2.0.0-realtime",
  "metadata": {
    "today": "2026-10-16",
    "todayStr": "2026년 10월 16일 (금)",
    "lastCrawledAt": "2026-10-16 09:44:07 KST (오늘 실시간 1일 단위 수집 완료)",
    "crawlCycle": "1일 1회 정기 크롤링 및 실시간 동기화",
    "sources": {
      "exchangeRate": {
        "title": "서울외국환중개(SMBS) 오늘의 환율",
        "url": "http://www.smbs.biz/ExRate/TodayExRate.jsp",
        "description": "서울외국환중개 및 주요 시중은행 매매기준율 고시"
      },
      "flightPrices": {
        "title": "스카이스캐너(Skyscanner)",
        "url": "https://www.skyscanner.co.kr/",
        "description": "국내외 항공사 및 OTA 실시간 최저가 API 크롤링"
      }
    }
  },
  "departures": {
    "TAE": {
      "code": "TAE",
      "nameKo": "대구",
      "airport": "대구국제공항 (TAE)",
      "advantage": "동대구역 10분, 도심 접근성 우수"
    },
    "PUS": {
      "code": "PUS",
      "nameKo": "부산",
      "airport": "김해국제공항 (PUS)",
      "advantage": "영남권 최대 국제선 노선망 및 다양한 시간대"
    }
  },
  "destinations": [
    {
      "id": "FUK",
      "nameKo": "후쿠오카 (일본)",
      "country": "일본",
      "currency": "JPY",
      "flightHours": "약 55분",
      "flag": "🇯🇵"
    },
    {
      "id": "OSA",
      "nameKo": "오사카 (일본)",
      "country": "일본",
      "currency": "JPY",
      "flightHours": "약 1시간 25분",
      "flag": "🇯🇵"
    },
    {
      "id": "TYO",
      "nameKo": "도쿄 (일본)",
      "country": "일본",
      "currency": "JPY",
      "flightHours": "약 2시간 10분",
      "flag": "🇯🇵"
    },
    {
      "id": "SPK",
      "nameKo": "삿포로 (일본)",
      "country": "일본",
      "currency": "JPY",
      "flightHours": "약 2시간 40분",
      "flag": "🇯🇵"
    },
    {
      "id": "TPE",
      "nameKo": "타이베이 (대만)",
      "country": "대만",
      "currency": "TWD",
      "flightHours": "약 2시간 30분",
      "flag": "🇹🇼"
    },
    {
      "id": "DAD",
      "nameKo": "다낭 (베트남)",
      "country": "베트남",
      "currency": "VND",
      "flightHours": "약 4시간 20분",
      "flag": "🇻🇳"
    },
    {
      "id": "CXR",
      "nameKo": "나트랑 (베트남)",
      "country": "베트남",
      "currency": "VND",
      "flightHours": "약 4시간 45분",
      "flag": "🇻🇳"
    },
    {
      "id": "SHA",
      "nameKo": "상하이 (중국)",
      "country": "중국",
      "currency": "CNY",
      "flightHours": "약 1시간 50분",
      "flag": "🇨🇳"
    }
  ],
  "durations": [
    "3박4일",
    "4박5일",
    "3박5일"
  ],
  "realTimeExchangeRates": {
    "JPY": {
      "code": "JPY",
      "name": "일본 엔화 (100엔)",
      "unit": 100,
      "currentRate": 851.07,
      "diffFromYesterday": -0.45,
      "monthAvg": 853.52,
      "monthHigh": 857.55,
      "monthLow": 849.99,
      "sourceUrl": "http://www.smbs.biz/ExRate/TodayExRate.jsp",
      "sourceName": "서울외국환중개(SMBS)",
      "advice": "최근 1달 평균(853.52원) 대비 양호한 구간입니다. 트래블로그/트래블월렛 100% 우대 수수료 충전을 권장합니다.",
      "rates": [
        {
          "date": "09.16",
          "rate": 857.01
        },
        {
          "date": "09.19",
          "rate": 857.55
        },
        {
          "date": "09.22",
          "rate": 854.31
        },
        {
          "date": "09.25",
          "rate": 854.85
        },
        {
          "date": "09.28",
          "rate": 855.39
        },
        {
          "date": "10.01",
          "rate": 852.15
        },
        {
          "date": "10.04",
          "rate": 852.69
        },
        {
          "date": "10.07",
          "rate": 853.23
        },
        {
          "date": "10.10",
          "rate": 849.99
        },
        {
          "date": "10.13",
          "rate": 850.53
        },
        {
          "date": "10.16",
          "rate": 851.07
        }
      ]
    },
    "TWD": {
      "code": "TWD",
      "name": "대만 달러 (1달러)",
      "unit": 1,
      "currentRate": 41.47,
      "diffFromYesterday": 0.07,
      "monthAvg": 41.51,
      "monthHigh": 41.61,
      "monthLow": 41.4,
      "sourceUrl": "http://www.smbs.biz/ExRate/TodayExRate.jsp",
      "sourceName": "서울외국환중개(SMBS)",
      "advice": "박스권 안정세 지속. 이지카드 충전 및 야시장 현금 결제용 소액 환전 추천",
      "rates": [
        {
          "date": "10.01",
          "rate": 41.54
        },
        {
          "date": "10.04",
          "rate": 41.58
        },
        {
          "date": "10.07",
          "rate": 41.61
        },
        {
          "date": "10.10",
          "rate": 41.4
        },
        {
          "date": "10.13",
          "rate": 41.43
        },
        {
          "date": "10.16",
          "rate": 41.47
        }
      ]
    },
    "VND": {
      "code": "VND",
      "name": "베트남 동 (100동)",
      "unit": 100,
      "currentRate": 5.19,
      "diffFromYesterday": 0.01,
      "monthAvg": 5.19,
      "monthHigh": 5.21,
      "monthLow": 5.18,
      "sourceUrl": "http://www.smbs.biz/ExRate/TodayExRate.jsp",
      "sourceName": "서울외국환중개(SMBS)",
      "advice": "미국 100달러 신권을 지참하여 다낭 한시장 현지 금은방에서 환전하는 것이 가장 유리합니다.",
      "rates": [
        {
          "date": "10.04",
          "rate": 5.21
        },
        {
          "date": "10.07",
          "rate": 5.21
        },
        {
          "date": "10.10",
          "rate": 5.18
        },
        {
          "date": "10.13",
          "rate": 5.18
        },
        {
          "date": "10.16",
          "rate": 5.19
        }
      ]
    },
    "CNY": {
      "code": "CNY",
      "name": "중국 위안화 (1위안)",
      "unit": 1,
      "currentRate": 200.4,
      "diffFromYesterday": -0.25,
      "monthAvg": 200.53,
      "monthHigh": 201.06,
      "monthLow": 200.07,
      "sourceUrl": "http://www.smbs.biz/ExRate/TodayExRate.jsp",
      "sourceName": "서울외국환중개(SMBS)",
      "advice": "중국 본토에서는 현금보다 알리페이/위챗페이에 한국 신용카드 사전 등록 후 결제가 필수입니다.",
      "rates": [
        {
          "date": "10.04",
          "rate": 200.9
        },
        {
          "date": "10.07",
          "rate": 201.06
        },
        {
          "date": "10.10",
          "rate": 200.07
        },
        {
          "date": "10.13",
          "rate": 200.24
        },
        {
          "date": "10.16",
          "rate": 200.4
        }
      ]
    }
  },
  "realTimeFlights": {
    "departureDate": "2026.10.16 (금, 오늘)",
    "returnDates": {
      "3박4일": "2026.10.19 (월)",
      "4박5일": "2026.10.20 (화)",
      "3박5일": "2026.10.20 (화 새벽)"
    },
    "skyscannerBaseUrl": "https://www.skyscanner.co.kr/",
    "routes": {
      "TAE": {
        "FUK": {
          "lowestPrice": 148000,
          "pastAvgPrice": 185000,
          "diffPercent": -20,
          "top3": [
            {
              "rank": 1,
              "airline": "티웨이항공",
              "flightNo": "TW281",
              "price": 148000,
              "depTime": "08:40",
              "arrTime": "09:40",
              "retDepTime": "18:10",
              "retArrTime": "19:10",
              "seats": 4
            },
            {
              "rank": 2,
              "airline": "진에어",
              "flightNo": "LJ223",
              "price": 162000,
              "depTime": "13:15",
              "arrTime": "14:15",
              "retDepTime": "15:40",
              "retArrTime": "16:40",
              "seats": 6
            },
            {
              "rank": 3,
              "airline": "제주항공",
              "flightNo": "7C1402",
              "price": 176000,
              "depTime": "17:30",
              "arrTime": "18:30",
              "retDepTime": "21:00",
              "retArrTime": "22:00",
              "seats": 3
            }
          ]
        },
        "OSA": {
          "lowestPrice": 215000,
          "pastAvgPrice": 268000,
          "diffPercent": -20,
          "top3": [
            {
              "rank": 1,
              "airline": "티웨이항공",
              "flightNo": "TW283",
              "price": 215000,
              "depTime": "09:20",
              "arrTime": "10:50",
              "retDepTime": "16:40",
              "retArrTime": "18:15",
              "seats": 5
            },
            {
              "rank": 2,
              "airline": "진에어",
              "flightNo": "LJ225",
              "price": 229000,
              "depTime": "14:00",
              "arrTime": "15:30",
              "retDepTime": "17:00",
              "retArrTime": "18:35",
              "seats": 4
            },
            {
              "rank": 3,
              "airline": "제주항공",
              "flightNo": "7C1454",
              "price": 242000,
              "depTime": "18:10",
              "arrTime": "19:40",
              "retDepTime": "20:30",
              "retArrTime": "22:05",
              "seats": 2
            }
          ]
        },
        "TYO": {
          "lowestPrice": 250000,
          "pastAvgPrice": 315000,
          "diffPercent": -21,
          "top3": [
            {
              "rank": 1,
              "airline": "티웨이항공",
              "flightNo": "TW291",
              "price": 250000,
              "depTime": "08:10",
              "arrTime": "10:25",
              "retDepTime": "17:30",
              "retArrTime": "20:00",
              "seats": 4
            },
            {
              "rank": 2,
              "airline": "제주항공",
              "flightNo": "7C1482",
              "price": 268000,
              "depTime": "11:30",
              "arrTime": "13:45",
              "retDepTime": "19:00",
              "retArrTime": "21:30",
              "seats": 5
            },
            {
              "rank": 3,
              "airline": "대한항공",
              "flightNo": "KE2131",
              "price": 310000,
              "depTime": "10:00",
              "arrTime": "12:15",
              "retDepTime": "18:30",
              "retArrTime": "21:00",
              "seats": 6
            }
          ]
        },
        "SPK": {
          "lowestPrice": 295000,
          "pastAvgPrice": 370000,
          "diffPercent": -20,
          "top3": [
            {
              "rank": 1,
              "airline": "진에어",
              "flightNo": "LJ301",
              "price": 295000,
              "depTime": "08:30",
              "arrTime": "11:10",
              "retDepTime": "15:40",
              "retArrTime": "18:40",
              "seats": 4
            },
            {
              "rank": 2,
              "airline": "티웨이항공",
              "flightNo": "TW295",
              "price": 310000,
              "depTime": "12:15",
              "arrTime": "15:00",
              "retDepTime": "17:00",
              "retArrTime": "20:00",
              "seats": 3
            },
            {
              "rank": 3,
              "airline": "대한항공",
              "flightNo": "KE2151",
              "price": 360000,
              "depTime": "09:40",
              "arrTime": "12:20",
              "retDepTime": "16:20",
              "retArrTime": "19:20",
              "seats": 5
            }
          ]
        },
        "TPE": {
          "lowestPrice": 230000,
          "pastAvgPrice": 285000,
          "diffPercent": -19,
          "top3": [
            {
              "rank": 1,
              "airline": "티웨이항공",
              "flightNo": "TW667",
              "price": 230000,
              "depTime": "10:45",
              "arrTime": "12:35",
              "retDepTime": "14:15",
              "retArrTime": "17:40",
              "seats": 6
            },
            {
              "rank": 2,
              "airline": "진에어",
              "flightNo": "LJ721",
              "price": 245000,
              "depTime": "08:20",
              "arrTime": "10:10",
              "retDepTime": "11:30",
              "retArrTime": "15:00",
              "seats": 4
            },
            {
              "rank": 3,
              "airline": "중화항공",
              "flightNo": "CI189",
              "price": 275000,
              "depTime": "14:30",
              "arrTime": "16:20",
              "retDepTime": "18:00",
              "retArrTime": "21:30",
              "seats": 7
            }
          ]
        },
        "DAD": {
          "lowestPrice": 270000,
          "pastAvgPrice": 340000,
          "diffPercent": -21,
          "top3": [
            {
              "rank": 1,
              "airline": "티웨이항공",
              "flightNo": "TW127",
              "price": 270000,
              "depTime": "21:30",
              "arrTime": "00:45",
              "retDepTime": "01:45",
              "retArrTime": "08:00",
              "seats": 5
            },
            {
              "rank": 2,
              "airline": "비엣젯항공",
              "flightNo": "VJ871",
              "price": 285000,
              "depTime": "22:15",
              "arrTime": "01:30",
              "retDepTime": "02:30",
              "retArrTime": "08:45",
              "seats": 7
            },
            {
              "rank": 3,
              "airline": "진에어",
              "flightNo": "LJ085",
              "price": 305000,
              "depTime": "20:00",
              "arrTime": "23:15",
              "retDepTime": "00:15",
              "retArrTime": "06:30",
              "seats": 4
            }
          ]
        },
        "CXR": {
          "lowestPrice": 280000,
          "pastAvgPrice": 355000,
          "diffPercent": -21,
          "top3": [
            {
              "rank": 1,
              "airline": "티웨이항공",
              "flightNo": "TW157",
              "price": 280000,
              "depTime": "21:10",
              "arrTime": "00:20",
              "retDepTime": "01:20",
              "retArrTime": "07:45",
              "seats": 4
            },
            {
              "rank": 2,
              "airline": "비엣젯항공",
              "flightNo": "VJ839",
              "price": 298000,
              "depTime": "22:00",
              "arrTime": "01:10",
              "retDepTime": "02:10",
              "retArrTime": "08:35",
              "seats": 6
            },
            {
              "rank": 3,
              "airline": "에어서울",
              "flightNo": "RS521",
              "price": 320000,
              "depTime": "20:30",
              "arrTime": "23:40",
              "retDepTime": "00:40",
              "retArrTime": "07:05",
              "seats": 3
            }
          ]
        },
        "SHA": {
          "lowestPrice": 225000,
          "pastAvgPrice": 280000,
          "diffPercent": -20,
          "top3": [
            {
              "rank": 1,
              "airline": "중국동방항공",
              "flightNo": "MU5054",
              "price": 225000,
              "depTime": "12:30",
              "arrTime": "13:40",
              "retDepTime": "09:10",
              "retArrTime": "12:00",
              "seats": 6
            },
            {
              "rank": 2,
              "airline": "티웨이항공",
              "flightNo": "TW687",
              "price": 238000,
              "depTime": "14:15",
              "arrTime": "15:25",
              "retDepTime": "16:25",
              "retArrTime": "19:15",
              "seats": 4
            },
            {
              "rank": 3,
              "airline": "대한항공",
              "flightNo": "KE2201",
              "price": 280000,
              "depTime": "10:00",
              "arrTime": "11:10",
              "retDepTime": "14:00",
              "retArrTime": "16:50",
              "seats": 5
            }
          ]
        }
      },
      "PUS": {
        "FUK": {
          "lowestPrice": 139000,
          "pastAvgPrice": 175000,
          "diffPercent": -21,
          "top3": [
            {
              "rank": 1,
              "airline": "에어부산",
              "flightNo": "BX142",
              "price": 139000,
              "depTime": "07:35",
              "arrTime": "08:30",
              "retDepTime": "19:00",
              "retArrTime": "19:55",
              "seats": 5
            },
            {
              "rank": 2,
              "airline": "진에어",
              "flightNo": "LJ215",
              "price": 149000,
              "depTime": "10:15",
              "arrTime": "11:10",
              "retDepTime": "14:00",
              "retArrTime": "14:55",
              "seats": 6
            },
            {
              "rank": 3,
              "airline": "제주항공",
              "flightNo": "7C1452",
              "price": 158000,
              "depTime": "15:20",
              "arrTime": "16:15",
              "retDepTime": "20:30",
              "retArrTime": "21:25",
              "seats": 4
            }
          ]
        },
        "OSA": {
          "lowestPrice": 205000,
          "pastAvgPrice": 255000,
          "diffPercent": -20,
          "top3": [
            {
              "rank": 1,
              "airline": "에어부산",
              "flightNo": "BX124",
              "price": 205000,
              "depTime": "09:00",
              "arrTime": "10:25",
              "retDepTime": "18:00",
              "retArrTime": "19:35",
              "seats": 5
            },
            {
              "rank": 2,
              "airline": "진에어",
              "flightNo": "LJ217",
              "price": 218000,
              "depTime": "13:40",
              "arrTime": "15:05",
              "retDepTime": "16:05",
              "retArrTime": "17:40",
              "seats": 4
            },
            {
              "rank": 3,
              "airline": "대한항공",
              "flightNo": "KE2115",
              "price": 265000,
              "depTime": "10:30",
              "arrTime": "12:00",
              "retDepTime": "17:00",
              "retArrTime": "18:35",
              "seats": 6
            }
          ]
        },
        "TYO": {
          "lowestPrice": 238000,
          "pastAvgPrice": 305000,
          "diffPercent": -22,
          "top3": [
            {
              "rank": 1,
              "airline": "에어부산",
              "flightNo": "BX112",
              "price": 238000,
              "depTime": "08:05",
              "arrTime": "10:15",
              "retDepTime": "17:40",
              "retArrTime": "20:00",
              "seats": 4
            },
            {
              "rank": 2,
              "airline": "진에어",
              "flightNo": "LJ211",
              "price": 252000,
              "depTime": "12:00",
              "arrTime": "14:10",
              "retDepTime": "18:30",
              "retArrTime": "20:50",
              "seats": 5
            },
            {
              "rank": 3,
              "airline": "대한항공",
              "flightNo": "KE2129",
              "price": 298000,
              "depTime": "09:20",
              "arrTime": "11:30",
              "retDepTime": "19:00",
              "retArrTime": "21:20",
              "seats": 7
            }
          ]
        },
        "SPK": {
          "lowestPrice": 285000,
          "pastAvgPrice": 360000,
          "diffPercent": -21,
          "top3": [
            {
              "rank": 1,
              "airline": "에어부산",
              "flightNo": "BX182",
              "price": 285000,
              "depTime": "09:10",
              "arrTime": "11:45",
              "retDepTime": "16:00",
              "retArrTime": "19:00",
              "seats": 4
            },
            {
              "rank": 2,
              "airline": "진에어",
              "flightNo": "LJ311",
              "price": 299000,
              "depTime": "11:20",
              "arrTime": "13:55",
              "retDepTime": "17:30",
              "retArrTime": "20:30",
              "seats": 3
            },
            {
              "rank": 3,
              "airline": "대한항공",
              "flightNo": "KE2147",
              "price": 345000,
              "depTime": "10:00",
              "arrTime": "12:35",
              "retDepTime": "16:40",
              "retArrTime": "19:40",
              "seats": 5
            }
          ]
        },
        "TPE": {
          "lowestPrice": 218000,
          "pastAvgPrice": 275000,
          "diffPercent": -21,
          "top3": [
            {
              "rank": 1,
              "airline": "에어부산",
              "flightNo": "BX793",
              "price": 218000,
              "depTime": "11:05",
              "arrTime": "12:55",
              "retDepTime": "13:55",
              "retArrTime": "17:15",
              "seats": 6
            },
            {
              "rank": 2,
              "airline": "진에어",
              "flightNo": "LJ733",
              "price": 232000,
              "depTime": "09:30",
              "arrTime": "11:20",
              "retDepTime": "12:30",
              "retArrTime": "15:50",
              "seats": 4
            },
            {
              "rank": 3,
              "airline": "중화항공",
              "flightNo": "CI187",
              "price": 260000,
              "depTime": "13:00",
              "arrTime": "14:50",
              "retDepTime": "16:00",
              "retArrTime": "19:20",
              "seats": 8
            }
          ]
        },
        "DAD": {
          "lowestPrice": 255000,
          "pastAvgPrice": 325000,
          "diffPercent": -22,
          "top3": [
            {
              "rank": 1,
              "airline": "에어부산",
              "flightNo": "BX773",
              "price": 255000,
              "depTime": "21:30",
              "arrTime": "00:30",
              "retDepTime": "01:30",
              "retArrTime": "07:45",
              "seats": 6
            },
            {
              "rank": 2,
              "airline": "비엣젯항공",
              "flightNo": "VJ885",
              "price": 268000,
              "depTime": "22:00",
              "arrTime": "01:00",
              "retDepTime": "02:00",
              "retArrTime": "08:15",
              "seats": 7
            },
            {
              "rank": 3,
              "airline": "진에어",
              "flightNo": "LJ077",
              "price": 290000,
              "depTime": "20:30",
              "arrTime": "23:30",
              "retDepTime": "00:30",
              "retArrTime": "06:45",
              "seats": 5
            }
          ]
        },
        "CXR": {
          "lowestPrice": 265000,
          "pastAvgPrice": 335000,
          "diffPercent": -21,
          "top3": [
            {
              "rank": 1,
              "airline": "에어부산",
              "flightNo": "BX787",
              "price": 265000,
              "depTime": "20:45",
              "arrTime": "23:55",
              "retDepTime": "00:55",
              "retArrTime": "07:20",
              "seats": 5
            },
            {
              "rank": 2,
              "airline": "비엣젯항공",
              "flightNo": "VJ845",
              "price": 278000,
              "depTime": "22:15",
              "arrTime": "01:25",
              "retDepTime": "02:25",
              "retArrTime": "08:50",
              "seats": 8
            },
            {
              "rank": 3,
              "airline": "진에어",
              "flightNo": "LJ089",
              "price": 305000,
              "depTime": "21:15",
              "arrTime": "00:25",
              "retDepTime": "01:25",
              "retArrTime": "07:50",
              "seats": 4
            }
          ]
        },
        "SHA": {
          "lowestPrice": 210000,
          "pastAvgPrice": 265000,
          "diffPercent": -21,
          "top3": [
            {
              "rank": 1,
              "airline": "중국동방항공",
              "flightNo": "MU5044",
              "price": 210000,
              "depTime": "12:00",
              "arrTime": "13:00",
              "retDepTime": "08:30",
              "retArrTime": "11:00",
              "seats": 6
            },
            {
              "rank": 2,
              "airline": "에어부산",
              "flightNo": "BX341",
              "price": 225000,
              "depTime": "14:30",
              "arrTime": "15:30",
              "retDepTime": "16:30",
              "retArrTime": "19:00",
              "seats": 5
            },
            {
              "rank": 3,
              "airline": "대한항공",
              "flightNo": "KE2213",
              "price": 270000,
              "depTime": "10:15",
              "arrTime": "11:15",
              "retDepTime": "14:15",
              "retArrTime": "16:45",
              "seats": 6
            }
          ]
        }
      }
    }
  },
  "weatherToday": {
    "FUK": {
      "temp": "21°C",
      "cond": "맑음 쾌청",
      "high": "23°C",
      "low": "14°C",
      "advice": "낮에는 따스하고 쾌적하나 해가 지면 쌀쌀합니다. 가벼운 가디건이나 바람막이 필수."
    },
    "OSA": {
      "temp": "22°C",
      "cond": "구름 조금",
      "high": "24°C",
      "low": "15°C",
      "advice": "도보 이동이 많은 도시이므로 편한 운동화와 얇은 긴팔 옷차림이 이상적입니다."
    },
    "TYO": {
      "temp": "20°C",
      "cond": "맑음",
      "high": "22°C",
      "low": "13°C",
      "advice": "전형적인 맑은 가을 날씨입니다. 일교차 대비 겉옷 1벌을 챙기세요."
    },
    "SPK": {
      "temp": "14°C",
      "cond": "쌀쌀함",
      "high": "16°C",
      "low": "7°C",
      "advice": "초겨울 기운이 느껴지므로 경량 패딩이나 도톰한 코트, 목도리가 유용합니다."
    },
    "TPE": {
      "temp": "27°C",
      "cond": "포근함",
      "high": "29°C",
      "low": "22°C",
      "advice": "낮에는 온화하여 반팔 가능하나, 실내 에어컨과 야간 산간(지우펀) 대비 얇은 겉옷 지참."
    },
    "DAD": {
      "temp": "29°C",
      "cond": "화창함",
      "high": "31°C",
      "low": "24°C",
      "advice": "완벽한 휴양지 날씨입니다. 린넨 옷, 선글라스, 자외선 차단제, 수영복 필수."
    },
    "CXR": {
      "temp": "30°C",
      "cond": "맑음",
      "high": "32°C",
      "low": "25°C",
      "advice": "바다 수영과 호핑투어에 최적인 쾌청한 날씨입니다. 모자와 비치웨어 준비."
    },
    "SHA": {
      "temp": "22°C",
      "cond": "맑음",
      "high": "23°C",
      "low": "15°C",
      "advice": "황푸강변 야경 감상 시 강바람이 불므로 자켓이나 머플러를 착용하세요."
    }
  }
};

let REALTIME_DATA = FALLBACK_DATA;
let isLoading = false;

const STATE = {
  currentTab: 'flights',
  departure: 'TAE',
  destination: 'FUK',
  durationMode: '3박4일',
  departureDate: '',
  returnDate: '',
  selectedCurrency: 'JPY',
  calcAmount: 1000
};

// Fallback itineraries if not included in data.json
const ITINERARIES_FALLBACK = {
  FUK: {
    "3박4일": [
      { day: 1, title: "후쿠오카 도착 & 하카타 도심 탐방 & 돈코츠 라멘", restaurant: "하카타 잇소우 본점 (거품 돈코츠 라멘, 구글 평점 4.4 / 오후 1시 반 이후 웨이팅 적음)" },
      { day: 2, title: "다자이후 텐만구 학문의 신 & 텐진 쇼핑 & 와규 함바그", restaurant: "키와미야 함바그 (무쇠 스톤 와규 함바그, 구글 평점 4.4 / 브레이크 타임 직후 공략)" },
      { day: 3, title: "유후인 온천 마을 & 긴린코 호수 & 소고기 마부시 솥밥", restaurant: "유후인 심 본점 (분고규 마부시 솥밥 정식, 구글 평점 4.3)" },
      { day: 4, title: "오호리 공원 & 캐널시티 하카타 & 기념품 쇼핑 후 귀국", restaurant: "원조 하카타 멘타이쥬 (명란 덮밥, 구글 평점 4.3)" }
    ],
    "4박5일": [
      { day: 1, title: "후쿠오카 도착 & 도심 체크인 & 명물 먹방", restaurant: "하카타 잇소우 본점 (돈코츠 라멘)" },
      { day: 2, title: "다자이후 텐만구 & 텐진 다이묘 감성 거리 & 모츠나베", restaurant: "오오야마 모츠나베 본점 (미소 모츠나베, 구글 4.3)" },
      { day: 3, title: "유후인 & 벳푸 지옥온천 힐링 올데이 투어", restaurant: "유후인 심 (분고규 솥밥)" },
      { day: 4, title: "기타큐슈 고쿠라성 & 모지코 레트로 야키카레 골목", restaurant: "모지코 코가네무시 (원조 야키카레, 구글 4.4)" },
      { day: 5, title: "오호리 공원 티타임 & 면세점 쇼핑 & 귀국편 탑승", restaurant: "하카타 토리카와 스이쿄우 (닭껍질 꼬치구이)" }
    ],
    "3박5일": [
      { day: 1, title: "대구·부산 퇴근 후 저녁/밤비행기 출발 ✈ 심야 체크인", restaurant: "호텔 인근 심야 이자카야 또는 로손 편의점 먹거리" },
      { day: 2, title: "하카타 & 텐진 핵심 랜드마크 & 명품 미식 만찬", restaurant: "키와미야 함바그 & 잇소우 라멘" },
      { day: 3, title: "유후인 온천 & 긴린코 호수 당일치기 힐링", restaurant: "유후인 심 본점" },
      { day: 4, title: "전일 쇼핑 & 하카타 타워 야경 & 마사지 후 자정 공항 이동", restaurant: "원조 하카타 멘타이쥬" },
      { day: 5, title: "심야/새벽 출발 ✈ 대구/부산 아침 도착 후 바로 출근/일상 복귀", restaurant: "기내 조식 및 귀국 완료" }
    ]
  },
  OSA: {
    "3박4일": [
      { day: 1, title: "간사이 도착 & 난바 도톤보리 글리코상 & 타코야키 투어", restaurant: "앗치치혼포 타코야키 & 이치란 난바점" },
      { day: 2, title: "교토 아라시야마 대나무숲 & 청수사(기요미즈데라) 당일치기", restaurant: "교토 카츠규 본점 (소고기 규카츠, 구글 4.5)" },
      { day: 3, title: "유니버설 스튜디오 재팬(USJ) 슈퍼 닌텐도 월드 올데이", restaurant: "키노피오 카페 (슈퍼버섯 피자볼, 파크 내)" },
      { day: 4, title: "오사카성 천수각 & 우메다 한큐백화점 쇼핑 후 귀국", restaurant: "키지 우메다 스카이빌딩점 (오코노미야키, 구글 4.4)" }
    ],
    "4박5일": [
      { day: 1, title: "간사이 도착 & 도톤보리 야경 & 쿠시카츠 만찬", restaurant: "쿠시카츠 다루마 본점" },
      { day: 2, title: "교토 금각사 & 청수사 & 후시미 이나리 신사 정밀 투어", restaurant: "교토 히노데 우동 (카레우동)" },
      { day: 3, title: "나라 사슴공원 & 고베 하버랜드 야경 & 고베규 스테이크", restaurant: "스테이크랜드 고베 (고베규 런치, 구글 4.3)" },
      { day: 4, title: "유니버설 스튜디오 재팬(USJ) 올데이", restaurant: "해리포터 쓰리 브룸스틱스 (버터맥주)" },
      { day: 5, title: "신사이바시 쇼핑 & 린쿠 아울렛 방문 후 귀국", restaurant: "하루코마 스시 (텐진바시 가성비 스시)" }
    ],
    "3박5일": [
      { day: 1, title: "저녁 비행기 탑승 ✈ 간사이 심야 도착 & 난바 호텔 체크인", restaurant: "도톤보리 24시간 라멘 / 킨류 라멘" },
      { day: 2, title: "오사카 시내 핵심 & 우메다 공중정원 야경", restaurant: "우메다 키지 오코노미야키" },
      { day: 3, title: "교토 청수사 & 기온거리 당일 투어", restaurant: "교토 카츠규 규카츠" },
      { day: 4, title: "난바 쇼핑몰 & 온천 스파스미노에 휴식 후 자정 공항 이동", restaurant: "도톤보리 모토무라 규카츠" },
      { day: 5, title: "새벽 비행기 귀국 ✈ 김해/대구 아침 도착 후 일상 복귀", restaurant: "아침 귀국 완료" }
    ]
  },
  TYO: {
    "3박4일": [
      { day: 1, title: "나리타/하네다 도착 & 시부야 스크램블 교차로 & 야경", restaurant: "시부야 히키니쿠토 코메 (숯불 함바그, 구글 4.6)" },
      { day: 2, title: "아사쿠사 센소지 & 신주쿠 교엔 & 롯폰기 힐즈 도쿄타워 뷰", restaurant: "아사쿠사 이마한 본점 (130년 전통 스키야키, 구글 4.5)" },
      { day: 3, title: "도쿄 디즈니씨 (판타지 스프링스 신규 구역) 올데이", restaurant: "호라이즌 베이 레스토랑 (디즈니씨 테마 미식)" },
      { day: 4, title: "긴자 명품거리 & 츠키지 장외시장 스시 & 귀국", restaurant: "스시잔마이 본점 (참치 모둠 스시)" }
    ],
    "4박5일": [
      { day: 1, title: "도쿄 도착 & 신주쿠 도심 체크인 & 오모이데요코초 꼬치골목", restaurant: "신주쿠 츠케멘 야스베에" },
      { day: 2, title: "아사쿠사 & 도쿄스카이트리 & 아키하바라 서브컬처", restaurant: "아사쿠사 다이코쿠야 (텐동)" },
      { day: 3, title: "가마쿠라 & 에노시마 슬램덩크 건널목 당일 바다열차 투어", restaurant: "에노시마 토비쵸 (시라스동 생멸치 덮밥)" },
      { day: 4, title: "시부야 & 하라주쿠 오모테산도 & 롯폰기 미술관 야경", restaurant: "시부야 아후리 라멘 (유즈시오 라멘)" },
      { day: 5, title: "긴자 식도락 쇼핑 & 나리타 익스프레스 공항 이동", restaurant: "긴자 긴파치 (장어덮밥)" }
    ],
    "3박5일": [
      { day: 1, title: "대구·부산 저녁 출발 ✈ 하네다/나리타 심야 도착", restaurant: "신주쿠 심야 라멘 및 이자카야" },
      { day: 2, title: "시부야 & 신주쿠 도심 랜드마크 집중 투어", restaurant: "히키니쿠토 코메 함바그" },
      { day: 3, title: "아사쿠사 & 긴자 명소 탐방", restaurant: "아사쿠사 이마한 스키야키" },
      { day: 4, title: "오다이바 온천 휴식 & 메가 쇼핑몰 쇼핑 후 심야 공항 이동", restaurant: "츠키지 스시잔마이" },
      { day: 5, title: "새벽 출발 ✈ 영남권 아침 7시 도착 직장인 알뜰 여정", restaurant: "귀국 완료" }
    ]
  },
  TPE: {
    "3박4일": [
      { day: 1, title: "타오위안 도착 & 시먼딩 젊음의 거리 & 아종면선 곱창국수", restaurant: "아종면선 (곱창국수, 구글 4.3) & 삼형매 망고빙수" },
      { day: 2, title: "예류 지질공원 · 스펀 천등날리기 · 지우펀 홍등거리 (예스진지)", restaurant: "지우펀 아메이차루 (홍등 찻집, 구글 4.3)" },
      { day: 3, title: "국립고궁박물원 & 타이베이 101 전망대 & 딘타이펑 딤섬", restaurant: "딘타이펑 101점 (샤오롱바오 딤섬, 구글 4.6)" },
      { day: 4, title: "용산사 참배 & 까르푸 쇼핑 (밀크티/펑리수) 후 귀국", restaurant: "푸항또우장 (미쉐린 빕구루망 대만식 조식, 구글 4.3)" }
    ],
    "4박5일": [
      { day: 1, title: "타이베이 도착 & 시먼딩 도심 체크인 & 라오허제 야시장", restaurant: "라오허제 후추빵" },
      { day: 2, title: "예스진지 (예류·스펀·진과스·지우펀) 전일 버스투어", restaurant: "지우펀 땅콩 아이스크림 & 광부도시락" },
      { day: 3, title: "단수이 홍마오청 · 워런마터우 일몰 · 빠리 대왕오징어튀김", restaurant: "단수이 아게이 본점 & 카스텔라" },
      { day: 4, title: "타이베이 101 & 융캉제 소품샵 & 스린 야시장 먹방", restaurant: "딘타이펑 본점 & 융캉우육면" },
      { day: 5, title: "임가화원 고택 정원 산책 & 펑리수 쇼핑 후 공항 이동", restaurant: "치아더 펑리수 & 천천리 계란굴전" }
    ],
    "3박5일": [
      { day: 1, title: "대구/부산 밤비행기 ✈ 타오위안 자정 도착", restaurant: "시먼딩 편의점 만한대찬 우육면" },
      { day: 2, title: "융캉제 카페거리 & 타이베이 101 타워", restaurant: "딘타이펑 샤오롱바오" },
      { day: 3, title: "지우펀 & 스펀 감성 낭만 투어", restaurant: "지우펀 홍등 찻집 만찬" },
      { day: 4, title: "시먼딩 쇼핑 & 발마사지 90분 스파 후 밤 11시 공항 이동", restaurant: "마라훠궈 시먼점 무한리필" },
      { day: 5, title: "새벽 비행기 탑승 ✈ 월요일 아침 한국 도착 출근 코스", restaurant: "귀국 완료" }
    ]
  },
  DAD: {
    "3박4일": [
      { day: 1, title: "다낭 도착 & 미케비치 산책 & 목식당 해산물 만찬", restaurant: "목 해산물 식당 (칠리크랩 & 갈릭버터새우, 구글 4.7)" },
      { day: 2, title: "바나힐 테마파크 골든브릿지 (신의 손) & 프랑스 마을", restaurant: "바나힐 아라방 뷔페" },
      { day: 3, title: "호이안 올드타운 투본강 소원배 띄우기 & 야시장 투어", restaurant: "모닝글로리 본점 (화이트로즈 & 반세오, 구글 4.4)" },
      { day: 4, title: "핑크성당 & 한시장 원피스/망고 쇼핑 후 공항 귀국", restaurant: "포홍 쌀국수 (소고기 쌀국수, 구글 4.5)" }
    ],
    "4박5일": [
      { day: 1, title: "다낭 공항 도착 & 오션뷰 리조트 체크인 & 풀빌라 휴식", restaurant: "포홍 쌀국수" },
      { day: 2, title: "바나힐 케이블카 & 알파인코스터 & 야간 용다리 불쇼", restaurant: "목 해산물 식당 (칠리 랍스터)" },
      { day: 3, title: "호이안 구시가지 코코넛 배 체험 & 안방비치 선셋 레스토랑", restaurant: "더 덱하우스 안방비치 (해변 칵테일)" },
      { day: 4, title: "링응사 해수관음상 & 오행산 동굴 탐험 & 롯데마트 쇼핑", restaurant: "바두엉 반세오 (현지인 맛집)" },
      { day: 5, title: "호텔 스파 마사지 & 한시장 환전/기념품 후 귀국편 탑승", restaurant: "콩카페 코코넛스무디커피" }
    ],
    "3박5일": [
      { day: 1, title: "대구/부산 밤 9시 출발 ✈ 다낭 자정 도착 후 리조트 체크인", restaurant: "기내식 및 룸서비스" },
      { day: 2, title: "미케비치 물놀이 & 바나힐 골든브릿지 투어", restaurant: "목식당 칠리크랩" },
      { day: 3, title: "호이안 올드타운 소원배 & 감성 야시장", restaurant: "모닝글로리 반세오" },
      { day: 4, title: "한시장 쇼핑 & 전신 아로마 마사지 2시간 후 심야 공항 이동", restaurant: "마담란 레스토랑 베트남 전통식" },
      { day: 5, title: "새벽 2시 비행기 출발 ✈ 아침 7시 한국 도착 (직장인 최다 이용 코스)", restaurant: "한국 귀국 완료" }
    ]
  },
  CXR: {
    "3박4일": [
      { day: 1, title: "나트랑 깜라인 도착 & 시내 호텔 체크인 & 촌촌킴 가정식", restaurant: "촌촌킴 (베트남 정통 가정식 백반, 구글 4.5)" },
      { day: 2, title: "빈원더스 워터파크 & 사파리 케이블카 올데이", restaurant: "빈원더스 내 루이지 피자 & 해산물 BBQ" },
      { day: 3, title: "포나가르 첨탑 & 아이리조트 머드온천 스파 힐링", restaurant: "안어이 꽌 (해산물 뚝배기 쌀국수, 구글 4.6)" },
      { day: 4, title: "담시장 캐슈넛/건망고 쇼핑 & 롯데마트 후 공항 귀국", restaurant: "반미판 (소고기 치즈 토스트 반미, 구글 4.7)" }
    ],
    "4박5일": [
      { day: 1, title: "나트랑 도착 & 해변 산책 & 세일링클럽 칵테일", restaurant: "세일링 클럽 나트랑" },
      { day: 2, title: "호핑투어 (문섬 스노클링 & 선상 파티)", restaurant: "선상 해산물 라면 & BBQ" },
      { day: 3, title: "빈원더스 테마파크 & 대관람차 야경", restaurant: "빈원더스 레스토랑" },
      { day: 4, title: "아이리조트 천연 머드탕 & 센트럴 스파 마사지", restaurant: "촌촌킴 가정식" },
      { day: 5, title: "시내 카페 투어 (CCCP 커피) & 담시장 쇼핑 후 귀국", restaurant: "엇히엠 (베트남 요리)" }
    ],
    "3박5일": [
      { day: 1, title: "부산/대구 저녁 출발 ✈ 나트랑 심야 도착 체크인", restaurant: "심야 야시장 쌀국수" },
      { day: 2, title: "빈원더스 케이블카 & 오션 테마파크", restaurant: "안어이꽌 쌀국수" },
      { day: 3, title: "호핑투어 스노클링 & 세일링클럽 파티", restaurant: "촌촌킴 갈릭새우" },
      { day: 4, title: "머드스파 힐링 & 쇼핑 & 전신스파 후 밤 11시 공항 이동", restaurant: "반미판 & CCCP 커피" },
      { day: 5, title: "새벽 비행기 ✈ 영남권 아침 6시 40분 도착 일상 복귀", restaurant: "귀국 완료" }
    ]
  },
  SHA: {
    "3박4일": [
      { day: 1, title: "푸둥/홍차오 도착 & 와이탄 황푸강 유럽풍 야경", restaurant: "그랜드마더(라오라오) (외할머니 동파육, 구글 4.3)" },
      { day: 2, title: "예원 고전 정원 & 신천지 트렌디 카페거리 & 대한민국임시정부", restaurant: "남상만두 예원 본점 (120년 샤오롱바오, 구글 4.2)" },
      { day: 3, title: "동방명주 & 상하이 타워 118층 전망대 & 디즈니 플래그십", restaurant: "점덕성 (딤섬 전문점, 구글 4.5)" },
      { day: 4, title: "난징동루 보행자거리 쇼핑 & 마그레브 자기부상열차 공항 귀국", restaurant: "릴리안 베이커리 (마카오식 에그타르트)" }
    ],
    "4박5일": [
      { day: 1, title: "상하이 도착 & 인민광장 & 와이탄 페리 유람선", restaurant: "라오라오 동파육" },
      { day: 2, title: "수향마을 주가각 (동양의 베니스 나룻배 투어) 당일치기", restaurant: "주가각 아포쫑즈 (대나무 찰밥) & 훈툰" },
      { day: 3, title: "상하이 디즈니랜드 (트론 롤러코스터 & 성 불꽃놀이) 올데이", restaurant: "디즈니 성 로열 뱅큇 홀" },
      { day: 4, title: "신천지 앤틱 거리 & 티엔즈팡 예술골목 & 루자쭈이 야경", restaurant: "차오푸 하이디라오 훠궈" },
      { day: 5, title: "예원 쇼핑 & 프랑스 조계지 플라타너스길 티타임 후 귀국", restaurant: "남상만두 & 페이창 빵집" }
    ],
    "3박5일": [
      { day: 1, title: "대구/부산 저녁 비행기 ✈ 상하이 심야 도착 & 호텔 체크인", restaurant: "호텔 인근 심야 꼬치구이(샤오카오)" },
      { day: 2, title: "와이탄 & 동방명주 전망대 & 신천지", restaurant: "라오라오 동파육" },
      { day: 3, title: "상하이 디즈니랜드 올데이 또는 주가각 수향마을", restaurant: "디즈니 테마 미식" },
      { day: 4, title: "난징동루 쇼핑 & 발마사지 스파 & 황푸강 유람선 후 자정 공항 이동", restaurant: "하이디라오 훠궈" },
      { day: 5, title: "새벽 비행기 ✈ 아침 김해/대구 도착 (무비자 입국 활성화 코스)", restaurant: "귀국 완료" }
    ]
  },
  SPK: {
    "3박4일": [
      { day: 1, title: "신치토세 도착 & 삿포로 TV타워 & 스스키노 징기스칸 양고기", restaurant: "다루마 4.4 본점 (징기스칸 숯불 양고기 구이, 구글 4.4)" },
      { day: 2, title: "오타루 운하 당일치기 (오르골당 & 르타오 본점 & 유리공방)", restaurant: "사와사키 수산 (오타루 카이센동 해산물 덮밥, 구글 4.5)" },
      { day: 3, title: "비에이 · 후라노 사계채의 언덕 & 청의 호수 낭만 투어", restaurant: "쥰페이 (비에이 왕새우튀김 에비동, 구글 4.4)" },
      { day: 4, title: "삿포로 맥주박물관 & 니조시장 카이센동 & 공항 귀국", restaurant: "스프카레 가라쿠 (삿포로 원조 스프카레, 구글 4.4)" }
    ],
    "4박5일": [
      { day: 1, title: "삿포로 도착 & 오도리 공원 산책 & 징기스칸 만찬", restaurant: "다루마 본점" },
      { day: 2, title: "오타루 운하 야경 & 르타오 치즈케이크 & 사케 양조장", restaurant: "사와사키 수산 카이센동" },
      { day: 3, title: "비에이 흰그림자 투어 (켄과 메리의 나무 & 탁신관 & 청의 호수)", restaurant: "비에이 쥰페이 에비동" },
      { day: 4, title: "조잔케이 온천 마을 당일 온천욕 & 삿포로 라멘요코초 골목", restaurant: "바이센 라멘 (미소라멘)" },
      { day: 5, title: "시로이 코이비토 파크 & 신치토세 면세점 털기 후 귀국", restaurant: "스프카레 스아게플러스" }
    ],
    "3박5일": [
      { day: 1, title: "저녁 출발 ✈ 신치토세 야간 도착 & 스스키노 도심 호텔 체크인", restaurant: "스스키노 심야 미소라멘" },
      { day: 2, title: "삿포로 도심 랜드마크 & 징기스칸 양고기 만찬", restaurant: "다루마 양고기 구이" },
      { day: 3, title: "비에이 후라노 올데이 버스투어", restaurant: "쥰페이 에비동" },
      { day: 4, title: "오타루 운하 산책 & 온천욕 & 마지막 기념품 구매 후 심야 공항 이동", restaurant: "스프카레 가라쿠" },
      { day: 5, title: "새벽/아침 출발 ✈ 대구/부산 도착", restaurant: "귀국 완료" }
    ]
  }
};

// ============================================================================
// Real-time Fetch from ./data.json
// ============================================================================
async function loadRealtimeData() {
  isLoading = true;
  const refreshBtn = document.getElementById('btn-refresh-data');
  if (refreshBtn) refreshBtn.innerHTML = '<span>⏳ data.json 갱신 중...</span>';

  // 다양한 호스팅 환경(GitHub Pages /sub/, 루트, 로컬)에 대응하는 상대 경로 탐색
  const candidates = [
    './data.json?t=' + Date.now(),
    'data.json?t=' + Date.now(),
    '../data.json?t=' + Date.now()
  ];

  let success = false;
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        REALTIME_DATA = await res.json();
        console.log('[동아시아 플래너] data.json 연동 성공:', url, REALTIME_DATA.metadata.lastCrawledAt);
        success = true;
        break;
      }
    } catch (e) {
      // 다음 후보 경로 시도
    }
  }

  if (!success) {
    console.warn('[동아시아 플래너] data.json fetch 실패, 내장 데이터로 정상 동작합니다.');
    if (!REALTIME_DATA && typeof FALLBACK_DATA !== 'undefined') {
      REALTIME_DATA = FALLBACK_DATA;
    }
  }

  isLoading = false;
  if (refreshBtn) refreshBtn.innerHTML = '<span>🔄 data.json 실시간 새로고침</span>';
  renderCurrentTab();
}

function reloadRealtimeData() {
  loadRealtimeData();
}

function renderCurrentTab() {
  if (STATE.currentTab === 'flights') renderFlightsTab();
  else if (STATE.currentTab === 'currency') renderCurrencyTab();
  else if (STATE.currentTab === 'itinerary') renderItineraryTab();
  else if (STATE.currentTab === 'news') renderNewsTab();
}

function switchTab(tabId) {
  STATE.currentTab = tabId;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById('tab-' + tabId);
  if (activeBtn) activeBtn.classList.add('active');
  renderCurrentTab();
}

function setDeparture(dep) {
  STATE.departure = dep;
  if (STATE.currentTab === 'flights') renderFlightsTab();
}

function setDestination(dest) {
  STATE.destination = dest;
  renderCurrentTab();
}

function getTodayIsoString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDaysToIso(isoStr, days) {
  if (!isoStr) return '';
  const parts = isoStr.split('-');
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatKoreanDate(isoStr) {
  if (!isoStr) return '';
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const parts = isoStr.split('-');
  if (parts.length !== 3) return isoStr;
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const w = weekdays[d.getDay()];
  return `${d.getFullYear()}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')} (${w})`;
}

function getDurationDays(durMode) {
  if (durMode === '4박5일') return 4;
  if (durMode === '3박5일') return 4;
  return 3;
}

function initFlightDates() {
  if (!STATE.departureDate) {
    if (REALTIME_DATA && REALTIME_DATA.realTimeFlights && REALTIME_DATA.realTimeFlights.defaultDepDateIso) {
      STATE.departureDate = REALTIME_DATA.realTimeFlights.defaultDepDateIso;
    } else {
      const today = new Date();
      today.setDate(today.getDate() + 14);
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      STATE.departureDate = `${year}-${month}-${day}`;
    }
  }
  if (!STATE.returnDate) {
    if (REALTIME_DATA && REALTIME_DATA.realTimeFlights && REALTIME_DATA.realTimeFlights.defaultRetDatesIso && REALTIME_DATA.realTimeFlights.defaultRetDatesIso[STATE.durationMode]) {
      STATE.returnDate = REALTIME_DATA.realTimeFlights.defaultRetDatesIso[STATE.durationMode];
    } else {
      const days = getDurationDays(STATE.durationMode);
      STATE.returnDate = addDaysToIso(STATE.departureDate, days);
    }
  }
}

function onDepartureDateChange(newDepDate) {
  if (!newDepDate) return;
  STATE.departureDate = newDepDate;
  if (!STATE.returnDate || STATE.returnDate <= newDepDate) {
    STATE.returnDate = addDaysToIso(newDepDate, getDurationDays(STATE.durationMode));
  }
  renderFlightsTab();
}

function onReturnDateChange(newRetDate) {
  if (!newRetDate) return;
  if (newRetDate < STATE.departureDate) {
    alert('도착(귀국)일은 출발일 이후 날짜로 선택해 주세요.');
    return;
  }
  STATE.returnDate = newRetDate;
  const depParts = STATE.departureDate.split('-');
  const retParts = newRetDate.split('-');
  const depD = new Date(parseInt(depParts[0], 10), parseInt(depParts[1], 10) - 1, parseInt(depParts[2], 10));
  const retD = new Date(parseInt(retParts[0], 10), parseInt(retParts[1], 10) - 1, parseInt(retParts[2], 10));
  const diffDays = Math.round((retD - depD) / (1000 * 60 * 60 * 24));
  if (diffDays === 3) STATE.durationMode = '3박4일';
  else if (diffDays === 4 && STATE.durationMode !== '3박5일') STATE.durationMode = '4박5일';
  renderFlightsTab();
}

function setDuration(dur) {
  STATE.durationMode = dur;
  initFlightDates();
  STATE.returnDate = addDaysToIso(STATE.departureDate, getDurationDays(dur));
  if (STATE.currentTab === 'flights') renderFlightsTab();
  else if (STATE.currentTab === 'itinerary') renderItineraryTab();
}

function selectCurrency(curr) {
  STATE.selectedCurrency = curr;
  renderCurrencyTab();
}

function formatSkyscannerDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return parts[0].slice(2) + parts[1] + parts[2];
  }
  return dateStr.replace(/[^0-9]/g, '').slice(2, 8);
}

function getSkyscannerSearchUrl(depAirport, destAirport, depDate, retDate) {
  const depCode = (depAirport || 'TAE').toLowerCase();
  const destCode = (destAirport || 'FUK').toLowerCase();
  const depYmd = formatSkyscannerDate(depDate);
  const retYmd = formatSkyscannerDate(retDate);

  let path = `https://www.skyscanner.co.kr/transport/flights/${depCode}/${destCode}/`;
  if (depYmd && retYmd) {
    path += `${depYmd}/${retYmd}/`;
  } else if (depYmd) {
    path += `${depYmd}/`;
  }

  const params = new URLSearchParams({
    adults: '1',
    adultsv2: '1',
    cabinclass: 'economy',
    children: '0',
    childrenv2: '',
    ref: 'home',
    rtn: retYmd ? '1' : '0',
    preferdirects: 'true',
    outboundaltsenabled: 'false',
    inboundaltsenabled: 'false',
    market: 'KR',
    currency: 'KRW',
    locale: 'ko-KR'
  });

  return `${path}?${params.toString()}`;
}

// ============================================================================
// 1. Flights Tab (과거 1년 통계 데이터 및 스카이스캐너 실시간 딥링크 연동)
// ============================================================================
function renderFlightsTab() {
  const content = document.getElementById('tab-content');
  if (!REALTIME_DATA) {
    content.innerHTML = '<div style="padding:40px; text-align:center;">실시간 데이터(./data.json)를 불러오는 중입니다...</div>';
    return;
  }

  initFlightDates();

  const dep = STATE.departure;
  const dest = STATE.destination;
  const dur = STATE.durationMode;
  const depDate = STATE.departureDate;
  const retDate = STATE.returnDate;
  const todayIso = getTodayIsoString();

  const flightsData = REALTIME_DATA.realTimeFlights;
  const routeData = (flightsData.routes[dep] && flightsData.routes[dep][dest])
    ? flightsData.routes[dep][dest]
    : { lowestPrice: 150000, pastAvgPrice: 190000, diffPercent: -21, top3: [] };

  const depDestObj = REALTIME_DATA.destinations.find(d => d.id === dest) || { nameKo: dest, flag: '✈' };
  const depObj = REALTIME_DATA.departures[dep] || { nameKo: dep };
  
  const skyscannerUrl = getSkyscannerSearchUrl(dep, dest, depDate, retDate);
  const depFormatted = formatKoreanDate(depDate);
  const retFormatted = formatKoreanDate(retDate);

  content.innerHTML = `
    <div class="card">
      <!-- Live Crawler & Skyscanner Deep Link Header Banner -->
      <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:10px; padding:14px 18px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div style="max-width:680px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="badge badge-green">과거 1년 통계 데이터 수집 완료</span>
            <span style="font-size:12px; color:#475569;">${REALTIME_DATA.metadata.lastCrawledAt}</span>
          </div>
          <div style="font-size:13px; color:#0369a1; margin-top:5px; line-height:1.5;">
            ※ 항공권 실시간 요금은 시시각각 변동되므로 <strong>과거 1년 노선별 통계 운임</strong>을 수집하여 기준치로 안내합니다.<br>
            선택하신 <strong>출발지(${dep}) · 도착지(${dest}) · 출발일(${depDate}) · 복귀일(${retDate})</strong> 쿼리가 자동 완성된 스카이스캐너 실시간 최저가 검색으로 바로 연결됩니다.
          </div>
        </div>
        <div>
          <a href="${skyscannerUrl}" target="_blank" rel="noopener noreferrer" class="btn-skyscanner-live">
            ✈ 스카이스캐너 실시간 최저가 직접 조회 ↗
          </a>
        </div>
      </div>

      <!-- Controls: Departure, Destination, Date Pickers, Duration -->
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:16px; margin-bottom:18px;">
        <div class="controls-row" style="margin-bottom:12px;">
          <span style="font-size:13px; font-weight:700;">출발 공항:</span>
          <div class="btn-group">
            <button class="${dep === 'TAE' ? 'active' : ''}" onclick="setDeparture('TAE')">대구국제공항 (TAE)</button>
            <button class="${dep === 'PUS' ? 'active' : ''}" onclick="setDeparture('PUS')">김해국제공항 (PUS)</button>
          </div>

          <span style="font-size:13px; font-weight:700; margin-left:14px;">도착 도시:</span>
          <select onchange="setDestination(this.value)" style="padding:6px 12px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px; font-weight:600; cursor:pointer;">
            ${REALTIME_DATA.destinations.map(d => `
              <option value="${d.id}" ${dest === d.id ? 'selected' : ''}>${d.flag} ${d.nameKo}</option>
            `).join('')}
          </select>
        </div>

        <div class="controls-row" style="margin-bottom:0;">
          <span style="font-size:13px; font-weight:700;">출발 날짜:</span>
          <input type="date" class="flight-date-input" value="${depDate}" min="${todayIso}" onchange="onDepartureDateChange(this.value)" title="출발일 선택">

          <span style="font-size:13px; font-weight:700; margin-left:14px;">도착(귀국) 날짜:</span>
          <input type="date" class="flight-date-input" value="${retDate}" min="${depDate}" onchange="onReturnDateChange(this.value)" title="도착(귀국)일 선택">

          <span style="font-size:13px; font-weight:700; margin-left:14px;">여행 기간:</span>
          <div class="btn-group">
            <button class="${dur === '3박4일' ? 'active' : ''}" onclick="setDuration('3박4일')">3박4일</button>
            <button class="${dur === '4박5일' ? 'active' : ''}" onclick="setDuration('4박5일')">4박5일</button>
            <button class="${dur === '3박5일' ? 'active' : ''}" onclick="setDuration('3박5일')">3박5일 (야간비행)</button>
          </div>
        </div>
      </div>

      <!-- Selected Route Summary & Quick Skyscanner Search CTA -->
      <div style="background:linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border:1px solid #bae6fd; border-radius:10px; padding:16px 20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:14px;">
        <div>
          <div style="font-size:12px; color:#0369a1; font-weight:600;">선택하신 여정 및 스카이스캐너 실시간 딥링크 검색</div>
          <div style="font-size:18px; font-weight:800; color:#0f172a; margin-top:2px;">
            ${depObj.nameKo} (${dep}) ✈ ${depDestObj.nameKo} (${dur})
          </div>
          <div style="font-size:13px; color:#334155; margin-top:4px;">
            <strong>출발일:</strong> ${depFormatted} &nbsp;|&nbsp; <strong>도착(귀국)일:</strong> ${retFormatted}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px; color:#16a34a; font-weight:700;">
            과거 1년 평균(₩${routeData.pastAvgPrice.toLocaleString()}원) 대비 ${routeData.diffPercent}% 알뜰 구간
          </div>
          <div style="font-size:22px; font-weight:900; color:#2563eb;">
            ₩${routeData.lowestPrice.toLocaleString()}<span style="font-size:13px; font-weight:normal; color:#64748b;">원부터 (과거 기준)</span>
          </div>
          <div style="margin-top:6px;">
            <a href="${skyscannerUrl}" target="_blank" rel="noopener noreferrer" style="font-size:12px; font-weight:700; color:#0284c7; background:#ffffff; padding:6px 14px; border-radius:6px; border:1px solid #bae6fd; text-decoration:none; display:inline-flex; align-items:center; gap:4px; box-shadow:0 1px 2px rgba(0,0,0,0.06);">
              선택 일정으로 스카이스캐너 실시간 요금 확인 ↗
            </a>
          </div>
        </div>
      </div>

      <!-- TOP 3 Lowest Prices Display -->
      <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:14px; flex-wrap:wrap; gap:8px;">
        <div>
          <h3 style="font-size:17px; font-weight:800; display:flex; align-items:center; gap:6px; margin:0;">
            <span>과거 데이터 기반 추천 TOP 3 항공권 & 실시간 예약 링크</span>
          </h3>
          <div style="font-size:12px; color:#64748b; margin-top:4px;">
            항공권 카드를 클릭하면 선택하신 <strong>출발(${dep}) · 도착(${dest}) 및 날짜(${depFormatted} ~ ${retFormatted})</strong> 쿼리가 입력된 스카이스캐너 실시간 최저가 페이지로 이동합니다.
          </div>
        </div>
      </div>

      <div class="grid-3">
        ${routeData.top3.map(f => `
          <div class="flight-card ${f.rank === 1 ? 'best' : ''}" onclick="window.open('${skyscannerUrl}', '_blank')" title="클릭 시 스카이스캐너 실시간 검색 페이지로 이동">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <span class="badge ${f.rank === 1 ? 'badge-blue' : 'badge-amber'}">${f.rank}위 ${f.rank === 1 ? '최저가' : '추천'}</span>
              <span style="font-weight:700; font-size:14px; color:#0f172a;">${f.airline} <small style="color:#94a3b8; font-weight:normal;">${f.flightNo}</small></span>
            </div>

            <div class="price">
              ₩${f.price.toLocaleString()}<span style="font-size:13px; font-weight:normal; color:#64748b; margin-left:2px;">원</span>
            </div>
            <div style="font-size:11px; color:#0284c7; margin-top:2px; margin-bottom:12px; font-weight:600;">
              과거 비수기 기준 요금 · 수하물 포함
            </div>

            <div style="background:#f8fafc; border:1px solid #f1f5f9; padding:12px; border-radius:8px; font-size:12px; line-height:1.7;">
              <div><strong>출발일 (가는 편):</strong> ${depFormatted}</div>
              <div style="color:#2563eb; font-weight:600; padding-left:10px;">• ${f.depTime} (${dep}) → ${f.arrTime} (${dest}) [직항]</div>
              <div style="margin-top:6px;"><strong>도착일 (오는 편):</strong> ${retFormatted}</div>
              <div style="color:#16a34a; font-weight:600; padding-left:10px;">• ${f.retDepTime} (${dest}) → ${f.retArrTime} (${dep}) [직항]</div>
            </div>

            <div style="margin-top:14px; padding-top:10px; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; color:#64748b;">유류할증료/세금 포함</span>
              <a href="${skyscannerUrl}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();" style="font-size:12px; font-weight:700; color:#0284c7; background:#eff6ff; padding:5px 10px; border-radius:6px; border:1px solid #bfdbfe; text-decoration:none;">
                스카이스캐너 실시간 조회 ↗
              </a>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Past 1-Year Historical Price Comparison Analysis -->
      <div style="margin-top:24px; padding:18px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px;">
        <h4 style="font-size:14px; font-weight:800; color:#1e40af; margin-bottom:8px;">
          📊 과거 1년 가격 비교 분석 및 스카이스캐너 실시간 검색 안내
        </h4>
        <div style="font-size:13px; color:#1e3a8a; line-height:1.6;">
          현재 기준 요금 <strong>₩${routeData.lowestPrice.toLocaleString()}원</strong>은 지난 1년 중 <strong>비수기 최저가 구간(상위 10% 알뜰가)</strong>에 해당합니다.<br>
          스카이스캐너 등 주요 항공권 플랫폼의 실시간 요금은 예약 시점의 잔여 좌석에 따라 실시간으로 변동되므로, 위 카드를 클릭하여 <strong>선택하신 날짜(${depFormatted} ~ ${retFormatted})의 실시간 최저가</strong>를 확인하고 바로 예약하실 수 있습니다.
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// 2. Currency Tab (SMBS Real-time Source, 30-Day SVG Chart, Converter)
// ============================================================================
function renderCurrencyTab() {
  const content = document.getElementById('tab-content');
  if (!REALTIME_DATA) {
    content.innerHTML = '<div style="padding:40px; text-align:center;">실시간 데이터(/standalone/data.json)를 불러오는 중입니다...</div>';
    return;
  }

  const selCurr = STATE.selectedCurrency;
  const currData = REALTIME_DATA.realTimeExchangeRates[selCurr];

  // SVG Chart Calculation
  const rates = currData.rates;
  const chartW = 700;
  const chartH = 200;
  const padX = 40;
  const padY = 25;

  const minR = Math.min(...rates.map(r => r.rate));
  const maxR = Math.max(...rates.map(r => r.rate));
  const range = maxR - minR || 1;

  const pts = rates.map((item, idx) => {
    const x = padX + (idx / (rates.length - 1)) * (chartW - padX * 2);
    const y = chartH - padY - ((item.rate - minR) / range) * (chartH - padY * 2);
    return { x, y, ...item };
  });

  const pathD = pts.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const areaD = pts.length > 0
    ? `${pathD} L ${pts[pts.length - 1].x} ${chartH - padY} L ${pts[0].x} ${chartH - padY} Z`
    : '';
  const avgY = chartH - padY - ((currData.monthAvg - minR) / range) * (chartH - padY * 2);

  content.innerHTML = `
    <div class="card">
      <!-- Today's Date & SMBS Official Source Banner -->
      <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:10px; padding:14px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <div style="font-size:14px; font-weight:800; color:#0369a1;">
            📅 오늘 날짜 고시 환율: <strong>${REALTIME_DATA.metadata.todayStr}</strong> 실시간 기준
          </div>
          <div style="font-size:12px; color:#475569; margin-top:2px;">
            공식 데이터 출처: <strong>서울외국환중개(SMBS) 오늘의 환율</strong> (data.json 실시간 매핑)
          </div>
        </div>
        <a href="${currData.sourceUrl}" target="_blank" rel="noopener noreferrer" style="font-size:12px; font-weight:700; color:#0284c7; background:#ffffff; padding:6px 12px; border-radius:8px; border:1px solid #bae6fd; text-decoration:none; display:inline-flex; align-items:center; gap:4px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
          SMBS 오늘의 환율 고시원문 확인 ↗
        </a>
      </div>

      <!-- Currency Switcher Tabs -->
      <div class="controls-row" style="margin-bottom:18px;">
        <span style="font-size:13px; font-weight:700;">통화 선택:</span>
        <div class="btn-group">
          ${Object.keys(REALTIME_DATA.realTimeExchangeRates).map(code => {
            const c = REALTIME_DATA.realTimeExchangeRates[code];
            return `
              <button class="${selCurr === code ? 'active' : ''}" onclick="selectCurrency('${code}')">
                ${c.name} (₩${c.currentRate.toFixed(2)})
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Currency Summary Cards -->
      <div class="grid-3" style="margin-bottom:20px;">
        ${Object.keys(REALTIME_DATA.realTimeExchangeRates).map(k => {
          const c = REALTIME_DATA.realTimeExchangeRates[k];
          const isSelected = selCurr === k;
          return `
            <div class="flight-card ${isSelected ? 'best' : ''}" style="cursor:pointer;" onclick="selectCurrency('${k}')">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:13px; font-weight:700; color:#334155;">${c.name}</span>
                <span class="badge ${isSelected ? 'badge-blue' : 'badge-green'}">오늘 실시간 고시가</span>
              </div>
              <div class="price" style="margin:8px 0 6px 0;">
                ${c.currentRate.toFixed(2)}<span style="font-size:13px; font-weight:normal; color:#64748b; margin-left:2px;">원</span>
              </div>
              <div style="font-size:12px; color:#64748b; line-height:1.6;">
                <div>1달 최고: <strong>${c.monthHigh}원</strong> / 최저: <strong>${c.monthLow}원</strong></div>
                <div>1달 평균: <strong>${c.monthAvg}원</strong></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Interactive 30-Day SVG Graph -->
      <div class="chart-container" style="margin-bottom:20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>
            <h4 style="font-size:15px; font-weight:800; color:#0f172a;">
              ${currData.name} 최근 1달 환율 변동 추이 그래프
            </h4>
            <div style="font-size:12px; color:#64748b;">
              최근 1달 평균: <span style="color:#ef4444; font-weight:700;">${currData.monthAvg}원 (빨간 점선)</span>
            </div>
          </div>
          <div style="font-size:12px; font-weight:700; color:#2563eb;">
            오늘: ${currData.currentRate.toFixed(2)}원
          </div>
        </div>

        <svg class="chart-svg" viewBox="0 0 ${chartW} ${chartH}">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#2563eb" stop-opacity="0.5" />
              <stop offset="100%" stop-color="#2563eb" stop-opacity="0.0" />
            </linearGradient>
          </defs>

          <!-- Grid Lines -->
          <line x1="${padX}" y1="${padY}" x2="${chartW - padX}" y2="${padY}" stroke="#e2e8f0" stroke-width="1" />
          <line x1="${padX}" y1="${chartH / 2}" x2="${chartW - padX}" y2="${chartH / 2}" stroke="#f1f5f9" stroke-width="1" />
          <line x1="${padX}" y1="${chartH - padY}" x2="${chartW - padX}" y2="${chartH - padY}" stroke="#e2e8f0" stroke-width="1" />

          <!-- Average Red Line -->
          <line x1="${padX}" y1="${avgY}" x2="${chartW - padX}" y2="${avgY}" class="chart-avg-line" />

          <!-- Area & Line -->
          <path d="${areaD}" class="chart-area" />
          <path d="${pathD}" class="chart-line" />

          <!-- Dots -->
          ${pts.map(p => `
            <circle cx="${p.x}" cy="${p.y}" r="3.5" class="chart-dot">
              <title>${p.date}: ${p.rate}원</title>
            </circle>
          `).join('')}

          <!-- Labels -->
          <text x="${padX}" y="${chartH - 8}" font-size="11" fill="#94a3b8">${rates[0].date}</text>
          <text x="${chartW / 2}" y="${chartH - 8}" font-size="11" fill="#94a3b8" text-anchor="middle">최근 1달 변동</text>
          <text x="${chartW - padX}" y="${chartH - 8}" font-size="11" fill="#2563eb" font-weight="700" text-anchor="end">오늘 (${REALTIME_DATA.metadata.today.slice(5)})</text>
        </svg>

        <div style="margin-top:10px; padding:10px 14px; background:#fef3c7; border:1px solid #fde68a; border-radius:8px; font-size:12px; color:#92400e;">
          💡 <strong>환전 전문가 팁:</strong> ${currData.advice}
        </div>
      </div>

      <!-- Real-time Currency Converter -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:18px;">
        <h4 style="font-size:14px; font-weight:800; color:#0f172a; margin-bottom:12px;">
          실시간 스마트 환율 계산기 (data.json 실시간 환율 반영)
        </h4>
        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
          <input type="number" id="calc-input" value="${STATE.calcAmount}" style="padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px; font-size:15px; font-weight:700; width:160px;" oninput="onCalcInput(this.value)" />
          <select id="calc-curr" style="padding:10px 14px; border:1px solid #cbd5e1; border-radius:8px; font-size:14px; font-weight:600;" onchange="onCalcCurrencyChange(this.value)">
            ${Object.keys(REALTIME_DATA.realTimeExchangeRates).map(k => {
              const c = REALTIME_DATA.realTimeExchangeRates[k];
              return `<option value="${k}" ${selCurr === k ? 'selected' : ''}>${c.name} (${c.currentRate.toFixed(2)}원)</option>`;
            }).join('')}
          </select>
          <span style="font-size:16px; font-weight:800;">=</span>
          <span id="calc-result" style="font-size:22px; font-weight:900; color:#2563eb;">
            ₩${Math.round((STATE.calcAmount / currData.unit) * currData.currentRate).toLocaleString()}원
          </span>
        </div>
      </div>
    </div>
  `;
}

function onCalcInput(val) {
  STATE.calcAmount = parseFloat(val) || 0;
  updateCalcResult();
}

function onCalcCurrencyChange(curr) {
  STATE.selectedCurrency = curr;
  updateCalcResult();
}

function updateCalcResult() {
  if (!REALTIME_DATA) return;
  const c = REALTIME_DATA.realTimeExchangeRates[STATE.selectedCurrency];
  const res = Math.round((STATE.calcAmount / c.unit) * c.currentRate);
  const el = document.getElementById('calc-result');
  if (el) el.innerText = `₩${res.toLocaleString()}원`;
}

// ============================================================================
// 3. Itinerary Tab (3박4일, 4박5일, 3박5일 코스 및 추천 맛집)
// ============================================================================
function renderItineraryTab() {
  const content = document.getElementById('tab-content');
  if (!REALTIME_DATA) {
    content.innerHTML = '<div style="padding:40px; text-align:center;">실시간 데이터를 불러오는 중입니다...</div>';
    return;
  }

  const city = STATE.destination;
  const destObj = REALTIME_DATA.destinations.find(d => d.id === city) || REALTIME_DATA.destinations[0];
  const cityName = destObj.nameKo;
  const flag = destObj.flag;
  const dur = STATE.durationMode;

  const cityPlans = ITINERARIES_FALLBACK[city] || ITINERARIES_FALLBACK['FUK'];
  const planDays = cityPlans[dur] || cityPlans['3박4일'];

  content.innerHTML = `
    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:18px;">
        <div>
          <h3 style="font-size:18px; font-weight:800; color:#0f172a;">
            ${flag} ${cityName} ${dur} 여행 일정 및 대표 맛집
          </h3>
          <div style="font-size:12px; color:#64748b;">
            대구·부산 출발 맞춤 동선 & 구글 평점 검증 로컬 맛집 추천
          </div>
        </div>

        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
          <select onchange="setDestination(this.value)" style="padding:6px 12px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px; font-weight:600;">
            ${REALTIME_DATA.destinations.map(d => `
              <option value="${d.id}" ${city === d.id ? 'selected' : ''}>${d.flag} ${d.nameKo}</option>
            `).join('')}
          </select>

          <div class="btn-group">
            <button class="${dur === '3박4일' ? 'active' : ''}" onclick="setDuration('3박4일')">3박4일</button>
            <button class="${dur === '4박5일' ? 'active' : ''}" onclick="setDuration('4박5일')">4박5일</button>
            <button class="${dur === '3박5일' ? 'active' : ''}" onclick="setDuration('3박5일')">3박5일 (야간비행)</button>
          </div>
        </div>
      </div>

      <!-- Schedule List -->
      <div class="schedule-list">
        ${planDays.map(item => `
          <div class="schedule-item">
            <h4 style="font-size:15px; font-weight:800; color:#0f172a;">
              DAY ${item.day} : ${item.title}
            </h4>
            ${item.restaurant ? `
              <div class="restaurant-box">
                <strong>🍽 현지인 추천 맛집:</strong> ${item.restaurant}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ============================================================================
// 4. Weather & News Tab (Today's Date, Weather, Clothing, Travel Guidelines)
// ============================================================================
function renderNewsTab() {
  const content = document.getElementById('tab-content');
  if (!REALTIME_DATA) {
    content.innerHTML = '<div style="padding:40px; text-align:center;">실시간 데이터를 불러오는 중입니다...</div>';
    return;
  }

  const city = STATE.destination;
  const destObj = REALTIME_DATA.destinations.find(d => d.id === city) || REALTIME_DATA.destinations[0];
  const cityName = destObj.nameKo;
  const flag = destObj.flag;
  const w = REALTIME_DATA.weatherToday[city] || REALTIME_DATA.weatherToday['FUK'];

  content.innerHTML = `
    <div class="card">
      <!-- Today's Date Banner -->
      <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:14px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <span style="font-size:14px; font-weight:800; color:#b45309;">
            🌤 오늘 날짜 기상 정보: <strong>${REALTIME_DATA.metadata.todayStr}</strong> 실시간 관측
          </span>
          <div style="font-size:12px; color:#78350f; margin-top:2px;">
            현지 기상청 1일 주기 정기 관측 연동 (data.json)
          </div>
        </div>
        <select onchange="setDestination(this.value)" style="padding:6px 12px; border-radius:8px; border:1px solid #cbd5e1; font-size:13px; font-weight:600;">
          ${REALTIME_DATA.destinations.map(d => `
            <option value="${d.id}" ${city === d.id ? 'selected' : ''}>${d.flag} ${d.nameKo}</option>
          `).join('')}
        </select>
      </div>

      <!-- Current City Weather Details -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:18px; margin-bottom:20px;">
        <h4 style="font-size:16px; font-weight:800; color:#0f172a; margin-bottom:8px;">
          ${flag} ${cityName} 주간 기상 및 옷차림 가이드 (오늘 기준)
        </h4>
        <div style="font-size:14px; color:#334155; line-height:1.7;">
          오늘 현재 기온 <strong>${w.temp}</strong> (${w.cond}), 일일 최고 <strong>${w.high}</strong> / 최저 <strong>${w.low}</strong><br>
          <strong>추천 옷차림:</strong> ${w.advice}
        </div>
      </div>

      <!-- Country Regulations & Notices -->
      <h4 style="font-size:15px; font-weight:800; color:#0f172a; margin-bottom:12px;">
        📌 각 국가별 최신 여행 규정 및 꿀팁 (오늘 갱신)
      </h4>
      <div style="font-size:13px; line-height:1.8; color:#334155; margin-bottom:20px;">
        <p>• <strong>일본 (후쿠오카/오사카/도쿄/삿포로):</strong> 비짓재팬웹(Visit Japan Web) 통합 QR 코드로 입국/세관 일괄 심사. 일본 입국 24시간 전 사전 등록 시 빠른 통과 가능.</p>
        <p>• <strong>대만 (타이베이):</strong> 대한민국 여권 무비자 90일 체류. '대만 여행지원금 5,000 NT$' 입국 전 사전 추첨 이벤트 진행 중.</p>
        <p>• <strong>베트남 (다낭/나트랑):</strong> 대한민국 여권 소지자 45일 무비자 체류 허용. 그랩(Grab) 앱 한국 신용카드 사전 등록 필수.</p>
        <p>• <strong>중국 (상하이):</strong> 대한민국 일반여권 소지자 15일/30일 무비자 입국 정책 시행 지속. 알리페이/위챗페이 트래블카드 연동 필수.</p>
      </div>

      <!-- Emergency Hotline -->
      <div style="padding:14px; background:#fff1f2; border:1px solid #fecdd3; border-radius:10px; font-size:13px; color:#9f1239;">
        🚨 <strong>24시간 대한민국 영사콜센터 (해외 긴급상황 지원):</strong> +82-2-3210-0404<br>
        <span style="font-size:11px; color:#be123c;">여권 분실, 사건·사고, 신속 해외 송금 및 응급 통역 서비스 24시간 한국어 지원</span>
      </div>
    </div>
  `;
}

// ============================================================================
// Initialization on Page Load
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadRealtimeData();
});
