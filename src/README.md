# IPE系统组件化架构

## 目录结构

```
src/
├── components/          # HTML组件
│   ├── Header.html     # 头部组件
│   ├── Dashboard.html  # 仪表板组件
│   ├── DataManagement.html # 数据管理组件
│   └── Modal.html      # 模态框组件
├── pages/              # 页面组件（预留）
├── utils/              # 工具类
│   └── ComponentLoader.js # 组件加载器
└── README.md           # 说明文档
```

## 组件说明

### Header.html
- 系统标题和版本信息
- 包含系统状态指示器

### Dashboard.html
- 风险驾驶舱界面
- KPI指标卡片
- 图表展示区域

### DataManagement.html
- 数据管理界面
- 标签页导航
- 表格展示

### Modal.html
- 通用模态框组件
- 表单输入界面
- 通知容器

## 工具类

### ComponentLoader.js
组件加载器，提供以下功能：
- 动态加载HTML组件
- 组件缓存管理
- 批量组件加载
- 组件重新加载

## 使用方法

### 1. 加载单个组件
```javascript
const loader = new ComponentLoader();
await loader.loadComponent('Header', 'headerContainer');
```

### 2. 批量加载组件
```javascript
const components = [
    { name: 'Header', target: 'headerContainer' },
    { name: 'Dashboard', target: 'dashboardContainer' }
];
await loader.loadComponents(components);
```

### 3. 检查组件状态
```javascript
if (loader.isComponentLoaded('Header')) {
    console.log('Header组件已加载');
}
```

## 优势

1. **模块化**: 每个组件独立，便于维护
2. **可复用**: 组件可以在不同页面中复用
3. **动态加载**: 按需加载，提高性能
4. **易于扩展**: 新增组件只需添加HTML文件
5. **解耦合**: 组件与主逻辑分离

## 注意事项

1. 组件文件必须放在 `src/components/` 目录下
2. 组件文件名必须与组件名一致
3. 目标容器ID必须在页面中存在
4. 组件加载是异步的，需要使用 await 等待
5. 组件内容会替换目标容器的innerHTML 