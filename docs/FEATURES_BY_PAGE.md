# Lago 按页面组织的功能文档

> **重要**: 本文档按照前端页面结构组织所有功能说明，便于快速定位和理解各页面的功能实现。基于 PRD 文档的页面架构设计。

## 📱 页面导航

### 用户端页面
1. [首页](#1-首页-apphomepagetsx)
2. [搜索页](#2-搜索页-appsearchpagetsx)
3. [商品详情页](#3-商品详情页-appproductsidpagetsx)
4. [发布页](#4-发布页-apppublishpagetsx)
5. [聊天页](#5-聊天页-appchatidpagetsx)
6. [消息中心](#6-消息中心-appmessagespagetsx)
7. [我的页面](#7-我的页面-appprofilepagetsx)

### 商家端页面
8. [商家中心](#8-商家中心-appmerchantdashboardpagetsx)
9. [商品管理](#9-商品管理-appmerchantproductspagetsx)
10. [订单中心](#10-订单中心-appmerchantorderspagetsx)
11. [财务结算](#11-财务结算-appmerchantfinancepagetsx)

### 物业端页面
12. [物业管理](#12-物业管理-apppropertydashboardpagetsx)
13. [循环柜管理](#13-循环柜管理-apppropertycabinetspagetsx)
14. [活动直播](#14-活动直播-apppropertylivepagetsx)

### 平台管理端页面
15. [平台管理后台](#15-平台管理后台-appadminpagetsx)

### 通用页面
16. [登录注册](#16-登录注册-appauthloginpagetsx)

---

## 📄 页面详细说明

### 1. 首页 (`app/page.tsx`)

**路径**: `/`

**功能模块**:
- **小区识别**: 基于微信地理定位，自动识别当前小区
- **推荐商品**: AI推荐的小区内的精选商品（租赁/买卖）
- **热门榜单**: 小区热门商品排行
- **活动Banner**: 物业合作推广活动
- **小区频道入口**: 直播、活动预告入口
- **搜索栏**: 支持自然语言输入和AI意图识别
- **底部导航**: 首页、搜索、发布、消息、我的

**API调用**:
- `GET /api/users/profile` - 获取用户信息
- `GET /api/communities/nearby` - 获取附近小区
- `GET /api/products/recommended` - 获取推荐商品
- `GET /api/products/hot` - 获取热门商品
- `GET /api/live-events/upcoming` - 获取即将开始的活动

**组件**:
- `Header.tsx` - 页头组件（显示小区名称）
- `ProductCard.tsx` - 商品卡片
- `BannerSwiper.tsx` - 活动Banner轮播
- `BottomNavigation.tsx` - 底部导航
- `PageLayout.tsx` - 页面布局

**设计要点**:
- 突出小区定位，使用科技信赖蓝色显示小区名称
- AI推荐商品使用浅蓝色背景提示条
- 商品卡片显示价格（活力橙色）、地理位置、小区名称

---

### 2. 任务页面 (`app/tasks/page.tsx`)

**路径**: `/tasks`

**功能模块**:

#### 2.1 任务列表
- **分类筛选**: 学习、创造、运动、生活技能、社交、其他
- **状态筛选**: 待完成、进行中、已完成、已审核、已拒绝
- **排序**: 按创建时间、截止时间、优先级
- **搜索**: 按任务标题搜索
- **卡片显示**:
  - 任务标题和描述
  - 难度等级（简单、中等、困难）
  - 奖励积分
  - 截止时间
  - 完成状态
  - 操作按钮（开始、提交、查看）

#### 2.2 任务详情 (`app/tasks/[id]/page.tsx`)
- **任务信息**: 完整的任务详情
- **提交证明**: 上传图片和描述
- **进度追踪**: 任务状态流转显示
- **评论区**: 家长和孩子的互动留言

#### 2.3 推荐任务 (`app/recommended-tasks/page.tsx`)
- **8大分类**:
  - 日常习惯
  - 学习习惯
  - 健康习惯
  - 社交习惯
  - 创造习惯
  - 生活技能
  - 品格培养
  - 环保意识
- **打卡功能**: 提交描述和图片证明
- **复制任务**: 将推荐任务添加到个人任务列表

**API调用**:
- `GET /api/tasks` - 获取任务列表
- `GET /api/tasks/:id` - 获取任务详情
- `POST /api/tasks` - 创建任务（家长）
- `PUT /api/tasks/:id` - 更新任务状态
- `POST /api/tasks/:id/complete` - 提交任务
- `POST /api/tasks/:id/approve` - 审核任务（家长）
- `GET /api/recommended-tasks` - 获取推荐任务
- `POST /api/recommended-tasks/:id/checkin` - 推荐任务打卡

**组件**:
- `TaskCard.tsx` - 任务卡片
- `TaskList.tsx` - 任务列表
- `TaskForm.tsx` - 任务表单
- `TaskEditDialog.tsx` - 任务编辑弹窗
- `TaskSubmissionDialog.tsx` - 任务提交弹窗

---

### 3. 存钱宝页面 (`app/piggy-banks/page.tsx`)

**路径**: `/piggy-banks`

**功能模块**:

#### 3.1 存钱宝列表
- **卡片展示**:
  - 存钱宝名称和图标
  - 当前金额 / 目标金额
  - 进度条
  - 类型标签（通用储蓄、玩具基金、礼物基金）
- **操作按钮**: 存款、取款、查看详情、编辑、删除
- **创建按钮**: 新建存钱宝

#### 3.2 存钱宝详情 (`app/piggy-banks/[id]/page.tsx`)
- **基本信息**: 名称、类型、目标、进度
- **交易记录**: 存取款历史列表
- **统计图表**: 收支趋势图
- **里程碑**: 完成度里程碑展示

#### 3.3 存款页面 (`app/piggy-banks/[id]/deposit/page.tsx`)
- **存款表单**: 
  - 金额输入
  - 来源选择（任务奖励、家长赠送、积分兑换）
  - 备注说明
- **快捷金额**: 10、20、50、100等快捷按钮

#### 3.4 取款页面 (`app/piggy-banks/[id]/withdraw/page.tsx`)
- **取款表单**:
  - 金额输入
  - 用途选择
  - 备注说明
- **余额显示**: 当前可用余额

#### 3.5 交易记录 (`app/piggy-banks/[id]/transactions/page.tsx`)
- **交易列表**: 时间、类型、金额、余额
- **筛选**: 按类型、时间范围筛选
- **导出**: 导出Excel报表

**API调用**:
- `GET /api/piggy-banks` - 获取存钱宝列表
- `GET /api/piggy-banks/:id` - 获取存钱宝详情
- `POST /api/piggy-banks` - 创建存钱宝
- `PUT /api/piggy-banks/:id` - 更新存钱宝
- `DELETE /api/piggy-banks/:id` - 删除存钱宝
- `POST /api/piggy-banks/:id/deposit` - 存款
- `POST /api/piggy-banks/:id/withdraw` - 取款
- `GET /api/transactions` - 获取交易记录

**组件**:
- `BankLayout.tsx` - 存钱宝布局
- `MobileForm.tsx` - 移动端表单
- `MobileInput.tsx` - 移动端输入框
- `MobileSelect.tsx` - 移动端选择器

---

### 4. 日程管理 (`app/schedules/page.tsx`)

**路径**: `/schedules`

**功能模块**:

#### 4.1 日程列表
- **日历视图**: 周视图显示课程表
- **颜色标识**: 不同课程不同颜色
- **节假日**: 显示节假日横幅
- **快速创建**: 点击时间段快速创建日程

#### 4.2 日程详情 (`app/schedules/[id]/page.tsx`)
- **日程信息**: 标题、时间、类型、描述
- **完成打卡**: 标记完成并获得积分
- **编辑删除**: 修改或删除日程

#### 4.3 日程表单
- **基本信息**: 标题、描述
- **时间设置**: 开始时间、结束时间、星期
- **重复设置**: 是否每周重复
- **奖励设置**: 完成奖励积分
- **颜色选择**: 选择日程颜色
- **类型选择**: 课程类型（从字典表）

**API调用**:
- `GET /api/schedules` - 获取日程列表
- `GET /api/schedules/:id` - 获取日程详情
- `POST /api/schedules` - 创建日程
- `PUT /api/schedules/:id` - 更新日程
- `DELETE /api/schedules/:id` - 删除日程
- `POST /api/schedules/:id/complete` - 完成日程
- `GET /api/holidays` - 获取节假日列表

**组件**:
- `ScheduleCalendar.tsx` - 日程日历
- `ScheduleCard.tsx` - 日程卡片
- `ScheduleForm.tsx` - 日程表单
- `CourseScheduleForm.tsx` - 课程日程表单
- `ScheduleDetailModal.tsx` - 日程详情模态框
- `HolidayBanner.tsx` - 节假日横幅
- `HolidayView.tsx` - 节假日视图
- `DatePicker.tsx` - 日期选择器

---

### 5. 积分商城 (`app/points/page.tsx`)

**路径**: `/points`

**功能模块**:

#### 5.1 积分总览
- **总积分**: 当前可用积分
- **历史统计**: 获得积分、消费积分
- **积分排行**: 家庭内排行
- **快捷入口**: 成就、商城、记录

#### 5.2 成就系统 (`app/points/achievements/page.tsx`)
- **成就列表**:
  - 成就图标和名称
  - 完成进度
  - 奖励积分
  - 完成状态
- **成就分类**:
  - 任务完成
  - 积分获得
  - 连续天数
  - 日程创建
  - 分类精通
- **领取奖励**: 完成成就后领取积分

#### 5.3 积分商城 (`app/points/shop/page.tsx`)
- **商品列表**: 可兑换的商品
- **商品分类**: 玩具、书籍、游戏等
- **兑换记录**: 兑换历史
- **购买流程**:
  1. 选择商品
  2. 确认积分消费
  3. 提交申请（家长审核）
  4. 审核通过后积分扣除

**API调用**:
- `GET /api/points/history` - 获取积分历史
- `GET /api/points/statistics` - 获取积分统计
- `POST /api/points/adjust` - 调整积分（家长）
- `GET /api/achievements` - 获取成就列表
- `GET /api/achievements/user` - 获取用户成就
- `POST /api/achievements/:id/claim` - 领取成就奖励

**组件**:
- `PointAdjustDialog.tsx` - 积分调整弹窗
- `EmptyState.tsx` - 空状态组件

---

### 6. 作品集 (`app/portfolio/page.tsx`)

**路径**: `/portfolio`

**功能模块**:

#### 6.1 作品集列表
- **卡片展示**: 封面图、标题、作品数量
- **创建按钮**: 新建作品集
- **公开标识**: 公开/私密标记

#### 6.2 作品集详情 (`app/portfolio/[id]/page.tsx`)
- **布局切换**: 
  - 瀑布流布局
  - 网格布局
  - 时间轴布局
  - 自由布局
- **作品展示**: 图片和视频作品
- **添加作品**: 上传新作品
- **AI创作**: AI图生图功能
- **批量上传**: 一次上传多个作品
- **拖拽排序**: 自由调整作品位置
- **作品编辑**: 修改标题、描述
- **作品删除**: 删除作品

#### 6.3 AI创作 (`app/portfolio/[id]/ai-create`)
- **提示词输入**: 描述想要生成的图片
- **风格选择**: 
  - 水彩画
  - 油画
  - 卡通
  - 写实
  - 赛博朋克
  - 极简
  - 国风
  - 梦幻
- **图生图**: 基于已有图片生成新图片
- **生成历史**: 查看历史生成记录

**API调用**:
- `GET /api/portfolio` - 获取作品集列表
- `GET /api/portfolio/:id` - 获取作品集详情
- `POST /api/portfolio` - 创建作品集
- `PUT /api/portfolio/:id` - 更新作品集
- `DELETE /api/portfolio/:id` - 删除作品集
- `POST /api/portfolio/:id/works` - 添加作品
- `PUT /api/portfolio/:id/works/:workId` - 更新作品
- `DELETE /api/portfolio/:id/works/:workId` - 删除作品
- `POST /api/portfolio/ai-generate` - AI生成图片

**组件**:
- `PhotoWall.tsx` - 照片墙（作品集展示）
- `DraggableItem.tsx` - 可拖拽作品项
- `LayoutSelector.tsx` - 布局选择器
- `layouts/*.tsx` - 各种布局组件
- `ImageAICreationDialog.tsx` - AI创作弹窗

---

### 7. 家庭聊天 (`app/chat-rooms/page.tsx`)

**路径**: `/chat-rooms`

**功能模块**:

#### 7.1 聊天室列表
- **房间卡片**: 名称、最后消息、未读数
- **创建房间**: 新建聊天室（家长）

#### 7.2 聊天界面 (`app/chat-rooms/[id]/page.tsx`)
- **消息列表**: 
  - 文字消息
  - 图片消息
  - 视频消息
  - 文件消息
  - 表情包
  - 任务卡片
- **消息输入**: 
  - 文字输入
  - 语音输入
  - 图片上传
  - 视频上传
  - 文件上传
  - 表情选择
  - 任务分享
- **直播功能**:
  - 发起直播
  - 观看直播
  - 录播上传
- **成员管理**: 
  - 查看成员列表
  - 添加成员（家长）
  - 移除成员（家长）

**WebSocket事件**:
- `message` - 新消息
- `typing` - 正在输入
- `read` - 已读回执
- `member_join` - 成员加入
- `member_leave` - 成员离开
- `livestream_start` - 直播开始
- `livestream_end` - 直播结束

**API调用**:
- `GET /api/chat/rooms` - 获取聊天室列表
- `GET /api/chat/rooms/:id` - 获取聊天室详情
- `POST /api/chat/rooms` - 创建聊天室
- `GET /api/chat/rooms/:id/messages` - 获取消息历史
- `POST /api/chat/rooms/:id/messages` - 发送消息
- `POST /api/chat/rooms/:id/members` - 添加成员
- `DELETE /api/chat/rooms/:id/members/:userId` - 移除成员
- `POST /api/livestream/start` - 开始直播
- `POST /api/livestream/end` - 结束直播
- `POST /api/upload` - 上传文件

**组件**:
- `WeChatStyleInput.tsx` - 微信风格输入框
- `EnhancedChatMessage.tsx` - 增强消息组件
- `MediaUpload.tsx` - 媒体上传
- `MediaPreview.tsx` - 媒体预览
- `ObjectUploader.tsx` - 对象上传
- `TaskSubmissionPanel.tsx` - 任务提交面板
- `WebRTCStreaming.tsx` - WebRTC直播
- `LiveStreamViewer.tsx` - 直播查看器
- `RecordedStreamUpload.tsx` - 录播上传
- `ChatRoomMemberManagement.tsx` - 成员管理
- `VoiceButton.tsx` - 语音按钮
- `VoiceInput.tsx` - 语音输入

---

### 8. 个人中心 (`app/profile/page.tsx`)

**路径**: `/profile`

**功能模块**:

- **用户信息**: 
  - 头像、昵称
  - 角色标识（家长/儿童）
  - 家庭信息
  - 选择的宠物
- **个人统计**:
  - 总积分
  - 完成任务数
  - 成就数量
  - 徽章数量
- **设置选项**:
  - 修改资料
  - 更换头像
  - 选择宠物
  - 宠物定制
  - 语音设置
  - 主题切换
  - 语言设置
  - 退出登录

**API调用**:
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息
- `POST /api/users/avatar` - 上传头像
- `GET /api/pets` - 获取宠物列表
- `PUT /api/users/pet` - 选择宠物
- `POST /api/pet-customization` - 宠物定制

**组件**:
- `UserProfile.tsx` - 用户资料
- `UserAvatar.tsx` - 用户头像
- `PetChatDialog.tsx` - 宠物对话弹窗
- `AudioSettingsPanel.tsx` - 音频设置面板

---

### 9. 家长仪表盘 (`app/parent/dashboard/page.tsx`)

**路径**: `/parent/dashboard`

**角色**: 仅家长可访问

**功能模块**:

- **概览统计**:
  - 孩子总数
  - 待审核任务
  - 今日完成任务
  - 本周积分变化
- **快捷操作**:
  - 创建任务
  - 审核任务
  - 调整积分
  - 查看数据
- **最近动态**:
  - 孩子最近活动
  - 任务完成情况
  - 积分变化记录

**API调用**:
- `GET /api/parent/dashboard` - 获取仪表盘数据
- `GET /api/parent/children` - 获取孩子列表
- `GET /api/parent/tasks/pending` - 获取待审核任务

**组件**:
- `ParentBottomNavigation.tsx` - 家长底部导航

---

### 10. 数据分析 (`app/parent/analytics/page.tsx`)

**路径**: `/parent/analytics`

**角色**: 仅家长可访问

**功能模块**:

- **积分分析**:
  - 积分趋势图
  - 积分来源分布
  - 积分消费分布
- **任务分析**:
  - 任务完成率
  - 任务分类统计
  - 任务难度分布
- **行为分析**:
  - 登录活跃度
  - 功能使用频率
  - 学习时长统计
- **成长报告**:
  - 周报
  - 月报
  - 导出PDF

**API调用**:
- `GET /api/analytics/points` - 积分分析
- `GET /api/analytics/tasks` - 任务分析
- `GET /api/analytics/behavior` - 行为分析
- `GET /api/analytics/report` - 生成报告

**组件**:
- `AnalyticsContent.tsx` - 分析内容组件

---

### 11. 家庭管理 (`app/parent/family-management/page.tsx`)

**路径**: `/parent/family-management`

**角色**: 仅家长可访问

**功能模块**:

- **家庭信息**: 家庭名称、描述
- **成员列表**: 所有家庭成员
- **成员管理**:
  - 添加成员（通过邀请码）
  - 修改成员角色
  - 移除成员
- **关系管理**:
  - 设置监护关系
  - 主要监护人标识
  - 关系类型（父母、祖父母、监护人等）

**API调用**:
- `GET /api/family` - 获取家庭信息
- `PUT /api/family` - 更新家庭信息
- `GET /api/family/members` - 获取成员列表
- `POST /api/family/members` - 添加成员
- `DELETE /api/family/members/:id` - 移除成员
- `GET /api/family/relations` - 获取关系列表
- `POST /api/family/relations` - 创建关系
- `PUT /api/family/relations/:id` - 更新关系

**组件**:
- `MemberForm.tsx` - 成员表单

---

### 12. 孩子管理 (`app/parent/children/page.tsx`)

**路径**: `/parent/children`

**角色**: 仅家长可访问

**功能模块**:

- **孩子列表**: 所有关联的孩子
- **孩子详情**:
  - 基本信息
  - 积分情况
  - 任务统计
  - 成就进度
- **快捷操作**:
  - 创建任务
  - 调整积分
  - 查看报告

**API调用**:
- `GET /api/parent/children` - 获取孩子列表
- `GET /api/parent/children/:id` - 获取孩子详情
- `GET /api/parent/children/:id/stats` - 获取孩子统计

---

### 13. 登录注册 (`app/auth/login/page.tsx`)

**路径**: `/auth/login`, `/auth/register`, `/login`

**功能模块**:

#### 13.1 登录
- **登录方式**:
  - 微信登录
  - 手机号+密码
  - 邮箱+密码
- **记住登录**: 保持登录状态
- **忘记密码**: 重置密码入口

#### 13.2 注册
- **注册方式**:
  - 微信快速注册
  - 手机号注册
  - 邮箱注册
- **角色选择**: 家长或儿童
- **家庭创建**: 新建家庭或加入现有家庭

#### 13.3 密码重置 (`app/auth/reset/page.tsx`)
- **验证身份**: 手机号或邮箱验证
- **重置密码**: 设置新密码

**API调用**:
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `POST /api/auth/wechat-login` - 微信登录
- `POST /api/auth/reset-password` - 重置密码
- `POST /api/auth/logout` - 登出

**组件**:
- `LoginContent.tsx` - 登录内容
- `LoginMethod.tsx` - 登录方式组件

---

### 14. 帮助中心 (`app/help/page.tsx`)

**路径**: `/help`

**功能模块**:

#### 14.1 帮助文档列表
- **分类展示**: 按类别和子类别组织
- **角色筛选**: 家长/儿童角色相关文档
- **搜索功能**: 按关键词搜索
- **常见问题**: 热门问题置顶

#### 14.2 文档详情 (`app/help/[id]/page.tsx`)
- **文档内容**: Markdown渲染
- **相关文档**: 推荐相关内容
- **AI助手**: 点击呼出宠物AI协助

**API调用**:
- `GET /api/help-documents` - 获取文档列表
- `GET /api/help-documents/:id` - 获取文档详情
- `GET /api/help-documents/search` - 搜索文档
- `POST /api/chat/pet` - AI宠物对话

---

## 🎨 通用组件

### 布局组件
- `PageLayout.tsx` - 页面布局（含Header和底部导航）
- `Header.tsx` - 页头（头像、通知）
- `BottomNavigation.tsx` - 底部导航
- `FunctionSwiper.tsx` - 功能滑动组件
- `NavigationLink.tsx` - 导航链接

### 表单组件
- `FormInput.tsx` - 表单输入框
- `FormTextarea.tsx` - 表单文本域
- `FormSelect.tsx` - 表单选择器
- `FormCheckbox.tsx` - 表单复选框
- `FormRadio.tsx` - 表单单选框
- `MobileForm.tsx` - 移动端表单
- `MobileInput.tsx` - 移动端输入框
- `MobileSelect.tsx` - 移动端选择器
- `MobileTextarea.tsx` - 移动端文本域

### UI组件
- `Loading.tsx` - 加载动画
- `EmptyState.tsx` - 空状态
- `ConfirmDialog.tsx` - 确认对话框
- `DatePicker.tsx` - 日期选择器
- `DateRangePicker.tsx` - 日期范围选择器
- `FireworksEffect.tsx` - 烟花效果

### 路由保护
- `ProtectedRoute.tsx` - 路由保护组件（检查登录和权限）

---

## 🔄 状态管理

### Context Providers
- `AuthProvider.tsx` - 认证状态
- `LoadingProvider.tsx` - 全局加载状态
- `WebSocketProvider.tsx` - WebSocket连接
- `ApiProvider.tsx` - API请求配置
- `AudioSettingsProvider.tsx` - 音频设置
- `PhotoWallProvider/` - 作品集状态

### Custom Hooks
- `useWebSocket.ts` - WebSocket连接Hook
- `useAuthRequest.ts` - 认证请求Hook
- `useAudioPlayer.ts` - 音频播放Hook

---

## 📱 移动端适配

### 响应式设计
- **小屏幕优先**: max-width: 420px (md), 480px (lg+)
- **触控优化**: 最小44px点击区域
- **底部安全区**: 适配iPhone底部
- **横屏支持**: 部分页面支持横屏

### 手势支持
- **滑动**: 功能Swiper、照片墙
- **拖拽**: 作品排序、布局调整
- **长按**: 任务卡片、消息气泡
- **双击**: 图片放大

---

## 🎯 性能优化

### 已实施
- **代码分割**: Next.js自动分割
- **图片优化**: Next.js Image组件
- **懒加载**: 路由和组件懒加载
- **缓存策略**: React Query数据缓存
- **骨架屏**: 首次加载显示骨架屏
- **全局loading**: 路由切换全局loading

### 计划中
- **虚拟滚动**: 长列表优化
- **预加载**: 关键路由预加载
- **离线支持**: Service Worker
- **CDN**: 静态资源CDN

---

## 🔐 权限控制

### 角色权限矩阵

| 功能 | 儿童 | 家长 |
|------|------|------|
| 查看任务 | ✅ | ✅ |
| 创建任务 | ❌ | ✅ |
| 完成任务 | ✅ | ❌ |
| 审核任务 | ❌ | ✅ |
| 查看存钱宝 | ✅ | ✅ |
| 创建存钱宝 | ✅ | ✅ |
| 取款 | ⚠️ | ✅ |
| 查看积分 | ✅ | ✅ |
| 调整积分 | ❌ | ✅ |
| 查看数据分析 | ❌ | ✅ |
| 家庭管理 | ❌ | ✅ |
| 聊天 | ✅ | ✅ |
| 作品集 | ✅ | ✅ |

注: ⚠️ 表示需要家长审核

---

**最后更新**: 2025-10-10

