/**
 * 组件加载器
 * 用于动态加载HTML组件
 */
class ComponentLoader {
    constructor() {
        this.components = new Map();
        this.loadedComponents = new Set();
    }

    /**
     * 加载组件
     * @param {string} componentName - 组件名称
     * @param {string} targetId - 目标容器ID
     * @returns {Promise<void>}
     */
    async loadComponent(componentName, targetId) {
        try {
            const target = document.getElementById(targetId);
            if (!target) {
                throw new Error(`目标容器 ${targetId} 不存在`);
            }

            // 如果组件已加载，直接返回
            if (this.loadedComponents.has(componentName)) {
                return;
            }

            // 加载组件HTML
            const response = await fetch(`src/components/${componentName}.html`);
            if (!response.ok) {
                throw new Error(`无法加载组件 ${componentName}`);
            }

            const html = await response.text();
            
            // 插入HTML
            target.innerHTML = html;
            
            // 标记为已加载
            this.loadedComponents.add(componentName);
            
            console.log(`组件 ${componentName} 加载成功`);
        } catch (error) {
            console.error(`加载组件 ${componentName} 失败:`, error);
            throw error;
        }
    }

    /**
     * 批量加载组件
     * @param {Array} components - 组件配置数组
     * @returns {Promise<void>}
     */
    async loadComponents(components) {
        const promises = components.map(comp => 
            this.loadComponent(comp.name, comp.target)
        );
        
        await Promise.all(promises);
        console.log('所有组件加载完成');
    }

    /**
     * 获取组件HTML内容
     * @param {string} componentName - 组件名称
     * @returns {Promise<string>}
     */
    async getComponentContent(componentName) {
        try {
            const response = await fetch(`src/components/${componentName}.html`);
            if (!response.ok) {
                throw new Error(`无法加载组件 ${componentName}`);
            }
            return await response.text();
        } catch (error) {
            console.error(`获取组件 ${componentName} 内容失败:`, error);
            throw error;
        }
    }

    /**
     * 检查组件是否已加载
     * @param {string} componentName - 组件名称
     * @returns {boolean}
     */
    isComponentLoaded(componentName) {
        return this.loadedComponents.has(componentName);
    }

    /**
     * 重新加载组件
     * @param {string} componentName - 组件名称
     * @param {string} targetId - 目标容器ID
     * @returns {Promise<void>}
     */
    async reloadComponent(componentName, targetId) {
        this.loadedComponents.delete(componentName);
        await this.loadComponent(componentName, targetId);
    }
}

// 导出
window.ComponentLoader = ComponentLoader; 