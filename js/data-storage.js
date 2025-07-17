/**
 * 数据存储模块
 * 负责数据的持久化存储和内存管理
 */

// 数据存储模块
class DataStorage {
    constructor() {
        this.storageKeys = {
            ALARM_RECORDS: 'ipe_alarm_records',
            USERS: 'ipe_users',
            ASSETS: 'ipe_assets',
            RULES: 'ipe_rules',
            DASHBOARD_STATS: 'ipe_dashboard_stats'
        };
        this.init();
    }

    init() {
        console.log('数据存储模块初始化...');
        this.ensureInitialData();
    }

    // 确保有初始数据
    ensureInitialData() {
        if (!this.getAlarmRecords().length) {
            this.generateInitialData();
        }
    }

    // 生成初始数据
    generateInitialData() {
        console.log('生成初始数据...');
        this.generateMockData();
    }

    // 生成Mock数据
    generateMockData() {
        console.log('生成Mock数据...');
        
        // 清空现有数据
        this.clearAllData();
        
        // 生成用户身份数据
        const userNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二'];
        const departments = ['技术部', '运营部', '市场部', '财务部', '人事部', '法务部', '采购部', '客服部'];
        const statuses = ['active', 'inactive', 'pending'];
        
        for (let i = 0; i < 20; i++) {
            const user = {
                id: `user_${String(i + 1).padStart(3, '0')}`,
                name: userNames[i % userNames.length] + (i > 9 ? `_${Math.floor(i/10) + 1}` : ''),
                idNumber: this.generateIdNumber(),
                validUntil: this.generateValidDate(),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                department: departments[Math.floor(Math.random() * departments.length)],
                createTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
            };
            this.addUser(user);
        }

        // 生成基线资产数据
        const assetTypes = ['server', 'database', 'network', 'application', 'storage', 'security'];
        const accountTypes = ['admin', 'user', 'service', 'guest'];
        
        for (let i = 0; i < 25; i++) {
            const asset = {
                id: `asset_${String(i + 1).padStart(3, '0')}`,
                type: assetTypes[Math.floor(Math.random() * assetTypes.length)],
                accountNumber: this.generateAccountNumber(),
                snapshotTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                hashValue: this.generateHashValue(),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                description: `资产描述_${i + 1}`,
                createTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
            };
            this.addAsset(asset);
        }

        // 生成风险规则数据
        const scanConditions = ['异常登录检测', '敏感文件访问', '系统资源监控', '网络流量异常', '权限变更检测', '数据泄露检测'];
        const algorithms = ['模糊匹配', '精确匹配', '正则表达式', '机器学习', '统计分析', '行为分析'];
        const thresholds = ['3次/分钟', '5次/小时', '10次/天', '80%', '90%', '95%'];
        
        for (let i = 0; i < 15; i++) {
            const rule = {
                id: `rule_${String(i + 1).padStart(3, '0')}`,
                scanCondition: scanConditions[Math.floor(Math.random() * scanConditions.length)],
                algorithm: algorithms[Math.floor(Math.random() * algorithms.length)],
                threshold: thresholds[Math.floor(Math.random() * thresholds.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                description: `规则描述_${i + 1}`,
                createTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
            };
            this.addRule(rule);
        }

        // 生成告警记录数据
        const riskLevels = ['high', 'medium', 'low'];
        const channels = ['email', 'sms', 'webhook', 'slack', 'dingtalk', 'wechat'];
        const sendStatuses = ['success', 'failed', 'pending', 'retrying'];
        
        // 确保每种风险等级都有数据
        const riskDistribution = {
            high: 15,    // 30% 高风险
            medium: 20,  // 40% 中风险
            low: 15      // 30% 低风险
        };
        
        let alarmIndex = 1;
        
        // 生成高风险数据
        for (let i = 0; i < riskDistribution.high; i++) {
            const alarm = {
                id: `alarm_${String(alarmIndex++).padStart(3, '0')}`,
                riskLevel: 'high',
                channel: channels[Math.floor(Math.random() * channels.length)],
                sendStatus: sendStatuses[Math.floor(Math.random() * sendStatuses.length)],
                triggerTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                description: `高风险告警_${i + 1}`,
                targetUser: userNames[Math.floor(Math.random() * userNames.length)],
                createTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            };
            this.addAlarmRecord(alarm);
        }
        
        // 生成中风险数据
        for (let i = 0; i < riskDistribution.medium; i++) {
            const alarm = {
                id: `alarm_${String(alarmIndex++).padStart(3, '0')}`,
                riskLevel: 'medium',
                channel: channels[Math.floor(Math.random() * channels.length)],
                sendStatus: sendStatuses[Math.floor(Math.random() * sendStatuses.length)],
                triggerTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                description: `中风险告警_${i + 1}`,
                targetUser: userNames[Math.floor(Math.random() * userNames.length)],
                createTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            };
            this.addAlarmRecord(alarm);
        }
        
        // 生成低风险数据
        for (let i = 0; i < riskDistribution.low; i++) {
            const alarm = {
                id: `alarm_${String(alarmIndex++).padStart(3, '0')}`,
                riskLevel: 'low',
                channel: channels[Math.floor(Math.random() * channels.length)],
                sendStatus: sendStatuses[Math.floor(Math.random() * sendStatuses.length)],
                triggerTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                description: `低风险告警_${i + 1}`,
                targetUser: userNames[Math.floor(Math.random() * userNames.length)],
                createTime: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            };
            this.addAlarmRecord(alarm);
        }

        console.log('Mock数据生成完成');
    }

    // 生成身份证号
    generateIdNumber() {
        const prefix = '110101'; // 北京市东城区
        const year = 1980 + Math.floor(Math.random() * 40);
        const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, '0');
        const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
        const suffix = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
        return `${prefix}${year}${month}${day}${suffix}`;
    }

    // 生成有效期
    generateValidDate() {
        const now = new Date();
        const validYears = 1 + Math.floor(Math.random() * 10);
        const validDate = new Date(now.getTime() + validYears * 365 * 24 * 60 * 60 * 1000);
        return validDate.toISOString().split('T')[0];
    }

    // 生成账户号
    generateAccountNumber() {
        const prefixes = ['ACC', 'USR', 'SVC', 'ADM'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const number = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
        return `${prefix}${number}`;
    }

    // 生成哈希值
    generateHashValue() {
        const chars = '0123456789abcdef';
        let hash = '';
        for (let i = 0; i < 32; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
        return hash;
    }

    // 通用存储方法
    saveData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    }

    // 通用读取方法
    loadData(key, defaultValue = []) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('读取数据失败:', error);
            return defaultValue;
        }
    }

    // 告警记录相关方法
    getAlarmRecords() {
        return this.loadData(this.storageKeys.ALARM_RECORDS, []);
    }

    addAlarmRecord(record) {
        const records = this.getAlarmRecords();
        records.push(record);
        this.saveData(this.storageKeys.ALARM_RECORDS, records);
        return record;
    }

    updateAlarmRecord(id, updatedRecord) {
        const records = this.getAlarmRecords();
        const index = records.findIndex(record => record.id === id);
        if (index !== -1) {
            records[index] = { ...records[index], ...updatedRecord };
            this.saveData(this.storageKeys.ALARM_RECORDS, records);
            return records[index];
        }
        return null;
    }

    deleteAlarmRecord(id) {
        const records = this.getAlarmRecords();
        const filteredRecords = records.filter(record => record.id !== id);
        this.saveData(this.storageKeys.ALARM_RECORDS, filteredRecords);
    }

    getAlarmRecord(id) {
        const records = this.getAlarmRecords();
        return records.find(record => record.id === id);
    }

    // 用户相关方法
    getUsers() {
        return this.loadData(this.storageKeys.USERS, []);
    }

    addUser(user) {
        const users = this.getUsers();
        users.push(user);
        this.saveData(this.storageKeys.USERS, users);
        return user;
    }

    updateUser(id, updatedUser) {
        const users = this.getUsers();
        const index = users.findIndex(user => user.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updatedUser };
            this.saveData(this.storageKeys.USERS, users);
            return users[index];
        }
        return null;
    }

    deleteUser(id) {
        const users = this.getUsers();
        const filteredUsers = users.filter(user => user.id !== id);
        this.saveData(this.storageKeys.USERS, filteredUsers);
    }

    // 资产相关方法
    getAssets() {
        return this.loadData(this.storageKeys.ASSETS, []);
    }

    addAsset(asset) {
        const assets = this.getAssets();
        assets.push(asset);
        this.saveData(this.storageKeys.ASSETS, assets);
        return asset;
    }

    updateAsset(id, updatedAsset) {
        const assets = this.getAssets();
        const index = assets.findIndex(asset => asset.id === id);
        if (index !== -1) {
            assets[index] = { ...assets[index], ...updatedAsset };
            this.saveData(this.storageKeys.ASSETS, assets);
            return assets[index];
        }
        return null;
    }

    deleteAsset(id) {
        const assets = this.getAssets();
        const filteredAssets = assets.filter(asset => asset.id !== id);
        this.saveData(this.storageKeys.ASSETS, filteredAssets);
    }

    // 规则相关方法
    getRules() {
        return this.loadData(this.storageKeys.RULES, []);
    }

    addRule(rule) {
        const rules = this.getRules();
        rules.push(rule);
        this.saveData(this.storageKeys.RULES, rules);
        return rule;
    }

    updateRule(id, updatedRule) {
        const rules = this.getRules();
        const index = rules.findIndex(rule => rule.id === id);
        if (index !== -1) {
            rules[index] = { ...rules[index], ...updatedRule };
            this.saveData(this.storageKeys.RULES, rules);
            return rules[index];
        }
        return null;
    }

    deleteRule(id) {
        const rules = this.getRules();
        const filteredRules = rules.filter(rule => rule.id !== id);
        this.saveData(this.storageKeys.RULES, filteredRules);
    }

    // 仪表板统计相关方法
    getDashboardStats() {
        return this.loadData(this.storageKeys.DASHBOARD_STATS, {});
    }

    saveDashboardStats(stats) {
        this.saveData(this.storageKeys.DASHBOARD_STATS, stats);
    }

    // 数据管理方法
    clearAllData() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    exportAllData() {
        return {
            timestamp: new Date().toISOString(),
            version: '2025.07',
            data: {
                alarmRecords: this.getAlarmRecords(),
                users: this.getUsers(),
                assets: this.getAssets(),
                rules: this.getRules(),
                dashboardStats: this.getDashboardStats()
            }
        };
    }

    importData(data) {
        try {
            if (data.data) {
                if (data.data.alarmRecords) {
                    this.saveData(this.storageKeys.ALARM_RECORDS, data.data.alarmRecords);
                }
                if (data.data.users) {
                    this.saveData(this.storageKeys.USERS, data.data.users);
                }
                if (data.data.assets) {
                    this.saveData(this.storageKeys.ASSETS, data.data.assets);
                }
                if (data.data.rules) {
                    this.saveData(this.storageKeys.RULES, data.data.rules);
                }
                if (data.data.dashboardStats) {
                    this.saveData(this.storageKeys.DASHBOARD_STATS, data.data.dashboardStats);
                }
                return true;
            }
        } catch (error) {
            console.error('数据导入失败:', error);
            return false;
        }
    }

    // 同步数据方法
    syncData() {
        console.log('开始同步数据...');
        try {
            // 随机决定风险事件的数量和类型
            const riskScenario = this.generateRandomRiskScenario();
            
            if (riskScenario.hasRisk) {
                console.log(`生成风险场景: ${riskScenario.description}`);
                this.generateMockData();
                
                // 根据风险场景生成相应数量的风险事件
                this.generateRecentRiskEvents(riskScenario.eventCount);
            } else {
                console.log('生成无风险场景...');
                this.clearAllData();
                this.generateMockDataWithoutAlarms();
            }
            
            // 获取同步后的数据
            const users = this.getUsers();
            const assets = this.getAssets();
            const rules = this.getRules();
            const alarms = this.getAlarmRecords();
            
            // 触发数据更新事件
            const event = new CustomEvent('dataSynced', {
                detail: {
                    users: users,
                    assets: assets,
                    rules: rules,
                    alarms: alarms,
                    scenario: riskScenario
                }
            });
            window.dispatchEvent(event);
            
            console.log('数据同步完成', {
                users: users.length,
                assets: assets.length,
                rules: rules.length,
                alarms: alarms.length,
                hasRiskEvents: alarms.length > 0,
                scenario: riskScenario.description
            });
            
            return {
                success: true,
                count: users.length + assets.length + rules.length + alarms.length,
                users: users,
                assets: assets,
                rules: rules,
                alarms: alarms,
                hasRiskEvents: alarms.length > 0,
                scenario: riskScenario
            };
        } catch (error) {
            console.error('数据同步失败:', error);
            return {
                success: false,
                error: error.message,
                count: 0
            };
        }
    }
    
    // 生成随机风险场景
    generateRandomRiskScenario() {
        const scenarios = [
            {
                name: '无风险',
                hasRisk: false,
                eventCount: 0,
                description: '系统运行正常，无风险事件'
            },
            {
                name: '低风险',
                hasRisk: true,
                eventCount: 3 + Math.floor(Math.random() * 5), // 3-7个事件
                description: '检测到少量低风险事件'
            },
            {
                name: '中风险',
                hasRisk: true,
                eventCount: 8 + Math.floor(Math.random() * 7), // 8-14个事件
                description: '检测到中等数量风险事件'
            },
            {
                name: '高风险',
                hasRisk: true,
                eventCount: 15 + Math.floor(Math.random() * 10), // 15-24个事件
                description: '检测到大量高风险事件，需要立即关注'
            },
            {
                name: '紧急风险',
                hasRisk: true,
                eventCount: 25 + Math.floor(Math.random() * 15), // 25-39个事件
                description: '系统检测到紧急风险事件，建议立即处理'
            }
        ];
        
        // 根据概率选择场景
        const random = Math.random();
        if (random < 0.2) {
            return scenarios[0]; // 20%概率无风险
        } else if (random < 0.4) {
            return scenarios[1]; // 20%概率低风险
        } else if (random < 0.7) {
            return scenarios[2]; // 30%概率中风险
        } else if (random < 0.9) {
            return scenarios[3]; // 20%概率高风险
        } else {
            return scenarios[4]; // 10%概率紧急风险
        }
    }
    
    // 生成不包含告警的Mock数据
    generateMockDataWithoutAlarms() {
        console.log('生成不包含告警的Mock数据...');
        
        // 清空现有数据
        this.clearAllData();
        
        // 生成用户身份数据
        const userNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二'];
        const departments = ['技术部', '运营部', '市场部', '财务部', '人事部', '法务部', '采购部', '客服部'];
        const statuses = ['active', 'inactive', 'pending'];
        
        for (let i = 0; i < 20; i++) {
            const user = {
                id: `user_${String(i + 1).padStart(3, '0')}`,
                name: userNames[i % userNames.length] + (i > 9 ? `_${Math.floor(i/10) + 1}` : ''),
                idNumber: this.generateIdNumber(),
                validUntil: this.generateValidDate(),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                department: departments[Math.floor(Math.random() * departments.length)],
                createTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
            };
            this.addUser(user);
        }

        // 生成基线资产数据
        const assetTypes = ['server', 'database', 'network', 'application', 'storage', 'security'];
        const accountTypes = ['admin', 'user', 'service', 'guest'];
        
        for (let i = 0; i < 25; i++) {
            const asset = {
                id: `asset_${String(i + 1).padStart(3, '0')}`,
                type: assetTypes[Math.floor(Math.random() * assetTypes.length)],
                accountNumber: this.generateAccountNumber(),
                snapshotTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                hashValue: this.generateHashValue(),
                status: statuses[Math.floor(Math.random() * statuses.length)],
                description: `资产描述_${i + 1}`,
                createTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
            };
            this.addAsset(asset);
        }

        // 生成风险规则数据
        const scanConditions = ['异常登录检测', '敏感文件访问', '系统资源监控', '网络流量异常', '权限变更检测', '数据泄露检测'];
        const algorithms = ['模糊匹配', '精确匹配', '正则表达式', '机器学习', '统计分析', '行为分析'];
        const thresholds = ['3次/分钟', '5次/小时', '10次/天', '80%', '90%', '95%'];
        
        for (let i = 0; i < 15; i++) {
            const rule = {
                id: `rule_${String(i + 1).padStart(3, '0')}`,
                scanCondition: scanConditions[Math.floor(Math.random() * scanConditions.length)],
                algorithm: algorithms[Math.floor(Math.random() * algorithms.length)],
                threshold: thresholds[Math.floor(Math.random() * thresholds.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                description: `规则描述_${i + 1}`,
                createTime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
            };
            this.addRule(rule);
        }

        // 不生成告警记录，保持0风险状态
        console.log('无告警Mock数据生成完成');
    }
    
    // 生成最近的风险事件
    generateRecentRiskEvents(count = null) {
        console.log('生成最近的风险事件...');
        
        const channels = ['email', 'sms', 'webhook', 'slack', 'dingtalk', 'wechat'];
        const sendStatuses = ['success', 'failed', 'pending', 'retrying'];
        const userNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十', '郑十一', '王十二'];
        
        // 生成指定数量或5-15个最近24小时内的风险事件
        const eventCount = count || (5 + Math.floor(Math.random() * 11));
        
        // 确保每种风险等级都有数据
        const highCount = Math.max(1, Math.floor(eventCount * 0.3)); // 30% 高风险
        const mediumCount = Math.max(1, Math.floor(eventCount * 0.4)); // 40% 中风险
        const lowCount = Math.max(1, eventCount - highCount - mediumCount); // 剩余为低风险
        
        const generatedEvents = [];
        let alarmIndex = 1;
        
        // 生成高风险事件
        for (let i = 0; i < highCount; i++) {
            const alarm = {
                id: `recent_alarm_${String(alarmIndex++).padStart(3, '0')}`,
                riskLevel: 'high',
                channel: channels[Math.floor(Math.random() * channels.length)],
                sendStatus: sendStatuses[Math.floor(Math.random() * sendStatuses.length)],
                triggerTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(), // 最近24小时内
                description: `最近高风险事件_${i + 1}`,
                targetUser: userNames[Math.floor(Math.random() * userNames.length)],
                createTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
            };
            this.addAlarmRecord(alarm);
            generatedEvents.push(alarm);
        }
        
        // 生成中风险事件
        for (let i = 0; i < mediumCount; i++) {
            const alarm = {
                id: `recent_alarm_${String(alarmIndex++).padStart(3, '0')}`,
                riskLevel: 'medium',
                channel: channels[Math.floor(Math.random() * channels.length)],
                sendStatus: sendStatuses[Math.floor(Math.random() * sendStatuses.length)],
                triggerTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(), // 最近24小时内
                description: `最近中风险事件_${i + 1}`,
                targetUser: userNames[Math.floor(Math.random() * userNames.length)],
                createTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
            };
            this.addAlarmRecord(alarm);
            generatedEvents.push(alarm);
        }
        
        // 生成低风险事件
        for (let i = 0; i < lowCount; i++) {
            const alarm = {
                id: `recent_alarm_${String(alarmIndex++).padStart(3, '0')}`,
                riskLevel: 'low',
                channel: channels[Math.floor(Math.random() * channels.length)],
                sendStatus: sendStatuses[Math.floor(Math.random() * sendStatuses.length)],
                triggerTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(), // 最近24小时内
                description: `最近低风险事件_${i + 1}`,
                targetUser: userNames[Math.floor(Math.random() * userNames.length)],
                createTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
            };
            this.addAlarmRecord(alarm);
            generatedEvents.push(alarm);
        }
        
        console.log(`生成了 ${eventCount} 个最近的风险事件 (高风险:${highCount}, 中风险:${mediumCount}, 低风险:${lowCount})`);
        return generatedEvents;
    }
}

// 导出类
window.DataStorage = DataStorage; 