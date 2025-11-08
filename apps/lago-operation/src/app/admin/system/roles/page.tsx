"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  operationCreateRole,
  operationDeleteRole,
  operationGetPermissions,
  operationGetRoles,
  operationUpdateRole,
} from "@/lib/apis/system";
import {
  OperationPermission,
  OperationRolePayload,
  OperationRoleWithPermissions,
} from "@/lib/apis/types";
import { useAuth } from "@lago/ui";

interface RoleFormState {
  id?: string;
  name: string;
  description?: string;
  permissionCodes: string[];
}

function buildEmptyForm(): RoleFormState {
  return {
    name: "",
    description: "",
    permissionCodes: [],
  };
}

export default function OperationRolesPage() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<OperationPermission[]>([]);
  const [roles, setRoles] = useState<OperationRoleWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleFormState | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const permissionGroups = useMemo(() => {
    const groups: Record<string, OperationPermission[]> = {};
    permissions.forEach((permission) => {
      const category = permission.category || "其他";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(permission);
    });
    return groups;
  }, [permissions]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [permRes, roleRes] = await Promise.all([
        operationGetPermissions(true),
        operationGetRoles(true),
      ]);
      if (permRes.data) {
        setPermissions(permRes.data.permissions || []);
      }
      if (roleRes.data) {
        setRoles(roleRes.data.roles || []);
      }
    } catch (error) {
      console.error("加载角色/权限失败:", error);
      toast.error("加载角色或权限失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePermission = (code: string) => {
    setEditingRole((prev) => {
      if (!prev) return prev;
      const exists = prev.permissionCodes.includes(code);
      return {
        ...prev,
        permissionCodes: exists
          ? prev.permissionCodes.filter((item) => item !== code)
          : [...prev.permissionCodes, code],
      };
    });
  };

  const handleEditRole = (role?: OperationRoleWithPermissions) => {
    if (role) {
      setEditingRole({
        id: role.id,
        name: role.name,
        description: role.description,
        permissionCodes: role.permissions || [],
      });
    } else {
      setEditingRole(buildEmptyForm());
    }
    setIsEditorOpen(true);
  };

  const handleSubmit = async () => {
    if (!editingRole) return;
    if (!editingRole.name?.trim()) {
      toast.error("角色名称不能为空");
      return;
    }

    const payload: OperationRolePayload = {
      name: editingRole.name.trim(),
      description: editingRole.description?.trim(),
      permissionCodes: editingRole.permissionCodes,
    };

    setSubmitting(true);
    try {
      if (editingRole.id) {
        await operationUpdateRole(editingRole.id, payload, true);
        toast.success("角色已更新");
      } else {
        await operationCreateRole(payload, true);
        toast.success("角色已创建");
      }
      setIsEditorOpen(false);
      setEditingRole(null);
      loadData();
    } catch (error) {
      console.error("保存角色失败:", error);
      toast.error(editingRole.id ? "更新角色失败" : "创建角色失败");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm("确定删除该角色吗？")) {
      return;
    }
    try {
      await operationDeleteRole(roleId, true);
      toast.success("角色已删除");
      loadData();
    } catch (error) {
      console.error("删除角色失败:", error);
      toast.error("删除角色失败");
    }
  };

  if (!user?.isSuperAdmin) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">角色权限配置</h1>
        <p className="text-gray-600">只有超级管理员才能访问此页面。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">角色权限配置</h1>
          <p className="text-gray-600 mt-1">
            为不同的运营角色分配权限点，用于控制后台页面和操作功能的可用性。
          </p>
        </div>
        <button
          onClick={() => handleEditRole()}
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          新建角色
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">加载中...</div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  角色名称
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  权限点
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  关联员工数
                </th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{role.name}</div>
                    {role.description && (
                      <div className="text-sm text-gray-500">
                        {role.description}
                      </div>
                    )}
                    {role.isSystem && (
                      <span className="mt-1 inline-flex px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                        系统角色
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((code) => (
                        <span
                          key={code}
                          className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700"
                        >
                          {code}
                        </span>
                      ))}
                      {role.permissions.length === 0 && (
                        <span className="text-gray-400">无权限</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {role.staffCount ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                    >
                      编辑
                    </button>
                    {!role.isSystem && (
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="px-3 py-1 text-sm rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                      >
                        删除
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isEditorOpen && editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingRole.id ? "编辑角色" : "新建角色"}
              </h2>
              <button
                onClick={() => {
                  setIsEditorOpen(false);
                  setEditingRole(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  角色名称
                </label>
                <input
                  value={editingRole.name}
                  onChange={(event) =>
                    setEditingRole((prev) =>
                      prev
                        ? { ...prev, name: event.target.value }
                        : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入角色名称"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  描述
                </label>
                <textarea
                  value={editingRole.description}
                  onChange={(event) =>
                    setEditingRole((prev) =>
                      prev
                        ? { ...prev, description: event.target.value }
                        : prev
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="关于角色的补充说明"
                  rows={3}
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">
                    权限点
                  </h3>
                  <button
                    onClick={() =>
                      setEditingRole((prev) =>
                        prev
                          ? {
                              ...prev,
                              permissionCodes:
                                prev.permissionCodes.length ===
                                permissions.length
                                  ? []
                                  : permissions.map((item) => item.code),
                            }
                          : prev
                      )
                    }
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {editingRole.permissionCodes.length === permissions.length
                      ? "清除全部"
                      : "全选"}
                  </button>
                </div>
                <div className="space-y-4">
                  {Object.entries(permissionGroups).map(
                    ([category, items]) => (
                      <div key={category} className="border border-gray-200 rounded-md">
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                          {category}
                        </div>
                        <div className="px-4 py-3 space-y-2">
                          {items.map((permission) => {
                            const checked = editingRole.permissionCodes.includes(
                              permission.code
                            );
                            return (
                              <label
                                key={permission.code}
                                className="flex items-start gap-2 text-sm text-gray-700"
                              >
                                <input
                                  type="checkbox"
                                  className="mt-1"
                                  checked={checked}
                                  onChange={() =>
                                    handleTogglePermission(permission.code)
                                  }
                                />
                                <span>
                                  <span className="font-medium">
                                    {permission.name}
                                  </span>
                                  <span className="ml-2 text-gray-500">
                                    ({permission.code})
                                  </span>
                                  {permission.description && (
                                    <div className="text-xs text-gray-400">
                                      {permission.description}
                                    </div>
                                  )}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsEditorOpen(false);
                  setEditingRole(null);
                }}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                disabled={submitting}
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

