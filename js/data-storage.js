/**
 * 数据存储模块
 * 负责数据的持久化存储和内存管理
 */

// 数据存储键名常量
const STORAGE_KEYS = {
    ALARM_RECORDS: 'ipe_alarm_records',
    USER_IDENTITIES: 'ipe_user_identities',
    BASE_ASSETS: 'ipe_base_assets',
    RISK_RULES: 'ipe_risk_rules',
    DASHBOARD_STATS: 'ipe_dashboard_stats'
};

// 全局数据模型
const appData = {
    alarmRecords: [],      // 告警记录
    userIdentities: [],    // 用户身份
    baseAssets: [],        // 基线资产
    riskRules: [],         // 风险规则
    dashboardStats: {}     // 仪表盘统计数据
};

/**
 * 数据存储工具类
 */
const DataStorage = {
    /**
     * 保存数据到localStorage
     * @param {string} key - 存储键名
     * @param {any} data - 要存储的数据
     */
    saveData: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`数据已保存到 ${key}:`, data);
        } catch (error) {
            console.error(`保存数据失败 ${key}:`, error);
            this.showStorageError('保存数据失败');
        }
    },

    /**
     * 从localStorage读取数据
     * @param {string} key - 存储键名
     * @param {any} defaultValue - 默认值
     * @returns {any} 读取的数据
     */
    loadData: function(key, defaultValue = []) {
        try {
            const data = localStorage.getItem(key);
            if (data === null) {
                console.log(`未找到存储数据 ${key}，使用默认值`);
                return defaultValue;
            }
            const parsedData = JSON.parse(data);
            console.log(`数据已加载 ${key}:`, parsedData);
            return parsedData;
        } catch (error) {
            console.error(`读取数据失败 ${key}:`, error);
            this.showStorageError('读取数据失败');
            return defaultValue;
        }
    },

    /**
     * 清除指定数据
     * @param {string} key - 存储键名
     */
    clearData: function(key) {
        try {
            localStorage.removeItem(key);
            console.log(`数据已清除 ${key}`);
        } catch (error) {
            console.error(`清除数据失败 ${key}:`, error);
        }
    },

    /**
     * 清除所有应用数据
     */
    clearAllData: function() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            console.log('所有应用数据已清除');
        } catch (error) {
            console.error('清除所有数据失败:', error);
        }
    },

    /**
     * 显示存储错误提示
     * @param {string} message - 错误消息
     */
    showStorageError: function(message) {
        const statusElement = document.getElementById('data-status');
        if (statusElement) {
            statusElement.textContent = `数据状态: ${message}`;
            statusElement.style.color = '#ff4d4f';
            
            // 3秒后恢复正常状态
            setTimeout(() => {
                statusElement.textContent = '数据状态: 正常';
                statusElement.style.color = '#52c41a';
            }, 3000);
        }
    },

    /**
     * 获取存储使用情况
     * @returns {object} 存储使用信息
     */
    getStorageInfo: function() {
        try {
            const totalSize = new Blob([localStorage]).size;
            const usedSize = Object.keys(localStorage).reduce((size, key) => {
                return size + new Blob([localStorage[key]]).size;
            }, 0);
            
            return {
                total: totalSize,
                used: usedSize,
                available: totalSize - usedSize,
                percentage: (usedSize / totalSize * 100).toFixed(2)
            };
        } catch (error) {
            console.error('获取存储信息失败:', error);
            return null;
        }
    }
};

/**
 * 应用数据管理器
 */
const AppDataManager = {
    /**
     * 初始化应用数据
     */
    init: function() {
        console.log('初始化应用数据...');
        
        // 从localStorage加载数据
        appData.alarmRecords = DataStorage.loadData(STORAGE_KEYS.ALARM_RECORDS, []);
        appData.userIdentities = DataStorage.loadData(STORAGE_KEYS.USER_IDENTITIES, []);
        appData.baseAssets = DataStorage.loadData(STORAGE_KEYS.BASE_ASSETS, []);
        appData.riskRules = DataStorage.loadData(STORAGE_KEYS.RISK_RULES, []);
        appData.dashboardStats = DataStorage.loadData(STORAGE_KEYS.DASHBOARD_STATS, {});
        
        console.log('应用数据初始化完成:', appData);
        this.updateDataStatus();
    },

    /**
     * 保存告警记录
     * @param {Array} records - 告警记录数组
     */
    saveAlarmRecords: function(records) {
        appData.alarmRecords = records;
        DataStorage.saveData(STORAGE_KEYS.ALARM_RECORDS, records);
        this.updateDataStatus();
    },

    /**
     * 保存用户身份数据
     * @param {Array} identities - 用户身份数组
     */
    saveUserIdentities: function(identities) {
        appData.userIdentities = identities;
        DataStorage.saveData(STORAGE_KEYS.USER_IDENTITIES, identities);
        this.updateDataStatus();
    },

    /**
     * 保存基线资产数据
     * @param {Array} assets - 基线资产数组
     */
    saveBaseAssets: function(assets) {
        appData.baseAssets = assets;
        DataStorage.saveData(STORAGE_KEYS.BASE_ASSETS, assets);
        this.updateDataStatus();
    },

    /**
     * 保存风险规则数据
     * @param {Array} rules - 风险规则数组
     */
    saveRiskRules: function(rules) {
        appData.riskRules = rules;
        DataStorage.saveData(STORAGE_KEYS.RISK_RULES, rules);
        this.updateDataStatus();
    },

    /**
     * 保存仪表盘统计数据
     * @param {object} stats - 仪表盘统计数据
     */
    saveDashboardStats: function(stats) {
        appData.dashboardStats = stats;
        DataStorage.saveData(STORAGE_KEYS.DASHBOARD_STATS, stats);
    },

    /**
     * 获取告警记录
     * @returns {Array} 告警记录数组
     */
    getAlarmRecords: function() {
        return appData.alarmRecords;
    },

    /**
     * 获取用户身份数据
     * @returns {Array} 用户身份数组
     */
    getUserIdentities: function() {
        return appData.userIdentities;
    },

    /**
     * 获取基线资产数据
     * @returns {Array} 基线资产数组
     */
    getBaseAssets: function() {
        return appData.baseAssets;
    },

    /**
     * 获取风险规则数据
     * @returns {Array} 风险规则数组
     */
    getRiskRules: function() {
        return appData.riskRules;
    },

    /**
     * 获取仪表盘统计数据
     * @returns {object} 仪表盘统计数据
     */
    getDashboardStats: function() {
        return appData.dashboardStats;
    },

    /**
     * 添加告警记录
     * @param {object} record - 告警记录对象
     */
    addAlarmRecord: function(record) {
        const records = [...appData.alarmRecords, record];
        this.saveAlarmRecords(records);
        return record;
    },

    /**
     * 更新告警记录
     * @param {string} id - 记录ID
     * @param {object} updatedRecord - 更新的记录对象
     */
    updateAlarmRecord: function(id, updatedRecord) {
        const records = appData.alarmRecords.map(record => 
            record.id === id ? { ...record, ...updatedRecord } : record
        );
        this.saveAlarmRecords(records);
    },

    /**
     * 删除告警记录
     * @param {string} id - 记录ID
     */
    deleteAlarmRecord: function(id) {
        const records = appData.alarmRecords.filter(record => record.id !== id);
        this.saveAlarmRecords(records);
    },

    /**
     * 更新数据状态显示
     */
    updateDataStatus: function() {
        const statusElement = document.getElementById('data-status');
        if (statusElement) {
            const totalRecords = appData.alarmRecords.length + 
                               appData.userIdentities.length + 
                               appData.baseAssets.length + 
                               appData.riskRules.length;
            
            statusElement.textContent = `数据状态: 正常 (${totalRecords} 条记录)`;
            statusElement.style.color = '#52c41a';
        }
    },

    /**
     * 重置所有数据
     */
    resetAllData: function() {
        if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
            DataStorage.clearAllData();
            
            // 清空内存数据
            appData.alarmRecords = [];
            appData.userIdentities = [];
            appData.baseAssets = [];
            appData.riskRules = [];
            appData.dashboardStats = {};
            
            this.updateDataStatus();
            console.log('所有数据已重置');
            
            // 刷新页面
            location.reload();
        }
    },

    /**
     * 导出数据
     * @returns {object} 导出的数据对象
     */
    exportData: function() {
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '2025.07',
            data: {
                alarmRecords: appData.alarmRecords,
                userIdentities: appData.userIdentities,
                baseAssets: appData.baseAssets,
                riskRules: appData.riskRules,
                dashboardStats: appData.dashboardStats
            }
        };
        
        return exportData;
    },

    /**
     * 导入数据
     * @param {object} importData - 导入的数据对象
     */
    importData: function(importData) {
        try {
            if (importData.data) {
                if (importData.data.alarmRecords) {
                    this.saveAlarmRecords(importData.data.alarmRecords);
                }
                if (importData.data.userIdentities) {
                    this.saveUserIdentities(importData.data.userIdentities);
                }
                if (importData.data.baseAssets) {
                    this.saveBaseAssets(importData.data.baseAssets);
                }
                if (importData.data.riskRules) {
                    this.saveRiskRules(importData.data.riskRules);
                }
                if (importData.data.dashboardStats) {
                    this.saveDashboardStats(importData.data.dashboardStats);
                }
                
                console.log('数据导入成功');
                this.updateDataStatus();
                return true;
            }
        } catch (error) {
            console.error('数据导入失败:', error);
            return false;
        }
    }
};

// 全局重置函数
function resetAllData() {
    AppDataManager.resetAllData();
}

// 页面加载时初始化数据
document.addEventListener('DOMContentLoaded', function() {
    AppDataManager.init();
}); 