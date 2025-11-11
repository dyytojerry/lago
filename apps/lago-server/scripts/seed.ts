import prisma from '../src/lib/prisma';
import { hashPassword } from '../src/lib/auth';
import {
  Prisma,
  UserRole,
  CommunityMemberRole,
  ProductStatus,
  ProductCategoryEnum,
  TransactionType,
  CommunityActivityStatus,
  CommunityActivityType,
} from '@prisma/client';

async function main() {
  console.log('开始初始化种子数据...');

  // 创建运营系统默认管理员账号
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.operationStaff.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@lago.com',
      password: adminPassword,
      roles: {
        create: {
          role: {
            connect: {
              name: 'super_admin',
              description: '超级管理员',
              isSystem: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
      },
      realName: '系统管理员',
      isActive: true,
    },
  });

  console.log('✅ 创建运营系统管理员:', admin.username);
  // 创建测试运营人员账号
  const testStaffPassword = await hashPassword('staff123');
  
  const auditStaff = await prisma.operationStaff.upsert({
    where: { username: 'audit' },
    update: {},
    create: {
      username: 'audit',
      email: 'audit@lago.com',
      password: testStaffPassword,
      roles: {
        create: {
          role: {
            connect: {
              name: 'audit_staff',
              description: '审核专员',
              isSystem: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
      },
      realName: '审核专员',
      isActive: true,
    },
  });

  console.log('✅ 创建审核专员:', auditStaff.username);

  const serviceStaff = await prisma.operationStaff.upsert({
    where: { username: 'service' },
    update: {},
    create: {
      username: 'service',
      email: 'service@lago.com',
      password: testStaffPassword,
      roles: {
        create: {
          role: {
            connect: {
              name: 'service_staff',
              description: '客服专员',
              isSystem: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
      },
      realName: '客服专员',
      isActive: true,
    },
  });

  console.log('✅ 创建客服专员:', serviceStaff.username);

  const communitySeeds = [
    {
      slug: 'luojiazhuang-dongyuan',
      name: '骆家庄东苑',
      address: '杭州市西湖区骆家庄东苑',
      location: '30.274440,120.091150',
      images: [
        'https://images.unsplash.com/photo-1507089947368-19c1da9775ae',
        'https://images.unsplash.com/photo-1460317442991-0ec209397118',
      ],
      description: '西溪湿地旁的宜居社区，绿化充足，生活便利。',
    },
    {
      slug: 'yaojiang-wendingyuan',
      name: '耀江文鼎苑',
      address: '杭州市西湖区文三路耀江文鼎苑',
      location: '30.280600,120.125200',
      images: [
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
        'https://images.unsplash.com/photo-1449844908441-8829872d2607',
      ],
      description: '毗邻黄龙商圈，高端住宅社区，配套完善。',
    },
    {
      slug: 'lvcheng-xixi-chengyuan',
      name: '绿城·西溪诚园',
      address: '杭州市西湖区天目山路398号',
      location: '30.252100,120.062700',
      images: [
        'https://images.unsplash.com/photo-1505843513577-22bb7d21e455',
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
      ],
      description: '绿城高端社区，邻近西溪湿地，环境优雅宁静。',
    },
    {
      slug: 'xixi-jiangnanli',
      name: '西溪江南里',
      address: '杭州市西湖区蒋村街道西溪路88号',
      location: '30.261800,120.091900',
      images: [
        'https://images.unsplash.com/photo-1554995207-c18c203602cb',
        'https://images.unsplash.com/photo-1556040220-4096d522378c',
      ],
      description: '滨水风情商业街区，适合地摊和线下活动。',
    },
    {
      slug: 'wenxin-yipinfang',
      name: '文新·艺品坊',
      address: '杭州市西湖区文一西路333号',
      location: '30.295200,120.102400',
      images: [
        'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e',
        'https://images.unsplash.com/photo-1444419988131-046ed4e5ffd6',
      ],
      description: '文创主题社区，艺文与市集氛围浓厚。',
    },
  ] as const;

  const dynamicTemplates = [
    '本周将进行公共区域保洁，请大家配合，谢谢理解。',
    '周末社区义诊即将开始，欢迎业主预约参加。',
    '夜间请注意关好门窗，近期有安全巡逻。',
    '小区车位升级改造完成，记得前往物业办理相关手续。',
    '垃圾分类检查将开展，请大家提前整理。',
  ];

  const lifestyleTemplates = [
    '今日鲜花市集在社区广场开摊，邻里们快来选购春天的气息。',
    '诚园书友会招募新成员，周末一起分享好书。',
    '亲子手工课堂报名开启，一起动手创造美好回忆。',
    '社区篮球团建日，欢迎热爱运动的朋友们参加。',
    '周五晚七点露天电影《寻梦环游记》，记得带上小板凳。',
  ];

  const productTemplates = [
    {
      title: '九成新空气炸锅',
      description: '仅使用三次，闲置出，附送烘焙纸30张。',
      price: 199,
    },
    {
      title: 'IKEA 落地阅读灯',
      description: '灯光柔和，非常适合客厅阅读角。',
      price: 89,
    },
    {
      title: '儿童平衡车',
      description: '适合3-5岁儿童，轮胎完好，送头盔。',
      price: 160,
    },
    {
      title: '实木茶几',
      description: '原木色茶几，表面有轻微划痕，整体良好。',
      price: 320,
    },
    {
      title: '家用跑步机',
      description: '支持折叠收纳，自带蓝牙音响，闲置低价转让。',
      price: 950,
    },
  ];

  const propertyPassword = await hashPassword('property123');
  const residentPassword = await hashPassword('resident123');
  const merchantPassword = await hashPassword('merchant123');
  const platformPassword = await hashPassword('platform123');

  const communityMap = new Map<string, { id: string; name: string }>();

  for (const communitySeed of communitySeeds) {
    const propertyUser = await prisma.user.upsert({
      where: { email: `${communitySeed.slug}-property@lago.com` },
      update: {},
      create: {
        email: `${communitySeed.slug}-property@lago.com`,
        phone: undefined,
        nickname: `${communitySeed.name}物业主管`,
        role: UserRole.property,
        creditScore: 100,
        password: propertyPassword,
        communityIds: [],
        isVerified: true,
      },
    });

    const community = await prisma.community.findFirst({
      where: { name: communitySeed.name },
    });

    let targetCommunity = community;
    if (targetCommunity) {
      targetCommunity = await prisma.community.update({
        where: { id: targetCommunity.id },
        data: {
          address: communitySeed.address,
          location: communitySeed.location,
          images: communitySeed.images,
          description: communitySeed.description,
          verificationStatus: 'approved',
          verifiedAt: new Date(),
          partnerId: propertyUser.id,
        },
      });
    } else {
      targetCommunity = await prisma.community.create({
        data: {
          name: communitySeed.name,
          address: communitySeed.address,
          location: communitySeed.location,
          images: communitySeed.images,
          description: communitySeed.description,
          verificationStatus: 'approved',
          verifiedAt: new Date(),
          partnerId: propertyUser.id,
        },
      });
    }

    await prisma.userCommunity.upsert({
      where: {
        userId_communityId: {
          userId: propertyUser.id,
          communityId: targetCommunity.id,
        },
      },
      update: {
        isActive: true,
        role: CommunityMemberRole.supervisor,
      },
      create: {
        userId: propertyUser.id,
        communityId: targetCommunity.id,
        role: CommunityMemberRole.supervisor,
        isActive: true,
      },
    });

    const propertyCommunityMembership = await prisma.user.findUnique({
      where: { id: propertyUser.id },
      select: { communityIds: true },
    });
 
     await prisma.user.update({
       where: { id: propertyUser.id },
       data: {
         communityIds: {
          set: Array.from(new Set([...(propertyCommunityMembership?.communityIds ?? []), targetCommunity.id])),
         },
       },
     });

    const residentUser = await prisma.user.upsert({
      where: { email: `${communitySeed.slug}-resident@lago.com` },
      update: {},
      create: {
        email: `${communitySeed.slug}-resident@lago.com`,
        nickname: `${communitySeed.name}住户`,
        role: UserRole.user,
        creditScore: 95,
        password: residentPassword,
        isVerified: true,
        communityIds: [targetCommunity.id],
      },
    });

    await prisma.userCommunity.upsert({
      where: {
        userId_communityId: {
          userId: residentUser.id,
          communityId: targetCommunity.id,
        },
      },
      update: {
        isActive: true,
        role: CommunityMemberRole.resident,
      },
      create: {
        userId: residentUser.id,
        communityId: targetCommunity.id,
        role: CommunityMemberRole.resident,
        isActive: true,
      },
    });

    const residentCommunityMembership = await prisma.user.findUnique({
      where: { id: residentUser.id },
      select: { communityIds: true },
    });

    await prisma.user.update({
      where: { id: residentUser.id },
      data: {
        communityIds: {
          set: Array.from(new Set([...(residentCommunityMembership?.communityIds ?? []), targetCommunity.id])),
        },
      },
    });

    await prisma.communityActivity.deleteMany({ where: { communityId: targetCommunity.id } });
    await prisma.product.deleteMany({ where: { communityId: targetCommunity.id } });

    for (let i = 0; i < 5; i += 1) {
      await prisma.communityActivity.create({
        data: {
          communityId: targetCommunity.id,
          creatorId: propertyUser.id,
          type: CommunityActivityType.announcement,
          title: `${communitySeed.name} 通知 ${i + 1}`,
          description: dynamicTemplates[i % dynamicTemplates.length],
          images: [],
          status: CommunityActivityStatus.published,
        },
      });
    }

    for (let i = 0; i < 5; i += 1) {
      await prisma.communityActivity.create({
        data: {
          communityId: targetCommunity.id,
          creatorId: propertyUser.id,
          type: CommunityActivityType.event,
          title: `${communitySeed.name} 日常生活 ${i + 1}`,
          description: lifestyleTemplates[i % lifestyleTemplates.length],
          images: [],
          status: CommunityActivityStatus.published,
        },
      });
    }

    for (let i = 0; i < 5; i += 1) {
      const template = productTemplates[i % productTemplates.length];
      await prisma.product.create({
        data: {
          ownerId: residentUser.id,
          communityId: targetCommunity.id,
          title: `${communitySeed.name} ${template.title}`,
          description: template.description,
          category: ProductCategoryEnum.overall,
          type: TransactionType.sell,
          price: new Prisma.Decimal(template.price),
          images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32'],
          status: ProductStatus.active,
          location: communitySeed.address,
          isVerified: true,
        },
      });
    }

    communityMap.set(communitySeed.slug, {
      id: targetCommunity.id,
      name: targetCommunity.name,
    });

    console.log(`✅ 初始化社区数据: ${communitySeed.name}`);
  }

  const microMerchants = [
    {
      email: 'vendor-nuts@lago.com',
      nickname: '骆家庄现炒瓜子摊',
      avatarUrl: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e',
      communities: ['luojiazhuang-dongyuan', 'yaojiang-wendingyuan'],
      stallType: '炒货摊贩',
      activities: [
        {
          title: '五香瓜子限时热炒',
          description: '每日现炒五香瓜子，满两斤送山核桃一盒，限时优惠快来围观！',
          image: 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17',
          location: '骆家庄东苑北门广场',
          startOffsetHours: 6,
          durationHours: 4,
          communitySlug: 'luojiazhuang-dongyuan',
          viewCount: 86,
          participantCount: 24,
        },
        {
          title: '花生米出锅啦',
          description: '黄飞红花生米、蒜香花生今日新鲜出炉，下单加送秘制辣料。',
          image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db',
          location: '耀江文鼎苑南广场',
          startOffsetHours: 30,
          durationHours: 3,
          communitySlug: 'yaojiang-wendingyuan',
          viewCount: 65,
          participantCount: 18,
        },
        {
          title: '坚果礼盒清仓夜市',
          description: '坚果礼盒买一送一，夜场限量抢购，错过再等一年。',
          image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
          location: '骆家庄东苑中心花坛',
          startOffsetHours: 54,
          durationHours: 5,
          communitySlug: 'luojiazhuang-dongyuan',
          viewCount: 92,
          participantCount: 31,
        },
        {
          title: '儿童零食试吃会',
          description: '进口冻干水果、坚果棒免费试吃，宝爸宝妈不要错过。',
          image: 'https://images.unsplash.com/photo-1506086679524-493c64fdfaa6',
          location: '耀江文鼎苑儿童游乐场入口',
          startOffsetHours: 18,
          durationHours: 2,
          communitySlug: 'yaojiang-wendingyuan',
          viewCount: 58,
          participantCount: 16,
        },
        {
          title: '年货大集预热摊',
          description: '人气瓜子、开口松子现炒预订，现场打包送礼盒。',
          image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a',
          location: '骆家庄东苑物业服务中心门口',
          startOffsetHours: 78,
          durationHours: 4,
          communitySlug: 'luojiazhuang-dongyuan',
          viewCount: 73,
          participantCount: 22,
        },
      ],
    },
    {
      email: 'vendor-fruits@lago.com',
      nickname: '西溪水果铺',
      avatarUrl: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc',
      communities: ['lvcheng-xixi-chengyuan', 'xixi-jiangnanli'],
      stallType: '水果摊贩',
      activities: [
        {
          title: '清晨鲜果集市',
          description: '当季赣南脐橙、爱媛果冻橙空运到杭，现场试吃再下单。',
          image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2',
          location: '绿城·西溪诚园北门口袋公园',
          startOffsetHours: 4,
          durationHours: 3,
          communitySlug: 'lvcheng-xixi-chengyuan',
          viewCount: 104,
          participantCount: 37,
        },
        {
          title: '草莓控集合夜摊',
          description: '丹东红颜草莓、奶油草莓限量空运，夜宵档来一份。',
          image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979',
          location: '西溪江南里星辰广场',
          startOffsetHours: 28,
          durationHours: 3,
          communitySlug: 'xixi-jiangnanli',
          viewCount: 132,
          participantCount: 42,
        },
        {
          title: '水果组合盲盒摊',
          description: '每日限定50份水果盲盒，内含4-6种应季水果惊喜组合。',
          image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352',
          location: '绿城·西溪诚园亲子广场',
          startOffsetHours: 50,
          durationHours: 3,
          communitySlug: 'lvcheng-xixi-chengyuan',
          viewCount: 94,
          participantCount: 29,
        },
        {
          title: '果切夏日市集',
          description: '低糖轻食水果杯、鲜榨果汁买二送一，健身党首选。',
          image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
          location: '西溪江南里水街拱桥',
          startOffsetHours: 72,
          durationHours: 4,
          communitySlug: 'xixi-jiangnanli',
          viewCount: 120,
          participantCount: 34,
        },
        {
          title: '儿童营养水果课堂',
          description: '现场示范儿童营养搭配，报名家庭送环保购物袋。',
          image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc',
          location: '绿城·西溪诚园社区图书馆前',
          startOffsetHours: 96,
          durationHours: 2,
          communitySlug: 'lvcheng-xixi-chengyuan',
          viewCount: 88,
          participantCount: 25,
        },
      ],
    },
    {
      email: 'vendor-recycle@lago.com',
      nickname: '老王环保回收摊',
      avatarUrl: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac',
      communities: ['yaojiang-wendingyuan', 'wenxin-yipinfang'],
      stallType: '回收摊贩',
      activities: [
        {
          title: '闲置数码回收日',
          description: '旧手机、平板、笔记本现场估价，支持资料清除。',
          image: 'https://images.unsplash.com/photo-1460518451285-97b6aa326961',
          location: '耀江文鼎苑社区服务中心门前',
          startOffsetHours: 2,
          durationHours: 5,
          communitySlug: 'yaojiang-wendingyuan',
          viewCount: 78,
          participantCount: 21,
        },
        {
          title: '衣物循环市集',
          description: '旧衣服回收换积分，积分可抵用社区洗衣服务。',
          image: 'https://images.unsplash.com/photo-1475180098004-ca77a66827be',
          location: '文新·艺品坊二层连廊',
          startOffsetHours: 26,
          durationHours: 4,
          communitySlug: 'wenxin-yipinfang',
          viewCount: 84,
          participantCount: 27,
        },
        {
          title: '废纸旧书集中收购',
          description: '按斤称重高价回收旧书籍、废纸箱，支持现场现金结算。',
          image: 'https://images.unsplash.com/photo-1503602642458-232111445657',
          location: '耀江文鼎苑北侧停车场',
          startOffsetHours: 48,
          durationHours: 4,
          communitySlug: 'yaojiang-wendingyuan',
          viewCount: 69,
          participantCount: 19,
        },
        {
          title: '小家电免费检测驿站',
          description: '电饭煲、电水壶、玩具车免费检测，小问题现场解决。',
          image: 'https://images.unsplash.com/photo-1527672809634-04ed36500ccd',
          location: '文新·艺品坊艺创广场',
          startOffsetHours: 70,
          durationHours: 5,
          communitySlug: 'wenxin-yipinfang',
          viewCount: 91,
          participantCount: 23,
        },
        {
          title: '旧物换绿植活动',
          description: '带上闲置小物件，可兑换绿植一盆，为家增添生机。',
          image: 'https://images.unsplash.com/photo-1518562923427-19e694199479',
          location: '耀江文鼎苑中央草坪',
          startOffsetHours: 92,
          durationHours: 3,
          communitySlug: 'yaojiang-wendingyuan',
          viewCount: 74,
          participantCount: 20,
        },
      ],
    },
  ];

  for (const merchant of microMerchants) {
    const uniqueCommunityIds = Array.from(
      new Set(
        merchant.communities
          .map((slug) => communityMap.get(slug)?.id)
          .filter((id): id is string => Boolean(id))
      )
    );

    const merchantUser = await prisma.user.upsert({
      where: { email: merchant.email },
      update: {
        nickname: merchant.nickname,
        avatarUrl: merchant.avatarUrl,
        role: UserRole.merchant,
        communityIds: {
          set: uniqueCommunityIds,
        },
      },
      create: {
        email: merchant.email,
        nickname: merchant.nickname,
        avatarUrl: merchant.avatarUrl,
        role: UserRole.merchant,
        creditScore: 92,
        isVerified: true,
        communityIds: uniqueCommunityIds,
        password: merchantPassword,
      },
    });

    for (const communityId of uniqueCommunityIds) {
      await prisma.userCommunity.upsert({
        where: {
          userId_communityId: {
            userId: merchantUser.id,
            communityId,
          },
        },
        update: {
          isActive: true,
          role: CommunityMemberRole.resident,
        },
        create: {
          userId: merchantUser.id,
          communityId,
          role: CommunityMemberRole.resident,
          isActive: true,
        },
      });
    }

    for (const activityTemplate of merchant.activities) {
      const community = communityMap.get(activityTemplate.communitySlug);
      if (!community) continue;

      const startTime = new Date(Date.now() + activityTemplate.startOffsetHours * 60 * 60 * 1000);
      const endTime = new Date(startTime.getTime() + activityTemplate.durationHours * 60 * 60 * 1000);

      await prisma.communityActivity.create({
        data: {
          communityId: community.id,
          creatorId: merchantUser.id,
          type: CommunityActivityType.market,
          title: `${activityTemplate.title}｜${merchant.stallType}`,
          description: activityTemplate.description,
          images: [activityTemplate.image],
          startTime,
          endTime,
          location: activityTemplate.location,
          status: CommunityActivityStatus.published,
          viewCount: activityTemplate.viewCount,
          participantCount: activityTemplate.participantCount,
        },
      });
    }

    console.log(`✅ 初始化小微商家及地摊活动: ${merchant.nickname}`);
  }

  const platformOperator = await prisma.user.upsert({
    where: { email: 'platform-ops@lago.com' },
    update: {
      nickname: '平台地摊运营官',
      role: UserRole.admin,
    },
    create: {
      email: 'platform-ops@lago.com',
      nickname: '平台地摊运营官',
      role: UserRole.admin,
      password: platformPassword,
      creditScore: 100,
      isVerified: true,
      communityIds: [],
    },
  });

  const platformActivities = [
    {
      title: '社区联合夜市·租售专区',
      description: '平台精选二手好物联合摆摊，提供免租摊位与直播助推。',
      image: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c',
      location: '骆家庄东苑中央广场',
      startOffsetHours: 8,
      durationHours: 5,
      communitySlug: 'luojiazhuang-dongyuan',
      viewCount: 188,
      participantCount: 56,
    },
    {
      title: '小区家居换新计划',
      description: '大型家居租售展，提供环保回收换新补贴，限时体验。',
      image: 'https://images.unsplash.com/photo-1484100356142-db6ab6244067',
      location: '耀江文鼎苑空中花园',
      startOffsetHours: 40,
      durationHours: 6,
      communitySlug: 'yaojiang-wendingyuan',
      viewCount: 172,
      participantCount: 61,
    },
    {
      title: '西溪亲子市集嘉年华',
      description: '亲子租赁玩具、绘本共享、儿童服装循环，新手爸妈福利多多。',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
      location: '绿城·西溪诚园亲子乐园',
      startOffsetHours: 64,
      durationHours: 6,
      communitySlug: 'lvcheng-xixi-chengyuan',
      viewCount: 205,
      participantCount: 72,
    },
    {
      title: '江南里潮玩租赁节',
      description: '平台提供潮玩、Switch、VR设备租赁体验，全场7折起。',
      image: 'https://images.unsplash.com/photo-1523475472560-d2df97ec485c',
      location: '西溪江南里中心露台',
      startOffsetHours: 88,
      durationHours: 5,
      communitySlug: 'xixi-jiangnanli',
      viewCount: 160,
      participantCount: 48,
    },
    {
      title: '文创换物集市周末专场',
      description: '平台联合文创工作室，提供文化租售摊位，支持现场签约合作。',
      image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef',
      location: '文新·艺品坊文化长廊',
      startOffsetHours: 112,
      durationHours: 6,
      communitySlug: 'wenxin-yipinfang',
      viewCount: 194,
      participantCount: 67,
    },
  ];

  const platformCommunityIds = Array.from(
    new Set(
      platformActivities
        .map((item) => communityMap.get(item.communitySlug)?.id)
        .filter((id): id is string => Boolean(id))
    )
  );

  await prisma.user.update({
    where: { id: platformOperator.id },
    data: {
      communityIds: {
        set: platformCommunityIds,
      },
    },
  });

  for (const communityId of platformCommunityIds) {
    await prisma.userCommunity.upsert({
      where: {
        userId_communityId: {
          userId: platformOperator.id,
          communityId,
        },
      },
      update: {
        isActive: true,
        role: CommunityMemberRole.supervisor,
      },
      create: {
        userId: platformOperator.id,
        communityId,
        role: CommunityMemberRole.supervisor,
        isActive: true,
      },
    });
  }

  for (const activityTemplate of platformActivities) {
    const community = communityMap.get(activityTemplate.communitySlug);
    if (!community) continue;

    const startTime = new Date(Date.now() + activityTemplate.startOffsetHours * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + activityTemplate.durationHours * 60 * 60 * 1000);

    await prisma.communityActivity.create({
      data: {
        communityId: community.id,
        creatorId: platformOperator.id,
        type: CommunityActivityType.market,
        title: `${activityTemplate.title}｜平台地摊活动`,
        description: activityTemplate.description,
        images: [activityTemplate.image],
        startTime,
        endTime,
        location: activityTemplate.location,
        status: CommunityActivityStatus.published,
        viewCount: activityTemplate.viewCount,
        participantCount: activityTemplate.participantCount,
      },
    });
  }

  console.log('✅ 初始化平台地摊活动');

  console.log('✅ 种子数据初始化完成！');
  console.log('\n默认账号信息:');
  console.log('运营系统管理员: admin / admin123');
  console.log('审核专员: audit / staff123');
  console.log('客服专员: service / staff123');
}

main()
  .catch((e) => {
    console.error('种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

