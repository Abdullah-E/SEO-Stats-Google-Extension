console.log("background.js loaded");

chrome.tabs.onUpdated.addListener((tabId, tab) => {
  

  if (tab.url && tab.url.includes("google.com/search")) {
    const queryParameters = tab.url.split("?")[1]
    const urlParameters = new URLSearchParams(queryParameters)
    const searchWord = urlParameters.get("q")
    console.log("Yoooo")
    console.log(searchWord)

    const request = createKeyWordRequest(searchWord)
    // const request = require('')
    
    fetch(request)
      .then((response) => response.json())
      .then((data) => {
          console.log("API Response:", data);
          // Handle the API response data as needed
          chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            searchWord: data.tasks[0].result[0].keyword,
            wordVolume:data.tasks[0].result[0].search_volume

          });
          return data
      })
      .catch((error) => {
          console.error("API Request Failed:", error);
      });
      
    // console.log(returnData)
    
    /*
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      searchWord: sample_data.tasks[0].result[0].keyword,
      wordVolume:sample_data.tasks[0].result[0].search_volume
    })
    */
  }
});

const createKeyWordRequest = (text) => {
  const apiLogin = 'bully.ae@gmail.com';
  const apiPassword = '8f5a76461028b29e';

  const apiUrl = "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live";

  const headers = new Headers({
    'Authorization': 'Basic ' + btoa(apiLogin + ':' + apiPassword),
    'Content-Type': 'application/json',
  });

  const requestData = [
    {
        language_code: "ar",
        keywords: [text],
        date_from: "2021-08-01",
    },
  ]
  // Construct the POST request
  const request = new Request(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestData),
  });
  return request
}
/*
const sendPostRequest = (requestData) => {
  // Your API login and password
  const apiLogin = 'bully.ae@gmail.com';
  const apiPassword = '8f5a76461028b29e';

  // Construct the request URL
  const apiUrl = "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live";

  // Construct the request headers with API login and password
  const headers = new Headers({
      'Authorization': 'Basic ' + btoa(apiLogin + ':' + apiPassword),
      'Content-Type': 'application/json',
  });

  // Construct the POST request
  const request = new Request(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestData),
  });

  // Send the request
  fetch(request)
      .then((response) => response.json())
      .then((data) => {
          console.log("API Response:", data);
          // Handle the API response data as needed
          chrome.tabs.sendMessage(tabId, {
            type: "NEW",
            searchWord: data,

          });
          return data
      })
      .catch((error) => {
          console.error("API Request Failed:", error);
      });
};
*/

const sample_data = {
    "version": "0.1.20230825",
    "status_code": 20000,
    "status_message": "Ok.",
    "time": "3.1175 sec.",
    "cost": 0.075,
    "tasks_count": 1,
    "tasks_error": 0,
    "tasks": [
        {
            "id": "10131915-6806-0367-0000-daa93e6535f6",
            "status_code": 20000,
            "status_message": "Ok.",
            "time": "3.0669 sec.",
            "cost": 0.075,
            "result_count": 1,
            "path": [
                "v3",
                "keywords_data",
                "google_ads",
                "search_volume",
                "live"
            ],
            "data": {
                "api": "keywords_data",
                "function": "search_volume",
                "se": "google_ads",
                "language_code": "ar",
                "keywords": [
                    "كرسي"
                ],
                "date_from": "2021-08-01"
            },
            "result": [
                {
                    "keyword": "كرسي",
                    "spell": null,
                    "location_code": null,
                    "language_code": "ar",
                    "search_partners": false,
                    "competition": "HIGH",
                    "competition_index": 87,
                    "search_volume": 74000,
                    "low_top_of_page_bid": 0.1,
                    "high_top_of_page_bid": 0.83,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 90500
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 90500
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 74000
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 74000
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 74000
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 74000
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 90500
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 74000
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 74000
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 74000
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 74000
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 74000
                        },
                        {
                            "year": 2022,
                            "month": 9,
                            "search_volume": 74000
                        },
                        {
                            "year": 2022,
                            "month": 8,
                            "search_volume": 74000
                        },
                        {
                            "year": 2022,
                            "month": 7,
                            "search_volume": 60500
                        },
                        {
                            "year": 2022,
                            "month": 6,
                            "search_volume": 60500
                        },
                        {
                            "year": 2022,
                            "month": 5,
                            "search_volume": 60500
                        },
                        {
                            "year": 2022,
                            "month": 4,
                            "search_volume": 60500
                        },
                        {
                            "year": 2022,
                            "month": 3,
                            "search_volume": 74000
                        },
                        {
                            "year": 2022,
                            "month": 2,
                            "search_volume": 60500
                        },
                        {
                            "year": 2022,
                            "month": 1,
                            "search_volume": 74000
                        },
                        {
                            "year": 2021,
                            "month": 12,
                            "search_volume": 74000
                        },
                        {
                            "year": 2021,
                            "month": 11,
                            "search_volume": 74000
                        },
                        {
                            "year": 2021,
                            "month": 10,
                            "search_volume": 74000
                        },
                        {
                            "year": 2021,
                            "month": 9,
                            "search_volume": 74000
                        },
                        {
                            "year": 2021,
                            "month": 8,
                            "search_volume": 60500
                        }
                    ]
                }
            ]
        }
    ]
}