import * as Joi from 'joi';

export const createOperationRoleSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().required().messages({
      'string.empty': '角色名称不能为空',
      'any.required': '角色名称是必填项',
    }),
    description: Joi.string().allow('').optional(),
    permissionCodes: Joi.array().items(Joi.string().trim()).optional(),
  }),
});

export const updateOperationRoleSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().trim().optional(),
    description: Joi.string().allow('').optional(),
    permissionCodes: Joi.array().items(Joi.string().trim()).optional(),
  }),
});

export const assignOperationStaffRolesSchema = Joi.object({
  body: Joi.object({
    roleIds: Joi.array().items(Joi.string().trim()).required().messages({
      'any.required': '角色ID列表是必填项',
    }),
    isSuperAdmin: Joi.boolean().optional(),
  }),
});

