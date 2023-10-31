(() => {
    console.log("contentScript.js loaded")
    let searchQuery, TextBox;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        const { type, searchWord } = request;

        if (type === "SEARCH_WORD") {
            searchQuery = searchWord
            console.log(searchWord)
            // getTextBox(wordVolume);
            
            // Add the API request logic here
            const apiLogin = 'iskandarth3@gmail.com'
            const apiPassword = 'cca345191c5d83c5'

            // const apiUrl = "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live";

            const headers = new Headers({
                'Authorization': 'Basic ' + btoa(apiLogin + ':' + apiPassword),
                'Content-Type': 'application/json',
            });

            const volReqData = makeRequestData(searchQuery, "SEARCH_VOLUME")

            // Construct the POST request
            const requestObj = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(volReqData),
            }
            const volumeRequest = new Request("https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live", requestObj)

            console.log("eh", cpc_data)
            // Make the API request
            
            fetch(volumeRequest)
                .then(response => response.json())
                .then(data => {
                    console.log("Google Ads API Response in contentScript.js:", data);
                    // Handle the API response data as needed in the content script
                    // For example, you can update the UI with the API data
                    TextBox = document.getElementById("result-stats")

                    if(!(data && data.tasks && data.tasks[0] && data.tasks[0].result && data.tasks[0].result[0] && data.tasks[0].result[0].search_volume) ){
                        console.log("Volume request unsuccessful, missing info")
                        return
                    }
                    if (TextBox && data.tasks[0].result[0]) {
                        TextBox.innerText = `Volume: ${data.tasks[0].result[0].search_volume}/mo`


                    }
                    const monthly_data = data
                    // document.addEventListener('DOMContentLoaded', function () {
                    //iframe stuff:
                    const iframe = document.createElement('iframe')
                    iframe.id = "chart-iframe"
                    document.body.appendChild(iframe)

                    // const iframeStyle = document.createElement('style')
                    // iframeStyle.textContent = chartStyleStr
                    // iframe.contentDocument.head.appendChild(iframeStyle)
                    
                    //script stuff:
                    const chartScript = document.createElement('script')
                    chartScript.src = chrome.runtime.getURL('lib/chart.js')
                    chartScript.type = 'text/javascript'
                    
                    //canvas stuff:
                    const chartContainer = document.createElement("canvas")
                    chartContainer.id = "ChartContainer"
            
                    const iframeStyle = document.createElement("style")
                    iframeStyle.textContent = chartStyleStrNew
                    
                    chartContainer.appendChild(chartScript)
                    document.body.appendChild(chartContainer)
                    
                    iframe.contentDocument.body.appendChild(chartContainer)
                    
                    document.body.appendChild(iframeStyle)
                    
                    /*
                    const chartStyle = document.createElement("style")
                    chartStyle.textContent = chartStyleStr
                    iframe.contentDocument.body.appendChild(chartStyle)
                    */
                    // chartScript.onload = function () {
                        console.log("chart script loaded")
                        const monthlySearches = monthly_data.tasks[0].result[0].monthly_searches;
                        const my_labels = monthlySearches.map(item => `${item.year}-${item.month}`)
                        const my_vols = monthlySearches.map(item => item.search_volume)
                        my_vols.reverse()
                        my_labels.reverse()
            
                        const ctx = iframe.contentDocument.getElementById('ChartContainer').getContext('2d')
                        
                        avg_vols = data_to_running_avg(my_vols)
                        
                        const myChart = new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: my_labels,
                                datasets: [{
                                label: 'Monthly Volume',
                                data: my_vols,
                                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 0,
                                barPercentage: 1.25,
                                }]
                            },
                            options: {
                                plugins: {
                                legend: {
                                    display: true,
                                    position: 'top',
                                },
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks:{
                                            font:{
                                                size: 20,
                                                weight: 900,
                    
                                            },
                                        }
                                    }
                                },
                                layout: {
                                padding: {
                                    top: 10, // Adjust the top padding
                                }
                                },
                                maintainAspectRatio: false, // Allow the chart to adjust its aspect ratio
                                aspectRatio: 1, // Set the desired aspect ratio
                                responsive: true
                            }
                        })
                    // }
                    console.log("after")
                })
                .then(()=>{
                    const cpcReqData = makeRequestData(searchQuery, "CPC");
                    console.log("data sent", cpcReqData)
                    const cpcReqObj = {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(cpcReqData),
                    }
                    const cpcRequest = new Request("https://api.dataforseo.com/v3/dataforseo_labs/google/historical_search_volume/live", cpcReqObj);
                    fetch(cpcRequest)
                    .then(response => response.json())
                    .then(cpc_data => {
                        console.log("D4S Labs API Response in contentScript.js:", cpc_data);
                        // Handle the API response data as needed in the content script
                        // For example, you can update the UI with the API data
                        TextBox = document.getElementById("result-stats")

                        if (TextBox && cpc_data?.tasks?.[0]?.result?.[0]?.items?.[0]?.keyword_info) {
                            const result_obj = cpc_data.tasks[0].result[0].items[0].keyword_info
                            const cpc = result_obj.cpc
                            const competition = result_obj.competition

                            TextBox.innerText = `${TextBox.innerText} | CPC: $${cpc} | Competition: ${competition}`
                        }else{
                            console.log("CPC request unsuccessful, missing info")
                        }

                        
                    })
                })
                .catch(error => {
                    console.error("API Request Failed in contentScript.js:", error)
                })


                

        }
    })

    
})()
const size_factor = 1

// const chartStylePrev = `
// #ChartContainer{
//     width: ${size_factor * 100}% !important;
//     height: ${size_factor * 100}% !important;
//     position: relative !important;
//     right: 0 !important;
//     top: 150px !important;
    
// }
// `

const data_to_running_avg = (data) => {
    let sum = 0
    let count = 0
    let running_avg = []
    for (let i = 0; i < data.length; i++) {
        sum += data[i]
        count++
        running_avg.push(sum / count)
    }
    return running_avg
}
const chartStyleStr = `
#ChartContainer {
    width: ${size_factor * 100}% !important;
    height: ${size_factor * 100}% !important;
    margin:auto !important;
    
}
`

const chartStyleStrNew = `
    #chart-iframe {
        position: absolute !important;
        top: 175px !important; 
        right: 50px !important;
        width: 500px !important;
        height: 350px !important;

    }
    
`
/*
#chart-iframe{
    position: absolute !important;
    top: 150px !important;
    right: 0 !important;
    width: ${size_factor * 100}% !important;
    height: ${size_factor * 100}% !important;
}
*/




const makeChart = (monthly_data) =>{
    console.log("making chart", monthly_data)
    document.addEventListener('DOMContentLoaded', function () {
        const iframe = document.createElement('iframe')
        document.body.appendChild(iframe)

        const chartScript = document.createElement('script')
        chartScript.src = chrome.runtime.getURL('lib/chart.js')
        chartScript.type = 'text/javascript'

        const chartContainer = document.createElement("canvas")
        chartContainer.id = "ChartContainer"

        const chartStyle = document.createElement("style")
        chartStyle.textContent = chartStyleStr
        
        chartContainer.appendChild(chartScript)
        // document.body.appendChild(chartContainer)
        iframe.contentDocument.body.appendChild(chartContainer)
        

        chartScript.onload = function () {
            console.log("chart script loaded")
            const monthlySearches = monthly_data.tasks[0].result[0].monthly_searches;
            const my_labels = monthlySearches.map(item => `${item.year}-${item.month}`)
            const my_vols = monthlySearches.map(item => item.search_volume)

            const ctx = iframe.contentDocument.getElementById('ChartContainer').getContext('2d')
            

            
            const myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                  labels: my_labels,
                  datasets: [{
                    label: 'Monthly Searches',
                    data: my_vols,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 0,
                    barPercentage: 1.25,
                  }]
                },
                options: {
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks:{
                        font:{
                            size: 20,
                            weight: 900,

                        },
                        // textStrokeWidth: 1,
                        // textStrokeColor: 'rgba(255, 255,255, 1)',
                    }
                    }
                  },
                  layout: {
                    padding: {
                      top: 10, // Adjust the top padding
                    }
                  },
                  maintainAspectRatio: false, // Allow the chart to adjust its aspect ratio
                  aspectRatio: 1, // Set the desired aspect ratio
                  responsive: true
                }
              })
            // iframe.contentDocument.head.appendChild(chartStyle);
        }
    })

}


const makeRequestData = (keyword, req_type) => {
    switch (req_type) {
        case "SEARCH_VOLUME":
            return [
                {
                    language_code: "ar",
                    keywords: [keyword],
                    date_from: "2021-08-01"
                }
            ]
        case "CPC":
            return [
                {
                    keywords: [keyword],
                    location_code: 2682,
                    location_name: "Saudi Arabia",
                    language_code: "ar",
                }
            ]
        default:
            return [
                {
                    language_code: "ar",
                    keywords: [keyword],
                    date_from: "2021-08-01",
                }
            ];
    }
}


const getTextBox = (volume) => {
    document.addEventListener("DOMContentLoaded", function () {
        TextBox = document.getElementById("result-stats")
        if (TextBox) {
            TextBox.innerText = "Volume: " + volume + " " + TextBox.innerText
        }
    })
}


const cpc_data = {
    "version": "0.1.20230825",
    "status_code": 20000,
    "status_message": "Ok.",
    "time": "0.0886 sec.",
    "cost": 0.0101,
    "tasks_count": 1,
    "tasks_error": 0,
    "tasks": [
        {
            "id": "10172335-6869-0401-0000-8bab37c0360b",
            "status_code": 20000,
            "status_message": "Ok.",
            "time": "0.0271 sec.",
            "cost": 0.0101,
            "result_count": 1,
            "path": [
                "v3",
                "dataforseo_labs",
                "google",
                "historical_search_volume",
                "live"
            ],
            "data": {
                "api": "dataforseo_labs",
                "function": "historical_search_volume",
                "se_type": "google",
                "keywords": [
                    "chair"
                ],
                "language_name": "English",
                "location_code": 2840
            },
            "result": [
                {
                    "se_type": "google",
                    "location_code": 2840,
                    "language_code": "en",
                    "items_count": 1,
                    "items": [
                        {
                            "se_type": "google",
                            "keyword": "chair",
                            "location_code": 2840,
                            "language_code": "en",
                            "search_partners": false,
                            "keyword_info": {
                                "se_type": "google",
                                "last_updated_time": "2023-10-10 05:27:22 +00:00",
                                "competition": 1,
                                "competition_level": "HIGH",
                                "cpc": 2.99,
                                "search_volume": 165000,
                                "low_top_of_page_bid": 0.5,
                                "high_top_of_page_bid": 2.99,
                                "categories": [
                                    10004,
                                    10300,
                                    11323,
                                    12633
                                ],
                                "monthly_searches": [
                                    {
                                        "year": 2023,
                                        "month": 9,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2023,
                                        "month": 8,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2023,
                                        "month": 7,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2023,
                                        "month": 6,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2023,
                                        "month": 5,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2023,
                                        "month": 4,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2023,
                                        "month": 3,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2023,
                                        "month": 2,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2023,
                                        "month": 1,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2022,
                                        "month": 12,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2022,
                                        "month": 11,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2022,
                                        "month": 10,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2022,
                                        "month": 9,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2022,
                                        "month": 8,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2022,
                                        "month": 7,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2022,
                                        "month": 6,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2022,
                                        "month": 5,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2022,
                                        "month": 4,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2022,
                                        "month": 3,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2022,
                                        "month": 2,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2022,
                                        "month": 1,
                                        "search_volume": 301000
                                    },
                                    {
                                        "year": 2021,
                                        "month": 12,
                                        "search_volume": 301000
                                    },
                                    {
                                        "year": 2021,
                                        "month": 11,
                                        "search_volume": 246000
                                    },
                                    {
                                        "year": 2021,
                                        "month": 10,
                                        "search_volume": 301000
                                    },
                                    {
                                        "year": 2021,
                                        "month": 9,
                                        "search_volume": 246000
                                    },
                                    {
                                        "year": 2021,
                                        "month": 8,
                                        "search_volume": 246000
                                    },
                                    {
                                        "year": 2021,
                                        "month": 7,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2021,
                                        "month": 6,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2021,
                                        "month": 5,
                                        "search_volume": 246000
                                    },
                                    {
                                        "year": 2021,
                                        "month": 4,
                                        "search_volume": 246000
                                    },
                                    {
                                        "year": 2021,
                                        "month": 3,
                                        "search_volume": 301000
                                    },
                                    {
                                        "year": 2021,
                                        "month": 2,
                                        "search_volume": 246000
                                    },
                                    {
                                        "year": 2021,
                                        "month": 1,
                                        "search_volume": 301000
                                    },
                                    {
                                        "year": 2020,
                                        "month": 12,
                                        "search_volume": 246000
                                    },
                                    {
                                        "year": 2020,
                                        "month": 11,
                                        "search_volume": 301000
                                    },
                                    {
                                        "year": 2020,
                                        "month": 10,
                                        "search_volume": 246000
                                    },
                                    {
                                        "year": 2020,
                                        "month": 9,
                                        "search_volume": 301000
                                    },
                                    {
                                        "year": 2020,
                                        "month": 8,
                                        "search_volume": 368000
                                    },
                                    {
                                        "year": 2020,
                                        "month": 7,
                                        "search_volume": 301000
                                    },
                                    {
                                        "year": 2020,
                                        "month": 6,
                                        "search_volume": 301000
                                    },
                                    {
                                        "year": 2020,
                                        "month": 5,
                                        "search_volume": 301000
                                    },
                                    {
                                        "year": 2020,
                                        "month": 4,
                                        "search_volume": 301000
                                    },
                                    {
                                        "year": 2020,
                                        "month": 3,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2020,
                                        "month": 2,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2020,
                                        "month": 1,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2019,
                                        "month": 12,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2019,
                                        "month": 11,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2019,
                                        "month": 10,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2019,
                                        "month": 9,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2019,
                                        "month": 8,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2019,
                                        "month": 7,
                                        "search_volume": 201000
                                    },
                                    {
                                        "year": 2019,
                                        "month": 6,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2019,
                                        "month": 5,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2019,
                                        "month": 4,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2019,
                                        "month": 3,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2019,
                                        "month": 2,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2019,
                                        "month": 1,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2018,
                                        "month": 12,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2018,
                                        "month": 11,
                                        "search_volume": 165000
                                    },
                                    {
                                        "year": 2018,
                                        "month": 10,
                                        "search_volume": 135000
                                    }
                                ]
                            },
                            "keyword_properties": {
                                "se_type": "google",
                                "core_keyword": "chairs",
                                "synonym_clustering_algorithm": null,
                                "keyword_difficulty": 63,
                                "detected_language": "en",
                                "is_another_language": false
                            },
                            "impressions_info": {
                                "se_type": "google",
                                "last_updated_time": "2022-04-25 06:09:35 +00:00",
                                "bid": 999,
                                "match_type": "exact",
                                "ad_position_min": 1.15,
                                "ad_position_max": 1,
                                "ad_position_average": 1.08,
                                "cpc_min": 209.41,
                                "cpc_max": 255.95,
                                "cpc_average": 232.68,
                                "daily_impressions_min": 857.41,
                                "daily_impressions_max": 1047.95,
                                "daily_impressions_average": 952.68,
                                "daily_clicks_min": 50.2,
                                "daily_clicks_max": 61.36,
                                "daily_clicks_average": 55.78,
                                "daily_cost_min": 11680.55,
                                "daily_cost_max": 14276.23,
                                "daily_cost_average": 12978.39
                            },
                            "serp_info": null
                        }
                    ]
                }
            ]
        }
    ]
}

const vol_data = {
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