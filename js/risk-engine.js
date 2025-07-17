/**
 * 风险计算引擎
 * 负责风险指标计算、数据分析和统计
 */

/**
 * 风险计算引擎类
 */
class RiskEngine {
    constructor() {
        this.riskLevels = {
            high: { score: 3, color: '#ff4d4f', name: '高风险' },
            medium: { score: 2, color: '#faad14', name: '中风险' },
            low: { score: 1, color: '#52c41a', name: '低风险' }
        };
        this.init();
    }

    init() {
        console.log('风险引擎初始化...');
    }

    // 计算风险等级
    calculateRiskLevel(alarmRecord) {
        const factors = {
            type: this.getTypeRiskFactor(alarmRecord.type),
            frequency: this.getFrequencyRiskFactor(alarmRecord),
            severity: this.getSeverityRiskFactor(alarmRecord),
            time: this.getTimeRiskFactor(alarmRecord.triggerTime)
        };

        const totalScore = Object.values(factors).reduce((sum, score) => sum + score, 0);
        
        if (totalScore >= 8) return 'high';
        if (totalScore >= 5) return 'medium';
        return 'low';
    }

    // 获取类型风险因子
    getTypeRiskFactor(type) {
        const typeFactors = {
            'login': 3,      // 登录异常
            'access': 2,     // 访问异常
            'system': 1,     // 系统异常
            'network': 2,    // 网络异常
            'data': 3        // 数据异常
        };
        return typeFactors[type] || 1;
    }

    // 获取频率风险因子
    getFrequencyRiskFactor(alarmRecord) {
        // 基于时间窗口内的同类告警数量
        const timeWindow = 24 * 60 * 60 * 1000; // 24小时
        const alarmTime = new Date(alarmRecord.triggerTime);
        const cutoffTime = new Date(alarmTime.getTime() - timeWindow);
        
        // 检查是否有DataStorage实例
        if (typeof window.dataStorage !== 'undefined' && window.dataStorage) {
            const recentAlarms = window.dataStorage.getAlarmRecords().filter(record => 
            record.type === alarmRecord.type && 
            new Date(record.triggerTime) > cutoffTime
        );

        if (recentAlarms.length >= 10) return 3;
        if (recentAlarms.length >= 5) return 2;
        if (recentAlarms.length >= 2) return 1;
        }
        return 0;
    }

    // 获取严重性风险因子
    getSeverityRiskFactor(alarmRecord) {
        // 基于告警的严重性指标
        const severityIndicators = {
            'unauthorized_access': 3,
            'data_breach': 3,
            'system_failure': 2,
            'performance_degradation': 1,
            'normal_alert': 0
        };
        
        return severityIndicators[alarmRecord.severity] || 1;
    }

    // 获取时间风险因子
    getTimeRiskFactor(timestamp) {
        const alarmTime = new Date(timestamp);
        const now = new Date();
        const timeDiff = now.getTime() - alarmTime.getTime();
        
        // 最近1小时内的告警风险更高
        if (timeDiff <= 60 * 60 * 1000) return 2;
        if (timeDiff <= 24 * 60 * 60 * 1000) return 1;
        return 0;
    }

    // 计算风险统计
    calculateRiskStats(alarmRecords) {
        const stats = {
            totalCount: alarmRecords.length,
            highRiskCount: 0,
            mediumRiskCount: 0,
            lowRiskCount: 0,
            distribution: { high: 0, medium: 0, low: 0 },
            trendRate: 0,
            dailyData: this.generateDailyData(alarmRecords)
        };

        // 统计各风险等级数量
        alarmRecords.forEach(record => {
            const riskLevel = record.riskLevel || this.calculateRiskLevel(record);
            switch (riskLevel) {
                case 'high':
                    stats.highRiskCount++;
                    break;
                case 'medium':
                    stats.mediumRiskCount++;
                    break;
                case 'low':
                    stats.lowRiskCount++;
                    break;
            }
        });

        // 计算分布
        const total = stats.totalCount;
        if (total > 0) {
            stats.distribution.high = Math.round((stats.highRiskCount / total) * 100);
            stats.distribution.medium = Math.round((stats.mediumRiskCount / total) * 100);
            stats.distribution.low = Math.round((stats.lowRiskCount / total) * 100);
        }

        // 计算趋势率（模拟）
        stats.trendRate = this.calculateTrendRate(alarmRecords);

        return stats;
    }

    // 生成每日数据
    generateDailyData(alarmRecords) {
        const dailyData = {
            dates: [],
            totalEvents: [],
            highRiskEvents: []
        };

        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayAlarms = alarmRecords.filter(record => 
                record.triggerTime.startsWith(dateStr)
            );

            dailyData.dates.push(dateStr);
            dailyData.totalEvents.push(dayAlarms.length);
            dailyData.highRiskEvents.push(
                dayAlarms.filter(record => record.riskLevel === 'high').length
            );
        }

        return dailyData;
    }

    // 计算趋势率
    calculateTrendRate(alarmRecords) {
        if (alarmRecords.length < 2) return 0;

        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const recentWeek = alarmRecords.filter(record => 
            new Date(record.triggerTime) > oneWeekAgo
        ).length;

        const previousWeek = alarmRecords.filter(record => 
            new Date(record.triggerTime) > twoWeeksAgo && 
            new Date(record.triggerTime) <= oneWeekAgo
        ).length;

        if (previousWeek === 0) return recentWeek > 0 ? 100 : 0;
        
        return Math.round(((recentWeek - previousWeek) / previousWeek) * 100);
    }

    // 生成模拟数据
    generateMockData(count = 10) {
        const mockRecords = [];
        const types = ['login', 'access', 'system', 'network', 'data'];
        const riskLevels = ['high', 'medium', 'low'];
        const statuses = ['success', 'failed', 'pending'];

        for (let i = 0; i < count; i++) {
            const record = {
                id: `mock_${String(i + 1).padStart(3, '0')}`,
                type: types[Math.floor(Math.random() * types.length)],
                riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                description: `模拟告警记录 ${i + 1}`,
                source: 'mock_system',
                severity: Math.random() > 0.7 ? 'high' : 'medium'
            };
            mockRecords.push(record);
        }

        return mockRecords;
    }

    // 风险评估
    assessRisk(alarmRecord) {
        const riskLevel = this.calculateRiskLevel(alarmRecord);
        const riskScore = this.calculateRiskScore(alarmRecord);
        const recommendations = this.generateRecommendations(alarmRecord, riskLevel);

        return {
            level: riskLevel,
            score: riskScore,
            factors: this.getRiskFactors(alarmRecord),
            recommendations: recommendations,
            timestamp: new Date().toISOString()
        };
    }

    // 计算风险分数
    calculateRiskScore(alarmRecord) {
        const baseScore = this.riskLevels[alarmRecord.riskLevel]?.score || 1;
        const timeFactor = this.getTimeRiskFactor(alarmRecord.triggerTime);
        const frequencyFactor = this.getFrequencyRiskFactor(alarmRecord);
        
        return Math.min(10, baseScore + timeFactor + frequencyFactor);
    }

    // 获取风险因子
    getRiskFactors(alarmRecord) {
        return {
            type: this.getTypeRiskFactor(alarmRecord.type),
            frequency: this.getFrequencyRiskFactor(alarmRecord),
            severity: this.getSeverityRiskFactor(alarmRecord),
            time: this.getTimeRiskFactor(alarmRecord.triggerTime)
        };
    }

    // 生成建议
    generateRecommendations(alarmRecord, riskLevel) {
        const recommendations = [];

        if (riskLevel === 'high') {
            recommendations.push('立即采取行动，检查系统安全状态');
            recommendations.push('通知相关安全团队');
            recommendations.push('启动应急响应流程');
        } else if (riskLevel === 'medium') {
            recommendations.push('关注告警趋势，准备应对措施');
            recommendations.push('检查相关系统配置');
        } else {
            recommendations.push('记录告警信息，持续监控');
        }

        // 基于告警类型的特定建议
        switch (alarmRecord.type) {
            case 'login':
                recommendations.push('检查用户账户安全，考虑重置密码');
                break;
            case 'access':
                recommendations.push('审查访问权限，确认是否授权');
                break;
            case 'system':
                recommendations.push('检查系统资源使用情况');
                break;
            case 'network':
                recommendations.push('检查网络连接和防火墙配置');
                break;
            case 'data':
                recommendations.push('检查数据完整性和备份状态');
                break;
        }

        return recommendations;
    }

    // 获取风险等级信息
    getRiskLevelInfo(riskLevel) {
        return this.riskLevels[riskLevel] || this.riskLevels.low;
    }

    // 验证告警记录
    validateAlarmRecord(record) {
        const required = ['id', 'type', 'timestamp'];
        const missing = required.filter(field => !record[field]);
        
        if (missing.length > 0) {
            throw new Error(`缺少必需字段: ${missing.join(', ')}`);
        }

        if (!['login', 'access', 'system', 'network', 'data'].includes(record.type)) {
            throw new Error('无效的告警类型');
        }

        if (isNaN(new Date(record.timestamp).getTime())) {
            throw new Error('无效的时间戳');
        }

        return true;
    }
}

// 创建全局实例并导出
window.RiskEngine = new RiskEngine(); 