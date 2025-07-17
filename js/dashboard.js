/**
 * 驾驶舱模块
 * 负责图表初始化、更新和交互
 */

// 仪表板功能模块
class Dashboard {
    constructor() {
        this.metrics = {
            highRisk: 0,
            mediumRisk: 0,
            lowRisk: 0,
            totalEvents: 0
        };
        this.trendData = [];
        this.init();
    }

    init() {
        console.log('初始化仪表板...');
        
        // 确保数据存储已初始化
        if (!window.dataStorage) {
            console.log('DataStorage未初始化，创建实例...');
            window.dataStorage = new DataStorage();
            window.dataStorage.generateMockData();
        }
        
        this.updateMetrics();
        this.initDonutChart();
        
        // 延迟初始化趋势图，确保DOM元素已准备好
        setTimeout(() => {
            this.initTrendChart();
        }, 100);
        
        this.bindEvents();
        
        console.log('仪表板初始化完成');
    }

    // 更新指标数据
    updateMetrics() {
        console.log('更新仪表板指标...');
        
        // 检查是否有DataStorage实例
        if (typeof window.dataStorage !== 'undefined' && window.dataStorage) {
            const alarmRecords = window.dataStorage.getAlarmRecords();
            console.log('获取到告警记录:', alarmRecords.length);
            
            const now = new Date();
            const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            // 统计24小时内的风险事件
            const recentAlarms = alarmRecords.filter(record => 
                new Date(record.triggerTime) > oneDayAgo
            );

            this.metrics.highRisk = recentAlarms.filter(r => r.riskLevel === 'high').length;
            this.metrics.mediumRisk = recentAlarms.filter(r => r.riskLevel === 'medium').length;
            this.metrics.lowRisk = recentAlarms.filter(r => r.riskLevel === 'low').length;
            this.metrics.totalEvents = recentAlarms.length;
            
            console.log('指标计算结果:', this.metrics);
        } else {
            // 如果没有DataStorage实例，使用默认值
            this.metrics.highRisk = 0;
            this.metrics.mediumRisk = 0;
            this.metrics.lowRisk = 0;
            this.metrics.totalEvents = 0;
            console.log('使用默认指标值:', this.metrics);
        }

        this.updateMetricDisplay();
    }

    // 更新指标显示
    updateMetricDisplay() {
        // 检查元素是否存在，避免在测试页面中出错
        const highRiskElement = document.getElementById('highRiskCount');
        const mediumRiskElement = document.getElementById('mediumRiskCount');
        const lowRiskElement = document.getElementById('lowRiskCount');
        const totalEventsElement = document.getElementById('totalEvents');
        
        // 检查是否所有风险事件都为0
        const allZero = this.metrics.highRisk === 0 && this.metrics.mediumRisk === 0 && this.metrics.lowRisk === 0;
        
        if (allZero) {
            // 所有风险事件都为0时，使用绿色0风险等级样式
            console.log('所有风险事件都为0，使用绿色0风险等级样式');
            
            // 更新高风险指标显示
            if (highRiskElement) {
                highRiskElement.textContent = '0';
                highRiskElement.style.color = '#52c41a'; // 绿色
                highRiskElement.style.fontWeight = '600';
            }
            
            // 更新中风险指标显示
            if (mediumRiskElement) {
                mediumRiskElement.textContent = '0';
                mediumRiskElement.style.color = '#52c41a'; // 绿色
                mediumRiskElement.style.fontWeight = '600';
            }
            
            // 更新低风险指标显示
            if (lowRiskElement) {
                lowRiskElement.textContent = '0';
                lowRiskElement.style.color = '#52c41a'; // 绿色
                lowRiskElement.style.fontWeight = '600';
            }
            
            // 更新总事件显示
            if (totalEventsElement) {
                totalEventsElement.textContent = '0';
                totalEventsElement.style.color = '#52c41a'; // 绿色
                totalEventsElement.style.fontWeight = '600';
            }
            
            // 更新指标表格的样式
            this.updateMetricTable(allZero);
            
        } else {
            // 有风险事件时，使用正常颜色
            if (highRiskElement) {
                highRiskElement.textContent = this.metrics.highRisk;
                highRiskElement.style.color = ''; // 恢复默认颜色
                highRiskElement.style.fontWeight = '';
            }
            if (mediumRiskElement) {
                mediumRiskElement.textContent = this.metrics.mediumRisk;
                mediumRiskElement.style.color = ''; // 恢复默认颜色
                mediumRiskElement.style.fontWeight = '';
            }
            if (lowRiskElement) {
                lowRiskElement.textContent = this.metrics.lowRisk;
                lowRiskElement.style.color = ''; // 恢复默认颜色
                lowRiskElement.style.fontWeight = '';
            }
            if (totalEventsElement) {
                totalEventsElement.textContent = this.metrics.totalEvents;
                totalEventsElement.style.color = ''; // 恢复默认颜色
                totalEventsElement.style.fontWeight = '';
            }
            
            // 恢复指标表格的样式
            this.updateMetricTable(false);
        }
    }
    
    // 更新指标表格样式
    updateMetricTable(allZero) {
        // 获取指标表格的行元素
        const tableRows = document.querySelectorAll('.metric-table tbody tr');
        
        if (allZero) {
            // 所有风险事件都为0时，所有行都使用绿色样式
            tableRows.forEach(row => {
                row.style.backgroundColor = '#f6ffed'; // 浅绿色背景
                row.style.borderLeft = '4px solid #52c41a'; // 绿色左边框
                
                // 更新状态列
                const statusCell = row.querySelector('.status-cell');
                if (statusCell) {
                    statusCell.textContent = '无风险';
                    statusCell.style.color = '#52c41a';
                    statusCell.style.fontWeight = '600';
                }
            });
            
            console.log('指标表格已更新为绿色样式（0风险状态）');
        } else {
            // 有风险事件时，根据风险等级设置不同样式
            tableRows.forEach((row, index) => {
                const riskLevel = row.getAttribute('data-risk-level');
                let bgColor = '#ffffff';
                let borderColor = '#d9d9d9';
                let statusText = '正常';
                let statusColor = '#52c41a';
                
                if (riskLevel === 'high') {
                    bgColor = '#fff2f0';
                    borderColor = '#ff4d4f';
                    statusText = '高风险';
                    statusColor = '#ff4d4f';
                } else if (riskLevel === 'medium') {
                    bgColor = '#fff7e6';
                    borderColor = '#faad14';
                    statusText = '中风险';
                    statusColor = '#faad14';
                } else if (riskLevel === 'low') {
                    bgColor = '#f6ffed';
                    borderColor = '#52c41a';
                    statusText = '低风险';
                    statusColor = '#52c41a';
                }
                
                row.style.backgroundColor = bgColor;
                row.style.borderLeft = `4px solid ${borderColor}`;
                
                // 更新状态列
                const statusCell = row.querySelector('.status-cell');
                if (statusCell) {
                    statusCell.textContent = statusText;
                    statusCell.style.color = statusColor;
                    statusCell.style.fontWeight = '600';
                }
            });
            
            console.log('指标表格已更新为正常样式');
        }
    }

    // 初始化环形图
    initDonutChart() {
        this.updateDonutChart();
    }

    // 更新环形图
    updateDonutChart() {
        console.log('更新环形图...');
        console.log('当前指标数据:', this.metrics);
        
        const total = this.metrics.totalEvents;
        
        // 更新环形图
        const highCircle = document.querySelector('.donut-chart .progress.high');
        const mediumCircle = document.querySelector('.donut-chart .progress.medium');
        const lowCircle = document.querySelector('.donut-chart .progress.low');

        console.log('找到的圆环元素:', {
            highCircle: !!highCircle,
            mediumCircle: !!mediumCircle,
            lowCircle: !!lowCircle
        });

        if (total > 0) {
            // 有事件时，按实际比例显示
            const highPercent = (this.metrics.highRisk / total) * 100;
            const mediumPercent = (this.metrics.mediumRisk / total) * 100;
            const lowPercent = (this.metrics.lowRisk / total) * 100;

            console.log('环形图百分比:', { highPercent, mediumPercent, lowPercent, total });

            // 计算每个圆环的长度
            const circumference = 251.2; // 2 * π * 80

            // 高风险环形图（红色）
            if (highCircle && this.metrics.highRisk > 0) {
                const highLength = (highPercent / 100) * circumference;
                const highDash = `${highLength} ${circumference - highLength}`;
                highCircle.style.strokeDasharray = highDash;
                highCircle.style.transform = 'rotate(-90deg)';
                highCircle.style.opacity = '1';
                console.log('高风险环形图更新:', highDash);
            } else if (highCircle) {
                highCircle.style.strokeDasharray = '0 251.2';
                highCircle.style.opacity = '0';
                console.log('高风险环形图隐藏');
            }

            // 中风险环形图（橙色）
            if (mediumCircle && this.metrics.mediumRisk > 0) {
                const mediumLength = (mediumPercent / 100) * circumference;
                const mediumDash = `${mediumLength} ${circumference - mediumLength}`;
                mediumCircle.style.strokeDasharray = mediumDash;
                // 中风险从高风险结束的位置开始
                const mediumStartAngle = (highPercent / 100) * 360 - 90;
                mediumCircle.style.transform = `rotate(${mediumStartAngle}deg)`;
                mediumCircle.style.opacity = '1';
                console.log('中风险环形图更新:', mediumDash, '起始角度:', mediumStartAngle);
            } else if (mediumCircle) {
                mediumCircle.style.strokeDasharray = '0 251.2';
                mediumCircle.style.opacity = '0';
                console.log('中风险环形图隐藏');
            }

            // 低风险环形图（绿色）
            if (lowCircle && this.metrics.lowRisk > 0) {
                const lowLength = (lowPercent / 100) * circumference;
                const lowDash = `${lowLength} ${circumference - lowLength}`;
                lowCircle.style.strokeDasharray = lowDash;
                // 低风险从中风险结束的位置开始
                const lowStartAngle = ((highPercent + mediumPercent) / 100) * 360 - 90;
                lowCircle.style.transform = `rotate(${lowStartAngle}deg)`;
                lowCircle.style.opacity = '1';
                console.log('低风险环形图更新:', lowDash, '起始角度:', lowStartAngle);
            } else if (lowCircle) {
                lowCircle.style.strokeDasharray = '0 251.2';
                lowCircle.style.opacity = '0';
                console.log('低风险环形图隐藏');
            }
        } else {
            // 总事件为0时，显示绿色完整圆形环（表示无风险状态）
            console.log('总事件为0，显示绿色完整圆形环');
            
            // 隐藏高风险和中风险环形图
            if (highCircle) {
                highCircle.style.strokeDasharray = '0 251.2';
                highCircle.style.opacity = '0';
            }
            if (mediumCircle) {
                mediumCircle.style.strokeDasharray = '0 251.2';
                mediumCircle.style.opacity = '0';
            }
            
            // 显示完整的绿色低风险环形图（完整圆形）
            if (lowCircle) {
                lowCircle.style.strokeDasharray = '251.2 0';
                lowCircle.style.transform = 'rotate(-90deg)';
                lowCircle.style.opacity = '1';
                console.log('显示绿色完整圆形环');
            }
        }

        // 更新中心数值
        const donutValueElement = document.getElementById('donutValue');
        if (donutValueElement) {
            donutValueElement.textContent = total;
            console.log('环形图中心数值更新:', total);
        }
    }

    // 初始化趋势图
    initTrendChart() {
        this.generateTrendData();
        this.renderTrendChart();
    }

    // 生成趋势数据
    generateTrendData() {
        this.trendData = [];
        const now = new Date();
        
        // 检查当前是否有风险事件
        const hasCurrentEvents = this.metrics.totalEvents > 0;
        
        if (hasCurrentEvents) {
            // 有风险事件时，生成正常的历史数据
            const baseData = [
                { highRisk: 2, mediumRisk: 8, lowRisk: 5 },
                { highRisk: 6, mediumRisk: 12, lowRisk: 3 },
                { highRisk: 1, mediumRisk: 6, lowRisk: 8 },
                { highRisk: 4, mediumRisk: 9, lowRisk: 12 },
                { highRisk: 3, mediumRisk: 7, lowRisk: 19 },
                { highRisk: 5, mediumRisk: 11, lowRisk: 7 },
                { highRisk: 2, mediumRisk: 10, lowRisk: 4 }
            ];
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dateStr = date.toISOString().split('T')[0];
                const data = baseData[6 - i];
                
                this.trendData.push({
                    date: dateStr,
                    highRisk: data.highRisk,
                    mediumRisk: data.mediumRisk,
                    lowRisk: data.lowRisk,
                    total: data.highRisk + data.mediumRisk + data.lowRisk
                });
            }
        } else {
            // 无风险事件时，生成全0的历史数据，表示持续无风险状态
            for (let i = 6; i >= 0; i--) {
                const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dateStr = date.toISOString().split('T')[0];
                
                this.trendData.push({
                    date: dateStr,
                    highRisk: 0,
                    mediumRisk: 0,
                    lowRisk: 0,
                    total: 0
                });
            }
        }
        
        console.log('生成趋势数据:', this.trendData);
    }

    // 渲染趋势图
    renderTrendChart() {
        console.log('渲染趋势图...');
        
        const canvas = document.getElementById('trendCanvas');
        if (!canvas) {
            console.log('趋势图Canvas元素不存在，尝试延迟渲染...');
            // 如果Canvas元素不存在，延迟重试
            setTimeout(() => {
                this.renderTrendChart();
            }, 200);
            return;
        }

        try {
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('无法获取Canvas上下文');
                return;
            }
            
            const width = canvas.width = 400;
            const height = canvas.height = 250;

            console.log('趋势图画布尺寸:', width, height);

            // 清空画布
            ctx.clearRect(0, 0, width, height);

            // 绘制背景网格
            this.drawGrid(ctx, width, height);

            // 绘制数据线
            this.drawTrendLines(ctx, width, height);

            // 绘制坐标轴标签
            this.drawAxisLabels(ctx, width, height);
            
            console.log('趋势图渲染完成');
        } catch (error) {
            console.error('趋势图渲染失败:', error);
            // 如果渲染失败，延迟重试
            setTimeout(() => {
                this.renderTrendChart();
            }, 500);
        }
    }

    // 绘制网格
    drawGrid(ctx, width, height) {
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;

        // 水平网格线
        for (let i = 0; i <= 5; i++) {
            const y = (height - 40) * (i / 5) + 20;
            ctx.beginPath();
            ctx.moveTo(60, y);
            ctx.lineTo(width - 20, y);
            ctx.stroke();
        }

        // 垂直网格线
        for (let i = 0; i < this.trendData.length; i++) {
            const x = 60 + (width - 80) * (i / (this.trendData.length - 1));
            ctx.beginPath();
            ctx.moveTo(x, 20);
            ctx.lineTo(x, height - 20);
            ctx.stroke();
        }
    }

    // 绘制趋势线
    drawTrendLines(ctx, width, height) {
        const maxValue = Math.max(...this.trendData.map(d => d.total), 1); // 确保不为0
        const colors = ['#ff4d4f', '#faad14', '#52c41a'];
        
        // 检查是否所有数据都为0
        const allZero = this.trendData.every(d => d.total === 0);
        
        if (allZero) {
            // 所有数据都为0时，显示"无风险"提示
            ctx.fillStyle = '#52c41a';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('✓ 无风险状态', width / 2, height / 2 - 10);
            
            ctx.fillStyle = '#8c8c8c';
            ctx.font = '12px Arial';
            ctx.fillText('过去7天无风险事件', width / 2, height / 2 + 10);
            
            console.log('趋势图显示无风险状态');
        } else {
            // 有数据时，绘制正常的趋势线
            ['highRisk', 'mediumRisk', 'lowRisk'].forEach((key, index) => {
                ctx.strokeStyle = colors[index];
                ctx.lineWidth = 2;
                ctx.beginPath();

                this.trendData.forEach((data, i) => {
                    const x = 60 + (width - 80) * (i / (this.trendData.length - 1));
                    const y = height - 20 - (data[key] / maxValue) * (height - 40);

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });

                ctx.stroke();
            });
        }
    }

    // 绘制坐标轴标签
    drawAxisLabels(ctx, width, height) {
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        // X轴标签（日期）
        this.trendData.forEach((data, i) => {
            const x = 60 + (width - 80) * (i / (this.trendData.length - 1));
            const date = new Date(data.date);
            const label = `${date.getMonth() + 1}/${date.getDate()}`;
            ctx.fillText(label, x, height - 5);
        });

        // Y轴标签
        const maxValue = Math.max(...this.trendData.map(d => d.total));
        for (let i = 0; i <= 5; i++) {
            const y = (height - 40) * (i / 5) + 20;
            const value = Math.round(maxValue * (1 - i / 5));
            ctx.textAlign = 'right';
            ctx.fillText(value.toString(), 55, y + 4);
        }
    }

    // 绑定事件
    bindEvents() {
        // 刷新按钮
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.updateMetrics();
                this.updateDonutChart();
                this.generateTrendData();
                this.renderTrendChart();
                if (typeof Notification !== 'undefined') {
                    Notification.show('数据已刷新', 'success');
                }
            });
        }

        // 趋势图刷新按钮
        const trendRefreshBtn = document.getElementById('trendRefreshBtn');
        if (trendRefreshBtn) {
            trendRefreshBtn.addEventListener('click', () => {
                this.generateTrendData();
                this.renderTrendChart();
                if (typeof Notification !== 'undefined') {
                    Notification.show('趋势数据已更新', 'success');
                }
            });
        }

        // 导出按钮
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportReport();
            });
        }

        // 监听数据同步事件
        window.addEventListener('dataSynced', (event) => {
            console.log('仪表板收到数据同步事件');
            this.refresh();
            if (typeof Notification !== 'undefined') {
                Notification.show('数据同步完成，仪表板已更新', 'success');
            }
        });
    }

    // 导出报告
    exportReport() {
        const report = {
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            trendData: this.trendData,
            alarmRecords: window.dataStorage ? window.dataStorage.getAlarmRecords() : []
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ipe-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (typeof Notification !== 'undefined') {
            Notification.show('报告已导出', 'success');
        }
    }

    // 刷新所有数据
    refresh() {
        this.updateMetrics();
        this.updateDonutChart();
        this.generateTrendData();
        
        // 延迟渲染趋势图，确保DOM元素已准备好
        setTimeout(() => {
            this.renderTrendChart();
        }, 100);
    }
}

// 通知系统
class Notification {
    static show(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="icon-${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        container.appendChild(notification);

        // 自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);

        // 手动关闭
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            });
        }
    }

    static getIcon(type) {
        const icons = {
            success: 'check',
            error: 'close',
            warning: 'warning',
            info: 'info'
        };
        return icons[type] || 'info';
    }
}

// 导出
window.Dashboard = Dashboard;
window.Notification = Notification; 