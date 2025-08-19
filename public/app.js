class CloudIQPro {
    constructor() {
        this.ws = null;
        this.data = null;
        this.chart = null;
        this.init();
    }

    init() {
        this.connectWebSocket();
        this.initializeChart();
        this.loadInitialData();
    }

    connectWebSocket() {
        this.ws = new WebSocket('ws://localhost:8080');
        
        this.ws.onopen = () => {
            console.log('Connected to CloudIQ Pro WebSocket');
        };
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            
            if (message.type === 'initial' || message.type === 'update') {
                this.data = message.data;
                this.updateDashboard();
            }
        };
        
        this.ws.onclose = () => {
            console.log('WebSocket connection closed. Attempting to reconnect...');
            setTimeout(() => this.connectWebSocket(), 3000);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    async loadInitialData() {
        try {
            const response = await fetch('/api/infrastructure');
            this.data = await response.json();
            this.updateDashboard();
        } catch (error) {
            console.error('Failed to load initial data:', error);
        }
    }

    updateDashboard() {
        if (!this.data) return;
        
        this.updateMetrics();
        this.updateAlerts();
        this.updateServers();
        this.updateRecommendations();
        this.updateChart();
    }

    updateMetrics() {
        const metrics = this.data.metrics;
        
        document.getElementById('total-cost').textContent = `€${metrics.totalCost.toFixed(2)}`;
        document.getElementById('potential-savings').textContent = `€${metrics.potentialSavings.toFixed(2)}`;
        document.getElementById('uptime').textContent = `${metrics.uptime}%`;
        document.getElementById('total-servers').textContent = metrics.serversCount;
        document.getElementById('alerts-count').textContent = metrics.alertsCount;
    }

    updateAlerts() {
        const container = document.getElementById('alerts-container');
        container.innerHTML = '';
        
        this.data.alerts.slice(0, 5).forEach(alert => {
            const alertDiv = document.createElement('div');
            const severityClasses = {
                low: 'bg-blue-50 border-l-4 border-l-blue-500',
                medium: 'bg-yellow-50 border-l-4 border-l-yellow-500',
                high: 'bg-red-50 border-l-4 border-l-red-500'
            };
            
            const severityTextClasses = {
                low: 'text-blue-800',
                medium: 'text-yellow-800',
                high: 'text-red-800'
            };
            
            const severityBadgeClasses = {
                low: 'bg-blue-100 text-blue-800',
                medium: 'bg-yellow-100 text-yellow-800',
                high: 'bg-red-100 text-red-800'
            };
            
            const icons = {
                anomaly: `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                          </svg>`,
                prediction: `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                             </svg>`,
                cost: `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                       </svg>`,
                security: `<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                           </svg>`
            };
            
            alertDiv.className = `p-4 ${severityClasses[alert.severity]} ${severityTextClasses[alert.severity]}`;
            alertDiv.innerHTML = `
                <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0 mt-0.5">
                        ${icons[alert.type]}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium">${alert.message}</div>
                        <div class="text-xs text-muted-foreground mt-1">
                            ${new Date(alert.timestamp).toLocaleTimeString()} • Server: ${alert.server}
                        </div>
                    </div>
                    <span class="inline-flex items-center px-2 py-1 text-xs font-medium ${severityBadgeClasses[alert.severity]}">
                        ${alert.severity.toUpperCase()}
                    </span>
                </div>
            `;
            
            container.appendChild(alertDiv);
        });
    }

    updateServers() {
        const container = document.getElementById('servers-grid');
        container.innerHTML = '';
        
        this.data.servers.forEach(server => {
            const serverCard = document.createElement('div');
            const statusClasses = {
                healthy: 'bg-green-100 text-green-800',
                warning: 'bg-yellow-100 text-yellow-800',
                critical: 'bg-red-100 text-red-800'
            };
            
            const providerLogos = {
                AWS: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.8 15.2c-2.2 0-4.3-.5-6.1-1.6-.2-.1-.2-.4 0-.5.1-.1.3-.1.4 0 1.6.9 3.5 1.4 5.7 1.4 2.8 0 5.9-.6 8.6-1.8.1 0 .3 0 .4.1.1.1.1.3 0 .4-2.9 1.4-6.2 2-9 2zm9.8-2.4c-.3-.4-2.1-.2-2.9-.1-.3 0-.3-.2-.1-.4 1.4-1 3.7-.7 4-.4.3.4-.1 2.8-.2 3.9 0 .3-.2.2-.2 0 0-.9-.3-3 .4-3z"/>
                      </svg>`,
                Azure: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M5.1 14.7l4.8-11.3c.2-.4.6-.7 1.1-.7h2c.4 0 .8.2 1 .6l7.5 17.1c.2.4-.1.9-.5.9H18c-.4 0-.8-.2-1-.6l-1.9-4.3H8.9l-3.3 4.8c-.2.3-.5.4-.8.4H2.6c-.4 0-.7-.5-.5-.9zm7.4-8.2L9.8 12h5.4l-2.7-5.5z"/>
                        </svg>`,
                GCP: `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M12.5 8.7c-.8-.6-1.8-.9-2.8-.9-2.4 0-4.4 2-4.4 4.4s2 4.4 4.4 4.4c1.4 0 2.6-.7 3.4-1.7h-3.4v-1.8h5.9c.1.4.1.8.1 1.2 0 3.3-2.2 5.7-5.9 5.7-3.4 0-6.2-2.8-6.2-6.2s2.8-6.2 6.2-6.2c1.7 0 3.2.7 4.3 1.8l-1.6 1.3z"/>
                       </svg>`
            };
            
            serverCard.className = 'bg-card border server-card p-4';
            serverCard.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="text-gray-600">
                            ${providerLogos[server.provider]}
                        </div>
                        <div>
                            <h3 class="font-semibold text-foreground">${server.name}</h3>
                            <p class="text-xs text-muted-foreground">${server.provider} • ${server.region}</p>
                        </div>
                    </div>
                    <span class="inline-flex items-center px-2 py-1 text-xs font-medium ${statusClasses[server.status]}">
                        ${server.status.toUpperCase()}
                    </span>
                </div>
                
                <div class="space-y-3">
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-muted-foreground">CPU Usage</span>
                            <span class="font-medium">${server.cpu}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-indicator" style="width: ${server.cpu}%"></div>
                        </div>
                    </div>
                    
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-muted-foreground">Memory Usage</span>
                            <span class="font-medium">${server.memory}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-indicator" style="width: ${server.memory}%"></div>
                        </div>
                    </div>
                    
                    <div class="pt-3 border-t space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-muted-foreground">Monthly Cost</span>
                            <span class="font-semibold">€${server.cost}</span>
                        </div>
                        
                        <div class="flex justify-between text-sm">
                            <span class="text-muted-foreground">AI Prediction</span>
                            <span class="font-medium ${server.prediction === 'critical' ? 'text-red-600' : server.prediction === 'increasing' ? 'text-yellow-600' : 'text-green-600'}">
                                ${server.prediction}
                            </span>
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(serverCard);
        });
    }

    async updateRecommendations() {
        try {
            const response = await fetch('/api/ai-analysis');
            const analysis = await response.json();
            
            const container = document.getElementById('recommendations-container');
            container.innerHTML = '';
            
            analysis.recommendations.forEach(rec => {
                const recCard = document.createElement('div');
                const typeIcons = {
                    cost: `<svg class="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                           </svg>`,
                    performance: `<svg class="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                  </svg>`,
                    security: `<svg class="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                               </svg>`
                };
                
                recCard.className = 'bg-card border p-4 server-card';
                recCard.innerHTML = `
                    <div class="flex items-start space-x-3">
                        <div class="flex-shrink-0 mt-1">
                            ${typeIcons[rec.type]}
                        </div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-foreground capitalize mb-2">${rec.type} Optimization</h4>
                            <p class="text-sm text-muted-foreground mb-3">${rec.description}</p>
                            
                            ${rec.savings ? `<div class="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium">
                                Potential Savings: €${rec.savings}
                            </div>` : ''}
                            
                            ${rec.impact ? `<div class="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium">
                                ${rec.impact}
                            </div>` : ''}
                            
                            ${rec.priority ? `<div class="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs font-medium">
                                Priority: ${rec.priority}
                            </div>` : ''}
                        </div>
                    </div>
                `;
                
                container.appendChild(recCard);
            });
        } catch (error) {
            console.error('Failed to load AI recommendations:', error);
        }
    }

    initializeChart() {
        const ctx = document.getElementById('performance-chart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['6h ago', '5h ago', '4h ago', '3h ago', '2h ago', '1h ago', 'Now'],
                datasets: [{
                    label: 'CPU Usage (%)',
                    data: [45, 52, 48, 61, 55, 67, 58],
                    borderColor: 'hsl(221.2 83.2% 53.3%)',
                    backgroundColor: 'hsl(221.2 83.2% 53.3% / 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Memory Usage (%)',
                    data: [67, 71, 69, 75, 78, 82, 79],
                    borderColor: 'hsl(262.1 83.3% 57.8%)',
                    backgroundColor: 'hsl(262.1 83.3% 57.8% / 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            padding: 20,
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'hsl(214.3 31.8% 91.4%)'
                        },
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'hsl(214.3 31.8% 91.4%)'
                        },
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 3,
                        hoverRadius: 6
                    }
                }
            }
        });
    }

    updateChart() {
        if (!this.chart || !this.data) return;
        
        // Simulate real-time data updates
        const currentCpu = this.data.servers.reduce((sum, s) => sum + s.cpu, 0) / this.data.servers.length;
        const currentMemory = this.data.servers.reduce((sum, s) => sum + s.memory, 0) / this.data.servers.length;
        
        this.chart.data.datasets[0].data.shift();
        this.chart.data.datasets[0].data.push(Math.round(currentCpu));
        
        this.chart.data.datasets[1].data.shift();
        this.chart.data.datasets[1].data.push(Math.round(currentMemory));
        
        this.chart.update('none');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CloudIQPro();
});