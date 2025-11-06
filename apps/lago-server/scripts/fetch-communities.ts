/**
 * 小区数据采集脚本
 * 
 * 使用高德地图 POI API 批量获取城市小区数据
 * 
 * 使用方法：
 * npm run fetch-communities -- --city=北京 --limit=100
 * 或
 * tsx src/scripts/fetch-communities.ts --city=北京 --limit=100
 */

import axios from 'axios';
import prisma from '../src/lib/prisma';
import { logger } from '../src/config/logger';

// 使用简单的geoHash实现，避免额外依赖
// 如果需要更高精度，可以安装 ngeohash 包: npm install ngeohash
function encodeGeoHash(lat: number, lng: number, precision: number = 9): string {
  // 简化的geoHash实现（实际项目中建议使用 ngeohash 库）
  // 这里返回一个基于经纬度的哈希值
  const latRange = [-90, 90];
  const lngRange = [-180, 180];
  let hash = '';
  let latMin = latRange[0];
  let latMax = latRange[1];
  let lngMin = lngRange[0];
  let lngMax = lngRange[1];
  
  const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let bits = 0;
  let bit = 0;
  
  for (let i = 0; i < precision * 5; i++) {
    if (i % 2 === 0) {
      const mid = (lngMin + lngMax) / 2;
      if (lng >= mid) {
        bit = 1;
        lngMin = mid;
      } else {
        bit = 0;
        lngMax = mid;
      }
    } else {
      const mid = (latMin + latMax) / 2;
      if (lat >= mid) {
        bit = 1;
        latMin = mid;
      } else {
        bit = 0;
        latMax = mid;
      }
    }
    
    bits = bits * 2 + bit;
    if ((i + 1) % 5 === 0) {
      hash += base32[bits];
      bits = 0;
    }
  }
  
  return hash;
}

// 高德地图 API 配置
const AMAP_API_KEY = process.env.AMAP_API_KEY || '';
const AMAP_BASE_URL = 'https://restapi.amap.com/v3/place/text';

// 主要城市列表（可根据需要扩展）
const MAJOR_CITIES = [
  '北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '武汉',
  '西安', '南京', '天津', '苏州', '长沙', '郑州', '东莞', '青岛',
  '沈阳', '宁波', '昆明', '大连', '厦门', '合肥', '佛山', '福州',
  '石家庄', '哈尔滨', '济南', '长春', '南昌', '贵阳', '太原', '南宁',
];

interface AmapPOI {
  id: string;
  name: string;
  type: string;
  typecode: string;
  address: string;
  location: string; // "经度,纬度"
  adname: string; // 区域名称
  cityname: string;
  adcode: string;
  tel?: string;
}

interface AmapResponse {
  status: string;
  count: string;
  info: string;
  infocode: string;
  pois: AmapPOI[];
}

/**
 * 从高德API获取指定城市的小区数据
 */
async function fetchCommunitiesByCity(
  city: string,
  limit: number = 1000
): Promise<AmapPOI[]> {
  if (!AMAP_API_KEY) {
    throw new Error('AMAP_API_KEY 环境变量未设置');
  }

  const allCommunities: AmapPOI[] = [];
  let page = 1;
  const pageSize = 25; // 高德API每页最多25条

  logger.info(`开始获取 ${city} 的小区数据...`);

  while (allCommunities.length < limit) {
    try {
      const response = await axios.get<AmapResponse>(AMAP_BASE_URL, {
        params: {
          key: AMAP_API_KEY,
          keywords: '小区',
          city,
          types: '120000', // 住宅区类型代码
          offset: pageSize,
          page,
          extensions: 'all', // 返回详细信息
        },
        timeout: 10000,
      });

      if (response.data.status !== '1') {
        logger.error(`API调用失败: ${response.data.info}`);
        break;
      }

      const pois = response.data.pois || [];
      if (pois.length === 0) {
        logger.info(`${city} 第 ${page} 页无更多数据`);
        break;
      }

      allCommunities.push(...pois);
      logger.info(`${city} 已获取 ${allCommunities.length} 条数据 (第 ${page} 页)`);

      // 如果返回的数据少于pageSize，说明已经是最后一页
      if (pois.length < pageSize) {
        break;
      }

      page++;

      // 控制请求频率，避免触发限流（高德建议QPS < 10）
      await sleep(200);
    } catch (error: any) {
      logger.error(`获取 ${city} 数据失败:`, error.message);
      // 如果是网络错误，重试一次
      if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
        logger.info('网络错误，等待后重试...');
        await sleep(1000);
        continue;
      }
      break;
    }
  }

  logger.info(`${city} 共获取 ${allCommunities.length} 条小区数据`);
  return allCommunities;
}

/**
 * 解析经纬度字符串 "经度,纬度"
 */
function parseLocation(location: string): { lng: number; lat: number } | null {
  const [lng, lat] = location.split(',').map(Number);
  if (isNaN(lng) || isNaN(lat)) {
    return null;
  }
  return { lng, lat };
}

/**
 * 计算geoHash
 */
function calculateGeoHash(lat: number, lng: number): string {
  try {
    return encodeGeoHash(lat, lng, 9); // 精度约5米
  } catch (error) {
    logger.error('计算geoHash失败:', error);
    return '';
  }
}

/**
 * 数据去重：检查小区是否已存在
 */
async function isCommunityExists(
  name: string,
  address: string,
  geoHash: string
): Promise<boolean> {
  // 基于名称和geoHash判断
  const existing = await prisma.community.findFirst({
    where: {
      OR: [
        { name: name, geoHash: geoHash },
        { name: name, address: address },
      ],
    },
  });
  return !!existing;
}

/**
 * 根据城市名称和区县名称查找省市区ID
 */
async function findRegionIds(
  cityName: string,
  districtName: string
): Promise<{ provinceId: string | null; cityId: string | null; districtId: string | null }> {
  try {
    // 查找城市
    const city = await prisma.city.findFirst({
      where: {
        name: {
          contains: cityName.replace('市', '').replace('省', ''),
        },
      },
      include: {
        province: true,
        districts: true,
      },
    });

    if (!city) {
      return { provinceId: null, cityId: null, districtId: null };
    }

    // 查找区县
    let district = null;
    if (districtName) {
      district = city.districts.find(
        (d) => d.name.includes(districtName) || districtName.includes(d.name)
      );
    }

    return {
      provinceId: city.provinceId,
      cityId: city.id,
      districtId: district?.id || null,
    };
  } catch (error) {
    logger.error('查找省市区失败:', error);
    return { provinceId: null, cityId: null, districtId: null };
  }
}

/**
 * 保存小区数据到数据库
 */
async function saveCommunities(pois: AmapPOI[], city: string): Promise<number> {
  let savedCount = 0;
  let skippedCount = 0;

  for (const poi of pois) {
    try {
      const location = parseLocation(poi.location);
      if (!location) {
        logger.warn(`跳过无效位置数据: ${poi.name}`);
        skippedCount++;
        continue;
      }

      const geoHash = calculateGeoHash(location.lat, location.lng);
      const address = poi.address || `${poi.adname}${poi.name}`;

      // 检查是否已存在
      const exists = await isCommunityExists(poi.name, address, geoHash);
      if (exists) {
        skippedCount++;
        continue;
      }

      // 查找省市区ID
      const regionIds = await findRegionIds(poi.cityname || city, poi.adname);

      // 保存到数据库
      await prisma.community.create({
        data: {
          name: poi.name,
          location: `${location.lat},${location.lng}`, // 存储为 "纬度,经度"
          address: address,
          provinceId: regionIds.provinceId,
          cityId: regionIds.cityId,
          districtId: regionIds.districtId,
          geoHash: geoHash,
          isActive: true,
        },
      });

      savedCount++;
    } catch (error: any) {
      // 如果是唯一约束冲突，跳过
      if (error.code === 'P2002') {
        skippedCount++;
        continue;
      }
      logger.error(`保存小区数据失败 [${poi.name}]:`, error.message);
    }
  }

  logger.info(`${city}: 新增 ${savedCount} 条，跳过 ${skippedCount} 条`);
  return savedCount;
}

/**
 * 主函数
 */
async function main() {
  // 从命令行参数获取配置
  const args = process.argv.slice(2);
  const cityArg = args.find((arg) => arg.startsWith('--city='))?.split('=')[1];
  const limitArg = args.find((arg) => arg.startsWith('--limit='))?.split('=')[1];
  const allCitiesArg = args.includes('--all-cities');

  // 如果指定了城市，优先使用；否则如果是--all-cities则使用所有城市；否则默认只处理杭州
  const cities = cityArg
    ? [cityArg]
    : allCitiesArg
    ? MAJOR_CITIES
    : ['杭州']; // 默认只处理杭州
  const limit = limitArg ? parseInt(limitArg, 10) : 2000; // 默认2000条

  if (cities.length === 0) {
    console.log(`
使用方法：
  npm run fetch-communities -- --city=北京 --limit=100
  npm run fetch-communities -- --all-cities --limit=500

参数：
  --city=城市名     指定要获取的城市（如：北京、上海）
  --all-cities      获取所有主要城市的数据
  --limit=数量      每个城市最多获取的小区数量（默认1000）
    `);
    process.exit(1);
  }

  if (!AMAP_API_KEY) {
    logger.error('请设置 AMAP_API_KEY 环境变量');
    process.exit(1);
  }

  try {
    // 连接数据库
    await prisma.$connect();
    logger.info('数据库连接成功');

    let totalSaved = 0;

    for (const city of cities) {
      try {
        // 获取小区数据
        const communities = await fetchCommunitiesByCity(city, limit);

        if (communities.length === 0) {
          logger.warn(`${city} 未获取到数据，跳过`);
          continue;
        }

        // 保存到数据库
        const saved = await saveCommunities(communities, city);
        totalSaved += saved;

        // 城市之间稍作延迟
        if (cities.length > 1) {
          await sleep(1000);
        }
      } catch (error: any) {
        logger.error(`处理 ${city} 时出错:`, error.message);
        continue;
      }
    }

    logger.info(`\n✅ 数据采集完成！共新增 ${totalSaved} 条小区数据`);
  } catch (error: any) {
    logger.error('脚本执行失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export { fetchCommunitiesByCity, saveCommunities };

