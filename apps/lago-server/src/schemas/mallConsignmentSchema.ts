import Joi from 'joi';

export const listConsignmentOrdersSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid('submitted', 'received', 'refurbishing', 'listed', 'sold', 'settled', 'cancelled').optional(),
    search: Joi.string().allow('').optional(),
  }),
});

export const updateConsignmentOrderSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    status: Joi.string().valid('submitted', 'received', 'refurbishing', 'listed', 'sold', 'settled', 'cancelled').optional(),
    assignedStaffId: Joi.string().allow(null).optional(),
    mallProductId: Joi.string().allow(null).optional(),
  }).min(1),
});
