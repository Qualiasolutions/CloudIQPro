import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Cloud, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Activity,
  Server,
  Zap,
  Shield,
  Monitor,
  PieChart,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface MetricData {
  totalCost: number
  potentialSavings: number
  uptime: number
  serversCount: number
  alertsCount: number
}

interface AlertData {
  id: number
  type: 'prediction' | 'cost' | 'security' | 'performance'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  server: string
  timestamp: string
}

interface ServerData {
  id: number
  name: string
  provider: string
  region: string
  status: 'healthy' | 'warning' | 'critical'
  cpu: number
  memory: number
  cost: number
  prediction: string
  description: string
}

const mockChartData = [
  { time: '6h ago', cpu: 45, memory: 67, cost: 89 },
  { time: '5h ago', cpu: 52, memory: 71, cost: 92 },
  { time: '4h ago', cpu: 48, memory: 69, cost: 87 },
  { time: '3h ago', cpu: 61, memory: 75, cost: 94 },
  { time: '2h ago', cpu: 55, memory: 78, cost: 91 },
  { time: '1h ago', cpu: 67, memory: 82, cost: 96 },
  { time: 'Now', cpu: 58, memory: 79, cost: 93 },
]

function App() {
  const [metrics, setMetrics] = useState<MetricData>({
    totalCost: 714.40,
    potentialSavings: 142.88,
    uptime: 99.7,
    serversCount: 4,
    alertsCount: 3
  })

  const [alerts] = useState<AlertData[]>([
    {
      id: 1,
      type: "prediction",
      severity: "high",
      message: "E-commerce frontend CPU will reach 95% in 45 minutes - expected traffic surge",
      server: "web-frontend",
      timestamp: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: 2,
      type: "cost",
      severity: "medium", 
      message: "Analytics database can be downsized during off-peak hours to save $89/month",
      server: "analytics-db",
      timestamp: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: 3,
      type: "security",
      severity: "critical",
      message: "SSL certificate for payment API expires in 14 days - renewal required",
      server: "payment-api",
      timestamp: new Date(Date.now() - 1800000).toISOString()
    }
  ])

  const [servers, setServers] = useState<ServerData[]>([
    {
      id: 1,
      name: "web-frontend",
      provider: "AWS",
      region: "us-east-1",
      status: "warning",
      cpu: 78,
      memory: 82,
      cost: 189.50,
      prediction: "increasing",
      description: "E-commerce frontend cluster"
    },
    {
      id: 2,
      name: "analytics-db",
      provider: "Azure",
      region: "eastus",
      status: "healthy",
      cpu: 45,
      memory: 67,
      cost: 234.80,
      prediction: "stable",
      description: "Analytics and reporting database"
    },
    {
      id: 3,
      name: "payment-api",
      provider: "GCP",
      region: "us-central1",
      status: "critical",
      cpu: 91,
      memory: 95,
      cost: 156.20,
      prediction: "critical",
      description: "Payment processing API"
    },
    {
      id: 4,
      name: "cache-cluster",
      provider: "AWS",
      region: "us-east-1",
      status: "healthy",
      cpu: 23,
      memory: 41,
      cost: 133.90,
      prediction: "stable",
      description: "Redis cache cluster"
    }
  ])

  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = () => {
    setIsRefreshing(true)
    
    // Simulate API call
    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        totalCost: prev.totalCost + (Math.random() - 0.5) * 20,
        potentialSavings: prev.potentialSavings + (Math.random() - 0.5) * 10
      }))
      
      setServers(prev => prev.map(server => ({
        ...server,
        cpu: Math.max(10, Math.min(95, server.cpu + (Math.random() - 0.5) * 15)),
        memory: Math.max(20, Math.min(98, server.memory + (Math.random() - 0.5) * 10))
      })))
      
      setIsRefreshing(false)
    }, 1500)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData()
    }, 30000) // Auto-refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <TrendingUp className="w-4 h-4" />
      case 'cost': return <DollarSign className="w-4 h-4" />
      case 'security': return <Shield className="w-4 h-4" />
      case 'performance': return <Zap className="w-4 h-4" />
      default: return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
                <Cloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">CloudIQ Pro</h1>
                <p className="text-sm text-gray-500">AI-Powered Cloud Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Button 
                onClick={refreshData} 
                disabled={isRefreshing}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{metrics.uptime}%</div>
                <div className="text-xs text-gray-500">System Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{metrics.serversCount}</div>
                <div className="text-xs text-gray-500">Active Servers</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Monthly Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.totalCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">+2.5% from last month</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI-Predicted Savings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${metrics.potentialSavings.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">20% potential reduction</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{metrics.alertsCount}</div>
                <p className="text-xs text-muted-foreground">2 critical, 1 medium</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">Warning</div>
                <p className="text-xs text-muted-foreground">1 server needs attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Alerts and Performance Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <span>AI Alert System</span>
                    <Badge variant="destructive" className="ml-2">LIVE</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alerts.map((alert, index) => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-lg border-l-4 ${getSeverityColor(alert.severity)} hover:shadow-md transition-shadow cursor-pointer`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{alert.message}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(alert.timestamp).toLocaleTimeString()} • Server: {alert.server}
                            </div>
                          </div>
                          <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    <span>Performance Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="cpu" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          name="CPU %" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="memory" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          name="Memory %" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Infrastructure Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-indigo-500" />
                <span>Infrastructure Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {servers.map((server) => (
                  <Card key={server.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{server.name}</CardTitle>
                          <CardDescription>{server.provider} • {server.region}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(server.status)}>
                          {server.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>CPU Usage</span>
                            <span className="font-medium">{Math.round(server.cpu)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${server.cpu}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Memory Usage</span>
                            <span className="font-medium">{Math.round(server.memory)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${server.memory}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Monthly Cost</span>
                            <span className="font-semibold">${server.cost}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>AI Prediction</span>
                            <Badge 
                              variant={server.prediction === 'critical' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {server.prediction}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                © 2024 CloudIQ Pro. AI-Powered Cloud Intelligence Platform.
              </p>
              <p className="text-xs text-blue-600 font-medium mt-1">
                Powered by Qualia Solutions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App