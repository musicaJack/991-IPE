/**
 * 主模块
 * 负责应用初始化和全局功能
 */

/**
 * 应用主控制器
 */
const AppController = {
    /**
     * 初始化应用
     */
    init: function() {
        console.log('=== IPE系统初始化开始 ===');
        
        // 检查依赖
        this.checkDependencies();
        
        // 初始化各个模块
        this.initModules();
        
        // 绑定全局事件
        this.bindGlobalEvents();
        
        // 生成初始模拟数据（可选）
        this.generateInitialData();
        
        console.log('=== IPE系统初始化完成 ===');
    },

    /**
     * 检查依赖
     */
    checkDependencies: function() {
        // 检查Chart.js
        if (typeof Chart === 'undefined') {
            console.error('Chart.js 未加载，请检查网络连接');
            this.showError('Chart.js 库加载失败，请刷新页面重试');
            return false;
        }

        // 检查localStorage
        if (typeof localStorage === 'undefined') {
            console.error('浏览器不支持localStorage');
            this.showError('浏览器不支持本地存储，部分功能可能无法使用');
            return false;
        }

        console.log('依赖检查通过');
        return true;
    },

    /**
     * 初始化各个模块
     */
    initModules: function() {
        try {
            // 数据存储模块已在data-storage.js中自动初始化
            
            // 初始化风险引擎
            if (typeof riskEngine !== 'undefined') {
                console.log('风险引擎初始化完成');
            } else {
                console.error('风险引擎初始化失败');
            }

            // 初始化驾驶舱
            if (typeof DashboardManager !== 'undefined') {
                DashboardManager.init();
                console.log('驾驶舱初始化完成');
            } else {
                console.error('驾驶舱初始化失败');
            }

            // 初始化表格管理器
            if (typeof TableManager !== 'undefined') {
                TableManager.init();
                console.log('表格管理器初始化完成');
            } else {
                console.error('表格管理器初始化失败');
            }

        } catch (error) {
            console.error('模块初始化失败:', error);
            this.showError('系统初始化失败，请刷新页面重试');
        }
    },

    /**
     * 绑定全局事件
     */
    bindGlobalEvents: function() {
        // 窗口大小变化事件
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // 页面可见性变化事件
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handlePageVisible();
            }
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // 错误处理
        window.addEventListener('error', (e) => {
            console.error('全局错误:', e.error);
            this.handleGlobalError(e.error);
        });

        console.log('全局事件绑定完成');
    },

    /**
     * 生成初始模拟数据
     */
    generateInitialData: function() {
        const alarmRecords = AppDataManager.getAlarmRecords();
        
        // 如果没有数据，生成一些模拟数据
        if (alarmRecords.length === 0) {
            console.log('生成初始模拟数据...');
            
            // 生成10条模拟告警记录
            const mockRecords = riskEngine.generateMockData(10);
            mockRecords.forEach(record => {
                AppDataManager.addAlarmRecord(record);
            });
            
            // 更新驾驶舱
            if (window.DashboardManager) {
                window.DashboardManager.updateDashboard();
            }
            
            console.log('初始模拟数据生成完成');
        }
    },

    /**
     * 处理窗口大小变化
     */
    handleResize: function() {
        // 重新调整图表大小
        if (window.pieChart) {
            window.pieChart.resize();
        }
        if (window.lineChart) {
            window.lineChart.resize();
        }
        
        console.log('窗口大小变化处理完成');
    },

    /**
     * 处理页面可见性变化
     */
    handlePageVisible: function() {
        console.log('页面重新可见，刷新数据...');
        
        // 刷新驾驶舱数据
        if (window.DashboardManager) {
            window.DashboardManager.updateDashboard();
        }
        
        // 刷新表格数据
        if (window.TableManager) {
            window.TableManager.refreshAllTables();
        }
    },

    /**
     * 处理键盘快捷键
     * @param {KeyboardEvent} e - 键盘事件
     */
    handleKeyboardShortcuts: function(e) {
        // Ctrl/Cmd + R: 刷新驾驶舱
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            if (window.DashboardManager) {
                window.DashboardManager.refresh();
            }
        }
        
        // Ctrl/Cmd + N: 添加新记录
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            addAlarmRecord();
        }
        
        // Ctrl/Cmd + D: 生成模拟数据
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            if (window.DashboardManager) {
                window.DashboardManager.generateMockData();
            }
        }
        
        // Escape: 取消编辑
        if (e.key === 'Escape') {
            const editingRow = document.querySelector('.ant-row.editing');
            if (editingRow) {
                const recordId = editingRow.dataset.id;
                if (window.TableManager) {
                    window.TableManager.cancelEdit(recordId);
                }
            }
        }
    },

    /**
     * 处理全局错误
     * @param {Error} error - 错误对象
     */
    handleGlobalError: function(error) {
        console.error('全局错误处理:', error);
        
        // 显示错误提示
        this.showError('系统发生错误，请刷新页面重试');
        
        // 记录错误日志
        this.logError(error);
    },

    /**
     * 显示错误信息
     * @param {string} message - 错误消息
     */
    showError: function(message) {
        // 创建错误提示元素
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // 添加样式
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4d4f;
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 300px;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(errorDiv);
        
        // 3秒后自动移除
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 3000);
    },

    /**
     * 记录错误日志
     * @param {Error} error - 错误对象
     */
    logError: function(error) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // 保存到localStorage
        try {
            const logs = JSON.parse(localStorage.getItem('ipe_error_logs') || '[]');
            logs.push(errorLog);
            
            // 只保留最近10条错误日志
            if (logs.length > 10) {
                logs.splice(0, logs.length - 10);
            }
            
            localStorage.setItem('ipe_error_logs', JSON.stringify(logs));
        } catch (e) {
            console.error('保存错误日志失败:', e);
        }
    },

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} wait - 等待时间
     * @returns {Function} 防抖后的函数
     */
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 获取系统信息
     * @returns {object} 系统信息
     */
    getSystemInfo: function() {
        return {
            version: '2025.07',
            userAgent: navigator.userAgent,
            screenSize: {
                width: screen.width,
                height: screen.height
            },
            windowSize: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            localStorage: typeof localStorage !== 'undefined',
            chartJs: typeof Chart !== 'undefined',
            timestamp: new Date().toISOString()
        };
    },

    /**
     * 导出系统信息
     */
    exportSystemInfo: function() {
        const systemInfo = this.getSystemInfo();
        const dataStr = JSON.stringify(systemInfo, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `ipe_system_info_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
    },

    /**
     * 清理系统数据
     */
    cleanupSystem: function() {
        if (confirm('确定要清理所有系统数据吗？此操作不可恢复。')) {
            // 清理localStorage
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('ipe_')) {
                    localStorage.removeItem(key);
                }
            });
            
            // 刷新页面
            location.reload();
        }
    }
};

// 全局工具函数
window.AppController = AppController;

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .error-notification .error-content {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .error-notification .error-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    }
    
    .error-notification .error-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(style);

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 延迟初始化，确保所有模块都已加载
    setTimeout(() => {
        AppController.init();
    }, 500);
});

// 全局函数
function getSystemInfo() {
    return AppController.getSystemInfo();
}

function exportSystemInfo() {
    AppController.exportSystemInfo();
}

function cleanupSystem() {
    AppController.cleanupSystem();
}

// 添加状态徽章样式
const statusStyle = document.createElement('style');
statusStyle.textContent = `
    .status-badge {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
    }
    
    .status-badge.success {
        background: #f6ffed;
        color: #52c41a;
        border: 1px solid #b7eb8f;
    }
    
    .status-badge.failed {
        background: #fff2f0;
        color: #ff4d4f;
        border: 1px solid #ffccc7;
    }
    
    .edit-input {
        width: 100%;
        padding: 4px 8px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        font-size: 14px;
    }
    
    .edit-input:focus {
        outline: none;
        border-color: #1890ff;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
`;
document.head.appendChild(statusStyle);

console.log('IPE系统主模块加载完成'); 