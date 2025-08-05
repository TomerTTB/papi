# 🚀 PAPI - Playright API Testing Platform

> **A comprehensive API testing and monitoring platform built with Node.js, Playwright, and modern web technologies.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.42+-blue.svg)](https://playwright.dev/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18+-lightgrey.svg)](https://expressjs.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com/)
[![AWS ECR](https://img.shields.io/badge/AWS-ECR%20Hosted-orange.svg)](https://aws.amazon.com/ecr/)

## 📋 Project Overview

PAPI is an "amazing :)" API testing platform designed for complex API ecosystems, featuring automated testing, real-time SLA monitoring, comprehensive reporting, CI/CD integration, and seamless Zephyr test management integration. Built to handle multiple environments and products with professional-grade reliability.

### 🎯 Key Highlights
- **Multi-Environment Support**: Staging, Beta, Production, and custom environments
- **Playwright Integration**: Reliable API testing framework
- **Web-Based Dashboard**: Intuitive interface for test management and execution
- **Test Management**: Automated test export/import with Zephyr integration
- **CI/CD Ready**: Docker containerization with AWS integration
- **Real-Time SLA Monitoring**: Continuous health checks with Slack integration
- **Advanced Features**: SSL monitoring, performance tracking, audit trails, and Zephyr integration
- **AWS ECR Hosted**: Professional container registry deployment

## 🏗️ Architecture Overview

### Core Components

#### 1. 🧪 **API Testing Engine** (Playwright-Powered)
- **Location**: `tests/` directory
- **Technology**: Playwright Test Framework
- **Features**:
  - Comprehensive test suites (basic, headers, validation, response structure)
  - Parallel test execution with configurable workers
  - Detailed HTML reports with timestamps
  - Cross-environment testing capabilities
  - Advanced response comparison and schema validation

**Test Categories**:
```javascript
├── basic.spec.js              // Status codes, response times
├── headers.spec.js            // Authentication, security headers
├── validation.spec.js         // Input validation, edge cases
├── response-structure.spec.js // Schema validation, data integrity
├── upload-attachments.spec.js // File upload testing
└── helpers/                   // Utilities and test helpers
```

#### 2. 🌐 **Frontend Portal** (Web Dashboard)
- **Location**: `web_server/` directory
- **Technology**: Vanilla JavaScript, Bootstrap 5, Express.js
- **Features**:
  - Product overview with endpoint statistics
  - Interactive test execution interface
  - Real-time test progress monitoring
  - Environment variable management
  - Report download and history

**Portal Pages**:
```
├── index.html           // Product dashboard
├── product.html         // Test execution interface
├── environment.html     // Environment management
├── test_management.html // Test case generation
└── docs/               // Comprehensive documentation site
```

#### 3. 📊 **SLA Monitoring System**
- **Location**: `src-sla/` directory
- **Technology**: Node.js, Express.js, Slack API
- **Features**:
  - Continuous endpoint health monitoring
  - SSL certificate expiration tracking
  - Configurable response time thresholds
  - Slack notifications for failures
  - Historical status tracking
  - Real-time dashboard with status indicators

**SLA Features**:
- Multi-region monitoring (US/EU)
- Customizable check intervals
- Automated failure recovery detection
- Performance metrics collection

#### 4. 🎭 **Mock Server** (SLA Testing Support)
- **Location**: `mock-server/` directory
- **Technology**: Node.js, Express.js, Socket.IO
- **Features**:
  - Configurable mock API endpoints
  - Real-time configuration updates via web interface
  - Dynamic response customization (status codes, delays, JSON responses)
  - Live endpoint testing capabilities
  - WebSocket-based configuration synchronization

**Mock Server Capabilities**:
- **Dynamic Configuration**: Modify endpoint responses without server restart
- **Response Simulation**: Configure custom status codes, delays, and JSON responses
- **Real-Time Testing**: Built-in endpoint testing with response time measurement
- **Web Interface**: User-friendly dashboard for configuration management
- **SLA Testing Support**: Simulate various API conditions for comprehensive SLA monitoring

#### 5. 🔧 **API Server** (Backend)
- **Location**: `src/` directory
- **Technology**: Node.js, Express.js, CORS
- **Features**:
  - RESTful API endpoints
  - Test execution orchestration
  - Environment variable management
  - File download/upload handling
  - Cross-origin resource sharing

#### 6. 📚 **Documentation Site**
- **Location**: `web_server/docs/` directory
- **Features**:
  - Interactive API documentation
  - Test methodology explanations
  - Project structure guides
  - Version history and changelogs

#### 7. 🔗 **Zephyr Integration** (Test Management)
- **Technology**: REST API integration with Zephyr Scale/Squad
- **Features**:
  - Automated test case export from PAPI to Zephyr
  - Seamless test result import into Zephyr test cycles
  - Bi-directional synchronization of test metadata
  - QA workflow automation for test management
  - Real-time test execution status updates

**Zephyr Integration Benefits**:
- **Automated Workflow**: QA testers can export new tests automatically when code is updated
- **Test Traceability**: Maintain complete audit trail from development to testing
- **Centralized Management**: Unified test management across development and QA teams
- **Compliance Support**: Structured test documentation for regulatory requirements

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** 18+ and npm
- **Git** for version control
- **Docker** (optional, for containerization)

### Installation & Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd PAPI
   npm install
   cd web_server && npm install && cd ..
   ```

2. **Configure Environment**
   ```bash
   # Copy example configuration
   cp start_example.ps1 start_local.ps1  # Windows
   cp start_example.sh start_local.sh    # macOS/Linux
   
   # Edit configuration with your API endpoints and keys
   ```

3. **Launch Platform**
   ```bash
   # Windows
   .\start_local.ps1
   
   # macOS/Linux
   chmod +x start_local.sh
   ./start_local.sh
   ```

4. **Launch Mock Server** (Optional - for SLA testing)
   ```bash
   cd mock-server
   .\mock_start.ps1  # Windows
   # or
   npm run dev       # Cross-platform
   ```

5. **Access Interfaces**
   - **Main API**: http://localhost:3000
   - **Web Dashboard**: http://localhost:8080
   - **SLA Monitor**: http://localhost:3001
   - **Mock Server API**: http://localhost:3003
   - **Mock Server Interface**: http://localhost:3004

---

## 🎮 Platform Features

### 🧪 **Automated Testing**
- **Playwright Integration**: Industry-standard testing framework
- **Multiple Test Types**: Basic validation, headers, input validation, response structure
- **Parallel Execution**: Configurable worker threads for faster testing
- **Rich Reporting**: HTML reports with screenshots and detailed logs
- **Environment Flexibility**: Test against multiple environments simultaneously

### 📊 **SLA Monitoring**
- **Real-Time Health Checks**: Continuous monitoring of API endpoints
- **SSL Certificate Monitoring**: Automated expiration alerts
- **Performance Tracking**: Response time monitoring with configurable thresholds
- **Slack Integration**: Instant notifications for failures and recoveries
- **Multi-Region Support**: Monitor US and EU endpoints independently
- **Mock Server Integration**: Test SLA monitoring with configurable mock endpoints

### 🎭 **Mock Server for SLA Testing**
- **Dynamic Configuration**: Modify endpoint behavior in real-time without restarts
- **Response Simulation**: Configure custom status codes, response delays, and JSON payloads
- **Web-Based Interface**: User-friendly dashboard for endpoint configuration
- **Live Testing**: Built-in endpoint testing with response time measurement
- **WebSocket Synchronization**: Real-time configuration updates across all clients
- **SLA Scenario Testing**: Simulate various API failure conditions for comprehensive monitoring validation

### 🌐 **Web Dashboard**
- **Product Overview**: Visual representation of API endpoints and health
- **Interactive Testing**: Point-and-click test execution
- **Environment Management**: Dynamic configuration updates
- **Report Management**: Download and view historical test reports
- **Documentation Hub**: Integrated help and API documentation
- **Zephyr Integration**: One-click test export/import functionality

### 🔗 **Zephyr Test Management Integration**
- **Automated Export**: Export test cases from PAPI to Zephyr when code is updated
- **Result Synchronization**: Import test execution results into Zephyr test cycles

### 🔄 **CI/CD Integration**
- **Docker Support**: Containerized deployment with Windows Server Core
- **Environment Variables**: Flexible configuration for different deployment stages
- **Headless Execution**: Command-line test execution for automation

---

## 📁 Project Structure

```
PAPI/
├── 🧪 tests/                    # Playwright test suites
│   ├── basic.spec.js           # Core API validation tests
│   ├── headers.spec.js         # Authentication & security tests
│   ├── validation.spec.js      # Input validation tests
│   ├── response-structure.spec.js # Schema validation tests
│   └── helpers/                # Test utilities and helpers
├── 🔧 src/                     # Backend API server
│   ├── server.js              # Express.js main server
│   ├── api.js                 # API route handlers
│   ├── testController.js      # Test execution and Zephyr integration
│   └── utils/                 # Server utilities
├── 📊 src-sla/                # SLA monitoring system
│   ├── server-sla.js          # SLA monitoring server
│   ├── sla.js                 # Core monitoring logic
│   ├── slack.js               # Slack integration
│   └── utils/                 # SLA utilities
├── 🎭 mock-server/            # Configurable mock server for SLA testing
│   ├── src/
│   │   ├── server.js          # Mock API server with Socket.IO
│   │   └── web-server.js      # Web interface server
│   ├── public/
│   │   └── index.html         # Configuration dashboard
│   ├── package.json           # Mock server dependencies
│   └── mock_start.ps1         # Windows startup script
├── 🌐 web_server/             # Frontend web application
│   ├── index.html             # Main dashboard
│   ├── product.html           # Test execution interface
│   ├── environment.html       # Environment management
│   ├── docs/                  # Documentation site
│   ├── scripts/               # Frontend JavaScript
│   └── styles/                # CSS stylesheets
├── ⚙️ config/                 # Configuration files
├── 📄 output/                 # Generated reports and files
├── 🐳 Dockerfile             # Container configuration
└── 📋 playwright.config.js   # Test framework configuration
```

---

## 🔧 Technical Implementation

### **Backend Architecture**
- **Express.js Server**: RESTful API with CORS support
- **Modular Design**: Separated concerns for testing, monitoring, and web serving
- **Environment Management**: Dynamic configuration updates
- **File Management**: Report generation and download capabilities

### **Frontend Architecture**
- **Vanilla JavaScript**: No framework dependencies, fast loading
- **Bootstrap 5**: Modern, responsive UI components
- **Template System**: Reusable HTML components
- **Real-Time Updates**: WebSocket-like functionality for live test feedback

### **Testing Framework**
- **Playwright**: Cross-browser API testing capabilities
- **Configurable Workers**: Parallel execution for performance
- **Rich Reporting**: HTML reports with detailed test information
- **Helper Functions**: Reusable test utilities and data management
- **Zephyr Integration**: Automated test case export and result import functionality

### **Monitoring System**
- **Scheduled Checks**: Configurable interval monitoring
- **Status Tracking**: Historical data collection
- **Alert System**: Slack integration for immediate notifications
- **SSL Monitoring**: Certificate expiration tracking

### **Cloud Infrastructure (AWS)**
- **ECR Container Registry**: Secure, scalable container image storage
- **Multi-AZ Deployment**: High availability across availability zones
- **IAM Integration**: Role-based access control and security
- **CloudWatch Integration**: Comprehensive logging and monitoring
- **Auto-Scaling**: Dynamic resource allocation based on demand

---

## 🚀 Deployment Options

### **Local Development**
```bash
npm run dev        # Development server with hot reload
npm run sla        # SLA monitoring service
npm run test       # Execute Playwright tests

# Mock Server (for SLA testing)
cd mock-server
npm run dev        # Start mock server with auto-reload
# or
.\mock_start.ps1   # Windows - starts both API and web interface
```

### **AWS ECR Deployment** (Production)
The platform is containerized and hosted on **Amazon Elastic Container Registry (ECR)** for professional deployment:

```bash
# Build and tag for ECR
docker build -t papi-platform .
docker tag papi-platform:latest <aws-account-id>.dkr.ecr.<region>.amazonaws.com/papi-platform:latest

# Push to ECR
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws-account-id>.dkr.ecr.<region>.amazonaws.com
docker push <aws-account-id>.dkr.ecr.<region>.amazonaws.com/papi-platform:latest
```

**ECR Benefits:**
- **Secure Container Registry**: Private, encrypted container storage
- **Integration with AWS Services**: ECS, EKS, Lambda deployment options
- **Automated Vulnerability Scanning**: Built-in security scanning
- **High Availability**: Multi-AZ redundancy and scalability
- **IAM Integration**: Fine-grained access control

### **Container Orchestration Options**
- **Amazon ECS**: Managed container orchestration
- **Amazon EKS**: Kubernetes-based deployment
- **AWS Fargate**: Serverless container execution
- **EC2 Instances**: Traditional virtual machine deployment

### **Production Features**
- Environment-specific configuration management
- SSL certificate automation with AWS Certificate Manager
- Application Load Balancer integration
- CloudWatch monitoring and alerting
- Auto-scaling based on demand

---

## 📊 Reporting & Analytics

### **Test Reports**
- **HTML Format**: Rich, interactive test reports
- **Timestamped Files**: Historical report tracking
- **Detailed Logs**: Step-by-step test execution details
- **Performance Metrics**: Response times and success rates

### **SLA Reports**
- **Real-Time Dashboard**: Live status monitoring
- **Historical Data**: Trend analysis and performance tracking
- **Alert History**: Notification logs and resolution tracking
- **SSL Status**: Certificate monitoring and expiration alerts

---

## 🔒 Security & Best Practices

### **Configuration Management**
- **Environment Variables**: Secure credential management
- **Example Files**: Template configurations without sensitive data
- **CORS Configuration**: Controlled cross-origin access
- **SSL Monitoring**: Certificate expiration tracking

### **Code Quality**
- **Modular Architecture**: Separated concerns and reusable components
- **Error Handling**: Comprehensive error management
- **Logging**: Detailed application logging
- **Documentation**: Inline code documentation and README files

---

## 🎯 Use Cases & Benefits

### **For QA Teams**
- Automated regression testing
- Comprehensive API validation
- Real-time test execution feedback
- Historical test result tracking
- **Zephyr Integration**: Seamless test case management and result synchronization
- **Automated Workflows**: Export new tests automatically when code updates occur

### **For DevOps Teams**
- CI/CD pipeline integration
- Environment health monitoring
- Automated alerting and notifications
- Container-ready deployment

### **For Development Teams**
- API endpoint validation
- Performance benchmarking
- Integration testing support
- Development environment monitoring

---

## 🔗 Zephyr Integration Workflow

PAPI provides seamless integration with Zephyr Scale/Squad for comprehensive test management:

### **Automated Test Export Process**
1. **Code Update Detection**: When API code is updated, PAPI automatically detects changes
2. **Test Generation**: New test cases are generated based on updated endpoints
3. **Zephyr Export**: QA testers can export these tests directly to Zephyr with one click
4. **Test Cycle Creation**: Tests are automatically organized into appropriate Zephyr test cycles

### **Test Execution & Import**
1. **PAPI Execution**: Run comprehensive API tests using Playwright framework
2. **Result Processing**: Test results are formatted for Zephyr compatibility
3. **Automatic Import**: Test execution results are imported into corresponding Zephyr test cycles
4. **Status Synchronization**: Real-time updates of test execution status in Zephyr

### **QA Team Benefits**
- **Reduced Manual Work**: Eliminate manual test case creation and result entry
- **Consistent Documentation**: Standardized test case format across all projects
- **Audit Trail**: Complete traceability from code changes to test execution
- **Compliance Support**: Structured test documentation for regulatory requirements

### **Configuration**
```javascript
// Zephyr integration settings
const zephyrConfig = {
  baseUrl: 'https://your-jira-instance.atlassian.net',
  projectKey: 'YOUR_PROJECT',
  testCyclePrefix: 'PAPI_Auto_',
  exportOnCodeChange: true,
  autoImportResults: true
};
```

---

## 🎭 Mock Server Usage

The integrated mock server provides a powerful way to test SLA monitoring scenarios:

### **Starting the Mock Server**
```bash
cd mock-server
.\mock_start.ps1  # Windows - automatically opens web interface
# or
npm run dev       # Cross-platform development mode
```

### **Configuration Interface**
- **Web Dashboard**: http://localhost:3004
- **Mock API Endpoints**: http://localhost:3003/[a|b|c]

### **Features**
- **Real-Time Configuration**: Modify endpoint responses without server restart
- **Response Customization**: Configure status codes, delays, and JSON responses
- **Live Testing**: Built-in endpoint testing with response time measurement
- **WebSocket Synchronization**: Configuration changes are instantly synchronized across all connected clients

### **SLA Testing Scenarios**
Use the mock server to simulate various API conditions:
- **Timeout Testing**: Configure response delays to test timeout handling
- **Error Simulation**: Set custom status codes (4xx, 5xx) to test error scenarios
- **Performance Testing**: Measure response times under different delay configurations
- **Availability Testing**: Toggle endpoints on/off to test monitoring alerts

---

## 📈 Future Enhancements

- **Database Integration**: Test result persistence
- **Advanced Analytics**: Performance trend analysis
- **Enhanced Mock Server**: Additional endpoint types and advanced response patterns
- **Load Testing**: Performance testing integration
- **Multi-Tenant Support**: Organization-level access control

---

## 🤝 Contributing

This project demonstrates professional software development practices including:
- **Clean Architecture**: Modular, maintainable code structure
- **Comprehensive Testing**: Multiple testing strategies and frameworks
- **DevOps Integration**: Docker, CI/CD, and monitoring capabilities
- **Documentation**: Thorough documentation and code comments
- **Security**: Best practices for credential management and access control

---

*Built with ❤️ using Node.js, Playwright, and modern web technologies*
