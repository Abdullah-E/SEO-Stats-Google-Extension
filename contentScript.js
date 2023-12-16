(() => {
    console.log("SEO Arabic Extension Initiated")
    // let searchQuery, TextBox;
    let received = false
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        // if(received){
        //     return
        // }
        received = true
        const { type, searchWord, extensionState } = request;
        const apiLogin = 'iskandarth3@gmail.com'
        const apiPassword = 'cca345191c5d83c5'
        if (type === "GOOGLE_SEARCH") {
            // searchQuery = searchWord
            const headers = new Headers({
                'Authorization': 'Basic ' + btoa(apiLogin + ':' + apiPassword), 
                'Content-Type': 'application/json',
            })
           

            if(!(extensionState.stats_enable || extensionState.chart_enable)){
                return
            }
            volumeCPCReq(searchWord, headers).then((stats) => {
                //document loaded:
                window.addEventListener("load", function(){

              
                    if(extensionState.chart_enable){
                        let what = document.getElementById("rcnt")
                        console.log("elem in window load:", what)
                        makeChart(stats.monthly_searches)
                    }
                    if(extensionState.stats_enable){
                        const textBox = makeTextBox(stats)
                    }
                    
                    if(!extensionState.word_list_enable){
                        return
                    }
        
                    keywordsReq(searchWord, headers).then((data) => {
                        makeKeywordTableIframe(data)
                        //wait for element with id "result-stats" to load
                        const xlsxButt = addXLSXButton(type)
                        if(xlsxButt){
                            xlsxButt.addEventListener("click", function(){
                                XLSX_export(data)
                            })
                        }else{
                            console.log("XLSX button not added")
                        }
                    })
                })
            })
            //keywordsReqAndTable(searchQuery)
            
        }
        else if(type == "AMAZON_SEARCH"){
            const headers = new Headers({
                'Authorization': 'Basic ' + btoa(apiLogin + ':' + apiPassword), 
                'Content-Type': 'application/json',
            })
            console.log("Amazon search", searchWord)
            volumeCPCReq(searchWord, headers)
            .then((stats) => {
                console.log("Stats:", stats)
                console.log("Stats length:", Object.keys(stats).length)
                // const textBox = document.getElementsByClassName("a-section a-spacing-small a-spacing-top-small")
                const textBox = document.querySelector("#search > span:nth-child(9) > div > h1 > div > div.sg-col-14-of-20.sg-col-18-of-24.sg-col.s-breadcrumb.sg-col-10-of-16.sg-col-6-of-12 > div > div")

                textBox.innerText = ""
                volumeCPCReq(searchWord, headers).then((stats) => {
                    if(stats.volume){
                        textBox.innerText = "Volume: " + stats.volume
                    }
                    if(stats.cpc){
                        textBox.innerText = textBox.innerText + " | CPC: " + stats.cpc
                    }
                    if(stats.competition){
                        textBox.innerText = textBox.innerText + " | Competition: " + stats.competition

                    }
                    //add button to textBox
                    var XLSX_button = document.createElement("button")
                    XLSX_button.innerText = "Export XLSX"
                    XLSX_button.id = "related-words-button"
                    textBox.appendChild(XLSX_button)
                    XLSX_button.addEventListener("click", function(){
                        console.log("XLSX Button clicked")
                        keywordsReq(searchWord, headers)
                        .then((data) => {
                            console.log("XLSX data:", data)
                            XLSX_export(data)
                        })

                    })

                })
                // const textBox = document.querySelector("a-section a-spacing-small a-spacing-top-small")
                console.log("Text box:", textBox)
            })
            .catch((error) => {
                console.log("Error:", error)
            })
            
            //check if XLSX button exists
            
            

        }
    })
    
    
})()



/*
const chartStyleStrNew = `
    #chart-iframe {
        position: absolute !important;
        top: 175px !important;
        right: 25px !important;
        width: 420px !important;
        height: 350px !important;
    }`
    */
const chartStyleStrNew = `
    #chart-iframe {
        position: relative !important;
        left: 70px;
        width: 420px !important;
        height: 400px !important;
        border-radius: 40px;
    }`

/*
const tableStyleStr = `
    #related-words-table {
        position: absolute !important;
        background-color: white !important;
        color: black !important;
        top: 575px !important; 
        right: 25px !important;
        width: 420px !important;
        height: 350px !important;
        border-radius: 40px; 
        overflow: hidden; 
    }
`
*/
const tableStyleStr = `
    #table-iframe {
        position: absolute !important;
        top: 625px !important;
        right: 25px !important;
        width: 420px !important;
        height: 600px !important;
        border-radius: 40px; 
    }`;

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



const makeChart = (monthly_data) => {
    const iframe = document.createElement('iframe');
    iframe.id = 'chart-iframe';

    const containing_elem = document.getElementById('rcnt');
    const google_column = document.getElementById('center_col');
    console.log("Containing elem in func:", containing_elem)
    google_column.insertAdjacentElement('afterend', iframe)

    iframe.src = chrome.runtime.getURL('components/chart/chart.html');

    const iframeStyle = document.createElement('style');
    iframeStyle.textContent = chartStyleStrNew;
    document.body.appendChild(iframeStyle);
    iframe.onload = function() {
        const iframeWindow = iframe.contentWindow;
        iframeWindow.postMessage({ action: 'setMonthlyData', monthlyData: monthly_data }, '*')
        console.log('message sent');
    };

    
}

const makeKeywordTable = (resultsArr) => {
    const keywords = resultsArr.map(item => item.keyword)
    const volumes = resultsArr.map(item => item.search_volume)
    const competitions = resultsArr.map(item => item.competition)

    const table = document.createElement("table")
    table.id = "related-words-table"

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
    //make rows for 20 keywords (or less)
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
    return table
}

const makeKeywordTableIframe = (resultsArr) => {
    const iframe = document.createElement('iframe')
    iframe.id = 'table-iframe'
    document.body.appendChild(iframe)

    iframe.src = chrome.runtime.getURL('components/table/table.html')

    const iframeStyle = document.createElement('style')
    iframeStyle.textContent = tableStyleStr
    document.body.appendChild(iframeStyle)

    iframe.onload = function() {
        const iframeWindow = iframe.contentWindow;
        iframeWindow.postMessage({ action: 'setKeywordTableData', data: resultsArr }, '*')
        console.log('Message sent to table iframe')
    }
}

const volumeCPCReq = async (keyword, headers) => {
    let stats = {}
    try{
        const volReqData = makeRequestData(keyword, "SEARCH_VOLUME")
        const volReqObj = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(volReqData),
        }
        const volumeRequest = new Request("https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live", volReqObj)
        // const volRes = await fetch(volumeRequest)

        // console.log("Volume response:", volRes)
        // const volData = await volRes.json()
        const volData = monthlySampleReturn
        console.log("Volume data:", volData)
        if(volData?.tasks?.[0]?.result?.[0]?.search_volume){
            stats.volume = volData.tasks[0].result[0].search_volume
        }
        if(volData?.tasks?.[0]?.result?.[0]?.monthly_searches){
            stats.monthly_searches = volData.tasks[0].result[0].monthly_searches
        }
        

        const cpcReqData = makeRequestData(keyword, "CPC");
        const cpcReqObj = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(cpcReqData),
        }
        const cpcRequest = new Request("https://api.dataforseo.com/v3/dataforseo_labs/google/historical_search_volume/live", cpcReqObj);
        // const cpcRes = await fetch(cpcRequest)
        // const cpcData = await cpcRes.json()
        const cpcData = cpcSampleReturn
        if(cpcData?.tasks?.[0]?.result?.[0]?.items?.[0]?.keyword_info){
            const result_obj = cpcData.tasks[0].result[0].items[0].keyword_info
            const cpc = result_obj.cpc
            const competition = result_obj.competition
            if(cpc)stats.cpc = cpc
            if(competition)stats.competition = competition
        }
        return stats
    }catch(error){
        console.error("API Request Failed in contentScript.js:", error)
    }
}

const keywordsReq = async (keyword, headers) => {
    try{
        const k4kReqData = makeRequestData(keyword, "SUGGESTED_KEYWORDS")
        const k4kReqObj = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(k4kReqData),
        }
        // console.log("req obj:", k4kReqData)
        const k4kRequest = new Request("https://api.dataforseo.com/v3/keywords_data/google/keywords_for_keywords/live", k4kReqObj)
        // const resp = await fetch(k4kRequest)
        // const data = await resp.json()
        const data = k4kSampleReturn
        return data
    }
    catch(error){
        console.error("API Request Failed in contentScript.js:", error)
        throw error
    }
}

const keyWordsTable = async (api_response) => {
    try{
        if(api_response?.tasks?.[0]?.result){
            const results = api_response.tasks[0].result
            const keywords = results.map(item => item.keyword)

            const keywordsTable = makeKeywordTable(results)
            document.body.appendChild(keywordsTable)
            console.log("Related words:", keywords)
        }
        else{
            console.log("Missing info in api response in keywordsTable", api_response)
        }
    }
    catch(error){
        console.error("Text", error)
        throw error
    }
}

const keywordsReqAndTable = async (keyword, headers) => {
    try {
        const response = await keywordsReq(keyword, headers);
        const data = response

        if (data?.tasks?.[0]?.result) {
            const results = data.tasks[0].result;
            const keywords = results.map(item => item.keyword);

            const keywordsTable = makeKeywordTable(results);
            document.body.appendChild(keywordsTable);
            console.log("Related words:", keywords);
        } else {
            console.log("Related words request unsuccessful, missing info");
        }
    } catch (error) {
        console.error("API Request Failed in contentScript.js:", error);
    }
};

const XLSX_export = (data) => {
    const wb = XLSX.utils.book_new()

    const result = data.tasks[0].result

    const stats_headers = ["keyword", "competition", "competition_index", "search_volume"]
    const stats_rows = result.map(item => stats_headers.map(header => item[header]))
    // const stats_rows = result.map(item => [item.keyword, item.search_volume, item.competition, item.cpc])
    
    stats_rows.unshift(stats_headers)
    console.log("Stats:", stats_rows)
    const stats_ws = XLSX.utils.aoa_to_sheet(stats_rows)
    XLSX.utils.book_append_sheet(wb, stats_ws, "Stats-Related Words")

    const monthly_headers = result[0].monthly_searches.map(item => `${item.year}-${item.month}`)
    monthly_headers.unshift("keyword")

    const monthly_rows = result.map(item => [item.keyword, ...item.monthly_searches.map(monthly_item =>  monthly_item.search_volume)])
    monthly_rows.unshift(monthly_headers)
    console.log("Monthly:", monthly_rows)
    const monthly_ws = XLSX.utils.aoa_to_sheet(monthly_rows)
    XLSX.utils.book_append_sheet(wb, monthly_ws, "Monthly Vol-Related Words")

    XLSX.writeFile(wb, "Related Words.xlsx")
}
const makeTextBox = (stats) => {
    textBox = document.getElementById("result-stats")
    if(textBox.innerText != ""){
        textBox.innerText = ""
    }
    if(stats.volume){
        textBox.innerText = "Volume: " + stats.volume
    }
    if(stats.cpc){
        textBox.innerText = textBox.innerText + " | CPC: " + stats.cpc
    }
    if(stats.competition){
        textBox.innerText = textBox.innerText + " | Competition: " + stats.competition
    }
    textBox.innerText = textBox.innerText + " | "
    return textBox
}

const addXLSXButton = (type) => {
    let textBoxQuerySelector  = ""
    switch (type) {
        case "GOOGLE_SEARCH":
            textBoxQuerySelector = "#result-stats"
            break;
        case "AMAZON_SEARCH":
            textBoxQuerySelector = "#search > span:nth-child(9) > div > h1 > div > div.sg-col-14-of-20.sg-col-18-of-24.sg-col.s-breadcrumb.sg-col-10-of-16.sg-col-6-of-12 > div > div"
            break;
        default:
            break;
    }
    const textBox = document.querySelector(textBoxQuerySelector)
    if(!textBox){
        console.log("Text box not found")
        return
    }
    var XLSX_button = document.createElement("button")
    XLSX_button.innerText = "Export XLSX"
    XLSX_button.id = "related-words-button"
    textBox.appendChild(XLSX_button)
    return XLSX_button
}

const getTextBox = (volume) => {
    document.addEventListener("DOMContentLoaded", function () {
        TextBox = document.getElementById("result-stats")
        if (TextBox) {
            TextBox.innerText = "Volume: " + volume + " " + TextBox.innerText
        }
    })
}

const monthlySampleReturn = {
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

const cpcSampleReturn = {
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

const k4kSampleReturn = {
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