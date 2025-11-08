"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  operationAssignStaffRoles,
  operationGetRoles,
  operationGetStaffs,
} from "@/lib/apis/system";
import {
  AssignStaffRolesPayload,
  OperationRoleWithPermissions,
  OperationStaff,
} from "@/lib/apis/types";
import { useAuth } from "@lago/ui";

interface StaffEditorState {
  staff?: OperationStaff;
  roleIds: string[];
  isSuperAdmin: boolean;
}

export default function StaffRolesPage() {
  const { user } = useAuth();
  const [staffs, setStaffs] = useState<OperationStaff[]>([]);
  const [roles, setRoles] = useState<OperationRoleWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editorState, setEditorState] = useState<StaffEditorState | null>(null);

  const roleMap = useMemo(() => {
    const map = new Map<string, OperationRoleWithPermissions>();
    roles.forEach((role) => map.set(role.id, role));
    return map;
  }, [roles]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffRes, roleRes] = await Promise.all([
        operationGetStaffs(true),
        operationGetRoles(true),
      ]);
      if (staffRes.data) {
        setStaffs(staffRes.data.staffs ?? []);
      }
      if (roleRes.data) {
        setRoles(roleRes.data.roles ?? []);
      }
    } catch (error) {
      console.error("加载员工或角色失败:", error);
      toast.error("加载员工或角色失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEditor = (staff: OperationStaff) => {
    setEditorState({
      staff,
      roleIds: staff.roleDetails?.map((role) => role.id) ?? [],
      isSuperAdmin: staff.isSuperAdmin ?? false,
    });
  };

  const toggleRoleSelection = (roleId: string) => {
    setEditorState((prev) => {
      if (!prev) return prev;
      const exists = prev.roleIds.includes(roleId);
      return {
        ...prev,
        roleIds: exists
          ? prev.roleIds.filter((id) => id !== roleId)
          : [...prev.roleIds, roleId],
      };
    });
  };

  const handleSubmit = async () => {
    if (!editorState?.staff) return;
    const payload: AssignStaffRolesPayload = {
      roleIds: editorState.roleIds,
      isSuperAdmin: editorState.isSuperAdmin,
    };

    setSubmitting(true);
    try {
      await operationAssignStaffRoles(editorState.staff.id, payload, true);
      toast.success("角色已更新");
      setEditorState(null);
      loadData();
    } catch (error) {
      console.error("更新员工角色失败:", error);
      toast.error("更新员工角色失败");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.isSuperAdmin) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">员工角色配置</h1>
        <p className="text-gray-600">只有超级管理员才能访问此页面。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">员工角色配置</h1>
        <p className="text-gray-600 mt-1">
          为运营员工分配角色，角色将决定员工拥有的权限点。
        </p>
      </div>

      {loading ? (
        <div className="text-gray-500">加载中...</div>
      ) : (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  员工
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  角色
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">
                  超级管理员
                </th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-600">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staffs.map((staff) => (
                <tr key={staff.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {staff.username}
                    </div>
                    <div className="text-sm text-gray-500">{staff.email}</div>
                    {staff.realName && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {staff.realName}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {staff.roleDetails && staff.roleDetails.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {staff.roleDetails.map((role) => (
                          <span
                            key={role.id}
                            className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700"
                          >
                            {role.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">未分配角色</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {staff.isSuperAdmin ? (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                        是
                      </span>
                    ) : (
                      "否"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEditor(staff)}
                      className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                    >
                      配置角色
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editorState && editorState.staff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  配置角色
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {editorState.staff.username}（{editorState.staff.email}）
                </p>
              </div>
              <button
                onClick={() => setEditorState(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <div className="flex items-center gap-2">
                <input
                  id="superAdmin"
                  type="checkbox"
                  checked={editorState.isSuperAdmin}
                  onChange={(event) =>
                    setEditorState((prev) =>
                      prev
                        ? { ...prev, isSuperAdmin: event.target.checked }
                        : prev
                    )
                  }
                  className="h-4 w-4"
                />
                <label htmlFor="superAdmin" className="text-sm text-gray-700">
                  授予超级管理员权限（拥有所有权限点）
                </label>
              </div>
              <div className="border border-gray-200 rounded-md">
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700 flex items-center justify-between">
                  <span>选择角色</span>
                  <button
                    onClick={() =>
                      setEditorState((prev) =>
                        prev
                          ? {
                              ...prev,
                              roleIds:
                                prev.roleIds.length === roles.length
                                  ? []
                                  : roles.map((role) => role.id),
                            }
                          : prev
                      )
                    }
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {editorState.roleIds.length === roles.length
                      ? "清除全部"
                      : "全选"}
                  </button>
                </div>
                <div className="px-4 py-3 space-y-2">
                  {roles.map((role) => {
                    const checked = editorState.roleIds.includes(role.id);
                    return (
                      <label
                        key={role.id}
                        className="flex items-start gap-3 text-sm text-gray-700"
                      >
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={checked}
                          onChange={() => toggleRoleSelection(role.id)}
                          disabled={role.isSystem && role.name === "超级管理员"}
                        />
                        <span>
                          <span className="font-medium">{role.name}</span>
                          {role.description && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {role.description}
                            </div>
                          )}
                          {role.permissions.length > 0 && (
                            <div className="mt-1 text-xs text-gray-400">
                              权限点：{role.permissions.join(", ")}
                            </div>
                          )}
                        </span>
                      </label>
                    );
                  })}
                  {roles.length === 0 && (
                    <div className="text-sm text-gray-500">
                      暂无可选角色，请先在角色配置页面创建角色。
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setEditorState(null)}
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

