import Joi from 'joi';

const communityIdsSchema = Joi.array().items(Joi.string().trim()).max(200);

export const listMallActivitiesSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid('draft', 'published', 'offline').optional(),
    search: Joi.string().allow('').optional(),
  }),
});

export const createMallActivitySchema = Joi.object({
  body: Joi.object({
    title: Joi.string().max(120).required(),
    description: Joi.string().allow('').optional(),
    coverImage: Joi.string().uri().allow('').optional(),
    startTime: Joi.date().iso().optional(),
    endTime: Joi.date().iso().optional(),
    visibleCommunityIds: communityIdsSchema.default([]),
    status: Joi.string().valid('draft', 'published', 'offline').default('draft'),
  }),
});

export const updateMallActivitySchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    title: Joi.string().max(120).optional(),
    description: Joi.string().allow('').optional(),
    coverImage: Joi.string().uri().allow('').optional(),
    startTime: Joi.date().iso().allow(null).optional(),
    endTime: Joi.date().iso().allow(null).optional(),
    visibleCommunityIds: communityIdsSchema.optional(),
    status: Joi.string().valid('draft', 'published', 'offline').optional(),
  }).min(1),
});

export const removeMallActivitySchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
});
