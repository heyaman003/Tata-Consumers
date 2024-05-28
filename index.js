document.addEventListener('DOMContentLoaded', function () {
    const values = [
        { year: 'FY 20-21', financials: { RevenueFromOperations: 11602, EBITDA: 1544, ProfitBeforeTax: 1329, GroupNetProfit: 945, ReturnOnCapital: 34.7, Dividend: 405, IndiaBusiness: 7003, InternationalBusiness: 3508, NonbrandedBusiness: 1122 } },
        { year: 'FY 21-22', financials: { RevenueFromOperations: 12426, EBITDA: 1749, ProfitBeforeTax: 1508, GroupNetProfit: 1056, ReturnOnCapital: 32.8, Dividend: 605, IndiaBusiness: 7914, InternationalBusiness: 3336, NonbrandedBusiness: 1214 } },
        { year: 'FY 22-23', financials: { RevenueFromOperations: 13783, EBITDA: 1874, ProfitBeforeTax: 1634, GroupNetProfit: 1174, ReturnOnCapital: 34.3, Dividend: 845, IndiaBusiness: 8717, InternationalBusiness: 3589, NonbrandedBusiness: 1500 } },
        { year: 'FY 23-24', financials: { RevenueFromOperations: 15206, EBITDA: 2323, ProfitBeforeTax: 2023, GroupNetProfit: 1516, ReturnOnCapital: 43.3, Dividend: 775, IndiaBusiness: 9736, InternationalBusiness: 3925, NonbrandedBusiness: 1577 } },
    ];

    let yAxisKey = 'financials.RevenueFromOperations';
    let activeTab = 'RevenueFromOperations';
    let chart = null;

    function createChart() {
        const ctx = document.getElementById('myChart').getContext('2d');

        // Create gradients
        const defaultGradient = ctx.createLinearGradient(0, 0, 0, 400);
        defaultGradient.addColorStop(0, '#FBEF10');
        defaultGradient.addColorStop(0.5, '#0DB14E');
        defaultGradient.addColorStop(1, '#01AEEF');

        const specialGradient = ctx.createLinearGradient(0, 0, 0, 400);
        specialGradient.addColorStop(0, '#2c8bdf');
        specialGradient.addColorStop(0.5, 'rgb(1, 100, 199)');
        specialGradient.addColorStop(1, '#2c8bdf');

        const data = {
            labels: values.map(v => v.year),
            datasets: [{
                label: 'Constant financial growth over the years',
                data: values.map(v => v.financials[yAxisKey.split('.')[1]]),
                backgroundColor: values.map((v, index) => 
                    index === values.length - 1 ? specialGradient : defaultGradient
                ),
                borderColor: values.map((v, index) => 
                    index === values.length - 1 ? specialGradient : defaultGradient
                ),
                borderWidth: 1,
                borderRadius: {
                    topLeft: 5,
                    topRight: 5,
                },
                hoverBackgroundColor: '#2c8bdf',
                hoverBorderColor: '#2c8bdf',
            }],
        };

        const config = {
            type: 'bar',
            data,
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
                plugins: {
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        formatter: (value, context) => {
                            return value;
                        },
                    },
                },
                barThickness: 52,
                maxBarThickness: 62,
                hover: {
                    onHover: function(event, chartElement) {
                        event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
                    },
                },
            },
            plugins: [ChartDataLabels],
        };

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, config);
    }

    createChart();

    window.updateChart = (value) => {
        yAxisKey = `financials.${value}`;
        activeTab = value;
        document.querySelectorAll('.chartMenu button').forEach(button => {
            button.classList.remove('active');
        });
        document.getElementById(value).classList.add('active');
        createChart();
    };

    window.switchTab = (tab) => {
        currentTab = tab;
        document.querySelectorAll('.chart-toggle-btn div').forEach(button => {
            button.classList.remove('active-tab');
        });
        document.querySelector(`.${tab}-btn`).classList.add('active-tab');
        updateChart(activeTab);
    };

    window.downloadImage = (format) => {
        const link = document.createElement('a');
        link.download = `chart.${format}`;
        link.href = document.getElementById('myChart').toDataURL(`image/${format}`, 1.0);
        link.click();
    };
});
