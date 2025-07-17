/**
 * 表格管理模块
 * 负责表格的渲染、编辑和数据操作
 */

// 表格管理模块
class TableManager {
    constructor() {
        this.currentTab = 'users';
        this.init();
    }

    init() {
        this.initTabs();
        this.loadTableData();
        this.bindEvents();
    }

    // 初始化标签页
    initTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    // 切换标签页
    switchTab(tabName) {
        console.log(`切换到标签页: ${tabName}`);
        
        // 更新按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.style.color = '#666666';
            btn.style.borderBottom = '2px solid transparent';
        });
        
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
            activeBtn.style.color = '#1890ff';
            activeBtn.style.borderBottom = '2px solid #1890ff';
        }

        // 更新内容区域
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
            pane.style.display = 'none';
        });
        
        const activePane = document.getElementById(`${tabName}Tab`);
        if (activePane) {
            activePane.classList.add('active');
            activePane.style.display = 'block';
        }

        this.currentTab = tabName;
        this.loadTableData();
    }

    // 加载表格数据
    loadTableData() {
        // 检查必要的DOM元素是否存在
        const tableContainer = document.querySelector('.table-container');
        if (!tableContainer) {
            console.log('表格容器不存在，跳过数据加载');
            return;
        }
        
        switch (this.currentTab) {
            case 'users':
                this.loadUsersTable();
                break;
            case 'assets':
                this.loadAssetsTable();
                break;
            case 'rules':
                this.loadRulesTable();
                break;
            case 'alarms':
                this.loadAlarmsTable();
                break;
        }
    }

    // 加载用户表格
    loadUsersTable() {
        const users = window.dataStorage ? window.dataStorage.getUsers() : [];
        const tbody = document.querySelector('#usersTable tbody');
        
        if (!tbody) {
            console.log('用户表格tbody元素不存在，跳过加载');
            return;
        }
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name || '未知'}</td>
                <td>${user.idNumber || '未知'}</td>
                <td>${user.validUntil || '未知'}</td>
                <td><span class="status-badge ${user.status}">${this.getStatusText(user.status)}</span></td>
            </tr>
        `).join('');
    }

    // 加载资产表格
    loadAssetsTable() {
        const assets = window.dataStorage ? window.dataStorage.getAssets() : [];
        const tbody = document.querySelector('#assetsTable tbody');
        
        if (!tbody) {
            console.log('资产表格tbody元素不存在，跳过加载');
            return;
        }
        
        tbody.innerHTML = assets.map(asset => `
            <tr>
                <td>${asset.id}</td>
                <td>${asset.type || '未知'}</td>
                <td>${asset.accountNumber || '未知'}</td>
                <td>${this.formatDateTime(asset.snapshotTime) || '未知'}</td>
                <td>${asset.hashValue || '未知'}</td>
            </tr>
        `).join('');
    }

    // 加载规则表格
    loadRulesTable() {
        const rules = window.dataStorage ? window.dataStorage.getRules() : [];
        const tbody = document.querySelector('#rulesTable tbody');
        
        if (!tbody) {
            console.log('规则表格tbody元素不存在，跳过加载');
            return;
        }
        
        tbody.innerHTML = rules.map(rule => `
            <tr>
                <td>${rule.id}</td>
                <td>${rule.scanCondition || '未知'}</td>
                <td>${rule.algorithm || '未知'}</td>
                <td>${rule.threshold || '未知'}</td>
                <td><span class="status-badge ${rule.status}">${this.getStatusText(rule.status)}</span></td>
            </tr>
        `).join('');
    }

    // 加载告警表格
    loadAlarmsTable() {
        const alarms = window.dataStorage ? window.dataStorage.getAlarmRecords() : [];
        const tbody = document.querySelector('#alarmsTable tbody');
        
        if (!tbody) {
            console.log('告警表格tbody元素不存在，跳过加载');
            return;
        }
        
        tbody.innerHTML = alarms.map(alarm => `
            <tr>
                <td>${alarm.id}</td>
                <td><span class="risk-badge ${alarm.riskLevel}">${this.getRiskLevelText(alarm.riskLevel)}</span></td>
                <td>${alarm.channel || '未知'}</td>
                <td><span class="status-badge ${alarm.sendStatus}">${this.getStatusText(alarm.sendStatus)}</span></td>
                <td>${this.formatDateTime(alarm.triggerTime) || '未知'}</td>
            </tr>
        `).join('');
    }

    // 获取状态文本
    getStatusText(status) {
        const statusMap = {
            active: '激活',
            inactive: '停用',
            pending: '待处理',
            success: '成功',
            failed: '失败',
            retrying: '重试中'
        };
        return statusMap[status] || status;
    }

    // 获取风险等级文本
    getRiskLevelText(riskLevel) {
        const riskMap = {
            high: '高风险',
            medium: '中风险',
            low: '低风险'
        };
        return riskMap[riskLevel] || riskLevel;
    }

    // 格式化日期时间
    formatDateTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('zh-CN');
    }

    // 绑定事件
    bindEvents() {
        // 清空数据按钮
        const clearDataBtn = document.getElementById('clearDataBtn');
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                this.clearAllData();
            });
        }

        // 信息同步按钮
        const syncDataBtn = document.getElementById('syncDataBtn');
        if (syncDataBtn) {
            syncDataBtn.addEventListener('click', () => {
                this.syncData();
            });
        }

        // 监听数据同步事件
        window.addEventListener('dataSynced', (event) => {
            console.log('表格管理器收到数据同步事件');
            this.loadTableData();
            
            // 显示风险场景信息
            if (event.detail && event.detail.scenario) {
                const scenario = event.detail.scenario;
                if (typeof Notification !== 'undefined') {
                    Notification.show(`数据同步完成！${scenario.description}`, 'success');
                }
            } else {
                if (typeof Notification !== 'undefined') {
                    Notification.show('表格数据已同步更新', 'success');
                }
            }
        });
    }

    // 获取标签页名称
    getTabName() {
        const tabNames = {
            users: '用户',
            assets: '资产',
            rules: '规则',
            alarms: '告警'
        };
        return tabNames[this.currentTab] || '记录';
    }



    // 生成ID
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 刷新表格
    refresh() {
        this.loadTableData();
    }

    // 清空所有数据
    clearAllData() {
        console.log('开始清空所有数据...');
        
        // 显示确认对话框
        if (confirm('确定要清空所有数据吗？此操作不可撤销。')) {
            const clearBtn = document.getElementById('clearDataBtn');
            if (clearBtn) {
                clearBtn.disabled = true;
                clearBtn.innerHTML = '<i class="icon-loading"></i> 清空中...';
            }
            
            // 显示加载状态
            if (typeof Notification !== 'undefined') {
                Notification.show('正在清空数据，请稍候...', 'info');
            }

            // 调用数据存储的清空方法
            if (window.dataStorage) {
                try {
                    window.dataStorage.clearAllData();
                    console.log('数据清空完成');
                    
                    // 重新加载所有表格数据
                    this.loadUsersTable();
                    this.loadAssetsTable();
                    this.loadRulesTable();
                    this.loadAlarmsTable();
                    
                    // 更新仪表板
                    if (window.ipeApp && window.ipeApp.dashboard) {
                        window.ipeApp.dashboard.refresh();
                    }
                    
                    if (typeof Notification !== 'undefined') {
                        Notification.show('所有数据已清空', 'success');
                    }
                } catch (error) {
                    console.error('数据清空失败:', error);
                    if (typeof Notification !== 'undefined') {
                        Notification.show('数据清空失败: ' + error.message, 'error');
                    }
                } finally {
                    // 恢复按钮状态
                    if (clearBtn) {
                        clearBtn.disabled = false;
                        clearBtn.innerHTML = '<i class="icon-delete"></i> 清空数据';
                    }
                }
            } else {
                console.error('DataStorage实例不存在');
                if (typeof Notification !== 'undefined') {
                    Notification.show('数据存储模块未初始化', 'error');
                }
                // 恢复按钮状态
                if (clearBtn) {
                    clearBtn.disabled = false;
                    clearBtn.innerHTML = '<i class="icon-delete"></i> 清空数据';
                }
            }
        }
    }

    // 同步数据
    syncData() {
        console.log('开始同步数据...');
        
        const syncBtn = document.getElementById('syncDataBtn');
        if (syncBtn) {
            syncBtn.classList.add('syncing');
            syncBtn.disabled = true;
        }
        
        // 显示加载状态
        if (typeof Notification !== 'undefined') {
            Notification.show('正在同步数据，请稍候...', 'info');
        }

        // 调用数据存储的同步方法
        if (window.dataStorage) {
            try {
                const result = window.dataStorage.syncData();
                console.log('数据同步结果:', result);
                
                // 重新加载所有表格数据
                this.loadUsersTable();
                this.loadAssetsTable();
                this.loadRulesTable();
                this.loadAlarmsTable();
                
                // 更新仪表板
                if (window.ipeApp && window.ipeApp.dashboard) {
                    window.ipeApp.dashboard.refresh();
                }
                
                if (typeof Notification !== 'undefined') {
                    Notification.show('数据同步完成！', 'success');
                }
            } catch (error) {
                console.error('数据同步失败:', error);
                if (typeof Notification !== 'undefined') {
                    Notification.show('数据同步失败: ' + error.message, 'error');
                }
            } finally {
                // 恢复按钮状态
                if (syncBtn) {
                    syncBtn.classList.remove('syncing');
                    syncBtn.disabled = false;
                }
            }
        } else {
            console.error('DataStorage实例不存在');
            if (typeof Notification !== 'undefined') {
                Notification.show('数据存储模块未初始化', 'error');
            }
            // 恢复按钮状态
            if (syncBtn) {
                syncBtn.classList.remove('syncing');
                syncBtn.disabled = false;
            }
        }
    }
}

// 导出
window.TableManager = TableManager; 