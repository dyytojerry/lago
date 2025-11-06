import prisma from '../src/lib/prisma';
import { hashPassword } from '../src/lib/auth';

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
      role: 'super_admin',
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
      role: 'audit_staff',
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
      role: 'service_staff',
      realName: '客服专员',
      isActive: true,
    },
  });

  console.log('✅ 创建客服专员:', serviceStaff.username);

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

