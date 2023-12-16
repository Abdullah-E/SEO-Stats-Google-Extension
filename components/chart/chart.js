let monthly_data;

async function handleMonthlyData(data) {
    // console.log('Received monthly data:', data);
    monthly_data = data;

    // Now you can use `monthly_data` in your chart rendering logic
    // console.log('Monthly Data:', monthly_data);

    // Run the chart rendering logic
    await renderChart();
}
let myChart
async function renderChart() {
    if (!monthly_data) {
        console.log('No monthly data found', monthly_data);
        return;
    }

    const selectedOption = document.querySelector('.options span.selected').innerText.toLowerCase();
    let my_labels, my_vols;

    if (selectedOption === 'years') {
        // Calculate yearly data with default values for missing months
        const yearlyData = {};
        monthly_data.forEach(item => {
            const year = item.year;
            if (!yearlyData[year]) {
                yearlyData[year] = {
                    totalVolume: 0,
                    count: 0,
                };
            }
            yearlyData[year].totalVolume += item.search_volume;
            yearlyData[year].count += 1;
        })
        // yearlyData.forEach(item => {
        //     if (item.count < 12) {
        //         item.totalVolume = item.totalVolume / item.count * 12;
        //     }
        // })

        Object.keys(yearlyData).forEach(year => {
            const item = yearlyData[year];
            if (item.count < 12) {
                item.totalVolume = item.totalVolume / item.count * 12;
            }
        })
        console.log('Yearly Data:', yearlyData);
        my_labels = Object.keys(yearlyData);
        my_vols = my_labels.map(year => yearlyData[year].totalVolume);
        
    } else {
        // Default to monthly data
        my_labels = monthly_data.map(item => `${item.year}-${item.month}`);
        my_vols = monthly_data.map(item => item.search_volume);
        my_vols.reverse();
        my_labels.reverse();
    }

    console.log('Labels:', my_labels)
    console.log('Volumes:', my_vols)
    const ctx = document.getElementById('myChart').getContext('2d');
    const labelSize = 12;
    if(myChart) myChart.destroy()
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: my_labels,
            datasets: [{
                label: 'Monthly Volume',
                data: my_vols,
                backgroundColor: 'rgba(99, 181, 166, 0.7)',
                borderColor: 'rgba(41, 43, 64, 1)',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: 'rgba(99, 181, 166, 1)',
                pointBorderColor: 'rgba(99, 181, 166, 1)',
                fill: false,
            }]
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: labelSize,
                            weight: 900,
                        },
                    },
                },
                x: {
                    ticks: {
                        font: {
                            size: labelSize,
                            weight: 900,
                        },
                    },
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
    });
}

function handleOptions() {
    const options = document.querySelectorAll('.options span');

    options.forEach(option => {
        option.addEventListener('click', async function () {
            options.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            await renderChart();
        });
    });
}

window.addEventListener('message', function(event) {
    console.log('Received message from extension:', event.data);
    // if (event.source !== window) return;

    const data = event.data;
    if (data.action === 'setMonthlyData') {
        // console.log('Setting monthly data:', data.monthlyData);
        handleMonthlyData(data.monthlyData);
    }else{
        console.log("ehhh")
    }
});

document.addEventListener("DOMContentLoaded", async function() {
    // You can perform any setup here if needed
    console.log('DOMContentLoaded');
    handleOptions()
    // If monthly data has already been received, render the chart
    if (monthly_data) {
        await renderChart();
    }else{
        console.log("no data")
    }
});
