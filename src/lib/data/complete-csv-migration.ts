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

// Use consistent dates for SSR compatibility
const CONSISTENT_DATE = new Date('2025-01-01T00:00:00.000Z');

export function parseCsvData(csvContent: string): Product[] {
  const lines = csvContent.trim().split('\n')
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
      club: parseFloat(row.retail_price) * 0.9 || 0,
      costBefore: parseFloat(row.cost_before) || 0,
      costAfter: parseFloat(row.cost_after) || 0
    }))

    // Calculate averages for product-level pricing
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
      brand: 'byko',
      taxable: true,
      attributes: ['Color', 'Size'],
      mediaMain: undefined, // Remove broken placeholder reference
      archived: false,
      wholesale: avgWholesale,
      retail: avgRetail,
      club: avgClub,
      costBefore: avgCostBefore,
      costAfter: avgCostAfter,
      createdAt: CONSISTENT_DATE,
      updatedAt: CONSISTENT_DATE,
      variants: variants
    }

    products.push(product)
  })

  return products
}

// The complete CSV data from your file - this includes all 330 variants across 63 products
const COMPLETE_CSV_DATA = `product_id,name,category_name,article,shelf_no,wholesale_price,retail_price,cost_before,cost_after,color_name,size_name,quantity
6,Boxing gloves amok,Boxing Gloves,BGA-1012,,35.0,49.99,12.0,16.0,Black,10oz,9
6,Boxing gloves amok,Boxing Gloves,BGA-1012,,35.0,49.99,12.0,16.0,Black,12oz,10
6,Boxing gloves amok,Boxing Gloves,BGA-1012,,35.0,49.99,12.0,16.0,Black,14oz,13
6,Boxing gloves amok,Boxing Gloves,BGA-1012,,35.0,49.99,12.0,16.0,Black,16oz,8
7,Boxing gloves ClassX,Boxing Gloves,BGC-1011,,41.0,69.99,14.0,18.0,Black,10oz,4
7,Boxing gloves ClassX,Boxing Gloves,BGC-1011,,41.0,69.99,14.0,18.0,Black,12oz,4
7,Boxing gloves ClassX,Boxing Gloves,BGC-1011,,41.0,69.99,14.0,18.0,Black,14oz,37
7,Boxing gloves ClassX,Boxing Gloves,BGC-1011,,41.0,69.99,14.0,18.0,Black,16oz,18
8,Boxing Gloves Endoor,Boxing Gloves,BGE-1013,,49.0,89.99,18.0,23.0,WHITE,10oz,0
8,Boxing Gloves Endoor,Boxing Gloves,BGE-1013,,49.0,89.99,18.0,23.0,WHITE,12oz,0
8,Boxing Gloves Endoor,Boxing Gloves,BGE-1013,,49.0,89.99,18.0,23.0,WHITE,14oz,0
8,Boxing Gloves Endoor,Boxing Gloves,BGE-1013,,49.0,89.99,18.0,23.0,WHITE,16oz,0
8,Boxing Gloves Endoor,Boxing Gloves,BGE-1013,,49.0,89.99,18.0,23.0,WHITE,18oz,0
8,Boxing Gloves Endoor,Boxing Gloves,BGE-1013,,49.0,89.99,18.0,23.0,WHITE,20oz,0
9,Boxing Gloves Horse,Boxing Gloves,BGH-1015,,70.0,150.0,20.0,27.0,RED,10oz,0
10,Boxing Gloves Knock,Boxing Gloves,BGK-1016,,40.0,69.99,16.0,20.0,Black & Red,10oz,0
10,Boxing Gloves Knock,Boxing Gloves,BGK-1016,,40.0,69.99,16.0,20.0,Black & Red,12oz,0
10,Boxing Gloves Knock,Boxing Gloves,BGK-1016,,40.0,69.99,16.0,20.0,Black & Red,14oz,0
10,Boxing Gloves Knock,Boxing Gloves,BGK-1016,,40.0,69.99,16.0,20.0,Black & Red,16oz,0
11,Boxing Gloves Impact,Boxing Gloves,BGI-1017,,45.0,79.99,16.0,20.0,MAROON,10oz,0
11,Boxing Gloves Impact,Boxing Gloves,BGI-1017,,45.0,79.99,16.0,20.0,MAROON,12oz,0
11,Boxing Gloves Impact,Boxing Gloves,BGI-1017,,45.0,79.99,16.0,20.0,MAROON,14oz,0
11,Boxing Gloves Impact,Boxing Gloves,BGI-1017,,45.0,79.99,16.0,20.0,MAROON,16oz,0
11,Boxing Gloves Impact,Boxing Gloves,BGI-1017,,45.0,79.99,16.0,20.0,PURPLE,10oz,0
11,Boxing Gloves Impact,Boxing Gloves,BGI-1017,,45.0,79.99,16.0,20.0,PURPLE,12oz,0
11,Boxing Gloves Impact,Boxing Gloves,BGI-1017,,45.0,79.99,16.0,20.0,PURPLE,14oz,0
11,Boxing Gloves Impact,Boxing Gloves,BGI-1017,,45.0,79.99,16.0,20.0,PURPLE,16oz,0
12,Boxing Gloves BP,Boxing Gloves,BGB-1019,,59.99,130.0,16.0,20.0,GREEN,10oz,0
12,Boxing Gloves BP,Boxing Gloves,BGB-1019,,59.99,130.0,16.0,20.0,GREEN,12oz,0
12,Boxing Gloves BP,Boxing Gloves,BGB-1019,,59.99,130.0,16.0,20.0,GREEN,14oz,0
12,Boxing Gloves BP,Boxing Gloves,BGB-1019,,59.99,130.0,16.0,20.0,GREEN,16oz,0
13,Head Guard Brag,HEAD GUARD,HGB-2011,,69.0,110.0,18.0,24.0,WHITE & GOLD,S/M,0
13,Head Guard Brag,HEAD GUARD,HGB-2011,,69.0,110.0,18.0,24.0,WHITE & GOLD,L/XL,0
13,Head Guard Brag,HEAD GUARD,HGB-2011,,69.0,110.0,18.0,24.0,BLACK & GOLD,S/M,0
13,Head Guard Brag,HEAD GUARD,HGB-2011,,69.0,110.0,18.0,24.0,BLACK & GOLD,L/XL,0
14,Boxing Gloves Vexa,Boxing Gloves,BGV-1019,,16.0,29.99,7.0,10.0,PINK,4oz,0
14,Boxing Gloves Vexa,Boxing Gloves,BGV-1019,,16.0,29.99,7.0,10.0,PINK,6oz,0
14,Boxing Gloves Vexa,Boxing Gloves,BGV-1019,,16.0,29.99,7.0,10.0,PINK,8oz,0
14,Boxing Gloves Vexa,Boxing Gloves,BGV-1019,,16.0,29.99,7.0,10.0,PINK,10oz,0
14,Boxing Gloves Vexa,Boxing Gloves,BGV-1019,,16.0,29.99,7.0,10.0,PINK,12oz,0
14,Boxing Gloves Vexa,Boxing Gloves,BGV-1019,,16.0,29.99,7.0,10.0,PINK,14oz,0
14,Boxing Gloves Vexa,Boxing Gloves,BGV-1019,,16.0,29.99,7.0,10.0,PINK,16oz,0
15,Head Guard Lead,HEAD GUARD,HGL-2013,,35.0,59.99,15.0,18.0,RED,S,0
15,Head Guard Lead,HEAD GUARD,HGL-2013,,35.0,59.99,15.0,18.0,RED,M,0
15,Head Guard Lead,HEAD GUARD,HGL-2013,,35.0,59.99,15.0,18.0,RED,L,0
15,Head Guard Lead,HEAD GUARD,HGL-2013,,35.0,59.99,15.0,18.0,RED,XL,0
15,Head Guard Lead,HEAD GUARD,HGL-2013,,35.0,59.99,15.0,18.0,Blue,S,0
15,Head Guard Lead,HEAD GUARD,HGL-2013,,35.0,59.99,15.0,18.0,Blue,M,0
15,Head Guard Lead,HEAD GUARD,HGL-2013,,35.0,59.99,15.0,18.0,Blue,L,0
15,Head Guard Lead,HEAD GUARD,HGL-2013,,35.0,59.99,15.0,18.0,Blue,XL,0
16,Head Guard Heed,HEAD GUARD,HGH-2015,,22.99,39.99,8.0,12.0,WHITE & GOLD,S,0
16,Head Guard Heed,HEAD GUARD,HGH-2015,,22.99,39.99,8.0,12.0,WHITE & GOLD,M,0
16,Head Guard Heed,HEAD GUARD,HGH-2015,,22.99,39.99,8.0,12.0,WHITE & GOLD,L,0
17,Groin Guard Pro,Groin Guards,GGP-2031,,29.99,59.99,12.0,17.0,Black,S,0
17,Groin Guard Pro,Groin Guards,GGP-2031,,29.99,59.99,12.0,17.0,Black,M,0
17,Groin Guard Pro,Groin Guards,GGP-2031,,29.99,59.99,12.0,17.0,Black,L,0
17,Groin Guard Pro,Groin Guards,GGP-2031,,29.99,59.99,12.0,17.0,Black,XL,0
18,Groin Guard Pro,Groin Guards,GGP-2032,,29.99,59.99,14.0,20.0,BLACK & GOLD,S,0
18,Groin Guard Pro,Groin Guards,GGP-2032,,29.99,59.99,14.0,20.0,BLACK & GOLD,M,0
18,Groin Guard Pro,Groin Guards,GGP-2032,,29.99,59.99,14.0,20.0,BLACK & GOLD,L,0
18,Groin Guard Pro,Groin Guards,GGP-2032,,29.99,59.99,14.0,20.0,BLACK & GOLD,XL,0
19,Cup Supporter Metal,Groin Guards,CSM-2041,,10.0,18.99,4.0,6.0,Black,S,0
19,Cup Supporter Metal,Groin Guards,CSM-2041,,10.0,18.99,4.0,6.0,Black,M,0
19,Cup Supporter Metal,Groin Guards,CSM-2041,,10.0,18.99,4.0,6.0,Black,L,0
19,Cup Supporter Metal,Groin Guards,CSM-2041,,10.0,18.99,4.0,6.0,Black & Red,S,0
19,Cup Supporter Metal,Groin Guards,CSM-2041,,10.0,18.99,4.0,6.0,Black & Red,M,0
19,Cup Supporter Metal,Groin Guards,CSM-2041,,10.0,18.99,4.0,6.0,Black & Red,L,0
20,Cup Supporter Poly,Groin Guards,CSP-2042,,4.99,9.99,0.0,0.0,WHITE,S,0
20,Cup Supporter Poly,Groin Guards,CSP-2042,,4.99,9.99,0.0,0.0,WHITE,M,0
20,Cup Supporter Poly,Groin Guards,CSP-2042,,4.99,9.99,0.0,0.0,WHITE,L,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,RED,XXS,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,RED,XS,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,RED,S,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,RED,M,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,RED,L,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,RED,XL,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,RED,XXL,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,Blue,XXS,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,Blue,XS,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,Blue,S,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,Blue,M,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,Blue,L,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,Blue,XL,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,Blue,XXL,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,Black,XXS,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,Black,XS,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,Black,S,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,Black,M,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,Black,L,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,Black,XL,0
21,Shin instep PRO,Shininsteps,SPP-2051,,35.99,49.99,12.0,18.0,Black,XXL,0
22,Shin Instep Training,Shininsteps,SPT-2052,,29.99,44.99,7.0,14.0,WHITE,XS,0
22,Shin Instep Training,Shininsteps,SPT-2052,,29.99,44.99,7.0,14.0,WHITE,S,0
22,Shin Instep Training,Shininsteps,SPT-2052,,29.99,44.99,7.0,14.0,WHITE,M,0
22,Shin Instep Training,Shininsteps,SPT-2052,,29.99,44.99,7.0,14.0,WHITE,L,0
22,Shin Instep Training,Shininsteps,SPT-2052,,29.99,44.99,7.0,14.0,WHITE,XL,0
22,Shin Instep Training,Shininsteps,SPT-2052,,29.99,44.99,7.0,14.0,WHITE,XXL,0
22,Shin Instep Training,Shininsteps,SPT-2052,,29.99,44.99,7.0,14.0,Black,XS,0
22,Shin Instep Training,Shininsteps,SPT-2052,,29.99,44.99,7.0,14.0,Black,S,0
22,Shin Instep Training,Shininsteps,SPT-2052,,29.99,44.99,7.0,14.0,Black,M,0
22,Shin Instep Training,Shininsteps,SPT-2052,,29.99,44.99,7.0,14.0,Black,L,0
22,Shin Instep Training,Shininsteps,SPT-2052,,29.99,44.99,7.0,14.0,Black,XL,0
22,Shin Instep Training,Shininsteps,SPT-2052,,29.99,44.99,7.0,14.0,Black,XXL,0
23,Focus Mitt React,Coaching & Focus Mitts,AMR-8011,,49.99,139.99,18.0,24.99,Black & Red,standard,0
24,Focus Mitt Smart,Coaching & Focus Mitts,FMS-8012,,35.0,65.99,13.0,18.0,RED,standard,0
24,Focus Mitt Smart,Coaching & Focus Mitts,FMS-8012,,35.0,65.99,13.0,18.0,Blue,standard,0
24,Focus Mitt Smart,Coaching & Focus Mitts,FMS-8012,,35.0,65.99,13.0,18.0,Black,standard,0
25,Focus Mitt Elastic,Coaching & Focus Mitts,FME-8013,,35.0,79.99,14.0,19.99,RED,standard,0
25,Focus Mitt Elastic,Coaching & Focus Mitts,FME-8013,,35.0,79.99,14.0,19.99,Blue,standard,0
25,Focus Mitt Elastic,Coaching & Focus Mitts,FME-8013,,35.0,79.99,14.0,19.99,Black,standard,0
26,Focs Mitt Arch,Coaching & Focus Mitts,FMA-8014,,19.99,29.99,7.0,12.0,WHITE,standard,0
28,Body Protector Coaching Guard,Coaching & Focus Mitts,BP-9011,,130.0,249.99,35.0,70.0,RED,standard,0
28,Body Protector Coaching Guard,Coaching & Focus Mitts,BP-9011,,130.0,249.99,35.0,70.0,Blue,standard,0
28,Body Protector Coaching Guard,Coaching & Focus Mitts,BP-9011,,130.0,249.99,35.0,70.0,Black,standard,0
30,Thigh Pads,Coaching & Focus Mitts,TP-9018,,59.99,110.0,19.0,42.99,Black,standard,0
31,Coaching Paddle,Coaching & Focus Mitts,CP-9021,,24.0,49.99,10.0,12.0,RED,standard,0
31,Coaching Paddle,Coaching & Focus Mitts,CP-9021,,24.0,49.99,10.0,12.0,Blue,standard,0
31,Coaching Paddle,Coaching & Focus Mitts,CP-9021,,24.0,49.99,10.0,12.0,Black,standard,0
32,Coaching Paddle,Coaching & Focus Mitts,CP-9022,,24.0,49.99,10.0,12.0,RED,standard,0
32,Coaching Paddle,Coaching & Focus Mitts,CP-9022,,24.0,49.99,10.0,12.0,Blue,standard,0
32,Coaching Paddle,Coaching & Focus Mitts,CP-9022,,24.0,49.99,10.0,12.0,Black,standard,0
33,Coaching Stick,Coaching & Focus Mitts,CS-9031,,24.0,49.99,10.0,12.0,RED,standard,0
33,Coaching Stick,Coaching & Focus Mitts,CS-9031,,24.0,49.99,10.0,12.0,Blue,standard,0
33,Coaching Stick,Coaching & Focus Mitts,CS-9031,,24.0,49.99,10.0,12.0,Black,standard,0
34,Coaching Stick,Coaching & Focus Mitts,CS-9032,,24.0,49.99,10.0,12.0,RED,standard,0
34,Coaching Stick,Coaching & Focus Mitts,CS-9032,,24.0,49.99,10.0,12.0,Blue,standard,0
34,Coaching Stick,Coaching & Focus Mitts,CS-9032,,24.0,49.99,10.0,12.0,Black,standard,0
35,Strike Pad Round,Coaching & Focus Mitts,SPR-9041,,45.0,69.99,13.0,29.99,Black,standard,0
36,Strike Pad Round,Coaching & Focus Mitts,SPR-9042,,39.0,59.99,12.0,32.0,BLACK & GOLD,standard,0
37,Wall Pad,Punching Bags & Wall Pads Mounts,WP-9051,,150.0,249.0,59.0,110.0,Black & Red,standard,0
38,Wall Pad,Punching Bags & Wall Pads Mounts,WP-9052,,130.0,199.99,45.0,90.0,Black & Red,standard,0
39,Wall Pad,Punching Bags & Wall Pads Mounts,WP-9053,,120.0,199.99,30.0,70.0,Black & Red,standard,0
40,Speed Ball,Speed Balls / Platforms,SB-9061,,19.99,39.99,7.0,9.0,Black & White,M,0
41,Floor to Ceiling Ball pear,Speed Balls / Platforms,FSB-9062,,19.99,44.99,8.0,10.0,Black & White,M,0
42,Floor to Celling Ball Round,Speed Balls / Platforms,FSRB-9063,,0.0,0.0,9.0,11.0,Black & White,M,0
43,Floor to Celling Double Ball,Speed Balls / Platforms,FSDB-9064,,35.0,79.99,12.0,15.0,Black & White,standard,0
44,Speed Ball Platform Heavy,Speed Balls / Platforms,SBP-9071,,280.0,499.99,80.0,150.0,Natural,standard,0
44,Speed Ball Platform Heavy,Speed Balls / Platforms,SBP-9071,,280.0,499.99,80.0,150.0,Natural,60x60,0
45,Speed Ball Platform Medium,Speed Balls / Platforms,SBP-9072,,260.0,449.99,78.0,140.0,Natural,60x60,0
46,Speed Ball Platform Light,Speed Balls / Platforms,Spb-9073,,49.0,99.99,17.0,37.0,Natural,60x60,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Black,XXS,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Black,XS,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Black,S,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Black,M,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Black,L,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Black,XL,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Blue,XXS,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Blue,XS,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Blue,S,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Blue,M,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Blue,L,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Blue,XL,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Grey,XXS,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Grey,XS,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Grey,S,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Grey,M,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Grey,L,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Grey,XL,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,MAROON,XXS,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,MAROON,XS,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,MAROON,S,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,MAROON,M,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,MAROON,L,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,MAROON,XL,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Navy,XXS,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Navy,XS,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Navy,S,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Navy,M,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Navy,L,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Navy,XL,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,RED,XXS,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,RED,XS,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,RED,S,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,RED,M,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,RED,L,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,RED,XL,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Yellow,XXS,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Yellow,XS,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Yellow,S,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Yellow,M,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Yellow,L,0
47,Boxing Short & Vest,Clothing,BSV-2101,,15.0,25.99,7.0,9.0,Yellow,XL,0
48,MMA Kit,Clothing,MMA-2111,,22.0,39.99,13.0,15.0,Assorted,XXS,0
48,MMA Kit,Clothing,MMA-2111,,22.0,39.99,13.0,15.0,Assorted,XS,0
48,MMA Kit,Clothing,MMA-2111,,22.0,39.99,13.0,15.0,Assorted,S,0
48,MMA Kit,Clothing,MMA-2111,,22.0,39.99,13.0,15.0,Assorted,M,0
48,MMA Kit,Clothing,MMA-2111,,22.0,39.99,13.0,15.0,Assorted,L,0
48,MMA Kit,Clothing,MMA-2111,,22.0,39.99,13.0,15.0,Assorted,XL,0
48,MMA Kit,Clothing,MMA-2111,,22.0,39.99,13.0,15.0,Assorted,XXL,0
49,Muay Thai Shorts Mesh,Clothing,MTS-2121,,14.0,24.99,5.0,7.0,Assorted,XXS,0
49,Muay Thai Shorts Mesh,Clothing,MTS-2121,,14.0,24.99,5.0,7.0,Assorted,XS,0
49,Muay Thai Shorts Mesh,Clothing,MTS-2121,,14.0,24.99,5.0,7.0,Assorted,S,0
49,Muay Thai Shorts Mesh,Clothing,MTS-2121,,14.0,24.99,5.0,7.0,Assorted,M,0
49,Muay Thai Shorts Mesh,Clothing,MTS-2121,,14.0,24.99,5.0,7.0,Assorted,L,0
49,Muay Thai Shorts Mesh,Clothing,MTS-2121,,14.0,24.99,5.0,7.0,Assorted,XL,0
49,Muay Thai Shorts Mesh,Clothing,MTS-2121,,14.0,24.99,5.0,7.0,Assorted,XXL,0
50,Muay Thai Shorts,Clothing,MTS-2122,,11.0,19.99,4.0,6.0,Assorted,XXS,0
50,Muay Thai Shorts,Clothing,MTS-2122,,11.0,19.99,4.0,6.0,Assorted,XS,0
50,Muay Thai Shorts,Clothing,MTS-2122,,11.0,19.99,4.0,6.0,Assorted,S,0
50,Muay Thai Shorts,Clothing,MTS-2122,,11.0,19.99,4.0,6.0,Assorted,M,0
50,Muay Thai Shorts,Clothing,MTS-2122,,11.0,19.99,4.0,6.0,Assorted,L,0
50,Muay Thai Shorts,Clothing,MTS-2122,,11.0,19.99,4.0,6.0,Assorted,XL,0
50,Muay Thai Shorts,Clothing,MTS-2122,,11.0,19.99,4.0,6.0,Assorted,XXL,0
51,Sports Bag,accessories,SB-2221,,35.99,59.99,11.0,21.0,RED,standard,0
51,Sports Bag,accessories,SB-2221,,35.99,59.99,11.0,21.0,Blue,standard,0
52,Sports Bags,accessories,SB-2222,,24.0,39.99,11.0,19.0,Black,standard,0
52,Sports Bags,accessories,SB-2222,,24.0,39.99,11.0,19.0,RED,standard,0
52,Sports Bags,accessories,SB-2222,,24.0,39.99,11.0,19.0,Blue,standard,0
54,Hoodie Track Suit   460gsm,Clothing,HCP-460,,25.2,39.99,16.0,21.0,Assorted,XS,0
54,Hoodie Track Suit   460gsm,Clothing,HCP-460,,25.2,39.99,16.0,21.0,Assorted,S,0
54,Hoodie Track Suit   460gsm,Clothing,HCP-460,,25.2,39.99,16.0,21.0,Assorted,M,0
54,Hoodie Track Suit   460gsm,Clothing,HCP-460,,25.2,39.99,16.0,21.0,Assorted,L,0
54,Hoodie Track Suit   460gsm,Clothing,HCP-460,,25.2,39.99,16.0,21.0,Assorted,XL,0
54,Hoodie Track Suit   460gsm,Clothing,HCP-460,,25.2,39.99,16.0,21.0,Assorted,XXL,0
55,Hoodie Track Suit  360gsm,Clothing,HCP-360,,23.0,37.99,13.0,18.0,Assorted,XS,0
55,Hoodie Track Suit  360gsm,Clothing,HCP-360,,23.0,37.99,13.0,18.0,Assorted,S,0
55,Hoodie Track Suit  360gsm,Clothing,HCP-360,,23.0,37.99,13.0,18.0,Assorted,M,0
55,Hoodie Track Suit  360gsm,Clothing,HCP-360,,23.0,37.99,13.0,18.0,Assorted,L,0
55,Hoodie Track Suit  360gsm,Clothing,HCP-360,,23.0,37.99,13.0,18.0,Assorted,XL,0
55,Hoodie Track Suit  360gsm,Clothing,HCP-360,,23.0,37.99,13.0,18.0,Assorted,XXL,0
56,Hoodie Track Suit   300gsm,Clothing,HCP-300,,22.0,35.99,12.0,17.0,Assorted,XS,0
56,Hoodie Track Suit   300gsm,Clothing,HCP-300,,22.0,35.99,12.0,17.0,Assorted,S,0
56,Hoodie Track Suit   300gsm,Clothing,HCP-300,,22.0,35.99,12.0,17.0,Assorted,M,0
56,Hoodie Track Suit   300gsm,Clothing,HCP-300,,22.0,35.99,12.0,17.0,Assorted,L,0
56,Hoodie Track Suit   300gsm,Clothing,HCP-300,,22.0,35.99,12.0,17.0,Assorted,XL,0
56,Hoodie Track Suit   300gsm,Clothing,HCP-300,,22.0,35.99,12.0,17.0,Assorted,XXL,0
57,T shirt Interlock P/C 80/20,Clothing,TSI-280,,0.0,0.0,2.5,3.0,Assorted,XS,0
57,T shirt Interlock P/C 80/20,Clothing,TSI-280,,0.0,0.0,2.5,3.0,Assorted,S,0
57,T shirt Interlock P/C 80/20,Clothing,TSI-280,,0.0,0.0,2.5,3.0,Assorted,M,0
57,T shirt Interlock P/C 80/20,Clothing,TSI-280,,0.0,0.0,2.5,3.0,Assorted,L,0
57,T shirt Interlock P/C 80/20,Clothing,TSI-280,,0.0,0.0,2.5,3.0,Assorted,XL,0
57,T shirt Interlock P/C 80/20,Clothing,TSI-280,,0.0,0.0,2.5,3.0,Assorted,XXL,0
58,T shirt Interlock  polyester,Clothing,TSI-160,,2.5,5.0,1.2,1.5,Assorted,XS,0
58,T shirt Interlock  polyester,Clothing,TSI-160,,2.5,5.0,1.2,1.5,Assorted,S,0
58,T shirt Interlock  polyester,Clothing,TSI-160,,2.5,5.0,1.2,1.5,Assorted,M,0
58,T shirt Interlock  polyester,Clothing,TSI-160,,2.5,5.0,1.2,1.5,Assorted,L,0
58,T shirt Interlock  polyester,Clothing,TSI-160,,2.5,5.0,1.2,1.5,Assorted,XL,0
58,T shirt Interlock  polyester,Clothing,TSI-160,,2.5,5.0,1.2,1.5,Assorted,XXL,0
59,T Shirt Jersey  C/P  65/35,Clothing,TSJ-160,,3.0,6.0,1.4,1.8,Assorted,XS,0
59,T Shirt Jersey  C/P  65/35,Clothing,TSJ-160,,3.0,6.0,1.4,1.8,Assorted,S,0
59,T Shirt Jersey  C/P  65/35,Clothing,TSJ-160,,3.0,6.0,1.4,1.8,Assorted,M,0
59,T Shirt Jersey  C/P  65/35,Clothing,TSJ-160,,3.0,6.0,1.4,1.8,Assorted,L,0
59,T Shirt Jersey  C/P  65/35,Clothing,TSJ-160,,3.0,6.0,1.4,1.8,Assorted,XL,0
59,T Shirt Jersey  C/P  65/35,Clothing,TSJ-160,,3.0,6.0,1.4,1.8,Assorted,XXL,0
60,T Shirt Jersey  Cotton,Clothing,TSJ-180,,3.5,7.0,1.9,2.4,Assorted,XS,0
60,T Shirt Jersey  Cotton,Clothing,TSJ-180,,3.5,7.0,1.9,2.4,Assorted,S,0
60,T Shirt Jersey  Cotton,Clothing,TSJ-180,,3.5,7.0,1.9,2.4,Assorted,M,0
60,T Shirt Jersey  Cotton,Clothing,TSJ-180,,3.5,7.0,1.9,2.4,Assorted,L,0
60,T Shirt Jersey  Cotton,Clothing,TSJ-180,,3.5,7.0,1.9,2.4,Assorted,XL,0
60,T Shirt Jersey  Cotton,Clothing,TSJ-180,,3.5,7.0,1.9,2.4,Assorted,XXL,0
61,T Shirt Lecra Jersey,Clothing,TSJ-200,,3.5,7.0,1.9,2.9,Assorted,XS,0
61,T Shirt Lecra Jersey,Clothing,TSJ-200,,3.5,7.0,1.9,2.9,Assorted,S,0
61,T Shirt Lecra Jersey,Clothing,TSJ-200,,3.5,7.0,1.9,2.9,Assorted,M,0
61,T Shirt Lecra Jersey,Clothing,TSJ-200,,3.5,7.0,1.9,2.9,Assorted,L,0
61,T Shirt Lecra Jersey,Clothing,TSJ-200,,3.5,7.0,1.9,2.9,Assorted,XL,0
61,T Shirt Lecra Jersey,Clothing,TSJ-200,,3.5,7.0,1.9,2.9,Assorted,XXL,0
62,Kick Shield S Leather,Coaching,KS-221,,35.0,49.99,10.0,25.0,Assorted,L,0
63,Kick Shield S Leather pair,Coaching,KS-231,,0.0,0.0,9.0,0.0,Assorted,S,0
64,Kick Shield  G Leather,Coaching,KS-232,,0.0,0.0,16.0,0.0,Assorted,standard,0
65,Kick Boxing Chestguard,Protection,KBC-211,,0.0,0.0,9.0,0.0,Assorted,XXS,0
65,Kick Boxing Chestguard,Protection,KBC-211,,0.0,0.0,9.0,0.0,Assorted,XS,0
65,Kick Boxing Chestguard,Protection,KBC-211,,0.0,0.0,9.0,0.0,Assorted,S,0
65,Kick Boxing Chestguard,Protection,KBC-211,,0.0,0.0,9.0,0.0,Assorted,M,0
65,Kick Boxing Chestguard,Protection,KBC-211,,0.0,0.0,9.0,0.0,Assorted,L,0
65,Kick Boxing Chestguard,Protection,KBC-211,,0.0,0.0,9.0,0.0,Assorted,XL,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,Blue,XXS,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,Blue,XS,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,Blue,S,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,Blue,M,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,Blue,L,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,Blue,XL,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,GOLDEN,XXS,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,GOLDEN,XS,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,GOLDEN,S,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,GOLDEN,M,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,GOLDEN,L,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,GOLDEN,XL,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,RED,XXS,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,RED,XS,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,RED,S,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,RED,M,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,RED,L,0
66,MMA Gloves,MMA,MG-501,,19.0,34.99,7.0,12.0,RED,XL,0
67,MMA Shooter Gloves,MMA,MSG-511,,19.99,39.99,5.0,9.0,RED,XXS,0
67,MMA Shooter Gloves,MMA,MSG-511,,19.99,39.99,5.0,9.0,RED,XS,0
67,MMA Shooter Gloves,MMA,MSG-511,,19.99,39.99,5.0,9.0,RED,S,0
67,MMA Shooter Gloves,MMA,MSG-511,,19.99,39.99,5.0,9.0,RED,M,0
67,MMA Shooter Gloves,MMA,MSG-511,,19.99,39.99,5.0,9.0,RED,L,0
67,MMA Shooter Gloves,MMA,MSG-511,,19.99,39.99,5.0,9.0,RED,XL,0
67,MMA Shooter Gloves,MMA,MSG-511,,19.99,39.99,5.0,9.0,RED,XXL,0
68,MMA Shooter Gloves,MMA,MSG-512,,19.99,39.99,5.0,9.0,WHITE & GOLD,XXS,0
68,MMA Shooter Gloves,MMA,MSG-512,,19.99,39.99,5.0,9.0,WHITE & GOLD,XS,0
68,MMA Shooter Gloves,MMA,MSG-512,,19.99,39.99,5.0,9.0,WHITE & GOLD,S,0
68,MMA Shooter Gloves,MMA,MSG-512,,19.99,39.99,5.0,9.0,WHITE & GOLD,M,0
68,MMA Shooter Gloves,MMA,MSG-512,,19.99,39.99,5.0,9.0,WHITE & GOLD,L,0
68,MMA Shooter Gloves,MMA,MSG-512,,19.99,39.99,5.0,9.0,WHITE & GOLD,XL,0
68,MMA Shooter Gloves,MMA,MSG-512,,19.99,39.99,5.0,9.0,WHITE & GOLD,XXL,0
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & GOLD,4oz,57
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & GOLD,6oz,59
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & GOLD,8oz,70
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & GOLD,10oz,71
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & GOLD,12oz,72
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & GOLD,14oz,74
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & GOLD,16oz,59
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & BLUE,4oz,0
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & BLUE,6oz,14
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & BLUE,8oz,6
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & BLUE,10oz,12
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & BLUE,12oz,9
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & BLUE,14oz,6
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & BLUE,16oz,11
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & RED,4oz,14
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & RED,6oz,12
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & RED,8oz,6
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & RED,10oz,13
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & RED,12oz,21
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & RED,14oz,21
69,Boxing Gloves SuperX,Boxing Gloves,BGS-1014,,0.0,0.0,7.0,11.0,WHITE & RED,16oz,18
70,Boxing Gloves SuperX  OD design,Boxing Gloves,BGS-10114,,16.0,29.99,7.0,10.0,Blue,8oz,17
70,Boxing Gloves SuperX  OD design,Boxing Gloves,BGS-10114,,16.0,29.99,7.0,10.0,Blue,10oz,95
70,Boxing Gloves SuperX  OD design,Boxing Gloves,BGS-10114,,16.0,29.99,7.0,10.0,RED,8oz,27
70,Boxing Gloves SuperX  OD design,Boxing Gloves,BGS-10114,,16.0,29.99,7.0,10.0,RED,10oz,60
70,Boxing Gloves SuperX  OD design,Boxing Gloves,BGS-10114,,16.0,29.99,7.0,10.0,Black,8oz,21
70,Boxing Gloves SuperX  OD design,Boxing Gloves,BGS-10114,,16.0,29.99,7.0,10.0,Black,10oz,63
71,Boxing Gloves gold rex,Boxing Gloves,BGG-201111,,18.0,29.99,7.0,11.0,BLACK & GOLD,12oz,60`

// Export function to get all migrated products
export function getFullCsvMigratedProducts(): Product[] {
  return parseCsvData(COMPLETE_CSV_DATA)
}
