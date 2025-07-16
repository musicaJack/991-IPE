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
            HIGH: 'high',
            MEDIUM: 'medium',
            LOW: 'low'
        };
        
        this.notifyChannels = {
            WECHAT: '微信',
            SMS: '短信',
            EMAIL: '邮件'
        };
        
        this.statusTypes = {
            SUCCESS: 'success',
            FAILED: 'failed'
        };
    }

    /**
     * 获取最近24小时的时间戳
     * @returns {number} 24小时前的时间戳
     */
    get24HoursAgo() {
        return Date.now() - 24 * 60 * 60 * 1000;
    }

    /**
     * 获取最近7天的日期数组
     * @returns {Array} 最近7天的Date对象数组
     */
    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            days.push(d);
        }
        return days;
    }

    /**
     * 获取最近14天的日期数组（用于计算周环比）
     * @returns {Array} 最近14天的Date对象数组
     */
    getLast14Days() {
        const days = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            days.push(d);
        }
        return days;
    }

    /**
     * 计算风险指标
     * @param {Array} alarmRecords - 告警记录数组
     * @returns {object} 风险指标计算结果
     */
    calculateRiskStats(alarmRecords = []) {
        console.log('开始计算风险指标...');
        
        const last24H = this.get24HoursAgo();
        const last7Days = this.getLast7Days();
        const last14Days = this.getLast14Days();
        
        // 过滤最近24小时的记录
        const records24H = alarmRecords.filter(record => {
            const recordTime = new Date(record.timestamp).getTime();
            return recordTime >= last24H;
        });
        
        // 按风险等级统计24小时数据
        const stats24H = this.countByRiskLevel(records24H);
        
        // 计算7天趋势数据
        const trendData = this.calculateTrendData(alarmRecords, last7Days);
        
        // 计算周环比
        const weekOverWeek = this.calculateWeekOverWeek(alarmRecords, last14Days);
        
        const result = {
            // 24小时统计数据
            highRiskCount: stats24H.high || 0,
            mediumRiskCount: stats24H.medium || 0,
            lowRiskCount: stats24H.low || 0,
            totalCount24H: records24H.length,
            
            // 趋势数据
            trendRate: weekOverWeek,
            trendData: trendData,
            
            // 分布数据（用于环形图）
            distribution: {
                high: stats24H.high || 0,
                medium: stats24H.medium || 0,
                low: stats24H.low || 0
            },
            
            // 7天数据（用于折线图）
            dailyData: trendData.dailyData,
            
            // 计算时间
            calculatedAt: new Date().toISOString()
        };
        
        console.log('风险指标计算完成:', result);
        return result;
    }

    /**
     * 按风险等级统计记录数量
     * @param {Array} records - 记录数组
     * @returns {object} 各风险等级的数量
     */
    countByRiskLevel(records) {
        const counts = {
            high: 0,
            medium: 0,
            low: 0
        };
        
        records.forEach(record => {
            if (counts.hasOwnProperty(record.riskLevel)) {
                counts[record.riskLevel]++;
            }
        });
        
        return counts;
    }

    /**
     * 计算趋势数据
     * @param {Array} alarmRecords - 告警记录数组
     * @param {Array} last7Days - 最近7天的日期数组
     * @returns {object} 趋势数据
     */
    calculateTrendData(alarmRecords, last7Days) {
        const dailyData = {
            dates: [],
            totalEvents: [],
            highRiskEvents: []
        };
        
        // 初始化每天的数据
        last7Days.forEach((date, index) => {
            const dateStr = date.toLocaleDateString('zh-CN', {
                month: '2-digit',
                day: '2-digit'
            });
            
            dailyData.dates.push(dateStr);
            dailyData.totalEvents.push(0);
            dailyData.highRiskEvents.push(0);
            
            // 计算当天的事件数量
            const dayStart = date.getTime();
            const dayEnd = new Date(date);
            dayEnd.setDate(dayEnd.getDate() + 1);
            const dayEndTime = dayEnd.getTime();
            
            // 过滤当天的记录
            const dayRecords = alarmRecords.filter(record => {
                const recordTime = new Date(record.timestamp).getTime();
                return recordTime >= dayStart && recordTime < dayEndTime;
            });
            
            // 统计当天的总事件数和高风险事件数
            dailyData.totalEvents[index] = dayRecords.length;
            dailyData.highRiskEvents[index] = dayRecords.filter(
                record => record.riskLevel === this.riskLevels.HIGH
            ).length;
        });
        
        return {
            dailyData: dailyData,
            totalEvents: dailyData.totalEvents.reduce((sum, count) => sum + count, 0),
            highRiskEvents: dailyData.highRiskEvents.reduce((sum, count) => sum + count, 0)
        };
    }

    /**
     * 计算周环比变化率
     * @param {Array} alarmRecords - 告警记录数组
     * @param {Array} last14Days - 最近14天的日期数组
     * @returns {number} 周环比变化率（百分比）
     */
    calculateWeekOverWeek(alarmRecords, last14Days) {
        if (last14Days.length < 14) {
            return 0;
        }
        
        // 本周（最近7天）
        const thisWeekStart = last14Days[7].getTime();
        const thisWeekEnd = new Date(last14Days[13]);
        thisWeekEnd.setDate(thisWeekEnd.getDate() + 1);
        const thisWeekEndTime = thisWeekEnd.getTime();
        
        // 上周（前7天）
        const lastWeekStart = last14Days[0].getTime();
        const lastWeekEnd = new Date(last14Days[6]);
        lastWeekEnd.setDate(lastWeekEnd.getDate() + 1);
        const lastWeekEndTime = lastWeekEnd.getTime();
        
        // 统计本周和上周的事件数量
        const thisWeekCount = alarmRecords.filter(record => {
            const recordTime = new Date(record.timestamp).getTime();
            return recordTime >= thisWeekStart && recordTime < thisWeekEndTime;
        }).length;
        
        const lastWeekCount = alarmRecords.filter(record => {
            const recordTime = new Date(record.timestamp).getTime();
            return recordTime >= lastWeekStart && recordTime < lastWeekEndTime;
        }).length;
        
        // 计算环比变化率
        if (lastWeekCount === 0) {
            return thisWeekCount > 0 ? 100 : 0;
        }
        
        const changeRate = ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100;
        return Math.round(changeRate * 100) / 100; // 保留两位小数
    }

    /**
     * 验证告警记录数据
     * @param {object} record - 告警记录对象
     * @returns {object} 验证结果
     */
    validateAlarmRecord(record) {
        const errors = [];
        
        // 验证风险等级
        if (!record.riskLevel || !Object.values(this.riskLevels).includes(record.riskLevel)) {
            errors.push('风险等级无效');
        }
        
        // 验证通知渠道
        if (!record.notifyChannel || !Object.values(this.notifyChannels).includes(record.notifyChannel)) {
            errors.push('通知渠道无效');
        }
        
        // 验证发送状态
        if (!record.status || !Object.values(this.statusTypes).includes(record.status)) {
            errors.push('发送状态无效');
        }
        
        // 验证时间戳
        if (!record.timestamp || isNaN(new Date(record.timestamp).getTime())) {
            errors.push('发生时间无效');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * 生成模拟数据
     * @param {number} count - 生成记录数量
     * @returns {Array} 模拟告警记录数组
     */
    generateMockData(count = 10) {
        const mockRecords = [];
        const riskLevels = Object.values(this.riskLevels);
        const notifyChannels = Object.values(this.notifyChannels);
        const statusTypes = Object.values(this.statusTypes);
        
        for (let i = 0; i < count; i++) {
            // 生成随机时间（最近7天内）
            const randomDaysAgo = Math.floor(Math.random() * 7);
            const timestamp = new Date();
            timestamp.setDate(timestamp.getDate() - randomDaysAgo);
            timestamp.setHours(
                Math.floor(Math.random() * 24),
                Math.floor(Math.random() * 60),
                Math.floor(Math.random() * 60)
            );
            
            const record = {
                id: `alarm_${Date.now()}_${i}`,
                riskLevel: riskLevels[Math.floor(Math.random() * riskLevels.length)],
                notifyChannel: notifyChannels[Math.floor(Math.random() * notifyChannels.length)],
                status: statusTypes[Math.floor(Math.random() * statusTypes.length)],
                timestamp: timestamp.toISOString(),
                description: `模拟告警事件 ${i + 1}`,
                createdAt: new Date().toISOString()
            };
            
            mockRecords.push(record);
        }
        
        return mockRecords;
    }

    /**
     * 分析风险趋势
     * @param {Array} alarmRecords - 告警记录数组
     * @returns {object} 趋势分析结果
     */
    analyzeRiskTrend(alarmRecords) {
        const last7Days = this.getLast7Days();
        const trendData = this.calculateTrendData(alarmRecords, last7Days);
        
        // 计算趋势方向
        const totalEvents = trendData.dailyData.totalEvents;
        const highRiskEvents = trendData.dailyData.highRiskEvents;
        
        // 简单趋势判断（比较前3天和后3天的平均值）
        const firstHalf = totalEvents.slice(0, 3);
        const secondHalf = totalEvents.slice(-3);
        
        const firstHalfAvg = firstHalf.reduce((sum, count) => sum + count, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, count) => sum + count, 0) / secondHalf.length;
        
        let trendDirection = 'stable';
        if (secondHalfAvg > firstHalfAvg * 1.2) {
            trendDirection = 'increasing';
        } else if (secondHalfAvg < firstHalfAvg * 0.8) {
            trendDirection = 'decreasing';
        }
        
        return {
            direction: trendDirection,
            firstHalfAverage: Math.round(firstHalfAvg * 100) / 100,
            secondHalfAverage: Math.round(secondHalfAvg * 100) / 100,
            totalEvents: totalEvents,
            highRiskEvents: highRiskEvents,
            peakDay: this.findPeakDay(totalEvents),
            lowDay: this.findLowDay(totalEvents)
        };
    }

    /**
     * 找到峰值日期
     * @param {Array} data - 数据数组
     * @returns {number} 峰值索引
     */
    findPeakDay(data) {
        return data.indexOf(Math.max(...data));
    }

    /**
     * 找到低谷日期
     * @param {Array} data - 数据数组
     * @returns {number} 低谷索引
     */
    findLowDay(data) {
        return data.indexOf(Math.min(...data));
    }

    /**
     * 获取风险等级颜色
     * @param {string} riskLevel - 风险等级
     * @returns {string} 颜色代码
     */
    getRiskLevelColor(riskLevel) {
        const colors = {
            [this.riskLevels.HIGH]: '#ff4d4f',
            [this.riskLevels.MEDIUM]: '#faad14',
            [this.riskLevels.LOW]: '#52c41a'
        };
        
        return colors[riskLevel] || '#8c8c8c';
    }

    /**
     * 获取风险等级标签
     * @param {string} riskLevel - 风险等级
     * @returns {string} 中文标签
     */
    getRiskLevelLabel(riskLevel) {
        const labels = {
            [this.riskLevels.HIGH]: '高风险',
            [this.riskLevels.MEDIUM]: '中风险',
            [this.riskLevels.LOW]: '低风险'
        };
        
        return labels[riskLevel] || '未知';
    }
}

// 创建全局风险引擎实例
const riskEngine = new RiskEngine();

// 导出给其他模块使用
window.RiskEngine = RiskEngine;
window.riskEngine = riskEngine; 