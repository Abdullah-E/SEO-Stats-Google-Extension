(() => {
    console.log("SEO Arabic Extension Initiated")
    let searchQuery, TextBox;

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        const { type, searchWord, extensionState } = request;

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
                if(extensionState.chart_enable){
                    makeChart(data)
                }
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

            //keywordsReqAndTable(searchQuery)
            if(!extensionState.word_list_enable){
                return
            }
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

const keywordsReqAndTable = async (keyword) => {
    const k4kReqData = makeRequestData(keyword, "SUGGESTED_KEYWORDS")
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

const getTextBox = (volume) => {
    document.addEventListener("DOMContentLoaded", function () {
        TextBox = document.getElementById("result-stats")
        if (TextBox) {
            TextBox.innerText = "Volume: " + volume + " " + TextBox.innerText
        }
    })
}