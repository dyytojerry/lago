import { apiRequest, HTTPResponse } from "@lago/common";
import {
  OperationPermission,
  OperationRolePayload,
  OperationRoleWithPermissions,
  AssignStaffRolesPayload,
  OperationStaff,
} from "./types";

export async function operationGetPermissions(
  noAuthorize?: boolean
): Promise<HTTPResponse<{ permissions: OperationPermission[] }>> {
  return apiRequest("/api/admin/system/permissions", {
    method: "GET",
    noAuthorize,
  });
}

export async function operationGetRoles(
  noAuthorize?: boolean
): Promise<HTTPResponse<{ roles: OperationRoleWithPermissions[] }>> {
  return apiRequest("/api/admin/system/roles", {
    method: "GET",
    noAuthorize,
  });
}

export async function operationCreateRole(
  data: OperationRolePayload,
  noAuthorize?: boolean
): Promise<HTTPResponse<{ role: OperationRoleWithPermissions }>> {
  return apiRequest("/api/admin/system/roles", {
    method: "POST",
    body: JSON.stringify(data),
    noAuthorize,
  });
}

export async function operationUpdateRole(
  roleId: string,
  data: OperationRolePayload,
  noAuthorize?: boolean
): Promise<HTTPResponse<{ role: OperationRoleWithPermissions }>> {
  return apiRequest(`/api/admin/system/roles/${roleId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    noAuthorize,
  });
}

export async function operationDeleteRole(
  roleId: string,
  noAuthorize?: boolean
): Promise<HTTPResponse<{ message: string }>> {
  return apiRequest(`/api/admin/system/roles/${roleId}`, {
    method: "DELETE",
    noAuthorize,
  });
}

export async function operationGetStaffs(
  noAuthorize?: boolean
): Promise<HTTPResponse<{ staffs: OperationStaff[] }>> {
  return apiRequest("/api/admin/system/staffs", {
    method: "GET",
    noAuthorize,
  });
}

export async function operationAssignStaffRoles(
  staffId: string,
  data: AssignStaffRolesPayload,
  noAuthorize?: boolean
): Promise<HTTPResponse<{ staff: OperationStaff }>> {
  return apiRequest(`/api/admin/system/staffs/${staffId}/roles`, {
    method: "PUT",
    body: JSON.stringify(data),
    noAuthorize,
  });
}

