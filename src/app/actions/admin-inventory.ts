'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { StockType } from "@prisma/client"

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        name: 'asc',
      },
    })
    return { success: true, data: products }
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return { success: false, error: "Failed to fetch products" }
  }
}

export async function getStockHistory(productId: string) {
  try {
    const history = await prisma.stock.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    })
    return { success: true, data: history }
  } catch (error) {
    console.error("Failed to fetch stock history:", error)
    return { success: false, error: "Failed to fetch stock history" }
  }
}

export async function createProduct(data: {
  name: string
  brand?: string
  price: number
  sku: string
  description?: string
  stockQuantity: number
  lowStockThreshold: number
}) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        brand: data.brand,
        price: data.price,
        sku: data.sku,
        description: data.description,
        stockQuantity: data.stockQuantity,
        lowStockThreshold: data.lowStockThreshold,
        // Create initial stock entry
        stock: {
          create: {
            quantity: data.stockQuantity,
            type: "ADD",
            notes: "Initial stock",
          },
        },
      },
    })
    revalidatePath("/admin/inventory")
    return { success: true, data: product }
  } catch (error) {
    console.error("Failed to create product:", error)
    return { success: false, error: "Failed to create product" }
  }
}

export async function updateProduct(id: string, data: {
  name?: string
  brand?: string
  price?: number
  sku?: string
  description?: string
  lowStockThreshold?: number
}) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data,
    })
    revalidatePath("/admin/inventory")
    return { success: true, data: product }
  } catch (error) {
    console.error("Failed to update product:", error)
    return { success: false, error: "Failed to update product" }
  }
}

export async function adjustStock(
  productId: string, 
  quantity: number, 
  type: StockType, 
  notes?: string
) {
  try {
    // Transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create stock record
      await tx.stock.create({
        data: {
          productId,
          quantity,
          type,
          notes,
        },
      })

      // 2. Update product stock quantity
      const product = await tx.product.findUnique({
        where: { id: productId },
      })

      if (!product) throw new Error("Product not found")

      let newQuantity = product.stockQuantity
      if (type === "ADD") {
        newQuantity += quantity
      } else if (type === "REMOVE") {
        newQuantity -= quantity
      } else if (type === "ADJUSTMENT") {
        // For adjustment, we'll assume the quantity is the NEW total quantity
        // Or we can treat it as a correction. 
        // Let's stick to the previous logic: ADD/REMOVE are deltas.
        // If type is ADJUSTMENT, let's assume it's a manual correction where we just add/sub the difference?
        // No, let's keep it simple: ADJUSTMENT is also a delta in this implementation, 
        // but usually it implies "I counted X". 
        // To support "I counted X", we'd need to calculate the delta.
        // For now, let's treat ADJUSTMENT as a delta too, or just use ADD/REMOVE in UI.
        // Let's assume the UI sends the delta.
        newQuantity += quantity
      }

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: newQuantity },
      })

      return updatedProduct
    })

    revalidatePath("/admin/inventory")
    return { success: true, data: result }
  } catch (error) {
    console.error("Failed to adjust stock:", error)
    return { success: false, error: "Failed to adjust stock" }
  }
}
