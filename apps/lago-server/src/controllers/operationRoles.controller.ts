import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { createErrorResponse, createSuccessResponse } from '../lib/response';

const prismaAny = prisma as any;

const DEFAULT_PERMISSIONS = [
  { code: 'dashboard:view', name: '查看仪表盘', category: 'dashboard', description: '查看运营仪表盘数据' },
  { code: 'products:view', name: '查看商品', category: 'product', description: '查看商品列表及详情' },
  { code: 'products:manage', name: '管理商品', category: 'product', description: '创建或更新商品信息' },
  { code: 'products:review', name: '审核商品', category: 'product', description: '审核商品上架申请' },
  { code: 'communities:view', name: '查看小区', category: 'community', description: '查看小区及认证信息' },
  { code: 'communities:manage', name: '管理小区', category: 'community', description: '新建或修改小区信息' },
  { code: 'communities:review', name: '审核小区', category: 'community', description: '审核小区认证申请' },
  { code: 'users:view', name: '查看用户', category: 'user', description: '查看用户信息' },
  { code: 'users:manage', name: '管理用户', category: 'user', description: '调整用户状态或信息' },
  { code: 'orders:view', name: '查看订单', category: 'order', description: '查看订单列表及详情' },
  { code: 'orders:manage', name: '管理订单', category: 'order', description: '修改订单状态或备注' },
  { code: 'approvals:review', name: '审核入驻', category: 'approval', description: '审核商家入驻等申请' },
  { code: 'analytics:view', name: '查看数据报表', category: 'analytics', description: '查看运营分析数据' },
  { code: 'finance:view', name: '查看财务', category: 'finance', description: '查看财务及结算信息' },
  { code: 'finance:manage', name: '管理财务', category: 'finance', description: '处理结算与财务操作' },
  { code: 'system:roles', name: '管理角色权限', category: 'system', description: '配置运营角色权限' },
  { code: 'system:staff_roles', name: '配置员工角色', category: 'system', description: '为运营员工分配角色' },
  { code: 'mall_products:manage', name: '商城运营 - 商品管理', category: 'mall', description: '发布商城商品并绑定可见小区' },
  { code: 'mall_activities:manage', name: '商城运营 - 活动管理', category: 'mall', description: '创建商城活动并配置覆盖小区' },
  { code: 'mall_banners:manage', name: '商城运营 - 钻石位管理', category: 'mall', description: '上传商城Banner并配置跳转链接' },
  { code: 'mall_consignments:manage', name: '商城运营 - 寄售管理', category: 'mall', description: '管理平台帮卖寄售订单与商品发布' },
];

const DEFAULT_ROLES = [
  {
    name: 'super_admin',
    description: '超级管理员，拥有全部权限',
    permissionCodes: DEFAULT_PERMISSIONS.map((permission) => permission.code),
  },
  {
    name: 'audit_staff',
    description: '审核专员，负责商品和小区审核',
    permissionCodes: [
      'products:view',
      'products:review',
      'communities:view',
      'communities:review',
      'approvals:review',
    ],
  },
  {
    name: 'service_staff',
    description: '客服专员，负责用户与订单相关事务',
    permissionCodes: [
      'dashboard:view',
      'users:view',
      'users:manage',
      'orders:view',
      'orders:manage',
    ],
  },
  {
    name: 'operation_staff',
    description: '运营专员，负责内容和小区维护',
    permissionCodes: [
      'dashboard:view',
      'products:view',
      'products:manage',
      'communities:view',
      'communities:manage',
      'analytics:view',
    ],
  },
  {
    name: 'finance_staff',
    description: '财务专员，负责结算相关操作',
    permissionCodes: [
      'finance:view',
      'finance:manage',
      'orders:view',
    ],
  },
  {
    name: 'mall_operator',
    description: '商城运营专员，负责商城商品与活动运营',
    permissionCodes: [
      'mall_products:manage',
      'mall_activities:manage',
      'mall_banners:manage',
      'mall_consignments:manage',
    ],
  },
];

async function ensureDefaultPermissions() {
  for (const permission of DEFAULT_PERMISSIONS) {
    await prismaAny.operationPermission.upsert({
      where: { code: permission.code },
      update: {
        name: permission.name,
        category: permission.category,
        description: permission.description,
      },
      create: permission,
    });
  }
}

function mapRole(role: any) {
  const permissions = role.rolePermissions?.map((rp: any) => rp.permission.code) ?? [];
  return {
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    permissions,
    staffCount: role.staffAssignments?.length ?? 0,
  };
}

function mapStaff(staff: any, allPermissionCodes: string[]) {
  const roles = staff.roles?.map((assignment: any) => ({
    id: assignment.role.id,
    name: assignment.role.name,
    description: assignment.role.description,
    isSystem: assignment.role.isSystem,
    permissions:
      assignment.role.rolePermissions?.map((rp: any) => rp.permission?.code).filter(Boolean) ?? [],
  })) ?? [];

  const permissionSet = new Set<string>();
  roles.forEach((role) => {
    role.permissions.forEach((code: string) => permissionSet.add(code));
  });

  if (staff.isSuperAdmin) {
    allPermissionCodes.forEach((code) => permissionSet.add(code));
  }

  return {
    id: staff.id,
    username: staff.username,
    email: staff.email,
    realName: staff.realName,
    phone: staff.phone,
    isActive: staff.isActive,
    isSuperAdmin: staff.isSuperAdmin,
    roles,
    roleDetails: roles,
    permissions: Array.from(permissionSet).sort(),
  };
}

async function ensureDefaultRoles() {
  await ensureDefaultPermissions();
  const permissions = await prismaAny.operationPermission.findMany();
  const permissionMap = new Map<string, string>(
    permissions.map((permission) => [permission.code, permission.id])
  );

  for (const roleDef of DEFAULT_ROLES) {
    const role = await prismaAny.operationRole.upsert({
      where: { name: roleDef.name },
      update: {
        description: roleDef.description,
        isSystem: true,
      },
      create: {
        name: roleDef.name,
        description: roleDef.description,
        isSystem: true,
      },
    });

    const permissionIds = roleDef.permissionCodes
      .map((code) => permissionMap.get(code))
      .filter((id): id is string => Boolean(id));

    await prismaAny.operationRolePermission.deleteMany({
      where: { roleId: role.id },
    });

    if (permissionIds.length > 0) {
      await prismaAny.operationRolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: role.id,
          permissionId,
        })),
      });
    }
  }
}

export async function listOperationPermissions(req: Request, res: Response) {
  try {
    await ensureDefaultPermissions();
    const permissions = await prismaAny.operationPermission.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    return createSuccessResponse(res, { permissions });
  } catch (error) {
    console.error('获取权限列表失败:', error);
    return createErrorResponse(res, '获取权限列表失败', 500);
  }
}

export async function listOperationRoles(req: Request, res: Response) {
  try {
    await ensureDefaultRoles();
    const roles = await prismaAny.operationRole.findMany({
      include: {
        rolePermissions: {
          include: { permission: true },
        },
        staffAssignments: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return createSuccessResponse(res, {
      roles: roles.map(mapRole),
    });
  } catch (error) {
    console.error('获取角色列表失败:', error);
    return createErrorResponse(res, '获取角色列表失败', 500);
  }
}

export async function createOperationRole(req: Request, res: Response) {
  try {
    const { name, description, permissionCodes = [] } = req.body;

    const existing = await prismaAny.operationRole.findUnique({ where: { name } });
    if (existing) {
      return createErrorResponse(res, '角色名称已存在', 409);
    }

    const permissions = await prismaAny.operationPermission.findMany({
      where: { code: { in: permissionCodes } },
    });

    if (permissionCodes.length !== permissions.length) {
      return createErrorResponse(res, '存在无效的权限编码', 400);
    }

    const role = await prismaAny.$transaction(async (tx) => {
      const createdRole = await tx.operationRole.create({
        data: {
          name,
          description,
        },
      });

      if (permissions.length > 0) {
        await tx.operationRolePermission.createMany({
          data: permissions.map((permission) => ({
            roleId: createdRole.id,
            permissionId: permission.id,
          })),
        });
      }

      return createdRole;
    });

    const result = await prismaAny.operationRole.findUnique({
      where: { id: role.id },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
        staffAssignments: true,
      },
    });

    return createSuccessResponse(res, { role: mapRole(result) }, 201);
  } catch (error) {
    console.error('创建角色失败:', error);
    return createErrorResponse(res, '创建角色失败', 500);
  }
}

export async function updateOperationRole(req: Request, res: Response) {
  try {
    const { roleId } = req.params;
    const { name, description, permissionCodes = [] } = req.body;

    const role = await prismaAny.operationRole.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: true,
      },
    });

    if (!role) {
      return createErrorResponse(res, '角色不存在', 404);
    }

    if (role.isSystem && name && name !== role.name) {
      return createErrorResponse(res, '系统内置角色不允许修改名称', 400);
    }

    const permissions = await prismaAny.operationPermission.findMany({
      where: { code: { in: permissionCodes } },
    });

    if (permissionCodes.length !== permissions.length) {
      return createErrorResponse(res, '存在无效的权限编码', 400);
    }

    await prismaAny.$transaction(async (tx) => {
      await tx.operationRole.update({
        where: { id: roleId },
        data: {
          name,
          description,
        },
      });

      await tx.operationRolePermission.deleteMany({
        where: { roleId },
      });

      if (permissions.length > 0) {
        await tx.operationRolePermission.createMany({
          data: permissions.map((permission) => ({
            roleId,
            permissionId: permission.id,
          })),
        });
      }
    });

    const result = await prismaAny.operationRole.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: { permission: true },
        },
        staffAssignments: true,
      },
    });

    return createSuccessResponse(res, { role: mapRole(result) });
  } catch (error) {
    console.error('更新角色失败:', error);
    return createErrorResponse(res, '更新角色失败', 500);
  }
}

export async function deleteOperationRole(req: Request, res: Response) {
  try {
    const { roleId } = req.params;

    const role = await prismaAny.operationRole.findUnique({
      where: { id: roleId },
      include: {
        staffAssignments: true,
      },
    });

    if (!role) {
      return createErrorResponse(res, '角色不存在', 404);
    }

    if (role.isSystem) {
      return createErrorResponse(res, '系统内置角色不允许删除', 400);
    }

    if (role.staffAssignments.length > 0) {
      return createErrorResponse(res, '角色已分配给员工，无法删除', 400);
    }

    await prismaAny.operationRole.delete({
      where: { id: roleId },
    });

    return createSuccessResponse(res, { message: '角色已删除' });
  } catch (error) {
    console.error('删除角色失败:', error);
    return createErrorResponse(res, '删除角色失败', 500);
  }
}

export async function listOperationStaffs(req: Request, res: Response) {
  try {
    const allPermissionCodes = (await prismaAny.operationPermission.findMany({ select: { code: true } })).map((item: { code: string }) => item.code);
    const staffs = await prismaAny.operationStaff.findMany({
      include: {
        roles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return createSuccessResponse(res, {
      staffs: staffs.map((staff) => mapStaff(staff, allPermissionCodes)),
    });
  } catch (error) {
    console.error('获取运营员工列表失败:', error);
    return createErrorResponse(res, '获取运营员工列表失败', 500);
  }
}

export async function assignOperationStaffRoles(req: Request, res: Response) {
  try {
    const { staffId } = req.params;
    const { roleIds = [], isSuperAdmin } = req.body as { roleIds: string[]; isSuperAdmin?: boolean };

    const staff = await prismaAny.operationStaff.findUnique({
      where: { id: staffId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!staff) {
      return createErrorResponse(res, '运营人员不存在', 404);
    }

    const roles = await prismaAny.operationRole.findMany({
      where: { id: { in: roleIds } },
    });

    if (roleIds.length !== roles.length) {
      return createErrorResponse(res, '存在无效的角色ID', 400);
    }

    let nextRoleIds = [...roleIds];

    if (isSuperAdmin) {
      const superAdminRole = await prismaAny.operationRole.findUnique({
        where: { name: 'super_admin' },
      });
      if (superAdminRole && !nextRoleIds.includes(superAdminRole.id)) {
        nextRoleIds.push(superAdminRole.id);
      }
    } else {
      const superAdminRole = await prismaAny.operationRole.findUnique({
        where: { name: 'super_admin' },
      });
      if (superAdminRole) {
        nextRoleIds = nextRoleIds.filter((id) => id !== superAdminRole.id);
      }
    }

    const uniqueRoleIds = Array.from(new Set(nextRoleIds));

    await prismaAny.$transaction(async (tx) => {
      await tx.operationStaffRole.deleteMany({
        where: { staffId },
      });

      if (uniqueRoleIds.length > 0) {
        await tx.operationStaffRole.createMany({
          data: uniqueRoleIds.map((roleId) => ({
            staffId,
            roleId,
          })),
        });
      }

      if (typeof isSuperAdmin === 'boolean') {
        await tx.operationStaff.update({
          where: { id: staffId },
          data: {
            isSuperAdmin,
          },
        });
      }
    });

    const result = await prismaAny.operationStaff.findUnique({
      where: { id: staffId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!result) {
      return createErrorResponse(res, '运营人员不存在', 404);
    }

    const allPermissionCodes = (await prismaAny.operationPermission.findMany({ select: { code: true } })).map((item: { code: string }) => item.code);

    return createSuccessResponse(res, {
      staff: mapStaff(result, allPermissionCodes),
    });
  } catch (error) {
    console.error('配置员工角色失败:', error);
    return createErrorResponse(res, '配置员工角色失败', 500);
  }
}

