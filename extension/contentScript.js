(() => {
    console.log("SEO Arabic Extension Initiated")
    // let searchQuery, TextBox;
    let received = false
    let logged_in = false
    // message received from background.js:
    chrome.runtime.onMessage.addListener(async(request, sender, sendResponse) => {
        // if(received){
        //     return
        // }
        // received = true
        
        
        let { type, searchWord, extensionState, authState } = request;

        if(!authState.logged_in){
            console.log("Not logged in")
            return
        }
        else{
            console.log("Logged in")
        }

        if(!extensionState.global_enable){
            return
        }
        const apiLogin = 'iskandarthe3@gmail.com'
        const apiPassword = '02e2a78f39b5bc24'
        const headers = new Headers({
            'Authorization': 'Basic ' + btoa(apiLogin + ':' + apiPassword), 
            'Content-Type': 'application/json',
        })
        if (type === "GOOGLE_SEARCH") {
            
            try{
                const stats = await volumeCPCReq(searchWord, headers)
                const relatedWordsData = await keywordsReq(searchWord, headers)
                
                const iframeContainer = document.createElement('div')
                let textBox
                let iframes = []
                if(extensionState.chart_enable){
                    iframes.push( makeChart(stats.monthly_searches))
                }
                if(extensionState.stats_enable){
                    textBox = makeTextBox(stats)
                }
                if(extensionState.word_list_enable){
                    
                    iframes.push(makeKeywordTableIframe(relatedWordsData))

                    const xlsxButt = addXLSXButton(type)
                    if(xlsxButt){
                        xlsxButt.addEventListener("click", function(){
                            XLSX_export(relatedWordsData)
                        })
                    }

                }
                insertIframes(iframes, iframeContainer)
                console.log("Iframe container:", iframeContainer)
                const google_column = document.getElementById('center_col')
                google_column.insertAdjacentElement('afterend', iframeContainer)
                chrome.storage.sync.onChanged.addListener(function(changes, namespace) {
                    console.log("Changes:", changes)
                    for (var key in changes) {
                        var storageChange = changes[key];
                
                        if(key == 'all_states'){

                            extensionState = storageChange.newValue

                            if(!extensionState.global_enable){
                                iframeContainer.innerHTML = ""
                                return
                            }
                            iframes = []
                            
                            if(extensionState.chart_enable){
                                iframes.push( makeChart(stats.monthly_searches))
                            }

                            if(extensionState.word_list_enable){
                                iframes.push(makeKeywordTableIframe(relatedWordsData))
                            }
                            //clear iframes from container:
                            iframeContainer.innerHTML = ""
                            insertIframes(iframes, iframeContainer)
                        }
                    }
                })
            }
            catch(error){
                console.error("Error:", error)
            }
            
        }
        else if(type == "AMAZON_SEARCH"){
            console.log("Amazon search", searchWord)
            volumeCPCReq(searchWord, headers)
            .then((stats) => {
                // const textBox = document.getElementsByClassName("a-section a-spacing-small a-spacing-top-small")
                const textBox = document.querySelector("#search > span:nth-child(9) > div > h1 > div > div.sg-col-14-of-20.sg-col-18-of-24.sg-col.s-breadcrumb.sg-col-10-of-16.sg-col-6-of-12 > div > div")

                textBox.innerText = ""
                
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
                    keywordsReq(searchWord, headers)
                    .then((data) => {
                        console.log("XLSX data:", data)
                        XLSX_export(data)
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


const borderRadius = 20;
const chartStyleStrNew = `
    #chart-iframe {

        width: 420px !important;
        height: 400px !important;
        border-radius: ${borderRadius}px !important;
        border: 0px !important;
        
    }`


const tableStyleStr = `
    #table-iframe {
        width: 420px !important;
        height: 600px !important;
        border-radius: ${borderRadius}px !important;
        border: 0px !important; 
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
    // container.appendChild(iframe);

    iframe.src = chrome.runtime.getURL('components/chart/chart.html');

    const iframeStyle = document.createElement('style');
    iframeStyle.textContent = chartStyleStrNew;
    document.body.appendChild(iframeStyle);
    iframe.onload = function() {
        const iframeWindow = iframe.contentWindow;
        iframeWindow.postMessage({ action: 'setMonthlyData', monthlyData: monthly_data }, '*')
        console.log('message sent');
    }
    return iframe

    
}

const makeKeywordTableIframe = (resultsArr) => {
    const iframe = document.createElement('iframe')
    iframe.id = 'table-iframe'
    // container.appendChild(iframe)


    iframe.src = chrome.runtime.getURL('components/table/table.html')

    const iframeStyle = document.createElement('style')
    iframeStyle.textContent = tableStyleStr
    document.body.appendChild(iframeStyle)

    iframe.onload = function() {
        const iframeWindow = iframe.contentWindow;
        iframeWindow.postMessage({ action: 'setKeywordTableData', data: resultsArr }, '*')
        console.log('Message sent to table iframe')
    }
    return iframe
}

const insertIframes = (iframes, iframeContainer) => {
    const initial_offset = 176
    const iframeDistance = 30
    let totalHeight = initial_offset
    const iframelastInd = iframes.length - 1

    iframes.forEach((iframe, index) => {
        if(index !== iframelastInd) {
            iframe.style.position = 'absolute'
            iframe.style.marginLeft = '80px'
        }
        else{
            iframe.style.position = 'relative'
            iframe.style.left = '80px'
        }

        if (index > 0 && index < iframelastInd) {
            iframe.style.top = `${totalHeight}px`
        }
        else if (index == iframelastInd) {
            iframe.style.top = `${totalHeight - initial_offset}px`
        }
        const iframeHeight = iframe.id == 'chart-iframe' ? 400 : 600
        console.log("offsetHeight:", iframeHeight)
        console.log("iframe", iframe)
        totalHeight += iframeHeight + iframeDistance
        iframeContainer.appendChild(iframe) 
    })

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
        // const volData = monthlySampleReturn
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
        // const cpcData = cpcSampleReturn
        if(cpcData?.tasks?.[0]?.result?.[0]?.items?.[0]?.keyword_info){
            const result_obj = cpcData.tasks[0].result[0].items[0].keyword_info
            const cpc = result_obj.cpc
            const competition = result_obj.competition
            if(cpc)stats.cpc = cpc
            if(competition)stats.competition = competition
        }
        return stats
    }catch(error){
        console.error("vol or cpc API Request Failed in contentScript.js:", error)
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
        // const data = k4kSampleReturn
        return data
    }
    catch(error){
        console.error("K4K API Request Failed in contentScript.js:", error)
        throw error
    }
}


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

