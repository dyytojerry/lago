import Joi from 'joi';

export const listMallBannersSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(200).default(50),
    status: Joi.string().valid('inactive', 'active').optional(),
  }),
});

export const createMallBannerSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().max(80).required(),
    imageUrl: Joi.string().uri().required(),
    linkUrl: Joi.string().uri().allow('').optional(),
    status: Joi.string().valid('inactive', 'active').default('active'),
    sortOrder: Joi.number().integer().min(0).default(0),
  }),
});

export const updateMallBannerSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
  body: Joi.object({
    title: Joi.string().max(80).optional(),
    imageUrl: Joi.string().uri().optional(),
    linkUrl: Joi.string().uri().allow('').optional(),
    status: Joi.string().valid('inactive', 'active').optional(),
    sortOrder: Joi.number().integer().min(0).optional(),
  }).min(1),
});

export const removeMallBannerSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required(),
  }),
});
