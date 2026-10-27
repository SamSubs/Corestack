const { z } = require('zod');

// Auth Schemas
const registerSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  role: z.enum(['ADMIN', 'CUSTOMER']).optional()
});

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "A senha é obrigatória")
});

// Product Schemas
const createProductSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres").max(255),
  description: z.string().optional().nullable(),
  price: z.union([z.string(), z.number()]).transform((val) => Number(val)).refine(val => val >= 0, { message: "Preço deve ser positivo" }),
  stock: z.union([z.string(), z.number()]).transform((val) => Number(val)).refine(val => val >= 0, { message: "Estoque não pode ser negativo" }),
  image: z.string().optional().nullable()
});

const updateProductSchema = createProductSchema.partial();

// Order Schemas
const cartItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().int().positive()
});

const checkoutSchema = z.object({
  paymentMethod: z.string().min(1, "Método de pagamento é obrigatório")
});

module.exports = {
  registerSchema,
  loginSchema,
  createProductSchema,
  updateProductSchema,
  checkoutSchema
};
