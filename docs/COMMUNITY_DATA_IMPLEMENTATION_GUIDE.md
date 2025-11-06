# 小区数据采集实施指南

## 🚀 快速开始

### 1. 注册高德开放平台

1. 访问：https://console.amap.com/
2. 注册/登录账号
3. 进入"应用管理" → "创建新应用"
4. 选择"Web服务"类型
5. 获取 API Key

### 2. 配置环境变量

在 `apps/lago-server/.env` 文件中添加：

```env
AMAP_API_KEY=your_amap_api_key_here
```

### 3. 运行采集脚本

```bash
# 采集单个城市
cd apps/lago-server
npm run fetch-communities -- --city=北京 --limit=500

# 采集所有主要城市
npm run fetch-communities -- --all-cities --limit=1000
```

### 4. 查看结果

```bash
# 使用 Prisma Studio 查看数据
npm run db:studio
```

---

## 📊 API 调用说明

### 高德地图 POI 搜索 API

**接口地址：**
```
GET https://restapi.amap.com/v3/place/text
```

**请求参数：**
- `key`: API Key（必填）
- `keywords`: 搜索关键词，如"小区"（必填）
- `city`: 城市名称，如"北京"（必填）
- `types`: POI类型代码，`120000` 表示住宅区（可选）
- `offset`: 每页记录数，最大25（可选）
- `page`: 页码，从1开始（可选）

**返回数据示例：**
```json
{
  "status": "1",
  "count": "100",
  "info": "OK",
  "infocode": "10000",
  "pois": [
    {
      "id": "B0FFG12345",
      "name": "某某小区",
      "type": "住宅区;住宅小区",
      "typecode": "120000",
      "address": "北京市朝阳区某某街道",
      "location": "116.397128,39.916527",
      "adname": "朝阳区",
      "cityname": "北京市",
      "adcode": "110105"
    }
  ]
}
```

---

## 💰 成本估算

### 免费额度
- **个人开发者**：每天 30,000 次调用
- **企业开发者**：每天 100,000 次调用

### 费用计算
假设每个城市平均有 5,000 个小区，需要调用 200 次 API（25条/页 × 200页）

- **单个城市**：约 200 次调用
- **32个主要城市**：约 6,400 次调用
- **完全在免费额度内** ✅

### 超出免费额度后
- 按量计费：约 0.01-0.02 元/次
- 建议：合理使用缓存，避免重复调用

---

## 🔄 数据更新策略

### 全量更新（每季度）
```bash
# 更新所有城市数据
npm run fetch-communities -- --all-cities --limit=2000
```

### 增量更新（新城市）
```bash
# 添加新城市
npm run fetch-communities -- --city=新城市名 --limit=1000
```

### 数据验证
- 定期检查数据完整性
- 处理重复数据
- 验证地理位置准确性

---

## 🛠️ 故障处理

### API 调用失败
- 检查 API Key 是否正确
- 确认网络连接正常
- 查看是否超出调用限制
- 检查账户余额（企业版）

### 数据质量问题
- 名称重复：使用相似度算法去重
- 位置错误：人工审核或用户反馈修正
- 缺失字段：补充或标记为待完善

---

## 📝 注意事项

1. **API Key 安全**
   - 不要将 API Key 提交到代码仓库
   - 使用环境变量管理
   - 定期轮换密钥

2. **调用频率控制**
   - 遵守 API 调用限制（QPS < 10）
   - 实现请求队列和限流
   - 避免短时间内大量调用

3. **数据合规**
   - 仅存储公开的小区信息
   - 不存储涉及个人隐私的数据
   - 遵守高德地图服务条款

4. **数据备份**
   - 定期备份数据库
   - 保留原始 API 响应（可选）
   - 记录数据变更历史

---

## 🔗 相关资源

- [高德开放平台](https://lbs.amap.com/)
- [POI 搜索 API 文档](https://lbs.amap.com/api/webservice/guide/api/search)
- [API 配额说明](https://lbs.amap.com/api/webservice/guide/tools/info)
- [错误码说明](https://lbs.amap.com/api/webservice/guide/tools/info)

