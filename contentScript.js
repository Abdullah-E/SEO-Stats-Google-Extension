(() => {
    console.log("SEO Arabic Extension Initiated")
    // let searchQuery, TextBox;
    let received = false
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if(received){
            return
        }
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
                
                if(extensionState.chart_enable){
                    makeChart(stats.monthly_searches)
                }
                if(extensionState.stats_enable){
                    const textBox = makeTextBox(stats)
                }
                
                if(!extensionState.word_list_enable){
                    return
                }
    
                keywordsReq(searchWord, headers).then((data) => {
                    keyWordsTable(data)
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
        right: 50px !important;
        width: 500px !important;
        height: 350px !important;

    }
`
*/

const chartStyleStrNew = `
    #chart-iframe {
        position: absolute !important;
        top: 175px !important;
        right: 25px !important;
        width: 420px !important;
        height: 350px !important;
    }`
const tableStyleStr = `
    #related-words-table {
        position: absolute !important;
        background-color: white !important;
        color: black !important;
        top: 575px !important; 
        right: 25px !important;
        width: 420px !important;
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

const makeChart = (monthly_data) => {

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
    
    // const monthlySearches = monthly_data.tasks[0].result[0].monthly_searches;
    console.log("Monthly data:", monthly_data)
    const my_labels = monthly_data.map(item => `${item.year}-${item.month}`)
    const my_vols = monthly_data.map(item => item.search_volume)
    my_vols.reverse()
    my_labels.reverse()

    const ctx = iframe.contentDocument.getElementById('ChartContainer').getContext('2d')
    const labelSize = 12
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
                            size: labelSize,
                            weight: 900,

                        },
                    }
                },
                x: {
                    ticks:{
                        font:{
                            size: labelSize,
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
        const volRes = await fetch(volumeRequest)
        // console.log("Volume response:", volRes)
        const volData = await volRes.json()
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
        const cpcRes = await fetch(cpcRequest)
        const cpcData = await cpcRes.json()
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
        const resp = await fetch(k4kRequest)
        const data = await resp.json()
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