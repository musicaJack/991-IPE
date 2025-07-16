/**
 * 表格管理模块
 * 负责表格的渲染、编辑和数据操作
 */

/**
 * 表格管理器
 */
const TableManager = {
    /**
     * 初始化表格
     */
    init: function() {
        console.log('初始化表格管理器...');
        this.initTabs();
        this.refreshAllTables();
        this.bindEvents();
    },

    /**
     * 初始化标签页
     */
    initTabs: function() {
        const tabLinks = document.querySelectorAll('.tab-link');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.openTab(e, targetId);
            });
        });
    },

    /**
     * 打开标签页
     * @param {Event} event - 点击事件
     * @param {string} tabName - 标签页名称
     */
    openTab: function(event, tabName) {
        // 隐藏所有标签页内容
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        // 移除所有标签页链接的active类
        const tabLinks = document.querySelectorAll('.tab-link');
        tabLinks.forEach(link => {
            link.classList.remove('active');
        });

        // 显示目标标签页内容
        const targetContent = document.getElementById(tabName);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        // 添加active类到点击的链接
        if (event && event.target) {
            event.target.classList.add('active');
        }

        // 刷新对应表格
        this.refreshTable(tabName);
    },

    /**
     * 刷新所有表格
     */
    refreshAllTables: function() {
        this.refreshAlarmTable();
        this.refreshUserTable();
        this.refreshAssetTable();
        this.refreshRuleTable();
    },

    /**
     * 刷新指定表格
     * @param {string} tableType - 表格类型
     */
    refreshTable: function(tableType) {
        switch (tableType) {
            case 'alarm-records':
                this.refreshAlarmTable();
                break;
            case 'user-identities':
                this.refreshUserTable();
                break;
            case 'base-assets':
                this.refreshAssetTable();
                break;
            case 'risk-rules':
                this.refreshRuleTable();
                break;
        }
    },

    /**
     * 刷新告警记录表格
     */
    refreshAlarmTable: function() {
        const tableBody = document.getElementById('alarm-table-body');
        if (!tableBody) return;

        const records = AppDataManager.getAlarmRecords();
        this.renderAlarmTable(tableBody, records);
    },

    /**
     * 渲染告警记录表格
     * @param {HTMLElement} tableBody - 表格体元素
     * @param {Array} records - 记录数组
     */
    renderAlarmTable: function(tableBody, records) {
        if (records.length === 0) {
            tableBody.innerHTML = this.getEmptyTableHTML('暂无告警记录');
            return;
        }

        tableBody.innerHTML = records.map(record => this.createAlarmTableRow(record)).join('');
    },

    /**
     * 创建告警记录表格行
     * @param {object} record - 告警记录
     * @returns {string} HTML字符串
     */
    createAlarmTableRow: function(record) {
        const riskLevelLabel = riskEngine.getRiskLevelLabel(record.riskLevel);
        const riskLevelColor = riskEngine.getRiskLevelColor(record.riskLevel);
        const timestamp = new Date(record.timestamp).toLocaleString('zh-CN');

        return `
            <div class="ant-row" data-id="${record.id}">
                <div class="ant-col" data-field="riskLevel">
                    <span style="color: ${riskLevelColor}; font-weight: 500;">${riskLevelLabel}</span>
                </div>
                <div class="ant-col" data-field="notifyChannel">
                    ${record.notifyChannel}
                </div>
                <div class="ant-col" data-field="status">
                    <span class="status-badge ${record.status}">${record.status === 'success' ? '成功' : '失败'}</span>
                </div>
                <div class="ant-col" data-field="timestamp">
                    ${timestamp}
                </div>
                <div class="ant-col actions-col">
                    <button class="table-btn btn-edit" onclick="TableManager.editAlarmRecord('${record.id}')">编辑</button>
                    <button class="table-btn btn-delete" onclick="TableManager.deleteAlarmRecord('${record.id}')">删除</button>
                </div>
            </div>
        `;
    },

    /**
     * 添加告警记录
     */
    addAlarmRecord: function() {
        const tableBody = document.getElementById('alarm-table-body');
        if (!tableBody) return;

        const newRow = this.createAlarmTableRow({
            id: 'new_' + Date.now(),
            riskLevel: 'medium',
            notifyChannel: '微信',
            status: 'success',
            timestamp: new Date().toISOString()
        });

        // 在表格开头插入新行
        tableBody.insertAdjacentHTML('afterbegin', newRow);
        
        // 进入编辑模式
        const firstRow = tableBody.querySelector('.ant-row');
        if (firstRow) {
            this.editAlarmRecord(firstRow.dataset.id);
        }
    },

    /**
     * 编辑告警记录
     * @param {string} recordId - 记录ID
     */
    editAlarmRecord: function(recordId) {
        const row = document.querySelector(`[data-id="${recordId}"]`);
        if (!row) return;

        row.classList.add('editing');
        
        const riskLevelCell = row.querySelector('[data-field="riskLevel"]');
        const notifyChannelCell = row.querySelector('[data-field="notifyChannel"]');
        const statusCell = row.querySelector('[data-field="status"]');
        const timestampCell = row.querySelector('[data-field="timestamp"]');
        const actionsCell = row.querySelector('.actions-col');

        // 创建编辑表单
        riskLevelCell.innerHTML = `
            <select class="edit-input" data-field="riskLevel">
                <option value="high">高风险</option>
                <option value="medium" selected>中风险</option>
                <option value="low">低风险</option>
            </select>
        `;

        notifyChannelCell.innerHTML = `
            <select class="edit-input" data-field="notifyChannel">
                <option value="微信" selected>微信</option>
                <option value="短信">短信</option>
                <option value="邮件">邮件</option>
            </select>
        `;

        statusCell.innerHTML = `
            <select class="edit-input" data-field="status">
                <option value="success" selected>成功</option>
                <option value="failed">失败</option>
            </select>
        `;

        timestampCell.innerHTML = `
            <input type="datetime-local" class="edit-input" data-field="timestamp" 
                   value="${new Date().toISOString().slice(0, 16)}">
        `;

        actionsCell.innerHTML = `
            <button class="table-btn btn-save" onclick="TableManager.saveAlarmRecord('${recordId}')">保存</button>
            <button class="table-btn btn-cancel" onclick="TableManager.cancelEdit('${recordId}')">取消</button>
        `;
    },

    /**
     * 保存告警记录
     * @param {string} recordId - 记录ID
     */
    saveAlarmRecord: function(recordId) {
        const row = document.querySelector(`[data-id="${recordId}"]`);
        if (!row) return;

        // 收集表单数据
        const formData = {};
        const inputs = row.querySelectorAll('.edit-input');
        inputs.forEach(input => {
            const field = input.dataset.field;
            let value = input.value;
            
            // 处理时间格式
            if (field === 'timestamp') {
                value = new Date(value).toISOString();
            }
            
            formData[field] = value;
        });

        // 验证数据
        const validation = riskEngine.validateAlarmRecord(formData);
        if (!validation.isValid) {
            alert('数据验证失败: ' + validation.errors.join(', '));
            return;
        }

        // 保存数据
        if (recordId.startsWith('new_')) {
            // 新增记录
            const newRecord = {
                id: 'alarm_' + Date.now(),
                ...formData,
                createdAt: new Date().toISOString()
            };
            AppDataManager.addAlarmRecord(newRecord);
        } else {
            // 更新记录
            AppDataManager.updateAlarmRecord(recordId, formData);
        }

        // 退出编辑模式
        this.exitEditMode(recordId);
        
        // 刷新表格和驾驶舱
        this.refreshAlarmTable();
        if (window.DashboardManager) {
            window.DashboardManager.updateDashboard();
        }
    },

    /**
     * 取消编辑
     * @param {string} recordId - 记录ID
     */
    cancelEdit: function(recordId) {
        this.exitEditMode(recordId);
        this.refreshAlarmTable();
    },

    /**
     * 退出编辑模式
     * @param {string} recordId - 记录ID
     */
    exitEditMode: function(recordId) {
        const row = document.querySelector(`[data-id="${recordId}"]`);
        if (row) {
            row.classList.remove('editing');
        }
    },

    /**
     * 删除告警记录
     * @param {string} recordId - 记录ID
     */
    deleteAlarmRecord: function(recordId) {
        if (confirm('确定要删除这条记录吗？')) {
            AppDataManager.deleteAlarmRecord(recordId);
            this.refreshAlarmTable();
            
            // 更新驾驶舱
            if (window.DashboardManager) {
                window.DashboardManager.updateDashboard();
            }
        }
    },

    /**
     * 刷新用户身份表格
     */
    refreshUserTable: function() {
        const tableBody = document.getElementById('user-table-body');
        if (!tableBody) return;

        const users = AppDataManager.getUserIdentities();
        if (users.length === 0) {
            tableBody.innerHTML = this.getEmptyTableHTML('暂无用户身份数据');
        } else {
            tableBody.innerHTML = users.map(user => this.createUserTableRow(user)).join('');
        }
    },

    /**
     * 创建用户身份表格行
     * @param {object} user - 用户数据
     * @returns {string} HTML字符串
     */
    createUserTableRow: function(user) {
        return `
            <div class="ant-row" data-id="${user.id}">
                <div class="ant-col" data-field="name">${user.name || ''}</div>
                <div class="ant-col" data-field="idNumber">${user.idNumber || ''}</div>
                <div class="ant-col" data-field="expiryDate">${user.expiryDate || ''}</div>
                <div class="ant-col" data-field="status">${user.status || ''}</div>
                <div class="ant-col actions-col">
                    <button class="table-btn btn-edit" onclick="TableManager.editUser('${user.id}')">编辑</button>
                    <button class="table-btn btn-delete" onclick="TableManager.deleteUser('${user.id}')">删除</button>
                </div>
            </div>
        `;
    },

    /**
     * 添加用户身份
     */
    addUserIdentity: function() {
        console.log('添加用户身份功能待实现');
    },

    /**
     * 刷新基线资产表格
     */
    refreshAssetTable: function() {
        const tableBody = document.getElementById('asset-table-body');
        if (!tableBody) return;

        const assets = AppDataManager.getBaseAssets();
        if (assets.length === 0) {
            tableBody.innerHTML = this.getEmptyTableHTML('暂无基线资产数据');
        } else {
            tableBody.innerHTML = assets.map(asset => this.createAssetTableRow(asset)).join('');
        }
    },

    /**
     * 创建基线资产表格行
     * @param {object} asset - 资产数据
     * @returns {string} HTML字符串
     */
    createAssetTableRow: function(asset) {
        return `
            <div class="ant-row" data-id="${asset.id}">
                <div class="ant-col" data-field="assetId">${asset.assetId || ''}</div>
                <div class="ant-col" data-field="type">${asset.type || ''}</div>
                <div class="ant-col" data-field="accountNumber">${asset.accountNumber || ''}</div>
                <div class="ant-col" data-field="snapshotTime">${asset.snapshotTime || ''}</div>
                <div class="ant-col actions-col">
                    <button class="table-btn btn-edit" onclick="TableManager.editAsset('${asset.id}')">编辑</button>
                    <button class="table-btn btn-delete" onclick="TableManager.deleteAsset('${asset.id}')">删除</button>
                </div>
            </div>
        `;
    },

    /**
     * 添加基线资产
     */
    addBaseAsset: function() {
        console.log('添加基线资产功能待实现');
    },

    /**
     * 刷新风险规则表格
     */
    refreshRuleTable: function() {
        const tableBody = document.getElementById('rule-table-body');
        if (!tableBody) return;

        const rules = AppDataManager.getRiskRules();
        if (rules.length === 0) {
            tableBody.innerHTML = this.getEmptyTableHTML('暂无风险规则数据');
        } else {
            tableBody.innerHTML = rules.map(rule => this.createRuleTableRow(rule)).join('');
        }
    },

    /**
     * 创建风险规则表格行
     * @param {object} rule - 规则数据
     * @returns {string} HTML字符串
     */
    createRuleTableRow: function(rule) {
        return `
            <div class="ant-row" data-id="${rule.id}">
                <div class="ant-col" data-field="ruleId">${rule.ruleId || ''}</div>
                <div class="ant-col" data-field="scanCondition">${rule.scanCondition || ''}</div>
                <div class="ant-col" data-field="algorithm">${rule.algorithm || ''}</div>
                <div class="ant-col" data-field="threshold">${rule.threshold || ''}</div>
                <div class="ant-col actions-col">
                    <button class="table-btn btn-edit" onclick="TableManager.editRule('${rule.id}')">编辑</button>
                    <button class="table-btn btn-delete" onclick="TableManager.deleteRule('${rule.id}')">删除</button>
                </div>
            </div>
        `;
    },

    /**
     * 添加风险规则
     */
    addRiskRule: function() {
        console.log('添加风险规则功能待实现');
    },

    /**
     * 获取空表格HTML
     * @param {string} message - 提示消息
     * @returns {string} HTML字符串
     */
    getEmptyTableHTML: function(message) {
        return `
            <div class="empty-table">
                <div class="empty-icon">📋</div>
                <div class="empty-text">${message}</div>
                <div class="empty-description">点击上方"添加"按钮开始添加数据</div>
            </div>
        `;
    },

    /**
     * 绑定事件
     */
    bindEvents: function() {
        // 绑定添加按钮事件
        const addButtons = document.querySelectorAll('.btn-add');
        addButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const action = button.getAttribute('onclick');
                if (action) {
                    // 执行对应的添加函数
                    const functionName = action.match(/onclick="([^"]+)"/)[1];
                    if (typeof window[functionName] === 'function') {
                        window[functionName]();
                    }
                }
            });
        });
    }
};

// 全局函数
function openTab(event, tabName) {
    TableManager.openTab(event, tabName);
}

function addAlarmRecord() {
    TableManager.addAlarmRecord();
}

function addUserIdentity() {
    TableManager.addUserIdentity();
}

function addBaseAsset() {
    TableManager.addBaseAsset();
}

function addRiskRule() {
    TableManager.addRiskRule();
}

// 导出给其他模块使用
window.TableManager = TableManager;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待其他模块加载完成
    setTimeout(() => {
        TableManager.init();
    }, 200);
}); 