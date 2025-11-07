/**
 * 小区详情补全脚本
 *
 * 根据当前数据库中的小区，调用高德地图接口补充小区的
 * 介绍、图片、地址等基础信息。
 *
 * 使用方法：
 *   npm run enrich-communities --workspace=apps/lago-server
 *   npm run enrich-communities --workspace=apps/lago-server -- --limit=50 --city=杭州
 *   npm run enrich-communities --workspace=apps/lago-server -- --force
 */

import axios from 'axios';
import prisma from '../src/lib/prisma';
import { logger } from '../src/config/logger';

interface CommandArgs {
  limit?: number;
  city?: string;
  force?: boolean;
}

interface CommunityWithRegion {
  id: string;
  name: string;
  address: string | null;
  location: string | null;
  description: string | null;
  images: string[];
  city?: { name: string | null } | null;
  district?: { name: string | null } | null;
}

interface AmapPoi {
  id: string;
  name: string;
  type?: string;
  typecode?: string;
  address?: string;
  location?: string; // lng,lat
  adname?: string;
  cityname?: string;
  pname?: string;
  tag?: string;
  photos?: Array<{ url: string }>;
  biz_ext?: {
    rating?: string;
    cost?: string;
  };
  deep_info?: {
    desc?: string;
    traffic?: string;
    recommend?: string;
    intro?: string;
    environment?: string;
    parking?: string;
  };
}

interface AmapSearchResponse {
  status: string;
  info: string;
  pois?: AmapPoi[];
}

const AMAP_API_KEY = process.env.AMAP_API_KEY;
const TEXT_SEARCH_URL = 'https://restapi.amap.com/v3/place/text';
const DETAIL_URL = 'https://restapi.amap.com/v3/place/detail';

function parseArgs(): CommandArgs {
  const args = process.argv.slice(2);
  const limitArg = args.find((arg) => arg.startsWith('--limit='));
  const cityArg = args.find((arg) => arg.startsWith('--city='));
  return {
    limit: limitArg ? Math.max(parseInt(limitArg.split('=')[1], 10), 1) : undefined,
    city: cityArg ? cityArg.split('=')[1] : undefined,
    force: args.includes('--force'),
  };
}

function parseCommunityLocation(location?: string | null): { lat: number; lng: number } | null {
  if (!location) return null;
  const parts = location.split(',').map((value) => Number(value.trim()));
  if (parts.length !== 2 || parts.some((value) => Number.isNaN(value))) {
    return null;
  }
  // 数据库存储为 "lat,lng"
  const [lat, lng] = parts;
  return { lat, lng };
}

function parsePoiLocation(location?: string): { lat: number; lng: number } | null {
  if (!location) return null;
  const parts = location.split(',').map((value) => Number(value.trim()));
  if (parts.length !== 2 || parts.some((value) => Number.isNaN(value))) {
    return null;
  }
  const [lng, lat] = parts; // 高德返回 lng,lat
  return { lat, lng };
}

function calculateDistanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000; // meters
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function collectPhotoUrls(poi?: AmapPoi | null): string[] {
  const urls = new Set<string>();
  if (!poi) return [];
  poi.photos?.forEach((photo) => {
    if (photo?.url) {
      urls.add(photo.url);
    }
  });
  return Array.from(urls);
}

function buildDescription(poi: AmapPoi, community: CommunityWithRegion): string {
  const lines: string[] = [];
  if (poi.deep_info?.desc) {
    lines.push(poi.deep_info.desc);
  } else if (poi.deep_info?.intro) {
    lines.push(poi.deep_info.intro);
  }

  const tags: string[] = [];
  if (poi.tag) tags.push(poi.tag);
  if (poi.type) tags.push(poi.type);
  if (tags.length) {
    lines.push(`标签：${tags.join(' | ')}`);
  }

  const extras: string[] = [];
  if (poi.biz_ext?.rating) {
    extras.push(`评分：${poi.biz_ext.rating}`);
  }
  if (poi.biz_ext?.cost) {
    extras.push(`均价：${poi.biz_ext.cost}`);
  }
  if (poi.deep_info?.traffic) {
    extras.push(`交通：${poi.deep_info.traffic}`);
  }
  if (poi.deep_info?.recommend) {
    extras.push(`推荐：${poi.deep_info.recommend}`);
  }
  if (poi.deep_info?.environment) {
    extras.push(`环境：${poi.deep_info.environment}`);
  }
  if (poi.deep_info?.parking) {
    extras.push(`停车：${poi.deep_info.parking}`);
  }
  if (extras.length) {
    lines.push(extras.join('\n'));
  }

  if (!lines.length) {
    const parts: string[] = [];
    const address = poi.address || community.address;
    if (address) parts.push(`地址：${address}`);
    if (community.city?.name) parts.push(`所属城市：${community.city.name}`);
    if (community.district?.name) parts.push(`所属区域：${community.district.name}`);
    lines.push(parts.join('\n'));
  }

  return lines.filter(Boolean).join('\n');
}

async function searchPoi(community: CommunityWithRegion): Promise<AmapPoi | null> {
  if (!AMAP_API_KEY) {
    throw new Error('AMAP_API_KEY 环境变量未配置');
  }

  const location = parseCommunityLocation(community.location);
  const params: Record<string, string> = {
    key: AMAP_API_KEY,
    keywords: community.name,
    types: '120000',
    extensions: 'all',
    offset: '10',
    page: '1',
  };

  if (community.city?.name) {
    params.city = community.city.name.replace(/市$/u, '');
  }

  try {
    const response = await axios.get<AmapSearchResponse>(TEXT_SEARCH_URL, {
      params,
      timeout: 10000,
    });

    if (response.data.status !== '1' || !response.data.pois?.length) {
      logger.warn(`[${community.name}] 未搜索到匹配小区: ${response.data.info}`);
      return null;
    }

    const pois = response.data.pois.filter((poi) => poi.name === community.name) || response.data.pois;

    if (!location) {
      return pois[0];
    }

    const scored = pois
      .map((poi) => {
        const poiLocation = parsePoiLocation(poi.location);
        const distance = poiLocation ? calculateDistanceMeters(location, poiLocation) : Number.POSITIVE_INFINITY;
        return { poi, distance };
      })
      .sort((a, b) => a.distance - b.distance);

    const best = scored[0];
    if (!best || !Number.isFinite(best.distance)) {
      return pois[0];
    }

    if (best.distance > 1500) {
      logger.warn(`[${community.name}] 最近的POI距离过远 (${Math.round(best.distance)}m)`);
    }

    return best.poi;
  } catch (error: any) {
    logger.error(`[${community.name}] 搜索失败:`, error.message || error);
    return null;
  }
}

async function fetchPoiDetail(poiId: string): Promise<AmapPoi | null> {
  if (!AMAP_API_KEY) {
    throw new Error('AMAP_API_KEY 环境变量未配置');
  }

  try {
    const response = await axios.get<AmapSearchResponse>(DETAIL_URL, {
      params: {
        key: AMAP_API_KEY,
        id: poiId,
        extensions: 'all',
      },
      timeout: 10000,
    });

    if (response.data.status !== '1' || !response.data.pois?.length) {
      return null;
    }

    return response.data.pois[0];
  } catch (error: any) {
    logger.error(`获取 POI(${poiId}) 详情失败:`, error.message || error);
    return null;
  }
}

async function enrichCommunity(community: CommunityWithRegion, options: CommandArgs): Promise<void> {
  const poi = await searchPoi(community);
  if (!poi) return;

  const detail = (poi.id && (await fetchPoiDetail(poi.id))) || poi;

  const photos = collectPhotoUrls(detail);
  const description = buildDescription(detail, community);
  const poiLocation = parsePoiLocation(detail.location);
  const updateData: Record<string, any> = {};

  if (options.force || !community.description || !community.description.trim()) {
    updateData.description = description;
  }

  if ((options.force || !community.images?.length) && photos.length) {
    updateData.images = photos;
  }

  if ((options.force || !community.address) && detail.address) {
    updateData.address = detail.address;
  }

  if (poiLocation) {
    const existingLocation = parseCommunityLocation(community.location);
    if (options.force || !existingLocation) {
      updateData.location = `${poiLocation.lat},${poiLocation.lng}`;
    }
  }

  if (!Object.keys(updateData).length) {
    logger.info(`[${community.name}] 无需更新`);
    return;
  }

  await prisma.community.update({
    where: { id: community.id },
    data: updateData,
  });

  logger.info(`✅ ${community.name} 已更新 (描述: ${Boolean(updateData.description)}, 图片: ${updateData.images?.length || 0})`);
}

async function fetchCommunitiesToEnrich(options: CommandArgs): Promise<CommunityWithRegion[]> {
  const baseWhere: any = {
    isActive: true,
  };

  if (options.city) {
    baseWhere.OR = [
      { city: { name: { contains: options.city } } },
      { address: { contains: options.city } },
    ];
  }

  const communities = await prisma.community.findMany({
    where: baseWhere,
    include: {
      city: { select: { name: true } },
      district: { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
    take: options.limit,
  });

  if (options.force) {
    return communities;
  }

  return communities.filter((community) => {
    const needsDescription = !community.description || !community.description.trim();
    const needsImages = !community.images || community.images.length === 0;
    return needsDescription || needsImages;
  });
}

async function main() {
  const options = parseArgs();

  if (!AMAP_API_KEY) {
    logger.error('请配置 AMAP_API_KEY 环境变量后再运行脚本');
    process.exit(1);
  }

  try {
    await prisma.$connect();
    logger.info('数据库连接成功');

    const communities = await fetchCommunitiesToEnrich(options);

    if (!communities.length) {
      logger.info('没有需要补全的小区数据');
      return;
    }

    logger.info(`共 ${communities.length} 个小区待补全`);

    for (const community of communities) {
      logger.info(`开始补全小区：${community.name}`);
      try {
        await enrichCommunity(community, options);
      } catch (error: any) {
        logger.error(`❌ ${community.name} 补全失败:`, error.message || error);
      }

      // 控制请求频率，避免触发高德限流
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  } catch (error: any) {
    logger.error('脚本执行失败:', error.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { main as enrichCommunities };

