/**
 * 驾驶舱模块
 * 负责图表初始化、更新和交互
 */

// 全局图表实例
let pieChart = null;
let lineChart = null;

/**
 * 驾驶舱管理器
 */
const DashboardManager = {
    /**
     * 初始化驾驶舱
     */
    init: function() {
        console.log('初始化驾驶舱...');
        this.initCharts();
        this.updateDashboard();
        this.bindEvents();
    },

    /**
     * 初始化图表
     */
    initCharts: function() {
        this.initPieChart();
        this.initLineChart();
    },

    /**
     * 初始化环形图
     */
    initPieChart: function() {
        const ctx = document.getElementById('pie-chart');
        if (!ctx) {
            console.error('找不到环形图canvas元素');
            return;
        }

        pieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['高风险', '中风险', '低风险'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: [
                        '#ff4d4f',
                        '#faad14',
                        '#52c41a'
                    ],
                    borderColor: [
                        '#ff7875',
                        '#ffc53d',
                        '#73d13d'
                    ],
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    animateScale: true
                }
            }
        });

        console.log('环形图初始化完成');
    },

    /**
     * 初始化折线图
     */
    initLineChart: function() {
        const ctx = document.getElementById('line-chart');
        if (!ctx) {
            console.error('找不到折线图canvas元素');
            return;
        }

        lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: '总事件数',
                        data: [],
                        borderColor: '#1890ff',
                        backgroundColor: 'rgba(24, 144, 255, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#1890ff',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    },
                    {
                        label: '高风险事件',
                        data: [],
                        borderColor: '#ff4d4f',
                        backgroundColor: 'rgba(255, 77, 79, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.4,
                        pointBackgroundColor: '#ff4d4f',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: function(context) {
                                return `日期: ${context[0].label}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: '日期',
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: '事件数量',
                            font: {
                                size: 12
                            }
                        },
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        console.log('折线图初始化完成');
    },

    /**
     * 更新驾驶舱数据
     */
    updateDashboard: function() {
        console.log('更新驾驶舱数据...');
        
        const alarmRecords = AppDataManager.getAlarmRecords();
        const riskStats = riskEngine.calculateRiskStats(alarmRecords);
        
        this.updateKPICards(riskStats);
        this.updateCharts(riskStats);
        
        // 保存统计数据
        AppDataManager.saveDashboardStats(riskStats);
        
        console.log('驾驶舱数据更新完成');
    },

    /**
     * 更新KPI卡片
     * @param {object} riskStats - 风险统计数据
     */
    updateKPICards: function(riskStats) {
        // 更新高风险事件数
        const highRiskElement = document.getElementById('high-risk-value');
        if (highRiskElement) {
            this.animateValueChange(highRiskElement, riskStats.highRiskCount);
        }

        // 更新中风险事件数
        const mediumRiskElement = document.getElementById('medium-risk-value');
        if (mediumRiskElement) {
            this.animateValueChange(mediumRiskElement, riskStats.mediumRiskCount);
        }

        // 更新低风险事件数
        const lowRiskElement = document.getElementById('low-risk-value');
        if (lowRiskElement) {
            this.animateValueChange(lowRiskElement, riskStats.lowRiskCount);
        }

        // 更新风险趋势
        const trendElement = document.getElementById('risk-trend-value');
        if (trendElement) {
            this.animateValueChange(trendElement, riskStats.trendRate);
        }

        // 添加风险脉冲效果
        this.addRiskPulseEffect(riskStats);
    },

    /**
     * 更新图表数据
     * @param {object} riskStats - 风险统计数据
     */
    updateCharts: function(riskStats) {
        // 更新环形图
        if (pieChart) {
            pieChart.data.datasets[0].data = [
                riskStats.distribution.high,
                riskStats.distribution.medium,
                riskStats.distribution.low
            ];
            pieChart.update('active');
        }

        // 更新折线图
        if (lineChart && riskStats.dailyData) {
            lineChart.data.labels = riskStats.dailyData.dates;
            lineChart.data.datasets[0].data = riskStats.dailyData.totalEvents;
            lineChart.data.datasets[1].data = riskStats.dailyData.highRiskEvents;
            lineChart.update('active');
        }
    },

    /**
     * 数值变化动画
     * @param {HTMLElement} element - 目标元素
     * @param {number} newValue - 新值
     */
    animateValueChange: function(element, newValue) {
        const oldValue = parseInt(element.textContent) || 0;
        
        if (oldValue !== newValue) {
            element.classList.add('changing');
            element.textContent = newValue;
            
            setTimeout(() => {
                element.classList.remove('changing');
            }, 500);
        }
    },

    /**
     * 添加风险脉冲效果
     * @param {object} riskStats - 风险统计数据
     */
    addRiskPulseEffect: function(riskStats) {
        const highRiskCard = document.querySelector('.kpi-card.kpi-high');
        
        if (highRiskCard) {
            if (riskStats.highRiskCount > 5) {
                highRiskCard.classList.add('alert');
            } else {
                highRiskCard.classList.remove('alert');
            }
        }
    },

    /**
     * 绑定事件
     */
    bindEvents: function() {
        // 图表点击事件
        this.bindChartClickEvents();
        
        // 自动刷新
        this.startAutoRefresh();
    },

    /**
     * 绑定图表点击事件
     */
    bindChartClickEvents: function() {
        // 环形图点击事件
        if (pieChart) {
            pieChart.options.onClick = (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const labels = ['high', 'medium', 'low'];
                    const riskLevel = labels[index];
                    
                    // 高亮相关表格记录
                    this.highlightTableRecords(riskLevel);
                }
            };
        }

        // 折线图点击事件
        if (lineChart) {
            lineChart.options.onClick = (event, elements) => {
                if (elements.length > 0) {
                    const datasetIndex = elements[0].datasetIndex;
                    const index = elements[0].index;
                    
                    // 显示详细信息
                    this.showDayDetails(index, datasetIndex);
                }
            };
        }
    },

    /**
     * 高亮表格记录
     * @param {string} riskLevel - 风险等级
     */
    highlightTableRecords: function(riskLevel) {
        const tableBody = document.getElementById('alarm-table-body');
        if (!tableBody) return;

        const rows = tableBody.querySelectorAll('.ant-row');
        rows.forEach(row => {
            const riskLevelCell = row.querySelector('[data-field="riskLevel"]');
            if (riskLevelCell) {
                const cellValue = riskLevelCell.textContent || riskLevelCell.value;
                if (cellValue === riskLevel) {
                    row.style.backgroundColor = '#e6f7ff';
                    row.style.border = '1px solid #91d5ff';
                } else {
                    row.style.backgroundColor = '';
                    row.style.border = '';
                }
            }
        });
    },

    /**
     * 显示日期详情
     * @param {number} dayIndex - 日期索引
     * @param {number} datasetIndex - 数据集索引
     */
    showDayDetails: function(dayIndex, datasetIndex) {
        const labels = ['总事件数', '高风险事件'];
        const label = labels[datasetIndex];
        
        // 这里可以显示详细信息弹窗
        console.log(`点击了第${dayIndex + 1}天的${label}`);
    },

    /**
     * 开始自动刷新
     */
    startAutoRefresh: function() {
        // 每30秒自动刷新一次
        setInterval(() => {
            this.updateDashboard();
        }, 30000);
    },

    /**
     * 手动刷新
     */
    refresh: function() {
        console.log('手动刷新驾驶舱...');
        this.updateDashboard();
    },

    /**
     * 生成模拟数据并更新
     */
    generateMockData: function() {
        const mockRecords = riskEngine.generateMockData(10);
        
        // 清空现有数据
        AppDataManager.saveAlarmRecords([]);
        
        // 添加模拟数据
        mockRecords.forEach(record => {
            AppDataManager.addAlarmRecord(record);
        });
        
        // 更新驾驶舱
        this.updateDashboard();
        
        // 刷新表格显示
        if (window.TableManager) {
            window.TableManager.refreshAlarmTable();
        }
        
        console.log('模拟数据生成完成');
    },

    /**
     * 导出图表为图片
     * @param {string} chartType - 图表类型 ('pie' | 'line' | 'all')
     */
    exportChart: function(chartType = 'all') {
        const charts = [];
        
        if (chartType === 'pie' || chartType === 'all') {
            charts.push({ name: '风险分布图', chart: pieChart });
        }
        
        if (chartType === 'line' || chartType === 'all') {
            charts.push({ name: '趋势分析图', chart: lineChart });
        }
        
        charts.forEach(({ name, chart }) => {
            if (chart) {
                const link = document.createElement('a');
                link.download = `${name}_${new Date().toISOString().slice(0, 10)}.png`;
                link.href = chart.toBase64Image();
                link.click();
            }
        });
    }
};

// 全局函数
function refreshDashboard() {
    DashboardManager.refresh();
}

function generateMockData() {
    DashboardManager.generateMockData();
}

function exportCharts(chartType) {
    DashboardManager.exportChart(chartType);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待其他模块加载完成
    setTimeout(() => {
        DashboardManager.init();
    }, 100);
}); 