// 主应用模块
class IPEApp {
    constructor() {
        this.dashboard = null;
        this.tableManager = null;
        this.init();
    }

    init() {
        console.log('初始化IPE系统...');
        
        // 初始化数据存储
        this.initDataStorage();
        
        // 初始化各个模块
        this.initModules();
        
        // 绑定全局事件
        this.bindGlobalEvents();
        
        // 检查是否需要自动刷新
        if (localStorage.getItem('autoRefresh') === 'true') {
            this.startAutoRefresh();
        }
        
        // 应用保存的主题
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.applyTheme(savedTheme);
        
        console.log('IPE系统初始化完成');
    }

    // 初始化数据存储
    initDataStorage() {
        // 创建DataStorage实例
        if (window.DataStorage) {
            window.dataStorage = new window.DataStorage();
            console.log('DataStorage实例创建成功');
        } else {
            console.error('DataStorage类未找到');
        }
    }



    // 初始化各个模块
    initModules() {
        // 初始化表格管理器
        this.tableManager = new TableManager();
        
        // 初始化风险引擎
        this.riskEngine = new RiskEngine();
        
        // 延迟初始化仪表板，确保DOM元素已准备好
        setTimeout(() => {
            this.dashboard = new Dashboard();
            console.log('Dashboard模块初始化完成');
            
            // 确保Dashboard正确更新
            if (this.dashboard) {
                this.dashboard.updateMetrics();
                this.dashboard.updateDonutChart();
                setTimeout(() => {
                    this.dashboard.initTrendChart();
                }, 200);
            }
        }, 200);
    }

    // 绑定全局事件
    bindGlobalEvents() {
        // 窗口大小变化时重新渲染图表
        window.addEventListener('resize', () => {
            if (this.dashboard) {
                this.dashboard.renderTrendChart();
            }
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl+R 刷新数据
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.refreshAll();
            }
            
            // Ctrl+E 导出报告
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                if (this.dashboard) {
                    this.dashboard.exportReport();
                }
            }
        });

        // 设置按钮
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }
    }

    // 刷新所有数据
    refreshAll() {
        console.log('刷新所有数据...');
        
        if (this.dashboard) {
            this.dashboard.refresh();
        }
        
        if (this.tableManager) {
            this.tableManager.refresh();
        }
        
        Notification.show('所有数据已刷新', 'success');
    }

    // 显示设置
    showSettings() {
        const settings = {
            autoRefresh: localStorage.getItem('autoRefresh') === 'true',
            theme: localStorage.getItem('theme') || 'dark',
            language: localStorage.getItem('language') || 'zh-CN'
        };

        const settingsHtml = `
            <div class="settings-panel">
                <h3>系统设置</h3>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="autoRefresh" ${settings.autoRefresh ? 'checked' : ''}>
                        自动刷新数据
                    </label>
                </div>
                <div class="setting-item">
                    <label>主题：</label>
                    <select id="theme">
                        <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>深色</option>
                        <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>浅色</option>
                    </select>
                </div>
                <div class="setting-item">
                    <label>语言：</label>
                    <select id="language">
                        <option value="zh-CN" ${settings.language === 'zh-CN' ? 'selected' : ''}>中文</option>
                        <option value="en-US" ${settings.language === 'en-US' ? 'selected' : ''}>English</option>
                    </select>
                </div>
                <div class="setting-actions">
                    <button class="btn btn-primary" onclick="ipeApp.saveSettings()">保存</button>
                    <button class="btn btn-default" onclick="ipeApp.closeSettings()">取消</button>
                </div>
            </div>
        `;

        // 创建模态框
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>系统设置</h3>
                    <button class="modal-close" onclick="ipeApp.closeSettings()">&times;</button>
                </div>
                <div class="modal-body">
                    ${settingsHtml}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // 保存设置
    saveSettings() {
        const autoRefresh = document.getElementById('autoRefresh').checked;
        const theme = document.getElementById('theme').value;
        const language = document.getElementById('language').value;

        localStorage.setItem('autoRefresh', autoRefresh);
        localStorage.setItem('theme', theme);
        localStorage.setItem('language', language);

        // 应用主题
        this.applyTheme(theme);

        // 设置自动刷新
        if (autoRefresh) {
            this.startAutoRefresh();
        } else {
            this.stopAutoRefresh();
        }

        this.closeSettings();
        Notification.show('设置已保存', 'success');
    }

    // 关闭设置
    closeSettings() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.remove();
        }
    }

    // 应用主题
    applyTheme(theme) {
        document.body.className = `theme-${theme}`;
    }

    // 开始自动刷新
    startAutoRefresh() {
        this.autoRefreshInterval = setInterval(() => {
            this.refreshAll();
        }, 30000); // 30秒
    }

    // 停止自动刷新
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    // 获取系统状态
    getSystemStatus() {
        const alarmRecords = window.dataStorage ? window.dataStorage.getAlarmRecords() : [];
        const recentAlarms = alarmRecords.filter(record => 
            new Date(record.triggerTime) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        return {
            totalAlarms: alarmRecords.length,
            recentAlarms: recentAlarms.length,
            highRiskAlarms: recentAlarms.filter(r => r.riskLevel === 'high').length,
            systemHealth: this.calculateSystemHealth(recentAlarms)
        };
    }

    // 计算系统健康度
    calculateSystemHealth(alarms) {
        const highRiskCount = alarms.filter(r => r.riskLevel === 'high').length;
        const totalCount = alarms.length;

        if (totalCount === 0) return 'excellent';
        if (highRiskCount === 0) return 'good';
        if (highRiskCount <= 2) return 'warning';
        return 'critical';
    }
}

// 全局应用实例（由index.html中的初始化脚本管理）

// 页面加载完成后初始化（由index.html中的初始化脚本处理）
// 这里保留全局函数供外部调用

// 全局函数
function refreshAll() {
    if (ipeApp) {
        ipeApp.refreshAll();
    }
}

function exportReport() {
    if (ipeApp && ipeApp.dashboard) {
        ipeApp.dashboard.exportReport();
    }
}

function showSettings() {
    if (ipeApp) {
        ipeApp.showSettings();
    }
} 