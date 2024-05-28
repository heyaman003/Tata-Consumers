var options1 = {
    series: [67, 33],
    chart: {
        width: 500,
        height: 500,
        type: 'donut',
    },
    labels: ["India", "International"],
    dataLabels: {
        enabled: false
    },
    responsive: [{
        breakpoint: 480,
        options: {
            chart: {
                width: 200,
                height: 200
            },
            legend: {
                show: false
            }
        }
    }],
    legend: {
        position: 'bottom',
        offsetY: 0,
        height: 100,
    }
};

var options2 = {
    series: [71, 29],
    chart: {
        width: 500,
        height: 500,
        type: 'donut',
    },
    labels: ["India", "International"],
    dataLabels: {
        enabled: false
    },
    responsive: [{
        breakpoint: 480,
        options: {
            chart: {
                width: 480,
                height: 480
            },
            legend: {
                show: false
            }
        }
    }],
    legend: {
        position: 'bottom',
        offsetY: 0,
        height: 100,
    }
};

var chart1 = new ApexCharts(document.querySelector("#chart-year1"), options1);
var chart2 = new ApexCharts(document.querySelector("#chart-year2"), options2);
chart1.render();
chart2.render();

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        var newSeriesYear1 = JSON.parse(this.getAttribute('data-series-year1'));
        var newLabelsYear1 = JSON.parse(this.getAttribute('data-labels-year1'));
        var newSeriesYear2 = JSON.parse(this.getAttribute('data-series-year2'));
        var newLabelsYear2 = JSON.parse(this.getAttribute('data-labels-year2'));
        var year1 = this.getAttribute('data-year1');
        var year2 = this.getAttribute('data-year2');

        chart1.updateOptions({
            series: newSeriesYear1,
            labels: newLabelsYear1
        });

        chart2.updateOptions({
            series: newSeriesYear2,
            labels: newLabelsYear2
        });

        document.getElementById('year-display1').innerText = year1;
        document.getElementById('year-display2').innerText = year2;
    });
});
