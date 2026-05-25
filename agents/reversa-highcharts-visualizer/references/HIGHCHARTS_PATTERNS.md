# Highcharts.js Patterns

Reference of proven code patterns for generating professional Highcharts charts.

---

## Complete HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[Chart Title]</title>
    
    <!-- Highcharts Core (required) -->
    <script src="https://code.highcharts.com/highcharts.js"></script>
    <!-- Extra modules as needed (see table in SKILL.md) -->
    <script src="https://code.highcharts.com/modules/exporting.js"></script>
    <script src="https://code.highcharts.com/modules/export-data.js"></script>
    <script src="https://code.highcharts.com/modules/accessibility.js"></script>
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            padding: 20px;
        }
        #container {
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 20px rgba(0,0,0,0.08);
            padding: 10px;
        }
        /* For multiple charts (dashboard) */
        .chart-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .chart-card {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 2px 20px rgba(0,0,0,0.08);
            padding: 10px;
        }
    </style>
</head>
<body>
    <div id="container"></div>
    <script>
        Highcharts.chart('container', {
            // Chart options here
        });
    </script>
</body>
</html>
```

## Recommended Global Options

Apply before creating any chart:

```javascript
Highcharts.setOptions({
    lang: {
        months: ['January','February','March','April','May','June',
                 'July','August','September','October','November','December'],
        shortMonths: ['Jan','Feb','Mar','Apr','May','Jun',
                      'Jul','Aug','Sep','Oct','Nov','Dec'],
        weekdays: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
        decimalPoint: '.',
        thousandsSep: ',',
        loading: 'Loading...',
        noData: 'No data to display',
        downloadPNG: 'Download as PNG',
        downloadJPEG: 'Download as JPEG',
        downloadPDF: 'Download as PDF',
        downloadSVG: 'Download as SVG',
        downloadCSV: 'Download as CSV',
        downloadXLS: 'Download as XLS',
        viewData: 'View data table',
        printChart: 'Print chart',
        viewFullscreen: 'Fullscreen',
        exitFullscreen: 'Exit fullscreen',
        contextButtonTitle: 'Chart menu'
    }
});
```

## Professional Color Palettes

```javascript
// Default Highcharts palette (good for most cases)
// It is the default, no need to define it

// Corporate Blue palette
colors: ['#2f7ed8','#0d233a','#8bbc21','#910000','#1aadce',
         '#492970','#f28f43','#77a1e5','#c42525','#a6c96a']

// Modern Vibrant palette
colors: ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316',
         '#eab308','#22c55e','#06b6d4','#3b82f6','#a855f7']

// Dark Mode palette
colors: ['#7cb5ec','#90ed7d','#f7a35c','#8085e9','#f15c80',
         '#e4d354','#2b908f','#f45b5b','#91e8e1','#b2e87e']

// Earth Tones palette
colors: ['#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf',
         '#d62728','#1f77b4','#ff7f0e','#2ca02c','#9467bd']
```

## Full Dark Mode Theme

```javascript
const darkTheme = {
    chart: {
        backgroundColor: '#1a1a2e',
        style: { fontFamily: "'Segoe UI', Roboto, sans-serif" }
    },
    title: { style: { color: '#e0e0e0' } },
    subtitle: { style: { color: '#a0a0a0' } },
    xAxis: {
        gridLineColor: '#2a2a4a',
        labels: { style: { color: '#b0b0b0' } },
        lineColor: '#3a3a5a',
        tickColor: '#3a3a5a',
        title: { style: { color: '#c0c0c0' } }
    },
    yAxis: {
        gridLineColor: '#2a2a4a',
        labels: { style: { color: '#b0b0b0' } },
        title: { style: { color: '#c0c0c0' } }
    },
    legend: {
        itemStyle: { color: '#c0c0c0' },
        itemHoverStyle: { color: '#fff' }
    },
    tooltip: {
        backgroundColor: 'rgba(20,20,40,0.95)',
        borderColor: '#4a4a6a',
        style: { color: '#e0e0e0' }
    },
    plotOptions: {
        series: {
            dataLabels: { color: '#c0c0c0' }
        }
    },
    credits: { style: { color: '#555' } }
};

// Apply theme globally
Highcharts.setOptions(darkTheme);
```

## Formatted Tooltip (Useful Patterns)

```javascript
// Tooltip with Brazilian currency
tooltip: {
    pointFormat: '{series.name}: <b>R$ {point.y:,.2f}</b><br/>',
    shared: true,
    useHTML: true
}

// Tooltip with percentage
tooltip: {
    pointFormat: '{series.name}: <b>{point.y:.1f}%</b><br/>'
}

// Custom tooltip with HTML
tooltip: {
    useHTML: true,
    formatter: function() {
        return `<div style="padding:8px">
            <b style="font-size:14px">${this.key}</b><br/>
            <span style="color:${this.color}">●</span>
            ${this.series.name}: <b>${Highcharts.numberFormat(this.y, 0, '.', ',')}</b>
        </div>`;
    }
}

// Shared tooltip (multiple series)
tooltip: {
    shared: true,
    crosshairs: true,
    borderRadius: 8,
    shadow: true
}
```

## Axis Formatting

```javascript
// Y axis with currency
yAxis: {
    title: { text: 'Revenue' },
    labels: {
        formatter: function() {
            return 'R$ ' + Highcharts.numberFormat(this.value, 0, '.', ',');
        }
    }
}

// Time-based X axis
xAxis: {
    type: 'datetime',
    dateTimeLabelFormats: {
        month: '%b %Y',
        year: '%Y'
    }
}

// Axis with rotated categories
xAxis: {
    categories: [...],
    labels: { rotation: -45, style: { fontSize: '11px' } }
}
```

## Animations

```javascript
// Entry animation
plotOptions: {
    series: {
        animation: {
            duration: 1500,
            easing: 'easeOutBounce'
        }
    }
}

// Staggered animation (each series delayed)
plotOptions: {
    series: {
        animation: { duration: 1000 },
        // each point appears with delay
        dataSorting: { enabled: true }
    }
}
```

## Responsiveness

```javascript
responsive: {
    rules: [{
        condition: { maxWidth: 500 },
        chartOptions: {
            legend: { layout: 'horizontal', align: 'center', verticalAlign: 'bottom' },
            yAxis: { title: { text: null } },
            subtitle: { text: null }
        }
    }]
}
```

## Dashboard with Multiple Charts

```html
<div class="chart-grid">
    <div class="chart-card" id="chart1"></div>
    <div class="chart-card" id="chart2"></div>
    <div class="chart-card" id="chart3"></div>
    <div class="chart-card" id="chart4"></div>
</div>
<script>
    // KPI cards + charts in grid
    Highcharts.chart('chart1', { /* options */ });
    Highcharts.chart('chart2', { /* options */ });
    Highcharts.chart('chart3', { /* options */ });
    Highcharts.chart('chart4', { /* options */ });
</script>
```

## Large Data (Boost Module)

```javascript
// For series with >10,000 points
// Include: <script src="https://code.highcharts.com/modules/boost.js"></script>
{
    boost: { useGPUTranslations: true },
    series: [{
        boostThreshold: 5000, // enable boost above 5k points
        data: massiveDataArray
    }]
}
```

## Useful Events

```javascript
chart: {
    events: {
        load: function() {
            // Run after chart renders
            console.log('Chart loaded');
        },
        redraw: function() {
            // After resize or update
        }
    }
},
plotOptions: {
    series: {
        events: {
            click: function(e) {
                alert(e.point.category + ': ' + e.point.y);
            }
        },
        point: {
            events: {
                mouseOver: function() {
                    // Highlight on hover
                }
            }
        }
    }
}
```

## Annotations

```javascript
// Requires: modules/annotations.js
annotations: [{
    labels: [{
        point: { x: 3, y: 150, xAxis: 0, yAxis: 0 },
        text: 'Important point!',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderColor: '#666',
        shape: 'callout'
    }],
    labelOptions: {
        borderRadius: 5,
        padding: 10
    }
}]
```