# Lago 数据库设计文档

> **重要**: 本文档描述完整的数据库表结构和关系。所有数据库变更必须通过Prisma Schema实现。

## 📊 数据库概览

- **数据库类型**: PostgreSQL
- **ORM**: Prisma
- **Schema位置**: `apps/lago-server/prisma/schema.prisma`
- **总表数**: 25+
- **业务领域**: 社区二手租售平台（玩具、游戏机等）

---

## 🏗️ 核心表结构

### 1. 用户体系

#### User (用户表)
```prisma
model User {
  id              String    @id @default(cuid())
  wechatOpenid    String?   @unique
  wechatUnionid   String?
  nickname        String?
  avatarUrl       String?
  phone           String?   @unique
  email           String?   @unique
  password        String?   // 密码哈希
  role            UserRole  // user | merchant | property | admin
  creditScore     Int       @default(100) // 信用积分
  isVerified      Boolean   @default(false) // 是否实名认证
  communityIds    String[]  // 加入的小区ID数组
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

**关键字段说明**:
- `wechatOpenid`: 微信登录标识，可选（支持其他登录方式）
- `role`: 用户角色，user（住户/个人卖家）、merchant（商家）、property（物业）、admin（平台管理员）
- `creditScore`: 信用积分，用于建立信任体系
- `communityIds`: 用户可加入多个小区

### 2. 社区体系

#### Community (小区表)
```prisma
model Community {
  id          String    @id @default(cuid())
  name        String    // 小区名称
  location    String    // 地理位置
  address     String?   // 详细地址
  partnerId   String?   // 合作物业ID
  geoHash     String?   // 地理位置哈希，用于距离计算
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**设计要点**:
- `geoHash`: 用于基于地理位置的商品推荐和距离计算
- `partnerId`: 关联物业公司，形成合作节点

---

### 3. 商品系统

#### Product (商品表)
```prisma
model Product {
  id              String        @id @default(cuid())
  ownerId         String        // 卖家ID
  communityId     String?       // 所属小区ID
  title           String        // 商品标题
  description     String?       // 商品描述
  category        ProductCategory // toys | gaming
  type            TransactionType // rent | sell | both
  price           Decimal       @db.Decimal(10,2) // 售价/租金
  deposit         Decimal?      @db.Decimal(10,2) // 押金（租赁）
  images          String[]      // 商品图片数组
  status          ProductStatus // pending | active | sold | rented | offline
  location        String?       // 地理位置
  geoHash         String?       // 地理位置哈希
  isVerified      Boolean       @default(false) // 是否认证商品
  viewCount       Int           @default(0) // 浏览次数
  likeCount       Int           @default(0) // 收藏次数
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

**商品状态流转**:
```
pending -> active -> sold/rented
                -> offline
```

**商品分类**:
- `toys` - 玩具
- `gaming` - 游戏机

**交易类型**:
- `rent` - 仅租赁
- `sell` - 仅出售
- `both` - 租售皆可

---

### 4. 订单系统

#### Order (订单表)
```prisma
model Order {
  id              String        @id @default(cuid())
  productId       String        // 商品ID
  buyerId         String        // 买家ID
  sellerId        String        // 卖家ID
  type            OrderType     // rent | sell
  amount          Decimal       @db.Decimal(10,2) // 订单金额
  deposit         Decimal?      @db.Decimal(10,2) // 押金（租赁）
  status          OrderStatus   // pending | paid | confirmed | completed | cancelled | refunded
  startDate       DateTime?     // 租赁开始日期
  endDate         DateTime?     // 租赁结束日期
  deliveryType    DeliveryType  // self_pickup | delivery | cabinet // 自提/配送/循环柜
  deliveryAddress String?       // 配送地址
  remark          String?       // 备注
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}
```

**订单状态流转**:
```
pending -> paid -> confirmed -> completed
                -> cancelled
                -> refunded
```

**配送类型**:
- `self_pickup` - 自提/面交
- `delivery` - 配送
- `cabinet` - 循环柜存取

#### Deposit (押金表)
```prisma
model Deposit {
  id            String        @id @default(cuid())
  orderId       String        // 订单ID
  amount        Decimal       @db.Decimal(10,2) // 押金金额
  refundStatus  RefundStatus  // pending | refunded | forfeited
  refundedAt    DateTime?     // 退款时间
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}
```

---

### 5. 聊天系统

#### ChatRoom (聊天室表)
```prisma
model ChatRoom {
  id          String   @id @default(cuid())
  productId   String?  // 关联商品ID（商品聊天）
  type        String   @default("private") // private | group
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### ChatMessage (聊天消息表)
```prisma
model ChatMessage {
  id         String      @id @default(cuid())
  chatRoomId String
  senderId   String
  receiverId String?
  type       MessageType // text | image | product_card | system
  content    String
  fileUrl    String?
  productId  String?     // 关联商品ID（商品卡片）
  isRead     Boolean     @default(false)
  createdAt  DateTime    @default(now())
}
```

---

### 6. 直播活动系统

#### LiveEvent (直播活动表)
```prisma
model LiveEvent {
  id          String        @id @default(cuid())
  communityId String        // 小区ID
  hostId      String        // 主持人ID
  title       String        // 活动标题
  description String?       // 活动描述
  startTime   DateTime      // 开始时间
  endTime     DateTime?     // 结束时间
  streamUrl   String?       // 直播流地址
  status      LiveStatus     // preparing | live | ended
  viewCount   Int           @default(0) // 观看人数
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}
```

---

### 7. 财务结算系统

#### Settlement (结算表)
```prisma
model Settlement {
  id          String           @id @default(cuid())
  userId      String           // 用户ID（卖家）
  orderId     String?          // 关联订单ID
  type        SettlementType   // commission | refund | withdrawal
  amount      Decimal          @db.Decimal(10,2) // 结算金额
  status      SettlementStatus // pending | completed | failed
  completedAt DateTime?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
}
```

---

### 8. 其他表

#### ProductCategory (商品分类表)
```prisma
model ProductCategory {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  icon        String?
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### Notification (通知表)
```prisma
model Notification {
  id          String               @id @default(cuid())
  userId      String
  type        NotificationType     // order | message | system
  title       String
  content     String
  relatedId   String?              // 相关实体ID
  relatedType String?              // 相关实体类型
  isRead      Boolean              @default(false)
  createdAt   DateTime             @default(now())
  readAt      DateTime?
}
```

---

## 🔄 数据库迁移流程

### 1. 修改Schema

编辑 `apps/lago-server/prisma/schema.prisma`:
```prisma
model Product {
  // 添加新字段
  priority Int @default(0)
}
```

### 2. 推送到数据库

```bash
cd apps/lago-server

# 开发环境
npx prisma db push

# 生产环境
npx prisma migrate dev --name add_product_priority
```

### 3. 更新种子数据

在 `src/scripts/seed.ts` 中处理存量数据:
```typescript
// 为现有商品设置默认优先级
const products = await prisma.product.findMany({
  where: { priority: null }
});

for (const product of products) {
  await prisma.product.update({
    where: { id: product.id },
    data: { priority: 0 }
  });
}
```

---

## 📊 关系图

### 核心关系

```
User
├── Community (多对多，通过communityIds)
├── Product (一对多，作为卖家)
├── Order (一对多，作为买家或卖家)
├── ChatRoom (多对多，通过ChatRoomMember)
├── Settlement (一对多)
└── Notification (一对多)

Product
├── User (owner) - 卖家
├── Community - 所属小区
├── Order (一对多) - 关联订单
└── ChatRoom (一对一) - 商品聊天

Order
├── Product - 商品
├── User (buyer) - 买家
├── User (seller) - 卖家
├── Deposit (一对一) - 押金
└── Settlement (一对多) - 结算记录

Community
├── User (多对多，通过communityIds)
├── Product (一对多)
└── LiveEvent (一对多)
```

---

## 🎯 索引策略

### 频繁查询字段

```prisma
@@index([userId])        // 用户相关数据
@@index([communityId])   // 小区相关数据
@@index([createdAt])     // 时间排序
@@index([status])        // 状态筛选
@@index([category])      // 分类筛选
@@index([geoHash])       // 地理位置查询
@@index([productId])     // 商品相关查询
```

### 唯一索引

```prisma
@@unique([userId, communityId])  // 用户小区关系
@@unique([chatRoomId, senderId]) // 聊天室成员
```

### 复合索引

```prisma
@@index([communityId, status, createdAt])  // 小区商品列表
@@index([geoHash, category, status])      // 地理位置+分类查询
@@index([buyerId, status, createdAt])     // 买家订单列表
```

---

## 🔐 数据安全

### 敏感字段

- `User.password` - 必须使用bcrypt加密
- `User.phone` - 个人隐私信息
- `User.email` - 个人隐私信息
- `User.wechatOpenid` - 微信标识
- `Order.deliveryAddress` - 地址隐私

### 删除策略

```prisma
// 级联删除
onDelete: Cascade    // 删除用户时删除相关数据

// 置空
onDelete: SetNull    // 删除商品时订单不删除，只置空productId
```

---

## 📈 性能优化

### 查询优化

1. **分页查询**: 使用 `skip` 和 `take`
2. **选择字段**: 使用 `select` 只查询需要的字段
3. **关联查询**: 使用 `include` 一次性加载关联数据
4. **聚合查询**: 使用 `groupBy` 和 `aggregate`
5. **地理位置查询**: 使用 `geoHash` 进行快速距离计算

### 缓存策略

1. **热点数据**: 使用Redis缓存
2. **商品列表**: 缓存小区商品列表
3. **用户信息**: 缓存用户基本信息
4. **TTL设置**: 根据数据特点设置合理的过期时间

---

## 🛠️ 常用查询示例

### 获取小区商品列表

```typescript
const products = await prisma.product.findMany({
  where: {
    communityId: communityId,
    status: 'active'
  },
  orderBy: {
    createdAt: 'desc'
  },
  skip: (page - 1) * pageSize,
  take: pageSize,
  include: {
    owner: {
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        creditScore: true
      }
    }
  }
});
```

### 获取用户订单列表（含分页）

```typescript
const orders = await prisma.order.findMany({
  where: {
    buyerId: userId,
    status: 'completed'
  },
  orderBy: {
    createdAt: 'desc'
  },
  skip: (page - 1) * pageSize,
  take: pageSize,
  include: {
    product: true,
    seller: {
      select: {
        id: true,
        nickname: true,
        avatarUrl: true
      }
    }
  }
});
```

### 基于地理位置查询商品

```typescript
const products = await prisma.product.findMany({
  where: {
    geoHash: {
      startsWith: userGeoHash.substring(0, 7) // 使用GeoHash前缀匹配
    },
    status: 'active',
    category: 'toys'
  },
  orderBy: {
    createdAt: 'desc'
  }
});
```

---

**最后更新**: 2025-01-10
**最后更新**: 2025-01-10
