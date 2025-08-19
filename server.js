const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Mock cloud infrastructure data
let infrastructureData = {
  servers: [
    { id: 'srv-001', name: 'Web Server 1', provider: 'AWS', region: 'eu-central-1', status: 'healthy', cpu: 45, memory: 67, cost: 156.80, prediction: 'stable' },
    { id: 'srv-002', name: 'Database Server', provider: 'Azure', region: 'West Europe', status: 'warning', cpu: 78, memory: 89, cost: 289.50, prediction: 'increasing' },
    { id: 'srv-003', name: 'Load Balancer', provider: 'GCP', region: 'europe-west1', status: 'healthy', cpu: 34, memory: 23, cost: 89.20, prediction: 'stable' },
    { id: 'srv-004', name: 'Cache Server', provider: 'AWS', region: 'eu-central-1', status: 'critical', cpu: 92, memory: 95, cost: 178.90, prediction: 'critical' }
  ],
  alerts: [
    { id: 1, type: 'anomaly', severity: 'high', message: 'Unusual CPU spike detected on Database Server', timestamp: new Date().toISOString(), server: 'srv-002' },
    { id: 2, type: 'prediction', severity: 'medium', message: 'Memory usage will exceed 90% in 45 minutes', timestamp: new Date().toISOString(), server: 'srv-002' },
    { id: 3, type: 'cost', severity: 'low', message: 'Cost optimization opportunity: downsize Cache Server during off-peak hours', timestamp: new Date().toISOString(), server: 'srv-004' }
  ],
  metrics: {
    totalCost: 714.40,
    potentialSavings: 142.88,
    uptime: 99.7,
    alertsCount: 3,
    serversCount: 4
  }
};

// AI-powered predictions and anomaly detection
function generateAIInsights() {
  // Simulate AI anomaly detection
  infrastructureData.servers.forEach(server => {
    if (Math.random() > 0.7) {
      server.cpu += Math.floor(Math.random() * 10 - 5);
      server.memory += Math.floor(Math.random() * 10 - 5);
      server.cpu = Math.max(0, Math.min(100, server.cpu));
      server.memory = Math.max(0, Math.min(100, server.memory));
      
      // Update status based on metrics
      if (server.cpu > 85 || server.memory > 90) {
        server.status = 'critical';
        server.prediction = 'critical';
      } else if (server.cpu > 70 || server.memory > 75) {
        server.status = 'warning';
        server.prediction = 'increasing';
      } else {
        server.status = 'healthy';
        server.prediction = 'stable';
      }
    }
  });

  // Generate new alerts based on AI analysis
  if (Math.random() > 0.8) {
    const alertTypes = ['anomaly', 'prediction', 'cost', 'security'];
    const severities = ['low', 'medium', 'high'];
    const messages = [
      'AI detected unusual network traffic pattern',
      'Predictive model forecasts storage capacity issue',
      'Cost optimization recommendation available',
      'Security anomaly detected in access patterns',
      'Performance degradation predicted in 30 minutes'
    ];
    
    const newAlert = {
      id: Date.now(),
      type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date().toISOString(),
      server: infrastructureData.servers[Math.floor(Math.random() * infrastructureData.servers.length)].id
    };
    
    infrastructureData.alerts.unshift(newAlert);
    infrastructureData.alerts = infrastructureData.alerts.slice(0, 10); // Keep only latest 10 alerts
  }

  // Update metrics
  infrastructureData.metrics.totalCost = infrastructureData.servers.reduce((sum, server) => sum + server.cost, 0);
  infrastructureData.metrics.potentialSavings = infrastructureData.metrics.totalCost * 0.2;
  infrastructureData.metrics.alertsCount = infrastructureData.alerts.length;
}

// WebSocket connection for real-time updates
wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  // Send initial data
  ws.send(JSON.stringify({ type: 'initial', data: infrastructureData }));
  
  // Send updates every 5 seconds
  const interval = setInterval(() => {
    generateAIInsights();
    ws.send(JSON.stringify({ type: 'update', data: infrastructureData }));
  }, 5000);
  
  ws.on('close', () => {
    clearInterval(interval);
    console.log('Client disconnected from WebSocket');
  });
});

// API Endpoints
app.get('/api/infrastructure', (req, res) => {
  res.json(infrastructureData);
});

app.get('/api/servers', (req, res) => {
  res.json(infrastructureData.servers);
});

app.get('/api/alerts', (req, res) => {
  res.json(infrastructureData.alerts);
});

app.get('/api/metrics', (req, res) => {
  res.json(infrastructureData.metrics);
});

app.get('/api/ai-analysis', (req, res) => {
  // Simulate AI analysis response
  const analysis = {
    anomalies: infrastructureData.servers.filter(s => s.status === 'critical' || s.status === 'warning').length,
    predictions: [
      { server: 'srv-002', metric: 'memory', forecast: '95% in 45 minutes', confidence: 87 },
      { server: 'srv-004', metric: 'cpu', forecast: 'Critical threshold in 2 hours', confidence: 92 }
    ],
    recommendations: [
      { type: 'cost', description: 'Scale down srv-003 during off-peak hours', savings: 45.60 },
      { type: 'performance', description: 'Add auto-scaling to srv-001', impact: 'Improved response time' },
      { type: 'security', description: 'Enable enhanced monitoring on srv-002', priority: 'High' }
    ]
  };
  res.json(analysis);
});

app.listen(PORT, () => {
  console.log(`CloudIQ Pro Demo Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:8080`);
});