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


                

        }
    })

    
})()
const size_factor = 1


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
