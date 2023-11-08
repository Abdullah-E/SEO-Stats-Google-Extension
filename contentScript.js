(() => {
    console.log("SEO Arabic Extension Initiated")
    let searchQuery, TextBox;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        const { type, searchWord } = request;

        if (type === "SEARCH_WORD") {
            searchQuery = searchWord

            const apiLogin = 'iskandarth3@gmail.com'
            const apiPassword = 'cca345191c5d83c5'

            const headers = new Headers({
                'Authorization': 'Basic ' + btoa(apiLogin + ':' + apiPassword),
                'Content-Type': 'application/json',
            });

            const volReqData = makeRequestData(searchQuery, "SEARCH_VOLUME")

            const requestObj = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(volReqData),
            }
            const volumeRequest = new Request("https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live", requestObj)
            
            
            fetch(volumeRequest)
                .then(response => response.json())
                .then(data => {
      
                    TextBox = document.getElementById("result-stats")

                    if(!(data && data.tasks && data.tasks[0] && data.tasks[0].result && data.tasks[0].result[0] && data.tasks[0].result[0].search_volume) ){
                        console.log("Volume request unsuccessful, missing info")
                        return
                    }
                    if (TextBox && data.tasks[0].result[0]) {
                        TextBox.innerText = `Volume: ${data.tasks[0].result[0].search_volume}/mo`


                    }
                    const monthly_data = data

                    const iframe = document.createElement('iframe')
                    iframe.id = "chart-iframe"
                    document.body.appendChild(iframe)

                    const chartScript = document.createElement('script')
                    chartScript.src = chrome.runtime.getURL('lib/chart.js')
                    chartScript.type = 'text/javascript'
                    
                    const chartContainer = document.createElement("canvas")
                    chartContainer.id = "ChartContainer"
            
                    const iframeStyle = document.createElement("style")
                    iframeStyle.textContent = chartStyleStrNew
                    
                    chartContainer.appendChild(chartScript)
                    document.body.appendChild(chartContainer)
                    
                    iframe.contentDocument.body.appendChild(chartContainer)
                    
                    document.body.appendChild(iframeStyle)
                    
  
                    const monthlySearches = monthly_data.tasks[0].result[0].monthly_searches;
                    const my_labels = monthlySearches.map(item => `${item.year}-${item.month}`)
                    const my_vols = monthlySearches.map(item => item.search_volume)
                    my_vols.reverse()
                    my_labels.reverse()
        
                    const ctx = iframe.contentDocument.getElementById('ChartContainer').getContext('2d')
                                        
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
                                top: 10, 
                            }
                            },
                            maintainAspectRatio: false, 
                            aspectRatio: 1, 
                            responsive: true
                        }
                    })

  
                })
                .then(()=>{
                    const cpcReqData = makeRequestData(searchQuery, "CPC");
                    const cpcReqObj = {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(cpcReqData),
                    }
                    const cpcRequest = new Request("https://api.dataforseo.com/v3/dataforseo_labs/google/historical_search_volume/live", cpcReqObj);
                    fetch(cpcRequest)
                    .then(response => response.json())
                    .then(cpc_data => {
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
            
            const k4kReqData = makeRequestData(searchQuery, "SUGGESTED_KEYWORDS")
            const k4kReqObj = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(k4kReqData),
            }
            // console.log("req obj:", k4kReqData)
            const k4kRequest = new Request("https://api.dataforseo.com/v3/keywords_data/google/keywords_for_keywords/live", k4kReqObj)
            fetch(k4kRequest)
                .then(response => response.json())
                .then(data => {
                    if(data?.tasks?.[0]?.result ){
                        const results = data.tasks[0].result
                        const keywords = results.map(item => item.keyword)
                        // const volumes = results.map(item => item.search_volume)
                        // const competitions = results.map(item => item.competition)
                        
                        //make a table
                        
                        const keywordsTable = makeKeywordTable(results)
                        document.body.appendChild(keywordsTable)
                        console.log("Related words:", keywords)
                    }else{
                        console.log("Related words request unsuccessful, missing info")
                    }
                    

                    })
                .catch(error => {
                    console.error("API Request Failed in contentScript.js:", error)
                })
            
        }
    })

    
})()
const size_factor = 1


// const chartStyleStr = `
// #ChartContainer {
//     width: ${size_factor * 100}% !important;
//     height: ${size_factor * 100}% !important;
//     margin:auto !important;
    
// }
// `

const chartStyleStrNew = `
    #chart-iframe {
        position: absolute !important;
        top: 175px !important; 
        right: 50px !important;
        width: 500px !important;
        height: 350px !important;

    }
`

const tableStyleStr = `
    #related-words-table {
        position: absolute !important;
            top: 575px !important; 
            right: 50px !important;
            width: 500px !important;
            height: 350px !important;
    }
`


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
        case "SUGGESTED_KEYWORDS":
            return [
                {
                    language_code: "ar",
                    keywords: [keyword],
                    sort_by: "relevance",
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

const makeKeywordTable = (resultsArr) => {
    const keywords = resultsArr.map(item => item.keyword)
    const volumes = resultsArr.map(item => item.search_volume)
    const competitions = resultsArr.map(item => item.competition)

    const table = document.createElement("table")
    table.id = "related-words-table"
    // table.style = "width:100%"
    const tableStyle = document.createElement("style")
    tableStyle.textContent = tableStyleStr
    document.body.appendChild(tableStyle)

    const tableHeader = document.createElement("tr")
    const headers = ["Keyword", "Volume", "Competition"]
    const elems = [keywords, volumes, competitions]
    for(let i = 0; i < headers.length; i++){
        const header = document.createElement("th")
        header.innerText = headers[i]
        tableHeader.appendChild(header)
    }
    table.appendChild(tableHeader)
    //make a row for 20 keywords
    const row_num = Math.min(20, keywords.length)
    for(let i = 0; i < row_num ; i++){
        const row = document.createElement("tr")
        for(let j = 0; j < elems.length; j++){
            const elem = document.createElement("td")
            elem.innerText = elems[j][i]
            row.appendChild(elem)
        }
        table.appendChild(row)
    }
        /*
    for(let i = 0; i < row_num ; i++){
        const row = document.createElement("tr")
        const keyword = document.createElement("td")
        keyword.innerText = keywords[i]
        const volume = document.createElement("td")
        volume.innerText = volumes[i]
        const competition = document.createElement("td")
        competition.innerText = competitions[i]
        row.appendChild(keyword)
        row.appendChild(volume)
        row.appendChild(competition)
        table.appendChild(row)
    }
    */
    return table
}
    

const getTextBox = (volume) => {
    document.addEventListener("DOMContentLoaded", function () {
        TextBox = document.getElementById("result-stats")
        if (TextBox) {
            TextBox.innerText = "Volume: " + volume + " " + TextBox.innerText
        }
    })
}

/*
const sample_suggestions = {
    "version": "0.1.20230825",
    "status_code": 20000,
    "status_message": "Ok.",
    "time": "2.4806 sec.",
    "cost": 0.075,
    "tasks_count": 1,
    "tasks_error": 0,
    "tasks": [
        {
            "id": "11082319-6937-0368-0000-540bc9e7560b",
            "status_code": 20000,
            "status_message": "Ok.",
            "time": "2.4272 sec.",
            "cost": 0.075,
            "result_count": 37,
            "path": [
                "v3",
                "keywords_data",
                "google_ads",
                "keywords_for_keywords",
                "live"
            ],
            "data": {
                "api": "keywords_data",
                "function": "keywords_for_keywords",
                "se": "google_ads",
                "keywords": [
                    "هاتف"
                ]
            },
            "result": [
                {
                    "keyword": "هاتف",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "MEDIUM",
                    "competition_index": 40,
                    "search_volume": 49500,
                    "low_top_of_page_bid": 0.03,
                    "high_top_of_page_bid": 0.25,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 40500
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 40500
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 40500
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 40500
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 60500
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 40500
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 74000
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 40500
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 49500
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 40500
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 33100
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 40500
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": null
                    }
                },
                {
                    "keyword": "callmyphone org",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 4,
                    "search_volume": 110,
                    "low_top_of_page_bid": 0.02,
                    "high_top_of_page_bid": 0.24,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 70
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 50
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 70
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 70
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 50
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 50
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 90
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 480
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 70
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 50
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 50
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 110
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "phone samsung galaxy z flip",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "HIGH",
                    "competition_index": 100,
                    "search_volume": 110,
                    "low_top_of_page_bid": 0.17,
                    "high_top_of_page_bid": 3.69,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 140
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 170
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 140
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 110
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 110
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 90
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 70
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 90
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 110
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 110
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 140
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 140
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "256iphone 13 pro max",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "HIGH",
                    "competition_index": 98,
                    "search_volume": 140,
                    "low_top_of_page_bid": 0.06,
                    "high_top_of_page_bid": 0.5,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 390
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 140
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 90
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 50
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 70
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 70
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 70
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 110
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 110
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 170
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 210
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 320
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "a72 mobihall",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 0,
                    "search_volume": 10,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 0
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 10
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            },
                            {
                                "name": "a72",
                                "concept_group": {
                                    "name": "Road",
                                    "type": null
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "alphone dz",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 0,
                    "search_volume": 1300,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 720
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 1000
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 1900
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 1300
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 1000
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 880
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 880
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 1300
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 1600
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 1600
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 1600
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 1900
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "arabphones",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 0,
                    "search_volume": 30,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 30
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 30
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 30
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 20
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 30
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 30
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 30
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "arabphones",
                                "concept_group": {
                                    "name": "Other Brands",
                                    "type": "OTHER_BRANDS"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "asus padfone e",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 14,
                    "search_volume": 20,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 30
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 30
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 30
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 30
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 20
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 10
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "asus",
                                "concept_group": {
                                    "name": "Other Brands",
                                    "type": "OTHER_BRANDS"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "callmy phone org",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 29,
                    "search_volume": 10,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 10
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "find my phone huawei y7 prime",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 23,
                    "search_volume": 20,
                    "low_top_of_page_bid": 0.02,
                    "high_top_of_page_bid": 0.22,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 30
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 40
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 20
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "y7",
                                "concept_group": {
                                    "name": "Variable",
                                    "type": null
                                }
                            },
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "find my phone huawei y9",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 12,
                    "search_volume": 50,
                    "low_top_of_page_bid": 0.03,
                    "high_top_of_page_bid": 0.23,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 90
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 110
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 30
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 30
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 50
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 50
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 50
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 50
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 70
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 40
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 40
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 50
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "y9",
                                "concept_group": {
                                    "name": "Variable",
                                    "type": null
                                }
                            },
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "iphone 11 mobihall",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 24,
                    "search_volume": 10,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 20
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 20
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 20
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 20
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "iphone 7 plus mobihall",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 0,
                    "search_volume": 10,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 0
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 10
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            },
                            {
                                "name": "iphone 7 plus",
                                "concept_group": {
                                    "name": "Smartphone",
                                    "type": null
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "iphone 8 mobihall",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": null,
                    "competition_index": null,
                    "search_volume": 10,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 0
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 0
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 10
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "iphone 8 plus mobihall",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 0,
                    "search_volume": 10,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 0
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 10
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            },
                            {
                                "name": "iphone 8 plus",
                                "concept_group": {
                                    "name": "Smartphone",
                                    "type": null
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "lt p9i",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 4,
                    "search_volume": 50,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 50
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 50
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 50
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 70
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 40
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 50
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 70
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 40
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 50
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 70
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 50
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 30
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "maxiphone 11 pro",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "HIGH",
                    "competition_index": 98,
                    "search_volume": 50,
                    "low_top_of_page_bid": 0.07,
                    "high_top_of_page_bid": 0.62,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 260
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 90
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 20
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 20
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 20
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 30
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "maxiphone xs",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "HIGH",
                    "competition_index": 100,
                    "search_volume": 480,
                    "low_top_of_page_bid": 0.02,
                    "high_top_of_page_bid": 0.29,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 720
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 590
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 390
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 320
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 390
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 480
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 480
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 480
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 880
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 390
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 320
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 260
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "mobihall xiaomi",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "MEDIUM",
                    "competition_index": 39,
                    "search_volume": 10,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 0
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 10
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "phones7",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 15,
                    "search_volume": 320,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 320
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 260
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 320
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 260
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 320
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 320
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 320
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 260
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 320
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 320
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 260
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 320
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "phones7 com",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 7,
                    "search_volume": 40,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 50
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 30
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 50
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 30
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 30
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 40
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 30
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 30
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 70
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "phonesamsung",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "HIGH",
                    "competition_index": 100,
                    "search_volume": 22200,
                    "low_top_of_page_bid": 0.15,
                    "high_top_of_page_bid": 4.05,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 22200
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 27100
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 27100
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 27100
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 27100
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 22200
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 27100
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 22200
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 22200
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 22200
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 22200
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 22200
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "poco f3 mobihall",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 0,
                    "search_volume": 10,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 10
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "poco x3 gt mobihall",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 0,
                    "search_volume": 10,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 10
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "poco x3 mobihall",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 0,
                    "search_volume": 10,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 0
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 10
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "poco x3 pro mobihall",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 0,
                    "search_volume": 10,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 20
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 20
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 20
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "pro maxiphone 11",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "HIGH",
                    "competition_index": 100,
                    "search_volume": 2900,
                    "low_top_of_page_bid": 0.04,
                    "high_top_of_page_bid": 0.46,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 5400
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 4400
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 4400
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 3600
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 2900
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 2400
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 1900
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 1900
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 2400
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 1600
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 1300
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 1000
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "realme 8 mobihall",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 0,
                    "search_volume": 10,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 0
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 10
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "realme",
                                "concept_group": {
                                    "name": "Other Brands",
                                    "type": "OTHER_BRANDS"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "redmi note 11 mobihall",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 20,
                    "search_volume": 10,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 20
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 20
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 10
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "samsung a51 mobihall",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 0,
                    "search_volume": 10,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 0
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 10
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            },
                            {
                                "name": "a51",
                                "concept_group": {
                                    "name": "Road",
                                    "type": null
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "samsung a71 mobihall",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": null,
                    "competition_index": null,
                    "search_volume": 10,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 0
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 0
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 0
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 0
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 0
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 10
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            },
                            {
                                "name": "a71",
                                "concept_group": {
                                    "name": "Road",
                                    "type": null
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "shawmi 11 pro",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "HIGH",
                    "competition_index": 97,
                    "search_volume": 880,
                    "low_top_of_page_bid": 0.02,
                    "high_top_of_page_bid": 0.19,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 390
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 480
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 590
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 590
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 720
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 720
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 1000
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 880
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 1300
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 1300
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 1300
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 1000
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "shawmi 11t",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "HIGH",
                    "competition_index": 97,
                    "search_volume": 368000,
                    "low_top_of_page_bid": 0.03,
                    "high_top_of_page_bid": 0.2,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 201000
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 246000
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 246000
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 246000
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 301000
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 368000
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 450000
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 450000
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 550000
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 550000
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 550000
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 550000
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "shawmi note 12",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "HIGH",
                    "competition_index": 78,
                    "search_volume": 90,
                    "low_top_of_page_bid": 0.04,
                    "high_top_of_page_bid": 0.19,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 70
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 170
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 210
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 260
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 210
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 110
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 30
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 30
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 30
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 20
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 40
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 20
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "siqiphoneparts",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 12,
                    "search_volume": 20,
                    "low_top_of_page_bid": 0.02,
                    "high_top_of_page_bid": 0.16,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 20
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 20
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 30
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 20
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "smart phone 21",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "HIGH",
                    "competition_index": 97,
                    "search_volume": 90,
                    "low_top_of_page_bid": 0.05,
                    "high_top_of_page_bid": 0.21,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 70
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 50
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 70
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 70
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 90
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 70
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 70
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 70
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 110
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 90
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 90
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 140
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                },
                {
                    "keyword": "www omanphone com",
                    "location_code": null,
                    "language_code": null,
                    "search_partners": false,
                    "competition": "LOW",
                    "competition_index": 14,
                    "search_volume": 10,
                    "low_top_of_page_bid": null,
                    "high_top_of_page_bid": null,
                    "monthly_searches": [
                        {
                            "year": 2023,
                            "month": 9,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 8,
                            "search_volume": 0
                        },
                        {
                            "year": 2023,
                            "month": 7,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 6,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 5,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 4,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 3,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 2,
                            "search_volume": 10
                        },
                        {
                            "year": 2023,
                            "month": 1,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 12,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 11,
                            "search_volume": 10
                        },
                        {
                            "year": 2022,
                            "month": 10,
                            "search_volume": 10
                        }
                    ],
                    "keyword_annotations": {
                        "concepts": [
                            {
                                "name": "omanphone",
                                "concept_group": {
                                    "name": "Others",
                                    "type": null
                                }
                            },
                            {
                                "name": "Non-Brands",
                                "concept_group": {
                                    "name": "Non-Brands",
                                    "type": "NON_BRAND"
                                }
                            }
                        ]
                    }
                }
            ]
        }
    ]
}

*/