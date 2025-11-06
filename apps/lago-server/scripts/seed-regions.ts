/**
 * 省市区数据填充脚本
 * 
 * 使用方法：
 * npm run seed-regions
 * 或
 * tsx scripts/seed-regions.ts
 */

import prisma from '../src/lib/prisma';
import { logger } from '../src/config/logger';

// 中国省市区数据（简化版，实际应使用完整数据）
const REGIONS_DATA = [
  {
    province: { code: '110000', name: '北京市' },
    cities: [
      {
        code: '110100',
        name: '北京市',
        districts: [
          { code: '110101', name: '东城区' },
          { code: '110102', name: '西城区' },
          { code: '110105', name: '朝阳区' },
          { code: '110106', name: '丰台区' },
          { code: '110107', name: '石景山区' },
          { code: '110108', name: '海淀区' },
          { code: '110109', name: '门头沟区' },
          { code: '110111', name: '房山区' },
          { code: '110112', name: '通州区' },
          { code: '110113', name: '顺义区' },
          { code: '110114', name: '昌平区' },
          { code: '110115', name: '大兴区' },
          { code: '110116', name: '怀柔区' },
          { code: '110117', name: '平谷区' },
          { code: '110118', name: '密云区' },
          { code: '110119', name: '延庆区' },
        ],
      },
    ],
  },
  {
    province: { code: '330000', name: '浙江省' },
    cities: [
      {
        code: '330100',
        name: '杭州市',
        districts: [
          { code: '330102', name: '上城区' },
          { code: '330105', name: '拱墅区' },
          { code: '330106', name: '西湖区' },
          { code: '330108', name: '滨江区' },
          { code: '330109', name: '萧山区' },
          { code: '330110', name: '余杭区' },
          { code: '330111', name: '富阳区' },
          { code: '330112', name: '临安区' },
          { code: '330113', name: '临平区' },
          { code: '330114', name: '钱塘区' },
          { code: '330122', name: '桐庐县' },
          { code: '330127', name: '淳安县' },
          { code: '330182', name: '建德市' },
        ],
      },
      {
        code: '330200',
        name: '宁波市',
        districts: [
          { code: '330203', name: '海曙区' },
          { code: '330205', name: '江北区' },
          { code: '330206', name: '北仑区' },
          { code: '330211', name: '镇海区' },
          { code: '330212', name: '鄞州区' },
          { code: '330213', name: '奉化区' },
          { code: '330225', name: '象山县' },
          { code: '330226', name: '宁海县' },
          { code: '330281', name: '余姚市' },
          { code: '330282', name: '慈溪市' },
        ],
      },
    ],
  },
  {
    province: { code: '310000', name: '上海市' },
    cities: [
      {
        code: '310100',
        name: '上海市',
        districts: [
          { code: '310101', name: '黄浦区' },
          { code: '310104', name: '徐汇区' },
          { code: '310105', name: '长宁区' },
          { code: '310106', name: '静安区' },
          { code: '310107', name: '普陀区' },
          { code: '310109', name: '虹口区' },
          { code: '310110', name: '杨浦区' },
          { code: '310112', name: '闵行区' },
          { code: '310113', name: '宝山区' },
          { code: '310114', name: '嘉定区' },
          { code: '310115', name: '浦东新区' },
          { code: '310116', name: '金山区' },
          { code: '310117', name: '松江区' },
          { code: '310118', name: '青浦区' },
          { code: '310120', name: '奉贤区' },
          { code: '310151', name: '崇明区' },
        ],
      },
    ],
  },
  {
    province: { code: '440000', name: '广东省' },
    cities: [
      {
        code: '440100',
        name: '广州市',
        districts: [
          { code: '440103', name: '荔湾区' },
          { code: '440104', name: '越秀区' },
          { code: '440105', name: '海珠区' },
          { code: '440106', name: '天河区' },
          { code: '440111', name: '白云区' },
          { code: '440112', name: '黄埔区' },
          { code: '440113', name: '番禺区' },
          { code: '440114', name: '花都区' },
          { code: '440115', name: '南沙区' },
          { code: '440117', name: '从化区' },
          { code: '440118', name: '增城区' },
        ],
      },
      {
        code: '440300',
        name: '深圳市',
        districts: [
          { code: '440303', name: '罗湖区' },
          { code: '440304', name: '福田区' },
          { code: '440305', name: '南山区' },
          { code: '440306', name: '宝安区' },
          { code: '440307', name: '龙岗区' },
          { code: '440308', name: '盐田区' },
          { code: '440309', name: '龙华区' },
          { code: '440310', name: '坪山区' },
          { code: '440311', name: '光明区' },
        ],
      },
    ],
  },
];

async function seedRegions() {
  try {
    await prisma.$connect();
    logger.info('开始填充省市区数据...');

    let provinceCount = 0;
    let cityCount = 0;
    let districtCount = 0;

    for (const region of REGIONS_DATA) {
      // 创建省份
      const province = await prisma.province.upsert({
        where: { code: region.province.code },
        update: {
          name: region.province.name,
          isActive: true,
        },
        create: {
          code: region.province.code,
          name: region.province.name,
          isActive: true,
        },
      });

      provinceCount++;

      for (const cityData of region.cities) {
        // 创建城市
        const city = await prisma.city.upsert({
          where: { code: cityData.code },
          update: {
            name: cityData.name,
            provinceId: province.id,
            isActive: true,
          },
          create: {
            code: cityData.code,
            name: cityData.name,
            provinceId: province.id,
            isActive: true,
          },
        });

        cityCount++;

        // 创建区县
        for (const districtData of cityData.districts) {
          await prisma.district.upsert({
            where: { code: districtData.code },
            update: {
              name: districtData.name,
              cityId: city.id,
              isActive: true,
            },
            create: {
              code: districtData.code,
              name: districtData.name,
              cityId: city.id,
              isActive: true,
            },
          });

          districtCount++;
        }
      }
    }

    logger.info(
      `✅ 省市区数据填充完成！省份: ${provinceCount}, 城市: ${cityCount}, 区县: ${districtCount}`
    );
  } catch (error: any) {
    logger.error('填充省市区数据失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  seedRegions();
}

export { seedRegions };

