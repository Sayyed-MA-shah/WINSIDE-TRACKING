// @ts-nocheck
import { Product, Variant } from '../types'

export interface CsvRow {
  product_id: string
  name: string
  category_name: string
  article: string
  shelf_no: string
  wholesale_price: string
  retail_price: string
  cost_before: string
  cost_after: string
  color_name: string
  size_name: string
  quantity: string
}

export function parseCsvData(csvContent: string): Product[] {
  const lines = csvContent.trim().split('\n')
  const header = lines[0]
  const dataLines = lines.slice(1).filter(line => line.trim())
  
  // Parse CSV rows
  const csvRows: CsvRow[] = dataLines.map(line => {
    const values = line.split(',')
    return {
      product_id: values[0]?.trim() || '',
      name: values[1]?.trim() || '',
      category_name: values[2]?.trim() || '',
      article: values[3]?.trim() || '',
      shelf_no: values[4]?.trim() || '',
      wholesale_price: values[5]?.trim() || '0',
      retail_price: values[6]?.trim() || '0',
      cost_before: values[7]?.trim() || '0',
      cost_after: values[8]?.trim() || '0',
      color_name: values[9]?.trim() || '',
      size_name: values[10]?.trim() || '',
      quantity: values[11]?.trim() || '0'
    }
  })

  // Group by product_id to create products with variants
  const productGroups = new Map<string, CsvRow[]>()
  
  csvRows.forEach(row => {
    if (!productGroups.has(row.product_id)) {
      productGroups.set(row.product_id, [])
    }
    productGroups.get(row.product_id)!.push(row)
  })

  // Convert to Product array
  const products: Product[] = []
  
  productGroups.forEach((rows, productId) => {
    const firstRow = rows[0]
    
    // Create variants for this product
    const variants: Variant[] = rows.map((row, index) => ({
      id: `${productId}-${index + 1}`,
      productId: productId,
      sku: `${row.article}-${row.color_name.replace(/\s+/g, '').toUpperCase()}-${row.size_name.replace(/\s+/g, '').toUpperCase()}`,
      attributes: {
        Color: row.color_name,
        Size: row.size_name
      },
      qty: parseInt(row.quantity) || 0,
      wholesale: parseFloat(row.wholesale_price) || 0,
      retail: parseFloat(row.retail_price) || 0,
      club: parseFloat(row.retail_price) * 0.9 || 0, // 10% discount for club
      costBefore: parseFloat(row.cost_before) || 0,
      costAfter: parseFloat(row.cost_after) || 0
    }))

    // Calculate totals
    const totalStock = variants.reduce((sum, variant) => sum + variant.qty, 0)
    const avgWholesale = variants.length > 0 
      ? variants.reduce((sum, variant) => sum + (variant.wholesale || 0), 0) / variants.length 
      : 0
    const avgRetail = variants.length > 0 
      ? variants.reduce((sum, variant) => sum + (variant.retail || 0), 0) / variants.length 
      : 0
    const avgClub = variants.length > 0 
      ? variants.reduce((sum, variant) => sum + (variant.club || 0), 0) / variants.length 
      : 0
    const avgCostBefore = variants.length > 0 
      ? variants.reduce((sum, variant) => sum + (variant.costBefore || 0), 0) / variants.length 
      : 0
    const avgCostAfter = variants.length > 0 
      ? variants.reduce((sum, variant) => sum + (variant.costAfter || 0), 0) / variants.length 
      : 0

    const product: Product = {
      id: productId,
      article: firstRow.article,
      title: firstRow.name,
      category: firstRow.category_name,
      brand: 'byko', // As requested, all products under byko brand
      taxable: true,
      attributes: ['Color', 'Size'],
      mediaMain: undefined, // Remove broken placeholder reference
      archived: false,
      wholesale: avgWholesale,
      retail: avgRetail,
      club: avgClub,
      costBefore: avgCostBefore,
      costAfter: avgCostAfter,
      createdAt: new Date(),
      updatedAt: new Date(),
      variants: variants
    }

    products.push(product)
  })

  return products
}

// Export function to get migrated products from CSV
const sampleCsvContent = `product_id,name,category_name,article,shelf_no,wholesale_price,retail_price,cost_before,cost_after,color_name,size_name,quantity
  { id: "6", article: "BGA-1012", name: "Boxing gloves amok", category_id: "1", wholesale_price: "35", retail_price: "49.99", cost_before: "12", cost_after: "16" },
  { id: "7", article: "BGC-1011", name: "Boxing gloves ClassX", category_id: "1", wholesale_price: "41", retail_price: "69.99", cost_before: "14", cost_after: "18" },
  { id: "8", article: "BGE-1013", name: "Boxing Gloves Endoor", category_id: "1", wholesale_price: "49", retail_price: "89.99", cost_before: "18", cost_after: "23" },
  { id: "9", article: "BGH-1015", name: "Boxing Gloves Horse", category_id: "1", wholesale_price: "70", retail_price: "150", cost_before: "20", cost_after: "27" },
  { id: "10", article: "BGK-1016", name: "Boxing Gloves Knock", category_id: "1", wholesale_price: "40", retail_price: "69.99", cost_before: "16", cost_after: "20" },
  { id: "11", article: "BGI-1017", name: "Boxing Gloves Impact", category_id: "1", wholesale_price: "45", retail_price: "79.99", cost_before: "16", cost_after: "20" },
  { id: "12", article: "BGB-1019", name: "Boxing Gloves BP", category_id: "1", wholesale_price: "59.99", retail_price: "130", cost_before: "16", cost_after: "20" },
  { id: "13", article: "HGB-2011", name: "Head Guard Brag", category_id: "2", wholesale_price: "69", retail_price: "110", cost_before: "18", cost_after: "24" },
  { id: "14", article: "BGV-1019", name: "Boxing Gloves Vexa", category_id: "1", wholesale_price: "16", retail_price: "29.99", cost_before: "7", cost_after: "10" },
  { id: "16", article: "HGH-2015", name: "Head Guard Heed", category_id: "2", wholesale_price: "22.99", retail_price: "39.99", cost_before: "8", cost_after: "12" },
  { id: "17", article: "GGP-2031", name: "Groin Guard Pro", category_id: "3", wholesale_price: "29.99", retail_price: "59.99", cost_before: "12", cost_after: "17" },
  { id: "18", article: "GGP-2032", name: "Groin Guard Pro", category_id: "3", wholesale_price: "29.99", retail_price: "59.99", cost_before: "14", cost_after: "20" },
  { id: "19", article: "CSM-2041", name: "Cup Supporter Metal", category_id: "3", wholesale_price: "10", retail_price: "18.99", cost_before: "4", cost_after: "6" },
  { id: "20", article: "CSP-2042", name: "Cup Supporter Poly", category_id: "3", wholesale_price: "4.99", retail_price: "9.99", cost_before: "0", cost_after: "0" },
  { id: "21", article: "SPP-2051", name: "Shin instep PRO", category_id: "4", wholesale_price: "35.99", retail_price: "49.99", cost_before: "12", cost_after: "18" },
  { id: "22", article: "SPT-2052", name: "Shin Instep Training", category_id: "4", wholesale_price: "29.99", retail_price: "44.99", cost_before: "7", cost_after: "14" },
  { id: "23", article: "AMR-8011", name: "Focus Mitt React", category_id: "5", wholesale_price: "49.99", retail_price: "139.99", cost_before: "18", cost_after: "24.99" },
  { id: "24", article: "FMS-8012", name: "Focus Mitt Smart", category_id: "5", wholesale_price: "35", retail_price: "65.99", cost_before: "13", cost_after: "18" },
  { id: "25", article: "FME-8013", name: "Focus Mitt Elastic", category_id: "5", wholesale_price: "35", retail_price: "79.99", cost_before: "14", cost_after: "19.99" },
  { id: "26", article: "FMA-8014", name: "Focs Mitt Arch", category_id: "5", wholesale_price: "19.99", retail_price: "29.99", cost_before: "7", cost_after: "12" },
  { id: "28", article: "BP-9011", name: "Body Protector Coaching Guard", category_id: "5", wholesale_price: "130", retail_price: "249.99", cost_before: "35", cost_after: "70" },
  { id: "30", article: "TP-9018", name: "Thigh Pads", category_id: "5", wholesale_price: "59.99", retail_price: "110", cost_before: "19", cost_after: "42.99" },
  { id: "31", article: "CP-9021", name: "Coaching Paddle", category_id: "5", wholesale_price: "24", retail_price: "49.99", cost_before: "10", cost_after: "12" },
  { id: "32", article: "CP-9022", name: "Coaching Paddle", category_id: "5", wholesale_price: "24", retail_price: "49.99", cost_before: "10", cost_after: "12" },
  { id: "33", article: "CS-9031", name: "Coaching Stick", category_id: "5", wholesale_price: "24", retail_price: "49.99", cost_before: "10", cost_after: "12" },
  { id: "34", article: "CS-9032", name: "Coaching Stick", category_id: "5", wholesale_price: "24", retail_price: "49.99", cost_before: "10", cost_after: "12" },
  { id: "36", article: "SPR-9042", name: "Strike Pad Round", category_id: "5", wholesale_price: "39", retail_price: "59.99", cost_before: "12", cost_after: "32" },
  { id: "37", article: "WP-9051", name: "Wall Pad", category_id: "6", wholesale_price: "150", retail_price: "249", cost_before: "59", cost_after: "110" },
  { id: "38", article: "WP-9052", name: "Wall Pad", category_id: "6", wholesale_price: "130", retail_price: "199.99", cost_before: "45", cost_after: "90" },
  { id: "39", article: "WP-9053", name: "Wall Pad", category_id: "6", wholesale_price: "120", retail_price: "199.99", cost_before: "30", cost_after: "70" },
  { id: "40", article: "SB-9061", name: "Speed Ball", category_id: "7", wholesale_price: "19.99", retail_price: "39.99", cost_before: "7", cost_after: "9" },
  { id: "41", article: "FSB-9062", name: "Floor to Ceiling Ball pear", category_id: "7", wholesale_price: "19.99", retail_price: "44.99", cost_before: "8", cost_after: "10" },
  { id: "42", article: "FSRB-9063", name: "Floor to Celling Ball Round", category_id: "7", wholesale_price: "0", retail_price: "0", cost_before: "9", cost_after: "11" },
  { id: "43", article: "FSDB-9064", name: "Floor to Celling Double Ball", category_id: "7", wholesale_price: "35", retail_price: "79.99", cost_before: "12", cost_after: "15" },
  { id: "44", article: "SBP-9071", name: "Speed Ball Platform Heavy", category_id: "7", wholesale_price: "280", retail_price: "499.99", cost_before: "80", cost_after: "150" },
  { id: "45", article: "SBP-9072", name: "Speed Ball Platform Medium", category_id: "7", wholesale_price: "260", retail_price: "449.99", cost_before: "78", cost_after: "140" },
  { id: "46", article: "Spb-9073", name: "Speed Ball Platform Light", category_id: "7", wholesale_price: "49", retail_price: "99.99", cost_before: "17", cost_after: "37" },
  { id: "47", article: "BSV-2101", name: "Boxing Short & Vest", category_id: "8", wholesale_price: "15", retail_price: "25.99", cost_before: "7", cost_after: "9" },
  { id: "48", article: "MMA-2111", name: "MMA Kit", category_id: "8", wholesale_price: "22", retail_price: "39.99", cost_before: "13", cost_after: "15" },
  { id: "49", article: "MTS-2121", name: "Muay Thai Shorts Mesh", category_id: "8", wholesale_price: "14", retail_price: "24.99", cost_before: "5", cost_after: "7" },
  { id: "50", article: "MTS-2122", name: "Muay Thai Shorts", category_id: "8", wholesale_price: "11", retail_price: "19.99", cost_before: "4", cost_after: "6" },
  { id: "51", article: "SB-2221", name: "Sports Bag", category_id: "9", wholesale_price: "35.99", retail_price: "59.99", cost_before: "11", cost_after: "21" },
  { id: "52", article: "SB-2222", name: "Sports Bags", category_id: "9", wholesale_price: "24", retail_price: "39.99", cost_before: "11", cost_after: "19" },
  { id: "54", article: "HCP-460", name: "Hoodie Track Suit   460gsm", category_id: "8", wholesale_price: "25.2", retail_price: "39.99", cost_before: "16", cost_after: "21" },
  { id: "55", article: "HCP-360", name: "Hoodie Track Suit  360gsm", category_id: "8", wholesale_price: "23", retail_price: "37.99", cost_before: "13", cost_after: "18" },
  { id: "56", article: "HCP-300", name: "Hoodie Track Suit   300gsm", category_id: "8", wholesale_price: "22", retail_price: "35.99", cost_before: "12", cost_after: "17" },
  { id: "57", article: "TSI-280", name: "T shirt Interlock P/C 80/20", category_id: "8", wholesale_price: "0", retail_price: "0", cost_before: "2.5", cost_after: "3" },
  { id: "58", article: "TSI-160", name: "T shirt Interlock  polyester", category_id: "8", wholesale_price: "2.5", retail_price: "5", cost_before: "1.2", cost_after: "1.5" },
  { id: "59", article: "TSJ-160", name: "T Shirt Jersey  C/P  65/35", category_id: "8", wholesale_price: "3", retail_price: "6", cost_before: "1.4", cost_after: "1.8" },
  { id: "60", article: "TSJ-180", name: "T Shirt Jersey  Cotton", category_id: "8", wholesale_price: "3.5", retail_price: "7", cost_before: "1.9", cost_after: "2.4" },
  { id: "61", article: "TSJ-200", name: "T Shirt Lecra Jersey", category_id: "8", wholesale_price: "3.5", retail_price: "7", cost_before: "1.9", cost_after: "2.9" },
  { id: "62", article: "KS-221", name: "Kick Shield S Leather", category_id: "10", wholesale_price: "35", retail_price: "49.99", cost_before: "10", cost_after: "25" },
  { id: "63", article: "KS-231", name: "Kick Shield S Leather pair", category_id: "10", wholesale_price: "0", retail_price: "0", cost_before: "9", cost_after: "0" },
  { id: "64", article: "KS-232", name: "Kick Shield  G Leather", category_id: "10", wholesale_price: "0", retail_price: "0", cost_before: "16", cost_after: "0" },
  { id: "65", article: "KBC-211", name: "Kick Boxing Chestguard", category_id: "11", wholesale_price: "0", retail_price: "0", cost_before: "9", cost_after: "0" },
  { id: "66", article: "MG-501", name: "MMA Gloves", category_id: "12", wholesale_price: "19", retail_price: "34.99", cost_before: "7", cost_after: "12" },
  { id: "67", article: "MSG-511", name: "MMA Shooter Gloves", category_id: "12", wholesale_price: "19.99", retail_price: "39.99", cost_before: "5", cost_after: "9" },
  { id: "68", article: "MSG-512", name: "MMA Shooter Gloves", category_id: "12", wholesale_price: "19.99", retail_price: "39.99", cost_before: "5", cost_after: "9" },
  { id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", category_id: "1", wholesale_price: "0", retail_price: "0", cost_before: "7", cost_after: "11" },
  { id: "70", article: "BGS-10114", name: "Boxing Gloves SuperX  OD design", category_id: "1", wholesale_price: "16", retail_price: "29.99", cost_before: "7", cost_after: "10" },
  { id: "71", article: "BGG-201111", name: "Boxing Gloves gold rex", category_id: "1", wholesale_price: "18", retail_price: "29.99", cost_before: "7", cost_after: "11" },
  { id: "72", article: "HGL-2023", name: "Head Guard Lead", category_id: "2", wholesale_price: "35", retail_price: "59", cost_before: "15", cost_after: "18" },
  { id: "73", article: "SPR-9041", name: "Strike Pad Round", category_id: "5", wholesale_price: "45", retail_price: "69.99", cost_before: "13", cost_after: "45" }
];

// Complete variant data from v_variants.csv
const variantData = [
  { id: "6", product_id: "6", article: "BGA-1012", name: "Boxing gloves amok", color: "Black", size: "10oz", quantity: "9" },
  { id: "7", product_id: "6", article: "BGA-1012", name: "Boxing gloves amok", color: "Black", size: "12oz", quantity: "10" },
  { id: "8", product_id: "6", article: "BGA-1012", name: "Boxing gloves amok", color: "Black", size: "14oz", quantity: "13" },
  { id: "9", product_id: "6", article: "BGA-1012", name: "Boxing gloves amok", color: "Black", size: "16oz", quantity: "8" },
  { id: "10", product_id: "7", article: "BGC-1011", name: "Boxing gloves ClassX", color: "Black", size: "10oz", quantity: "4" },
  { id: "11", product_id: "7", article: "BGC-1011", name: "Boxing gloves ClassX", color: "Black", size: "12oz", quantity: "4" },
  { id: "12", product_id: "7", article: "BGC-1011", name: "Boxing gloves ClassX", color: "Black", size: "14oz", quantity: "37" },
  { id: "13", product_id: "7", article: "BGC-1011", name: "Boxing gloves ClassX", color: "Black", size: "16oz", quantity: "18" },
  { id: "14", product_id: "8", article: "BGE-1013", name: "Boxing Gloves Endoor", color: "WHITE", size: "10oz", quantity: "0" },
  { id: "15", product_id: "8", article: "BGE-1013", name: "Boxing Gloves Endoor", color: "WHITE", size: "12oz", quantity: "0" },
  { id: "16", product_id: "8", article: "BGE-1013", name: "Boxing Gloves Endoor", color: "WHITE", size: "14oz", quantity: "0" },
  { id: "17", product_id: "8", article: "BGE-1013", name: "Boxing Gloves Endoor", color: "WHITE", size: "16oz", quantity: "0" },
  { id: "18", product_id: "8", article: "BGE-1013", name: "Boxing Gloves Endoor", color: "WHITE", size: "18oz", quantity: "0" },
  { id: "19", product_id: "8", article: "BGE-1013", name: "Boxing Gloves Endoor", color: "WHITE", size: "20oz", quantity: "0" },
  { id: "20", product_id: "9", article: "BGH-1015", name: "Boxing Gloves Horse", color: "RED", size: "10oz", quantity: "0" },
  { id: "21", product_id: "10", article: "BGK-1016", name: "Boxing Gloves Knock", color: "Black & Red", size: "10oz", quantity: "0" },
  { id: "22", product_id: "10", article: "BGK-1016", name: "Boxing Gloves Knock", color: "Black & Red", size: "12oz", quantity: "0" },
  { id: "23", product_id: "10", article: "BGK-1016", name: "Boxing Gloves Knock", color: "Black & Red", size: "14oz", quantity: "0" },
  { id: "24", product_id: "10", article: "BGK-1016", name: "Boxing Gloves Knock", color: "Black & Red", size: "16oz", quantity: "0" },
  { id: "25", product_id: "11", article: "BGI-1017", name: "Boxing Gloves Impact", color: "MAROON", size: "10oz", quantity: "0" },
  { id: "26", product_id: "11", article: "BGI-1017", name: "Boxing Gloves Impact", color: "MAROON", size: "12oz", quantity: "0" },
  { id: "27", product_id: "11", article: "BGI-1017", name: "Boxing Gloves Impact", color: "MAROON", size: "14oz", quantity: "0" },
  { id: "28", product_id: "11", article: "BGI-1017", name: "Boxing Gloves Impact", color: "MAROON", size: "16oz", quantity: "0" },
  { id: "29", product_id: "11", article: "BGI-1017", name: "Boxing Gloves Impact", color: "PURPLE", size: "10oz", quantity: "0" },
  { id: "30", product_id: "11", article: "BGI-1017", name: "Boxing Gloves Impact", color: "PURPLE", size: "12oz", quantity: "0" },
  { id: "31", product_id: "11", article: "BGI-1017", name: "Boxing Gloves Impact", color: "PURPLE", size: "14oz", quantity: "0" },
  { id: "32", product_id: "11", article: "BGI-1017", name: "Boxing Gloves Impact", color: "PURPLE", size: "16oz", quantity: "0" },
  { id: "33", product_id: "12", article: "BGB-1019", name: "Boxing Gloves BP", color: "GREEN", size: "10oz", quantity: "0" },
  { id: "34", product_id: "12", article: "BGB-1019", name: "Boxing Gloves BP", color: "GREEN", size: "12oz", quantity: "0" },
  { id: "35", product_id: "12", article: "BGB-1019", name: "Boxing Gloves BP", color: "GREEN", size: "14oz", quantity: "0" },
  { id: "36", product_id: "12", article: "BGB-1019", name: "Boxing Gloves BP", color: "GREEN", size: "16oz", quantity: "0" },
  { id: "37", product_id: "13", article: "HGB-2011", name: "Head Guard Brag", color: "WHITE & GOLD", size: "S/M", quantity: "0" },
  { id: "38", product_id: "13", article: "HGB-2011", name: "Head Guard Brag", color: "WHITE & GOLD", size: "L/XL", quantity: "0" },
  { id: "39", product_id: "13", article: "HGB-2011", name: "Head Guard Brag", color: "BLACK & GOLD", size: "S/M", quantity: "0" },
  { id: "40", product_id: "13", article: "HGB-2011", name: "Head Guard Brag", color: "BLACK & GOLD", size: "L/XL", quantity: "0" },
  { id: "41", product_id: "14", article: "BGV-1019", name: "Boxing Gloves Vexa", color: "PINK", size: "4oz", quantity: "0" },
  { id: "42", product_id: "14", article: "BGV-1019", name: "Boxing Gloves Vexa", color: "PINK", size: "6oz", quantity: "0" },
  { id: "43", product_id: "14", article: "BGV-1019", name: "Boxing Gloves Vexa", color: "PINK", size: "8oz", quantity: "0" },
  { id: "44", product_id: "14", article: "BGV-1019", name: "Boxing Gloves Vexa", color: "PINK", size: "10oz", quantity: "0" },
  { id: "45", product_id: "14", article: "BGV-1019", name: "Boxing Gloves Vexa", color: "PINK", size: "12oz", quantity: "0" },
  { id: "46", product_id: "14", article: "BGV-1019", name: "Boxing Gloves Vexa", color: "PINK", size: "14oz", quantity: "0" },
  { id: "47", product_id: "14", article: "BGV-1019", name: "Boxing Gloves Vexa", color: "PINK", size: "16oz", quantity: "0" },
  { id: "56", product_id: "16", article: "HGH-2015", name: "Head Guard Heed", color: "WHITE & GOLD", size: "S", quantity: "19" },
  { id: "57", product_id: "16", article: "HGH-2015", name: "Head Guard Heed", color: "WHITE & GOLD", size: "M", quantity: "38" },
  { id: "58", product_id: "16", article: "HGH-2015", name: "Head Guard Heed", color: "WHITE & GOLD", size: "L", quantity: "19" },
  { id: "59", product_id: "17", article: "GGP-2031", name: "Groin Guard Pro", color: "Black", size: "S", quantity: "0" },
  { id: "60", product_id: "17", article: "GGP-2031", name: "Groin Guard Pro", color: "Black", size: "M", quantity: "0" },
  { id: "61", product_id: "17", article: "GGP-2031", name: "Groin Guard Pro", color: "Black", size: "L", quantity: "0" },
  { id: "62", product_id: "17", article: "GGP-2031", name: "Groin Guard Pro", color: "Black", size: "XL", quantity: "0" },
  { id: "63", product_id: "18", article: "GGP-2032", name: "Groin Guard Pro", color: "BLACK & GOLD", size: "S", quantity: "0" },
  { id: "64", product_id: "18", article: "GGP-2032", name: "Groin Guard Pro", color: "BLACK & GOLD", size: "M", quantity: "0" },
  { id: "65", product_id: "18", article: "GGP-2032", name: "Groin Guard Pro", color: "BLACK & GOLD", size: "L", quantity: "0" },
  { id: "66", product_id: "18", article: "GGP-2032", name: "Groin Guard Pro", color: "BLACK & GOLD", size: "XL", quantity: "0" },
  { id: "67", product_id: "19", article: "CSM-2041", name: "Cup Supporter Metal", color: "Black", size: "S", quantity: "0" },
  { id: "68", product_id: "19", article: "CSM-2041", name: "Cup Supporter Metal", color: "Black", size: "M", quantity: "0" },
  { id: "69", product_id: "19", article: "CSM-2041", name: "Cup Supporter Metal", color: "Black", size: "L", quantity: "0" },
  { id: "70", product_id: "19", article: "CSM-2041", name: "Cup Supporter Metal", color: "Black & Red", size: "S", quantity: "0" },
  { id: "71", product_id: "19", article: "CSM-2041", name: "Cup Supporter Metal", color: "Black & Red", size: "M", quantity: "0" },
  { id: "72", product_id: "19", article: "CSM-2041", name: "Cup Supporter Metal", color: "Black & Red", size: "L", quantity: "0" },
  { id: "73", product_id: "20", article: "CSP-2042", name: "Cup Supporter Poly", color: "WHITE", size: "S", quantity: "0" },
  { id: "74", product_id: "20", article: "CSP-2042", name: "Cup Supporter Poly", color: "WHITE", size: "M", quantity: "0" },
  { id: "75", product_id: "20", article: "CSP-2042", name: "Cup Supporter Poly", color: "WHITE", size: "L", quantity: "0" },
  { id: "76", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "RED", size: "XXS", quantity: "0" },
  { id: "77", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "RED", size: "XS", quantity: "0" },
  { id: "78", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "RED", size: "S", quantity: "0" },
  { id: "79", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "RED", size: "M", quantity: "0" },
  { id: "80", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "RED", size: "L", quantity: "0" },
  { id: "81", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "RED", size: "XL", quantity: "0" },
  { id: "82", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "RED", size: "XXL", quantity: "0" },
  { id: "83", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "Blue", size: "XXS", quantity: "0" },
  { id: "84", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "Blue", size: "XS", quantity: "0" },
  { id: "85", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "Blue", size: "S", quantity: "0" },
  { id: "86", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "Blue", size: "M", quantity: "0" },
  { id: "87", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "Blue", size: "L", quantity: "0" },
  { id: "88", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "Blue", size: "XL", quantity: "0" },
  { id: "89", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "Blue", size: "XXL", quantity: "0" },
  { id: "90", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "Black", size: "XXS", quantity: "0" },
  { id: "91", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "Black", size: "XS", quantity: "0" },
  { id: "92", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "Black", size: "S", quantity: "0" },
  { id: "93", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "Black", size: "M", quantity: "0" },
  { id: "94", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "Black", size: "L", quantity: "0" },
  { id: "95", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "Black", size: "XL", quantity: "0" },
  { id: "96", product_id: "21", article: "SPP-2051", name: "Shin instep PRO", color: "Black", size: "XXL", quantity: "0" },
  { id: "97", product_id: "22", article: "SPT-2052", name: "Shin Instep Training", color: "WHITE", size: "XS", quantity: "0" },
  { id: "98", product_id: "22", article: "SPT-2052", name: "Shin Instep Training", color: "WHITE", size: "S", quantity: "0" },
  { id: "99", product_id: "22", article: "SPT-2052", name: "Shin Instep Training", color: "WHITE", size: "M", quantity: "0" },
  { id: "100", product_id: "22", article: "SPT-2052", name: "Shin Instep Training", color: "WHITE", size: "L", quantity: "0" },
  { id: "101", product_id: "22", article: "SPT-2052", name: "Shin Instep Training", color: "WHITE", size: "XL", quantity: "0" },
  { id: "102", product_id: "22", article: "SPT-2052", name: "Shin Instep Training", color: "WHITE", size: "XXL", quantity: "0" },
  { id: "103", product_id: "22", article: "SPT-2052", name: "Shin Instep Training", color: "Black", size: "XS", quantity: "0" },
  { id: "104", product_id: "22", article: "SPT-2052", name: "Shin Instep Training", color: "Black", size: "S", quantity: "0" },
  { id: "105", product_id: "22", article: "SPT-2052", name: "Shin Instep Training", color: "Black", size: "M", quantity: "0" },
  { id: "106", product_id: "22", article: "SPT-2052", name: "Shin Instep Training", color: "Black", size: "L", quantity: "0" },
  { id: "107", product_id: "22", article: "SPT-2052", name: "Shin Instep Training", color: "Black", size: "XL", quantity: "0" },
  { id: "108", product_id: "22", article: "SPT-2052", name: "Shin Instep Training", color: "Black", size: "XXL", quantity: "0" },
  { id: "109", product_id: "23", article: "AMR-8011", name: "Focus Mitt React", color: "Black & Red", size: "standard", quantity: "0" },
  { id: "110", product_id: "24", article: "FMS-8012", name: "Focus Mitt Smart", color: "RED", size: "standard", quantity: "12" },
  { id: "111", product_id: "24", article: "FMS-8012", name: "Focus Mitt Smart", color: "Blue", size: "standard", quantity: "11" },
  { id: "112", product_id: "24", article: "FMS-8012", name: "Focus Mitt Smart", color: "Black", size: "standard", quantity: "0" },
  { id: "113", product_id: "25", article: "FME-8013", name: "Focus Mitt Elastic", color: "RED", size: "standard", quantity: "0" },
  { id: "114", product_id: "25", article: "FME-8013", name: "Focus Mitt Elastic", color: "Blue", size: "standard", quantity: "0" },
  { id: "115", product_id: "25", article: "FME-8013", name: "Focus Mitt Elastic", color: "Black", size: "standard", quantity: "8" },
  { id: "116", product_id: "26", article: "FMA-8014", name: "Focs Mitt Arch", color: "WHITE", size: "standard", quantity: "0" },
  { id: "118", product_id: "28", article: "BP-9011", name: "Body Protector Coaching Guard", color: "RED", size: "standard", quantity: "0" },
  { id: "119", product_id: "28", article: "BP-9011", name: "Body Protector Coaching Guard", color: "Blue", size: "standard", quantity: "0" },
  { id: "120", product_id: "28", article: "BP-9011", name: "Body Protector Coaching Guard", color: "Black", size: "standard", quantity: "0" },
  { id: "122", product_id: "30", article: "TP-9018", name: "Thigh Pads", color: "Black", size: "standard", quantity: "0" },
  { id: "123", product_id: "31", article: "CP-9021", name: "Coaching Paddle", color: "RED", size: "standard", quantity: "0" },
  { id: "124", product_id: "31", article: "CP-9021", name: "Coaching Paddle", color: "Blue", size: "standard", quantity: "0" },
  { id: "125", product_id: "31", article: "CP-9021", name: "Coaching Paddle", color: "Black", size: "standard", quantity: "0" },
  { id: "126", product_id: "32", article: "CP-9022", name: "Coaching Paddle", color: "RED", size: "standard", quantity: "0" },
  { id: "127", product_id: "32", article: "CP-9022", name: "Coaching Paddle", color: "Blue", size: "standard", quantity: "0" },
  { id: "128", product_id: "32", article: "CP-9022", name: "Coaching Paddle", color: "Black", size: "standard", quantity: "0" },
  { id: "129", product_id: "33", article: "CS-9031", name: "Coaching Stick", color: "RED", size: "standard", quantity: "0" },
  { id: "130", product_id: "33", article: "CS-9031", name: "Coaching Stick", color: "Blue", size: "standard", quantity: "0" },
  { id: "131", product_id: "33", article: "CS-9031", name: "Coaching Stick", color: "Black", size: "standard", quantity: "0" },
  { id: "132", product_id: "34", article: "CS-9032", name: "Coaching Stick", color: "RED", size: "standard", quantity: "0" },
  { id: "133", product_id: "34", article: "CS-9032", name: "Coaching Stick", color: "Blue", size: "standard", quantity: "0" },
  { id: "134", product_id: "34", article: "CS-9032", name: "Coaching Stick", color: "Black", size: "standard", quantity: "0" },
  { id: "136", product_id: "36", article: "SPR-9042", name: "Strike Pad Round", color: "BLACK & GOLD", size: "standard", quantity: "0" },
  { id: "137", product_id: "37", article: "WP-9051", name: "Wall Pad", color: "Black & Red", size: "standard", quantity: "0" },
  { id: "138", product_id: "38", article: "WP-9052", name: "Wall Pad", color: "Black & Red", size: "standard", quantity: "0" },
  { id: "139", product_id: "39", article: "WP-9053", name: "Wall Pad", color: "Black & Red", size: "standard", quantity: "0" },
  { id: "140", product_id: "40", article: "SB-9061", name: "Speed Ball", color: "Black & White", size: "M", quantity: "0" },
  { id: "141", product_id: "41", article: "FSB-9062", name: "Floor to Ceiling Ball pear", color: "Black & White", size: "M", quantity: "0" },
  { id: "142", product_id: "42", article: "FSRB-9063", name: "Floor to Celling Ball Round", color: "Black & White", size: "M", quantity: "0" },
  { id: "143", product_id: "43", article: "FSDB-9064", name: "Floor to Celling Double Ball", color: "Black & White", size: "standard", quantity: "0" },
  { id: "144", product_id: "44", article: "SBP-9071", name: "Speed Ball Platform Heavy", color: "Natural", size: "standard", quantity: "0" },
  { id: "145", product_id: "44", article: "SBP-9071", name: "Speed Ball Platform Heavy", color: "Natural", size: "60x60", quantity: "0" },
  { id: "146", product_id: "45", article: "SBP-9072", name: "Speed Ball Platform Medium", color: "Natural", size: "60x60", quantity: "0" },
  { id: "147", product_id: "46", article: "Spb-9073", name: "Speed Ball Platform Light", color: "Natural", size: "60x60", quantity: "0" },
  { id: "148", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Black", size: "XXS", quantity: "0" },
  { id: "149", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Black", size: "XS", quantity: "0" },
  { id: "150", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Black", size: "S", quantity: "0" },
  { id: "151", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Black", size: "M", quantity: "0" },
  { id: "152", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Black", size: "L", quantity: "0" },
  { id: "153", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Black", size: "XL", quantity: "0" },
  { id: "154", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Blue", size: "XXS", quantity: "0" },
  { id: "155", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Blue", size: "XS", quantity: "0" },
  { id: "156", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Blue", size: "S", quantity: "0" },
  { id: "157", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Blue", size: "M", quantity: "0" },
  { id: "158", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Blue", size: "L", quantity: "0" },
  { id: "159", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Blue", size: "XL", quantity: "0" },
  { id: "160", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Grey", size: "XXS", quantity: "0" },
  { id: "161", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Grey", size: "XS", quantity: "0" },
  { id: "162", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Grey", size: "S", quantity: "0" },
  { id: "163", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Grey", size: "M", quantity: "0" },
  { id: "164", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Grey", size: "L", quantity: "0" },
  { id: "165", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Grey", size: "XL", quantity: "0" },
  { id: "166", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "MAROON", size: "XXS", quantity: "0" },
  { id: "167", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "MAROON", size: "XS", quantity: "0" },
  { id: "168", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "MAROON", size: "S", quantity: "0" },
  { id: "169", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "MAROON", size: "M", quantity: "0" },
  { id: "170", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "MAROON", size: "L", quantity: "0" },
  { id: "171", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "MAROON", size: "XL", quantity: "0" },
  { id: "172", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Navy", size: "XXS", quantity: "0" },
  { id: "173", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Navy", size: "XS", quantity: "0" },
  { id: "174", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Navy", size: "S", quantity: "0" },
  { id: "175", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Navy", size: "M", quantity: "0" },
  { id: "176", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Navy", size: "L", quantity: "0" },
  { id: "177", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Navy", size: "XL", quantity: "0" },
  { id: "178", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "RED", size: "XXS", quantity: "0" },
  { id: "179", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "RED", size: "XS", quantity: "0" },
  { id: "180", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "RED", size: "S", quantity: "0" },
  { id: "181", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "RED", size: "M", quantity: "0" },
  { id: "182", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "RED", size: "L", quantity: "0" },
  { id: "183", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "RED", size: "XL", quantity: "0" },
  { id: "184", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Yellow", size: "XXS", quantity: "0" },
  { id: "185", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Yellow", size: "XS", quantity: "0" },
  { id: "186", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Yellow", size: "S", quantity: "0" },
  { id: "187", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Yellow", size: "M", quantity: "0" },
  { id: "188", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Yellow", size: "L", quantity: "0" },
  { id: "189", product_id: "47", article: "BSV-2101", name: "Boxing Short & Vest", color: "Yellow", size: "XL", quantity: "0" },
  { id: "190", product_id: "48", article: "MMA-2111", name: "MMA Kit", color: "Assorted", size: "XXS", quantity: "0" },
  { id: "191", product_id: "48", article: "MMA-2111", name: "MMA Kit", color: "Assorted", size: "XS", quantity: "0" },
  { id: "192", product_id: "48", article: "MMA-2111", name: "MMA Kit", color: "Assorted", size: "S", quantity: "0" },
  { id: "193", product_id: "48", article: "MMA-2111", name: "MMA Kit", color: "Assorted", size: "M", quantity: "0" },
  { id: "194", product_id: "48", article: "MMA-2111", name: "MMA Kit", color: "Assorted", size: "L", quantity: "0" },
  { id: "195", product_id: "48", article: "MMA-2111", name: "MMA Kit", color: "Assorted", size: "XL", quantity: "0" },
  { id: "196", product_id: "48", article: "MMA-2111", name: "MMA Kit", color: "Assorted", size: "XXL", quantity: "0" },
  { id: "197", product_id: "49", article: "MTS-2121", name: "Muay Thai Shorts Mesh", color: "Assorted", size: "XXS", quantity: "0" },
  { id: "198", product_id: "49", article: "MTS-2121", name: "Muay Thai Shorts Mesh", color: "Assorted", size: "XS", quantity: "0" },
  { id: "199", product_id: "49", article: "MTS-2121", name: "Muay Thai Shorts Mesh", color: "Assorted", size: "S", quantity: "0" },
  { id: "200", product_id: "49", article: "MTS-2121", name: "Muay Thai Shorts Mesh", color: "Assorted", size: "M", quantity: "0" },
  { id: "201", product_id: "49", article: "MTS-2121", name: "Muay Thai Shorts Mesh", color: "Assorted", size: "L", quantity: "0" },
  { id: "202", product_id: "49", article: "MTS-2121", name: "Muay Thai Shorts Mesh", color: "Assorted", size: "XL", quantity: "0" },
  { id: "203", product_id: "49", article: "MTS-2121", name: "Muay Thai Shorts Mesh", color: "Assorted", size: "XXL", quantity: "0" },
  { id: "204", product_id: "50", article: "MTS-2122", name: "Muay Thai Shorts", color: "Assorted", size: "XXS", quantity: "0" },
  { id: "205", product_id: "50", article: "MTS-2122", name: "Muay Thai Shorts", color: "Assorted", size: "XS", quantity: "0" },
  { id: "206", product_id: "50", article: "MTS-2122", name: "Muay Thai Shorts", color: "Assorted", size: "S", quantity: "0" },
  { id: "207", product_id: "50", article: "MTS-2122", name: "Muay Thai Shorts", color: "Assorted", size: "M", quantity: "0" },
  { id: "208", product_id: "50", article: "MTS-2122", name: "Muay Thai Shorts", color: "Assorted", size: "L", quantity: "0" },
  { id: "209", product_id: "50", article: "MTS-2122", name: "Muay Thai Shorts", color: "Assorted", size: "XL", quantity: "0" },
  { id: "210", product_id: "50", article: "MTS-2122", name: "Muay Thai Shorts", color: "Assorted", size: "XXL", quantity: "0" },
  { id: "211", product_id: "51", article: "SB-2221", name: "Sports Bag", color: "RED", size: "standard", quantity: "0" },
  { id: "212", product_id: "51", article: "SB-2221", name: "Sports Bag", color: "Blue", size: "standard", quantity: "0" },
  { id: "213", product_id: "52", article: "SB-2222", name: "Sports Bags", color: "Black", size: "standard", quantity: "0" },
  { id: "214", product_id: "52", article: "SB-2222", name: "Sports Bags", color: "RED", size: "standard", quantity: "0" },
  { id: "215", product_id: "52", article: "SB-2222", name: "Sports Bags", color: "Blue", size: "standard", quantity: "0" },
  { id: "222", product_id: "54", article: "HCP-460", name: "Hoodie Track Suit   460gsm", color: "Assorted", size: "XS", quantity: "0" },
  { id: "223", product_id: "54", article: "HCP-460", name: "Hoodie Track Suit   460gsm", color: "Assorted", size: "S", quantity: "0" },
  { id: "224", product_id: "54", article: "HCP-460", name: "Hoodie Track Suit   460gsm", color: "Assorted", size: "M", quantity: "0" },
  { id: "225", product_id: "54", article: "HCP-460", name: "Hoodie Track Suit   460gsm", color: "Assorted", size: "L", quantity: "0" },
  { id: "226", product_id: "54", article: "HCP-460", name: "Hoodie Track Suit   460gsm", color: "Assorted", size: "XL", quantity: "0" },
  { id: "227", product_id: "54", article: "HCP-460", name: "Hoodie Track Suit   460gsm", color: "Assorted", size: "XXL", quantity: "0" },
  { id: "228", product_id: "55", article: "HCP-360", name: "Hoodie Track Suit  360gsm", color: "Assorted", size: "XS", quantity: "0" },
  { id: "229", product_id: "55", article: "HCP-360", name: "Hoodie Track Suit  360gsm", color: "Assorted", size: "S", quantity: "0" },
  { id: "230", product_id: "55", article: "HCP-360", name: "Hoodie Track Suit  360gsm", color: "Assorted", size: "M", quantity: "0" },
  { id: "231", product_id: "55", article: "HCP-360", name: "Hoodie Track Suit  360gsm", color: "Assorted", size: "L", quantity: "0" },
  { id: "232", product_id: "55", article: "HCP-360", name: "Hoodie Track Suit  360gsm", color: "Assorted", size: "XL", quantity: "0" },
  { id: "233", product_id: "55", article: "HCP-360", name: "Hoodie Track Suit  360gsm", color: "Assorted", size: "XXL", quantity: "0" },
  { id: "234", product_id: "56", article: "HCP-300", name: "Hoodie Track Suit   300gsm", color: "Assorted", size: "XS", quantity: "0" },
  { id: "235", product_id: "56", article: "HCP-300", name: "Hoodie Track Suit   300gsm", color: "Assorted", size: "S", quantity: "0" },
  { id: "236", product_id: "56", article: "HCP-300", name: "Hoodie Track Suit   300gsm", color: "Assorted", size: "M", quantity: "0" },
  { id: "237", product_id: "56", article: "HCP-300", name: "Hoodie Track Suit   300gsm", color: "Assorted", size: "L", quantity: "0" },
  { id: "238", product_id: "56", article: "HCP-300", name: "Hoodie Track Suit   300gsm", color: "Assorted", size: "XL", quantity: "0" },
  { id: "239", product_id: "56", article: "HCP-300", name: "Hoodie Track Suit   300gsm", color: "Assorted", size: "XXL", quantity: "0" },
  { id: "240", product_id: "57", article: "TSI-280", name: "T shirt Interlock P/C 80/20", color: "Assorted", size: "XS", quantity: "0" },
  { id: "241", product_id: "57", article: "TSI-280", name: "T shirt Interlock P/C 80/20", color: "Assorted", size: "S", quantity: "0" },
  { id: "242", product_id: "57", article: "TSI-280", name: "T shirt Interlock P/C 80/20", color: "Assorted", size: "M", quantity: "0" },
  { id: "243", product_id: "57", article: "TSI-280", name: "T shirt Interlock P/C 80/20", color: "Assorted", size: "L", quantity: "0" },
  { id: "244", product_id: "57", article: "TSI-280", name: "T shirt Interlock P/C 80/20", color: "Assorted", size: "XL", quantity: "0" },
  { id: "245", product_id: "57", article: "TSI-280", name: "T shirt Interlock P/C 80/20", color: "Assorted", size: "XXL", quantity: "0" },
  { id: "246", product_id: "58", article: "TSI-160", name: "T shirt Interlock  polyester", color: "Assorted", size: "XS", quantity: "0" },
  { id: "247", product_id: "58", article: "TSI-160", name: "T shirt Interlock  polyester", color: "Assorted", size: "S", quantity: "0" },
  { id: "248", product_id: "58", article: "TSI-160", name: "T shirt Interlock  polyester", color: "Assorted", size: "M", quantity: "0" },
  { id: "249", product_id: "58", article: "TSI-160", name: "T shirt Interlock  polyester", color: "Assorted", size: "L", quantity: "0" },
  { id: "250", product_id: "58", article: "TSI-160", name: "T shirt Interlock  polyester", color: "Assorted", size: "XL", quantity: "0" },
  { id: "251", product_id: "58", article: "TSI-160", name: "T shirt Interlock  polyester", color: "Assorted", size: "XXL", quantity: "0" },
  { id: "252", product_id: "59", article: "TSJ-160", name: "T Shirt Jersey  C/P  65/35", color: "Assorted", size: "XS", quantity: "0" },
  { id: "253", product_id: "59", article: "TSJ-160", name: "T Shirt Jersey  C/P  65/35", color: "Assorted", size: "S", quantity: "0" },
  { id: "254", product_id: "59", article: "TSJ-160", name: "T Shirt Jersey  C/P  65/35", color: "Assorted", size: "M", quantity: "0" },
  { id: "255", product_id: "59", article: "TSJ-160", name: "T Shirt Jersey  C/P  65/35", color: "Assorted", size: "L", quantity: "0" },
  { id: "256", product_id: "59", article: "TSJ-160", name: "T Shirt Jersey  C/P  65/35", color: "Assorted", size: "XL", quantity: "0" },
  { id: "257", product_id: "59", article: "TSJ-160", name: "T Shirt Jersey  C/P  65/35", color: "Assorted", size: "XXL", quantity: "0" },
  { id: "258", product_id: "60", article: "TSJ-180", name: "T Shirt Jersey  Cotton", color: "Assorted", size: "XS", quantity: "0" },
  { id: "259", product_id: "60", article: "TSJ-180", name: "T Shirt Jersey  Cotton", color: "Assorted", size: "S", quantity: "0" },
  { id: "260", product_id: "60", article: "TSJ-180", name: "T Shirt Jersey  Cotton", color: "Assorted", size: "M", quantity: "0" },
  { id: "261", product_id: "60", article: "TSJ-180", name: "T Shirt Jersey  Cotton", color: "Assorted", size: "L", quantity: "0" },
  { id: "262", product_id: "60", article: "TSJ-180", name: "T Shirt Jersey  Cotton", color: "Assorted", size: "XL", quantity: "0" },
  { id: "263", product_id: "60", article: "TSJ-180", name: "T Shirt Jersey  Cotton", color: "Assorted", size: "XXL", quantity: "0" },
  { id: "264", product_id: "61", article: "TSJ-200", name: "T Shirt Lecra Jersey", color: "Assorted", size: "XS", quantity: "0" },
  { id: "265", product_id: "61", article: "TSJ-200", name: "T Shirt Lecra Jersey", color: "Assorted", size: "S", quantity: "0" },
  { id: "266", product_id: "61", article: "TSJ-200", name: "T Shirt Lecra Jersey", color: "Assorted", size: "M", quantity: "0" },
  { id: "267", product_id: "61", article: "TSJ-200", name: "T Shirt Lecra Jersey", color: "Assorted", size: "L", quantity: "0" },
  { id: "268", product_id: "61", article: "TSJ-200", name: "T Shirt Lecra Jersey", color: "Assorted", size: "XL", quantity: "0" },
  { id: "269", product_id: "61", article: "TSJ-200", name: "T Shirt Lecra Jersey", color: "Assorted", size: "XXL", quantity: "0" },
  { id: "270", product_id: "62", article: "KS-221", name: "Kick Shield S Leather", color: "Assorted", size: "L", quantity: "0" },
  { id: "271", product_id: "63", article: "KS-231", name: "Kick Shield S Leather pair", color: "Assorted", size: "S", quantity: "0" },
  { id: "272", product_id: "64", article: "KS-232", name: "Kick Shield  G Leather", color: "Assorted", size: "standard", quantity: "0" },
  { id: "273", product_id: "65", article: "KBC-211", name: "Kick Boxing Chestguard", color: "Assorted", size: "XXS", quantity: "0" },
  { id: "274", product_id: "65", article: "KBC-211", name: "Kick Boxing Chestguard", color: "Assorted", size: "XS", quantity: "0" },
  { id: "275", product_id: "65", article: "KBC-211", name: "Kick Boxing Chestguard", color: "Assorted", size: "S", quantity: "0" },
  { id: "276", product_id: "65", article: "KBC-211", name: "Kick Boxing Chestguard", color: "Assorted", size: "M", quantity: "0" },
  { id: "277", product_id: "65", article: "KBC-211", name: "Kick Boxing Chestguard", color: "Assorted", size: "L", quantity: "0" },
  { id: "278", product_id: "65", article: "KBC-211", name: "Kick Boxing Chestguard", color: "Assorted", size: "XL", quantity: "0" },
  { id: "279", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "Blue", size: "XXS", quantity: "0" },
  { id: "280", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "Blue", size: "XS", quantity: "0" },
  { id: "281", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "Blue", size: "S", quantity: "0" },
  { id: "282", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "Blue", size: "M", quantity: "0" },
  { id: "283", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "Blue", size: "L", quantity: "0" },
  { id: "284", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "Blue", size: "XL", quantity: "0" },
  { id: "285", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "GOLDEN", size: "XXS", quantity: "0" },
  { id: "286", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "GOLDEN", size: "XS", quantity: "0" },
  { id: "287", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "GOLDEN", size: "S", quantity: "0" },
  { id: "288", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "GOLDEN", size: "M", quantity: "0" },
  { id: "289", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "GOLDEN", size: "L", quantity: "0" },
  { id: "290", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "GOLDEN", size: "XL", quantity: "0" },
  { id: "291", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "RED", size: "XXS", quantity: "0" },
  { id: "292", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "RED", size: "XS", quantity: "0" },
  { id: "293", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "RED", size: "S", quantity: "0" },
  { id: "294", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "RED", size: "M", quantity: "0" },
  { id: "295", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "RED", size: "L", quantity: "0" },
  { id: "296", product_id: "66", article: "MG-501", name: "MMA Gloves", color: "RED", size: "XL", quantity: "0" },
  { id: "297", product_id: "67", article: "MSG-511", name: "MMA Shooter Gloves", color: "RED", size: "XXS", quantity: "0" },
  { id: "298", product_id: "67", article: "MSG-511", name: "MMA Shooter Gloves", color: "RED", size: "XS", quantity: "0" },
  { id: "299", product_id: "67", article: "MSG-511", name: "MMA Shooter Gloves", color: "RED", size: "S", quantity: "0" },
  { id: "300", product_id: "67", article: "MSG-511", name: "MMA Shooter Gloves", color: "RED", size: "M", quantity: "0" },
  { id: "301", product_id: "67", article: "MSG-511", name: "MMA Shooter Gloves", color: "RED", size: "L", quantity: "0" },
  { id: "302", product_id: "67", article: "MSG-511", name: "MMA Shooter Gloves", color: "RED", size: "XL", quantity: "0" },
  { id: "303", product_id: "67", article: "MSG-511", name: "MMA Shooter Gloves", color: "RED", size: "XXL", quantity: "0" },
  { id: "304", product_id: "68", article: "MSG-512", name: "MMA Shooter Gloves", color: "WHITE & GOLD", size: "XXS", quantity: "0" },
  { id: "305", product_id: "68", article: "MSG-512", name: "MMA Shooter Gloves", color: "WHITE & GOLD", size: "XS", quantity: "0" },
  { id: "306", product_id: "68", article: "MSG-512", name: "MMA Shooter Gloves", color: "WHITE & GOLD", size: "S", quantity: "0" },
  { id: "307", product_id: "68", article: "MSG-512", name: "MMA Shooter Gloves", color: "WHITE & GOLD", size: "M", quantity: "0" },
  { id: "308", product_id: "68", article: "MSG-512", name: "MMA Shooter Gloves", color: "WHITE & GOLD", size: "L", quantity: "0" },
  { id: "309", product_id: "68", article: "MSG-512", name: "MMA Shooter Gloves", color: "WHITE & GOLD", size: "XL", quantity: "0" },
  { id: "310", product_id: "68", article: "MSG-512", name: "MMA Shooter Gloves", color: "WHITE & GOLD", size: "XXL", quantity: "0" },
  // Continue with all the other variants...
  { id: "311", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & GOLD", size: "4oz", quantity: "57" },
  { id: "312", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & GOLD", size: "6oz", quantity: "59" },
  { id: "313", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & GOLD", size: "8oz", quantity: "70" },
  { id: "314", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & GOLD", size: "10oz", quantity: "71" },
  { id: "315", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & GOLD", size: "12oz", quantity: "72" },
  { id: "316", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & GOLD", size: "14oz", quantity: "74" },
  { id: "317", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & GOLD", size: "16oz", quantity: "59" },
  { id: "318", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & BLUE", size: "4oz", quantity: "0" },
  { id: "319", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & BLUE", size: "6oz", quantity: "14" },
  { id: "320", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & BLUE", size: "8oz", quantity: "6" },
  { id: "321", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & BLUE", size: "10oz", quantity: "12" },
  { id: "322", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & BLUE", size: "12oz", quantity: "9" },
  { id: "323", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & BLUE", size: "14oz", quantity: "6" },
  { id: "324", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & BLUE", size: "16oz", quantity: "11" },
  { id: "325", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & RED", size: "4oz", quantity: "14" },
  { id: "326", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & RED", size: "6oz", quantity: "12" },
  { id: "327", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & RED", size: "8oz", quantity: "6" },
  { id: "328", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & RED", size: "10oz", quantity: "13" },
  { id: "329", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & RED", size: "12oz", quantity: "21" },
  { id: "330", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & RED", size: "14oz", quantity: "21" },
  { id: "331", product_id: "69", article: "BGS-1014", name: "Boxing Gloves SuperX", color: "WHITE & RED", size: "16oz", quantity: "18" },
  { id: "332", product_id: "70", article: "BGS-10114", name: "Boxing Gloves SuperX  OD design", color: "Blue", size: "8oz", quantity: "17" },
  { id: "333", product_id: "70", article: "BGS-10114", name: "Boxing Gloves SuperX  OD design", color: "Blue", size: "10oz", quantity: "95" },
  { id: "334", product_id: "70", article: "BGS-10114", name: "Boxing Gloves SuperX  OD design", color: "RED", size: "8oz", quantity: "27" },
  { id: "335", product_id: "70", article: "BGS-10114", name: "Boxing Gloves SuperX  OD design", color: "RED", size: "10oz", quantity: "60" },
  { id: "336", product_id: "70", article: "BGS-10114", name: "Boxing Gloves SuperX  OD design", color: "Black", size: "8oz", quantity: "21" },
  { id: "337", product_id: "70", article: "BGS-10114", name: "Boxing Gloves SuperX  OD design", color: "Black", size: "10oz", quantity: "63" },
  { id: "338", product_id: "71", article: "BGG-201111", name: "Boxing Gloves gold rex", color: "BLACK & GOLD", size: "12oz", quantity: "60" },
  { id: "339", product_id: "72", article: "HGL-2023", name: "Head Guard Lead", color: "RED", size: "S", quantity: "5" },
  { id: "340", product_id: "72", article: "HGL-2023", name: "Head Guard Lead", color: "RED", size: "M", quantity: "0" },
  { id: "341", product_id: "72", article: "HGL-2023", name: "Head Guard Lead", color: "RED", size: "L", quantity: "5" },
  { id: "342", product_id: "72", article: "HGL-2023", name: "Head Guard Lead", color: "RED", size: "XL", quantity: "0" },
  { id: "343", product_id: "72", article: "HGL-2023", name: "Head Guard Lead", color: "Blue", size: "S", quantity: "5" },
  { id: "344", product_id: "72", article: "HGL-2023", name: "Head Guard Lead", color: "Blue", size: "M", quantity: "10" },
  { id: "345", product_id: "72", article: "HGL-2023", name: "Head Guard Lead", color: "Blue", size: "L", quantity: "0" },
  { id: "346", product_id: "72", article: "HGL-2023", name: "Head Guard Lead", color: "Blue", size: "XL", quantity: "5" },
  { id: "347", product_id: "72", article: "HGL-2023", name: "Head Guard Lead", color: "Black", size: "S", quantity: "5" },
  { id: "348", product_id: "72", article: "HGL-2023", name: "Head Guard Lead", color: "Black", size: "M", quantity: "5" },
  { id: "349", product_id: "72", article: "HGL-2023", name: "Head Guard Lead", color: "Black", size: "L", quantity: "0" },
  { id: "350", product_id: "72", article: "HGL-2023", name: "Head Guard Lead", color: "Black", size: "XL", quantity: "0" },
  { id: "351", product_id: "73", article: "SPR-9041", name: "Strike Pad Round", color: "Black", size: "S", quantity: "5" },
  { id: "352", product_id: "73", article: "SPR-9041", name: "Strike Pad Round", color: "Black", size: "M", quantity: "14" },
  { id: "353", product_id: "73", article: "SPR-9041", name: "Strike Pad Round", color: "Black", size: "L", quantity: "1" }
];

// Generate complete product list from CSV data
export const csvMigratedProducts: Product[] = productData.map(product => {
  const productVariants = variantData
    .filter(v => v.product_id === product.id)
    .map(variant => ({
      id: `variant-${variant.id}`,
      productId: `prod-${product.id}`,
      sku: `${variant.article}-${variant.color}-${variant.size}`,
      attributes: { 
        Size: variant.size, 
        Color: variant.color
      },
      qty: parseInt(variant.quantity) || 0
    }));

  const wholesale = parseFloat(product.wholesale_price) || 0;
  const retail = parseFloat(product.retail_price) || 0;
  const club = retail > 0 ? Math.round(retail * 0.85 * 100) / 100 : 0;

  return {
    id: `prod-${product.id}`,
    article: product.article,
    title: product.name,
    category: categoryMap[product.category_id] || 'Uncategorized',
    brand: assignBrand(parseInt(product.id)),
    taxable: true,
    attributes: productVariants.length > 0 ? ['Size', 'Color'] : [],
    mediaMain: undefined,
    archived: false,
    wholesale,
    retail,
    club,
    costBefore: parseFloat(product.cost_before) || 0,
    costAfter: parseFloat(product.cost_after) || 0,
    variants: productVariants,
    createdAt: new Date(),
    updatedAt: new Date()
  };
});

export const csvMigrationMetadata = {
  totalProducts: csvMigratedProducts.length,
  totalCategories: Object.keys(categoryMap).length,
  totalVariants: csvMigratedProducts.reduce((sum, product) => sum + product.variants.length, 0),
  brandDistribution: {
    greenhil: csvMigratedProducts.filter(p => p.brand === 'greenhil').length,
    harican: csvMigratedProducts.filter(p => p.brand === 'harican').length,
    byko: csvMigratedProducts.filter(p => p.brand === 'byko').length,
  },
  categoryDistribution: csvMigratedProducts.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>),
  migrationDate: new Date().toISOString(),
  source: 'CSV Files - Complete Import',
  status: 'COMPLETE - All Products with Full Variant Data'
};
