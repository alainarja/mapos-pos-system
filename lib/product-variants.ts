import { Product, ProductVariant } from '@/types'

export function extractVariantInfo(productName: string): {
  baseName: string
  variantAttribute?: string
  variantValue?: string
} {
  // Common patterns for variants
  const patterns = [
    // Pattern: "Product - Variant" or "Product, Variant"
    /^(.+?)\s*[-,]\s*(.+)$/,
    // Pattern: "Product (Variant)"
    /^(.+?)\s*\((.+?)\)$/,
    // Pattern: "Product Variant" where variant is a color or size
    /^(.+?)\s+(Red|Blue|Green|Yellow|Black|White|Pink|Purple|Orange|Grey|Gray|Brown|Small|Medium|Large|XL|XXL|XS|S|M|L)$/i,
  ]

  for (const pattern of patterns) {
    const match = productName.match(pattern)
    if (match) {
      const baseName = match[1].trim()
      const variantPart = match[2].trim()
      
      // Try to determine the attribute type
      let attribute = 'Variant'
      let value = variantPart
      
      // Check if it's a color
      if (/^(Red|Blue|Green|Yellow|Black|White|Pink|Purple|Orange|Grey|Gray|Brown|Navy|Beige|Cream|Teal|Maroon|Olive)$/i.test(variantPart)) {
        attribute = 'Color'
        value = variantPart.charAt(0).toUpperCase() + variantPart.slice(1).toLowerCase()
      }
      // Check if it's a size
      else if (/^(XS|S|M|L|XL|XXL|XXXL|Small|Medium|Large|Extra Large)$/i.test(variantPart)) {
        attribute = 'Size'
        value = variantPart.toUpperCase()
      }
      // Check for size patterns like "32", "34", etc.
      else if (/^\d+$/.test(variantPart)) {
        attribute = 'Size'
        value = variantPart
      }
      
      return { baseName, variantAttribute: attribute, variantValue: value }
    }
  }
  
  // No variant pattern found
  return { baseName: productName }
}

export function groupProductsByVariants(products: Product[]): Product[] {
  const productGroups = new Map<string, Product[]>()
  const standaloneProducts: Product[] = []
  
  // First pass: group products by base name and category
  products.forEach(product => {
    const { baseName, variantAttribute, variantValue } = extractVariantInfo(product.name)
    
    // Create a unique key for grouping (baseName + category)
    const groupKey = `${baseName.toLowerCase()}_${product.category}`
    
    if (variantAttribute && variantValue) {
      // This product looks like a variant
      if (!productGroups.has(groupKey)) {
        productGroups.set(groupKey, [])
      }
      
      // Add variant info to the product
      const productWithVariant = {
        ...product,
        variantGroup: baseName,
        variantAttribute,
        variantValue,
        isVariant: true
      }
      
      productGroups.get(groupKey)!.push(productWithVariant)
    } else {
      // Check if this might be a parent product for existing variants
      let isParentProduct = false
      productGroups.forEach((variants, key) => {
        if (key.startsWith(baseName.toLowerCase()) && variants[0].category === product.category) {
          isParentProduct = true
        }
      })
      
      if (!isParentProduct) {
        standaloneProducts.push(product)
      }
    }
  })
  
  // Second pass: create grouped products
  const groupedProducts: Product[] = []
  
  productGroups.forEach((variants, groupKey) => {
    if (variants.length > 1) {
      // Multiple variants found - create a parent product
      const firstVariant = variants[0]
      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0)
      const minPrice = Math.min(...variants.map(v => v.price))
      const maxPrice = Math.max(...variants.map(v => v.price))
      
      // Create variant objects
      const productVariants: ProductVariant[] = variants.map(v => ({
        id: v.id,
        name: v.name,
        variantAttribute: v.variantAttribute || 'Variant',
        variantValue: v.variantValue || v.name,
        price: v.price,
        stock: v.stock,
        image: v.image,
        sku: v.sku,
        barcode: v.barcode
      }))
      
      // Create the parent product
      const parentProduct: Product = {
        ...firstVariant,
        id: `group_${groupKey}`,
        name: firstVariant.variantGroup || firstVariant.name,
        price: minPrice,
        stock: totalStock,
        variants: productVariants,
        isVariant: false,
        variantGroup: firstVariant.variantGroup,
        // Show price range if prices differ
        description: minPrice !== maxPrice 
          ? `${firstVariant.description || ''} (Price: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)})`.trim()
          : firstVariant.description
      }
      
      groupedProducts.push(parentProduct)
    } else if (variants.length === 1) {
      // Single variant - add as standalone
      standaloneProducts.push(variants[0])
    }
  })
  
  // Combine grouped products and standalone products
  return [...groupedProducts, ...standaloneProducts]
}

export function getVariantDisplay(product: Product): string {
  if (product.variants && product.variants.length > 0) {
    const attributes = new Set(product.variants.map(v => v.variantAttribute))
    if (attributes.size === 1) {
      const attribute = product.variants[0].variantAttribute
      return `${product.variants.length} ${attribute}s available`
    }
    return `${product.variants.length} variants available`
  }
  return ''
}