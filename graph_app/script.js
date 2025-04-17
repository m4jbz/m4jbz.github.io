class CSVChartVisualizer {
  constructor() {
    this.chartInstance = null;
    this.csvData = null;
    this.headers = [];
    this.chartType = 'bar';
    
    // DOM elements
    this.fileInput = document.getElementById('csvFile');
    this.chartTypeSelect = document.getElementById('chartType');
    this.xAxisSelect = document.getElementById('xAxis');
    this.yAxisSelect = document.getElementById('yAxis');
    this.generateButton = document.getElementById('generateChart');
    this.chartCanvas = document.getElementById('chartCanvas');
    
    // Initialize event listeners
    this.initEventListeners();
  }
  
  initEventListeners() {
    // Listen for file input changes
    this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    
    // Listen for chart type changes
    this.chartTypeSelect.addEventListener('change', () => {
      this.chartType = this.chartTypeSelect.value;
      this.updateAxisVisibility();
    });
    
    // Listen for generate button clicks
    this.generateButton.addEventListener('click', () => this.generateChart());
    
    // Initial visibility setup
    this.updateAxisVisibility();
  }
  
  updateAxisVisibility() {
    const xAxisGroup = document.getElementById('xAxisGroup');
    const yAxisGroup = document.getElementById('yAxisGroup');
    
    // Show/hide axis selectors based on chart type
    if (this.chartType === 'pie') {
      xAxisGroup.style.display = 'block';
      yAxisGroup.style.display = 'block';
      xAxisGroup.querySelector('label').textContent = 'Labels:';
      yAxisGroup.querySelector('label').textContent = 'Values:';
    } else if (this.chartType === 'histogram') {
      xAxisGroup.style.display = 'block';
      yAxisGroup.style.display = 'none';
      xAxisGroup.querySelector('label').textContent = 'Data Column:';
    } else {
      xAxisGroup.style.display = 'block';
      yAxisGroup.style.display = 'block';
      xAxisGroup.querySelector('label').textContent = 'X-Axis:';
      yAxisGroup.querySelector('label').textContent = 'Y-Axis:';
    }
  }
  
  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Use PapaParse to parse the CSV file
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        this.csvData = results.data;
        this.headers = results.meta.fields;
        
        // Populate the axis dropdowns
        this.populateAxisDropdowns();
        
        // Enable the generate button
        this.generateButton.disabled = false;
      },
      error: (error) => {
        console.error('Error al analizar CSV:', error);
        alert('Error analizando archivo CSV. Por favor revisa el formato e intenta de nuevo.');
      }
    });
  }
  
  populateAxisDropdowns() {
    // Clear existing options
    this.xAxisSelect.innerHTML = '';
    this.yAxisSelect.innerHTML = '';
    
    // Add new options from headers
    this.headers.forEach(header => {
      const xOption = document.createElement('option');
      xOption.value = header;
      xOption.textContent = header;
      this.xAxisSelect.appendChild(xOption);
      
      const yOption = document.createElement('option');
      yOption.value = header;
      yOption.textContent = header;
      this.yAxisSelect.appendChild(yOption);
    });
    
    // Select the second column for Y-axis by default if available
    if (this.headers.length > 1) {
      this.yAxisSelect.selectedIndex = 1;
    }
  }
  
  generateChart() {
    if (!this.csvData || this.csvData.length === 0) {
      alert('Por favor sube un archivo CSV primero.');
      return;
    }
    
    // Destroy existing chart if any
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    
    // Get selected axes
    const xAxisField = this.xAxisSelect.value;
    const yAxisField = this.yAxisSelect.value;
    
    // Generate the appropriate chart based on selection
    switch (this.chartType) {
      case 'bar':
        this.createBarChart(xAxisField, yAxisField);
        break;
      case 'pie':
        this.createPieChart(xAxisField, yAxisField);
        break;
      case 'line':
        this.createLineChart(xAxisField, yAxisField);
        break;
      case 'scatter':
        this.createScatterChart(xAxisField, yAxisField);
        break;
      case 'histogram':
        this.createHistogram(xAxisField);
        break;
      default:
        alert('Tipo de gráfica no soportado');
    }
  }
  
  createBarChart(xAxisField, yAxisField) {
    const labels = this.csvData.map(row => row[xAxisField]);
    const data = this.csvData.map(row => row[yAxisField]);
    
    const ctx = this.chartCanvas.getContext('2d');
    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: yAxisField,
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: yAxisField
            }
          },
          x: {
            title: {
              display: true,
              text: xAxisField
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: `${yAxisField} by ${xAxisField}`,
            font: {
              size: 16
            }
          }
        }
      }
    });
  }
  
  createPieChart(labelField, valueField) {
    const labels = this.csvData.map(row => row[labelField]);
    const data = this.csvData.map(row => row[valueField]);
    
    // Generate colors for each slice
    const colors = this.generateColors(data.length);
    
    const ctx = this.chartCanvas.getContext('2d');
    this.chartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: '#ffffff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `${valueField} Distribution by ${labelField}`,
            font: {
              size: 16
            }
          },
          legend: {
            position: 'right'
          }
        }
      }
    });
  }
  
  createLineChart(xAxisField, yAxisField) {
    // Sort data by x-axis values for line charts to ensure correct connection
    const sortedData = [...this.csvData].sort((a, b) => {
      return a[xAxisField] - b[xAxisField];
    });
    
    const labels = sortedData.map(row => row[xAxisField]);
    const data = sortedData.map(row => row[yAxisField]);
    
    const ctx = this.chartCanvas.getContext('2d');
    this.chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: yAxisField,
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          tension: 0.1,
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              text: yAxisField
            }
          },
          x: {
            title: {
              display: true,
              text: xAxisField
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: `${yAxisField} vs ${xAxisField}`,
            font: {
              size: 16
            }
          }
        }
      }
    });
  }
  
  createScatterChart(xAxisField, yAxisField) {
    const data = this.csvData.map(row => ({
      x: row[xAxisField],
      y: row[yAxisField]
    }));
    
    const ctx = this.chartCanvas.getContext('2d');
    this.chartInstance = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: `${yAxisField} vs ${xAxisField}`,
          data: data,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: {
              display: true,
              text: xAxisField
            }
          },
          y: {
            title: {
              display: true,
              text: yAxisField
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: `Scatter Plot: ${yAxisField} vs ${xAxisField}`,
            font: {
              size: 16
            }
          }
        }
      }
    });
  }
  
  createHistogram(dataField) {
    // Extract numerical data from the selected column
    const rawData = this.csvData.map(row => row[dataField]).filter(val => !isNaN(val));
    
    // Calculate histogram bins
    const binCount = Math.ceil(Math.sqrt(rawData.length)); // Square root rule for bin count
    const min = Math.min(...rawData);
    const max = Math.max(...rawData);
    const binWidth = (max - min) / binCount;
    
    // Create bins
    const bins = Array(binCount).fill(0);
    const binLabels = [];
    
    // Calculate bin edges
    for (let i = 0; i < binCount; i++) {
      const binStart = min + i * binWidth;
      const binEnd = binStart + binWidth;
      binLabels.push(`${binStart.toFixed(2)} - ${binEnd.toFixed(2)}`);
    }
    
    // Count values in each bin
    rawData.forEach(value => {
      // Handle the edge case for the maximum value
      if (value === max) {
        bins[binCount - 1]++;
      } else {
        const binIndex = Math.floor((value - min) / binWidth);
        bins[binIndex]++;
      }
    });
    
    const ctx = this.chartCanvas.getContext('2d');
    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: binLabels,
        datasets: [{
          label: `Frequency of ${dataField}`,
          data: bins,
          backgroundColor: 'rgba(153, 102, 255, 0.7)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Frequency'
            }
          },
          x: {
            title: {
              display: true,
              text: dataField + ' Ranges'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: `Histogram of ${dataField}`,
            font: {
              size: 16
            }
          }
        }
      }
    });
  }
  
  generateColors(count) {
    const colors = [];
    const hueStep = 360 / count;
    
    for (let i = 0; i < count; i++) {
      const hue = i * hueStep;
      colors.push(`hsl(${hue}, 70%, 60%)`);
    }
    
    return colors;
  }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  new CSVChartVisualizer();
});