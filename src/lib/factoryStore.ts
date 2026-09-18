import { useSyncExternalStore } from "react";
import type {
  IncomingEntry,
  Location,
} from "./inventoryData";

/* ==========================================================================
   INTERFACES & TYPES FOR MANUFACTURING FACTORY
   ========================================================================== */

export type LeatherType =
  | "Cow Leather"
  | "Buffalo Leather"
  | "Goat Leather"
  | "Suede Leather"
  | "Synthetic Leather"
  | "PU Leather";

export type RawMaterialGrade = "Grade A" | "Grade B" | "Grade C" | "Premium";

export type MaterialCategory =
  | "Raw Material"
  | "Component"
  | "Accessory"
  | "Work in Progress"
  | "Finished Goods";

export type ProductionStage =
  | "Material Issue"
  | "Cutting"
  | "Stitching / Assembly"
  | "Finishing"
  | "Quality Check"
  | "Completed";

export type ProductionOrderStatus =
  | "Draft"
  | "Planned"
  | "In Production"
  | "Quality Check"
  | "Completed"
  | "Cancelled";

export type MovementTypeExtended =
  | "Opening Stock"
  | "Incoming"
  | "Material Issue"
  | "Production Consumption"
  | "Production Output"
  | "Outgoing"
  | "Adjustment"
  | "Transfer"
  | "Return"
  | "Wastage"
  | "Rejection";

// 1. Raw Material Item
export interface RawMaterialItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: "Raw Material";
  leatherType: LeatherType;
  grade: RawMaterialGrade;
  color: string;
  thickness: string;
  unit: string;
  currentStock: number;
  minStock: number;
  location: Location;
  batchLot?: string;
  averageCost: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  description?: string;
  lastUpdated?: string;
}

// 2. Component & Accessory Item
export interface ComponentItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: "Component" | "Accessory";
  unit: string;
  currentStock: number;
  minStock: number;
  location: Location;
  supplierName?: string;
  cost: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  description?: string;
  lastUpdated?: string;
}

// 3. Work in Progress (WIP)
export interface WIPItem {
  id: string;
  wipCode: string;
  productName: string;
  productCode: string;
  variantName?: string;
  productionOrderId: string;
  productionOrderNumber: string;
  stage: ProductionStage;
  quantity: number;
  completedQuantity: number;
  unit: string;
  productionDate: string;
  currentLocation: Location;
  status: "Not Started" | "In Production" | "Quality Check" | "Completed" | "Rejected";
  notes?: string;
}

// 4. Finished Product Item
export interface FinishedProductItem {
  id: string;
  sku: string;
  productName: string;
  productType: "Shoes" | "Bags" | "Belts" | "Wallets" | "Accessories" | "Other";
  category: "Finished Goods";
  variantName: string;
  size?: string;
  color?: string;
  material?: string;
  currentStock: number;
  minStock: number;
  location: Location;
  sellingPrice: number;
  productionCost: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  description?: string;
  lastUpdated?: string;
}

// 5. Product & Variant Catalog
export interface ProductVariant {
  id: string;
  sku: string;
  variantName: string;
  size?: string;
  color?: string;
  material?: string;
  sellingPrice: number;
  estimatedCost: number;
}

export interface ProductCatalogItem {
  id: string;
  productCode: string;
  productName: string;
  category: "Shoes" | "Bags" | "Belts" | "Wallets" | "Accessories" | "Other";
  description: string;
  variants: ProductVariant[];
  basePrice: number;
  estimatedCost: number;
}

// 6. Bill of Materials (BOM)
export interface BOMIngredient {
  itemId: string;
  itemCode: string;
  itemName: string;
  materialCategory: "Raw Material" | "Component" | "Accessory";
  unit: string;
  quantityRequired: number; // per 1 product unit
  wastagePercent: number; // e.g. 5%
  unitCost: number;
  notes?: string;
}

export interface BillOfMaterial {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  variantId?: string;
  variantSku?: string;
  variantName?: string;
  ingredients: BOMIngredient[];
  totalMaterialCost: number;
  otherCost: number;
  totalEstimatedCost: number;
  updatedAt: string;
}

// 7. Material Requirement Check for Production
export interface MaterialRequirementCheck {
  itemId: string;
  itemCode: string;
  itemName: string;
  unit: string;
  requiredQty: number;
  availableQty: number;
  shortageQty: number;
  hasShortage: boolean;
}

// 8. Production Order
export interface ProductionOrder {
  id: string;
  orderNumber: string;
  productId: string;
  productCode: string;
  productName: string;
  variantId?: string;
  variantSku?: string;
  variantName?: string;
  plannedQuantity: number;
  producedQuantity: number;
  rejectedQuantity: number;
  wastageQuantity: number;
  productionDate: string;
  expectedCompletion: string;
  status: ProductionOrderStatus;
  currentStage: ProductionStage;
  materialsIssued: boolean;
  materialRequirements: MaterialRequirementCheck[];
  notes?: string;
  createdBy: string;
}

// 9. Wastage Record
export interface WastageRecord {
  id: string;
  wastageNumber: string;
  date: string;
  productionOrderId?: string;
  productionOrderNumber?: string;
  productName?: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  materialCategory: string;
  quantity: number;
  unit: string;
  reason:
    | "Leather Cutting Waste"
    | "Damaged Leather"
    | "Defective Sole / Component"
    | "Broken Accessory"
    | "Production Rejection"
    | "Other Wastage";
  recordedBy: string;
  notes?: string;
}

// 10. Stock Transfer Record
export interface StockTransferRecord {
  id: string;
  transferNumber: string;
  date: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  fromLocation: Location;
  toLocation: Location;
  reason: string;
  transferredBy: string;
  status: "Completed" | "Pending" | "Cancelled";
}

// 11. Stock Adjustment Record
export interface StockAdjustmentRecord {
  id: string;
  adjustmentNumber: string;
  date: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  systemStock: number;
  physicalStock: number;
  difference: number;
  unit: string;
  adjustmentType: "Addition" | "Deduction";
  reason: "Physical Count" | "Damage" | "Missing Stock" | "Data Correction" | "Other";
  user: string;
  notes?: string;
}

// 12. Stock Movement Record (Central Audit Ledger)
export interface ExtendedStockMovement {
  id: string;
  movementId: string;
  date: string;
  dateTime?: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  type: MovementTypeExtended;
  category: string;
  quantity: number;
  quantityDisplay: string;
  previousBalance: number;
  newBalance: number;
  balanceDisplay: string;
  reference: string;
  location: Location;
  user: string;
  notes?: string;
}

/* ==========================================================================
   INITIAL MOCK DATA FOR FACTORY
   ========================================================================== */

const SEED_RAW_MATERIALS: RawMaterialItem[] = [
  {
    id: "rm-001",
    itemCode: "RM-LEATH-001",
    itemName: "Full Grain Cow Leather - Black",
    category: "Raw Material",
    leatherType: "Cow Leather",
    grade: "Grade A",
    color: "Black",
    thickness: "1.2 - 1.4 mm",
    unit: "Sq.ft",
    currentStock: 1500,
    minStock: 500,
    location: "Main Warehouse",
    batchLot: "LOT-2026-089",
    averageCost: 110,
    status: "In Stock",
    description: "Premium full grain cowhide suitable for shoe uppers and luxury bags.",
    lastUpdated: "18 Sep 2026",
  },
  {
    id: "rm-002",
    itemCode: "RM-LEATH-002",
    itemName: "Full Grain Cow Leather - Cognac Brown",
    category: "Raw Material",
    leatherType: "Cow Leather",
    grade: "Grade A",
    color: "Cognac Brown",
    thickness: "1.4 - 1.6 mm",
    unit: "Sq.ft",
    currentStock: 950,
    minStock: 400,
    location: "Main Warehouse",
    batchLot: "LOT-2026-092",
    averageCost: 120,
    status: "In Stock",
    description: "Rich vegetable-retanned cow leather for dress shoes and belts.",
    lastUpdated: "17 Sep 2026",
  },
  {
    id: "rm-003",
    itemCode: "RM-LEATH-003",
    itemName: "Goat Leather Lining - Tan",
    category: "Raw Material",
    leatherType: "Goat Leather",
    grade: "Grade B",
    color: "Tan",
    thickness: "0.7 - 0.9 mm",
    unit: "Sq.ft",
    currentStock: 850,
    minStock: 1000,
    location: "Main Warehouse",
    batchLot: "LOT-2026-074",
    averageCost: 75,
    status: "Low Stock",
    description: "Soft goat skin for shoe interior lining and wallet pockets.",
    lastUpdated: "17 Sep 2026",
  },
  {
    id: "rm-004",
    itemCode: "RM-LEATH-004",
    itemName: "Suede Calfskin - Navy Blue",
    category: "Raw Material",
    leatherType: "Suede Leather",
    grade: "Premium",
    color: "Navy Blue",
    thickness: "1.1 - 1.3 mm",
    unit: "Sq.ft",
    currentStock: 1200,
    minStock: 300,
    location: "Main Warehouse",
    batchLot: "LOT-2026-095",
    averageCost: 135,
    status: "In Stock",
    description: "Silky suede calfskin for casual loafers and handbags.",
    lastUpdated: "16 Sep 2026",
  },
  {
    id: "rm-005",
    itemCode: "RM-LEATH-005",
    itemName: "Heavy Buffalo Harness Leather - Dark Brown",
    category: "Raw Material",
    leatherType: "Buffalo Leather",
    grade: "Grade A",
    color: "Dark Brown",
    thickness: "3.5 - 4.0 mm",
    unit: "Sq.ft",
    currentStock: 420,
    minStock: 250,
    location: "Main Warehouse",
    batchLot: "LOT-2026-061",
    averageCost: 150,
    status: "In Stock",
    description: "Thick vegetable tanned buffalo hide specifically cut for heavy duty belts.",
    lastUpdated: "15 Sep 2026",
  },
  {
    id: "rm-006",
    itemCode: "RM-LEATH-006",
    itemName: "PU Synthetic Trim Leather",
    category: "Raw Material",
    leatherType: "PU Leather",
    grade: "Grade B",
    color: "Black",
    thickness: "1.0 mm",
    unit: "Meter",
    currentStock: 150,
    minStock: 200,
    location: "Warehouse B",
    batchLot: "LOT-2026-030",
    averageCost: 45,
    status: "Low Stock",
    description: "Synthetic backing roll used for reinforcement and internal linings.",
    lastUpdated: "14 Sep 2026",
  },
];

const SEED_COMPONENTS: ComponentItem[] = [
  {
    id: "cmp-001",
    itemCode: "CMP-SOLE-001",
    itemName: "TPR Shoe Rubber Sole (Size 8)",
    category: "Component",
    unit: "Pair",
    currentStock: 350,
    minStock: 100,
    location: "Production Store",
    supplierName: "Precision Hardware Co",
    cost: 280,
    status: "In Stock",
    description: "Durable molded TPR outsoles for dress shoes.",
    lastUpdated: "18 Sep 2026",
  },
  {
    id: "cmp-002",
    itemCode: "CMP-SOLE-002",
    itemName: "Leather Insole Board 3mm",
    category: "Component",
    unit: "Piece",
    currentStock: 600,
    minStock: 200,
    location: "Production Store",
    supplierName: "Precision Hardware Co",
    cost: 45,
    status: "In Stock",
    description: "Cushioned shanked insoles for footwear construction.",
    lastUpdated: "17 Sep 2026",
  },
  {
    id: "cmp-003",
    itemCode: "CMP-ACC-001",
    itemName: "Solid Brass Belt Buckle 38mm",
    category: "Accessory",
    unit: "Piece",
    currentStock: 800,
    minStock: 250,
    location: "Warehouse B",
    supplierName: "Precision Hardware Co",
    cost: 120,
    status: "In Stock",
    description: "Antique finish brass single-prong buckles.",
    lastUpdated: "18 Sep 2026",
  },
  {
    id: "cmp-004",
    itemCode: "CMP-ACC-002",
    itemName: "Metal Zipper #5 Antique Brass (35cm)",
    category: "Accessory",
    unit: "Piece",
    currentStock: 450,
    minStock: 150,
    location: "Warehouse B",
    supplierName: "Precision Hardware Co",
    cost: 65,
    status: "In Stock",
    description: "Smooth sliding brass zippers for handbags.",
    lastUpdated: "16 Sep 2026",
  },
  {
    id: "cmp-005",
    itemCode: "CMP-ACC-003",
    itemName: "Bonded Nylon Thread (Black 0.8mm)",
    category: "Component",
    unit: "Meter",
    currentStock: 5000,
    minStock: 1500,
    location: "Production Store",
    supplierName: "Precision Hardware Co",
    cost: 0.8,
    status: "In Stock",
    description: "High tensile strength sewing thread for leather assembly.",
    lastUpdated: "17 Sep 2026",
  },
  {
    id: "cmp-006",
    itemCode: "CMP-CHEM-001",
    itemName: "Leather Contact Adhesive Glue",
    category: "Component",
    unit: "Ltr",
    currentStock: 45,
    minStock: 20,
    location: "Chemical Store",
    supplierName: "Apex Chemical Corp",
    cost: 220,
    status: "In Stock",
    description: "Fast setting polychloroprene adhesive for upper & sole bonding.",
    lastUpdated: "18 Sep 2026",
  },
  {
    id: "cmp-007",
    itemCode: "CMP-PKG-001",
    itemName: "Premium Shoe Box - Rigid Craft",
    category: "Accessory",
    unit: "Piece",
    currentStock: 280,
    minStock: 100,
    location: "Warehouse B",
    supplierName: "Precision Hardware Co",
    cost: 40,
    status: "In Stock",
    description: "Branded gift packaging boxes with cotton dust bag.",
    lastUpdated: "16 Sep 2026",
  },
];

const SEED_WIP_ITEMS: WIPItem[] = [
  {
    id: "wip-001",
    wipCode: "WIP-2026-001",
    productName: "Classic Leather Shoe",
    productCode: "SHOE-001",
    variantName: "Black / Size 8",
    productionOrderId: "po-001",
    productionOrderNumber: "PROD-00001",
    stage: "Stitching / Assembly",
    quantity: 100,
    completedQuantity: 60,
    unit: "Pair",
    productionDate: "18 Sep 2026",
    currentLocation: "Production Store",
    status: "In Production",
    notes: "Cutting completed. 60 pairs stitched and ready for sole lasting.",
  },
  {
    id: "wip-002",
    wipCode: "WIP-2026-002",
    productName: "Executive Leather Tote Bag",
    productCode: "BAG-001",
    variantName: "Cognac Brown / Medium",
    productionOrderId: "po-002",
    productionOrderNumber: "PROD-00002",
    stage: "Cutting",
    quantity: 40,
    completedQuantity: 15,
    unit: "Piece",
    productionDate: "17 Sep 2026",
    currentLocation: "Production Store",
    status: "In Production",
    notes: "Leather panel die-cutting ongoing.",
  },
];

const SEED_FINISHED_PRODUCTS: FinishedProductItem[] = [
  {
    id: "fp-001",
    sku: "SHOE-001-BLK-08",
    productName: "Classic Leather Shoe",
    productType: "Shoes",
    category: "Finished Goods",
    variantName: "Black / Size 8",
    size: "8",
    color: "Black",
    material: "Full Grain Cow Leather",
    currentStock: 120,
    minStock: 30,
    location: "Finished Goods",
    sellingPrice: 3800,
    productionCost: 1850,
    status: "In Stock",
    description: "Handcrafted full-grain leather oxford shoes with rubber sole.",
    lastUpdated: "18 Sep 2026",
  },
  {
    id: "fp-002",
    sku: "SHOE-001-BRN-09",
    productName: "Classic Leather Shoe",
    productType: "Shoes",
    category: "Finished Goods",
    variantName: "Cognac Brown / Size 9",
    size: "9",
    color: "Cognac Brown",
    material: "Full Grain Cow Leather",
    currentStock: 85,
    minStock: 25,
    location: "Finished Goods",
    sellingPrice: 3950,
    productionCost: 1900,
    status: "In Stock",
    description: "Classic brown leather lace-up derby shoes.",
    lastUpdated: "17 Sep 2026",
  },
  {
    id: "fp-003",
    sku: "BAG-001-COG-M",
    productName: "Executive Leather Tote Bag",
    productType: "Bags",
    category: "Finished Goods",
    variantName: "Cognac Brown / Medium",
    size: "Medium",
    color: "Cognac Brown",
    material: "Full Grain Cow Leather",
    currentStock: 45,
    minStock: 15,
    location: "Finished Goods",
    sellingPrice: 6500,
    productionCost: 3100,
    status: "In Stock",
    description: "Spacious laptop tote with brass zipper and suede lining.",
    lastUpdated: "16 Sep 2026",
  },
  {
    id: "fp-004",
    sku: "BELT-001-BRN-34",
    productName: "Classic Leather Belt 38mm",
    productType: "Belts",
    category: "Finished Goods",
    variantName: "Dark Brown / Size 34",
    size: "34",
    color: "Dark Brown",
    material: "Buffalo Harness Leather",
    currentStock: 210,
    minStock: 50,
    location: "Finished Goods",
    sellingPrice: 1250,
    productionCost: 520,
    status: "In Stock",
    description: "Solid buffalo hide belt with solid brass buckle.",
    lastUpdated: "18 Sep 2026",
  },
  {
    id: "fp-005",
    sku: "WLT-001-BLK-OS",
    productName: "Slim Leather Bifold Wallet",
    productType: "Wallets",
    category: "Finished Goods",
    variantName: "Black / Standard",
    size: "Standard",
    color: "Black",
    material: "Full Grain Cow Leather",
    currentStock: 15,
    minStock: 40,
    location: "Finished Goods",
    sellingPrice: 950,
    productionCost: 380,
    status: "Low Stock",
    description: "6-card slot slim wallet with bill compartment.",
    lastUpdated: "15 Sep 2026",
  },
];

const SEED_PRODUCT_CATALOG: ProductCatalogItem[] = [
  {
    id: "prod-cat-001",
    productCode: "SHOE-001",
    productName: "Classic Leather Shoe",
    category: "Shoes",
    description: "Formal Oxford & Derby shoes crafted from premium cow leather.",
    basePrice: 3800,
    estimatedCost: 1850,
    variants: [
      {
        id: "var-001",
        sku: "SHOE-001-BLK-07",
        variantName: "Black / Size 7",
        size: "7",
        color: "Black",
        sellingPrice: 3800,
        estimatedCost: 1850,
      },
      {
        id: "var-002",
        sku: "SHOE-001-BLK-08",
        variantName: "Black / Size 8",
        size: "8",
        color: "Black",
        sellingPrice: 3800,
        estimatedCost: 1850,
      },
      {
        id: "var-003",
        sku: "SHOE-001-BLK-09",
        variantName: "Black / Size 9",
        size: "9",
        color: "Black",
        sellingPrice: 3800,
        estimatedCost: 1850,
      },
      {
        id: "var-004",
        sku: "SHOE-001-BRN-08",
        variantName: "Cognac Brown / Size 8",
        size: "8",
        color: "Cognac Brown",
        sellingPrice: 3950,
        estimatedCost: 1900,
      },
      {
        id: "var-005",
        sku: "SHOE-001-BRN-09",
        variantName: "Cognac Brown / Size 9",
        size: "9",
        color: "Cognac Brown",
        sellingPrice: 3950,
        estimatedCost: 1900,
      },
    ],
  },
  {
    id: "prod-cat-002",
    productCode: "BAG-001",
    productName: "Executive Leather Tote Bag",
    category: "Bags",
    description: "Spacious business tote with padded laptop sleeve.",
    basePrice: 6500,
    estimatedCost: 3100,
    variants: [
      {
        id: "var-006",
        sku: "BAG-001-COG-M",
        variantName: "Cognac Brown / Medium",
        size: "Medium",
        color: "Cognac Brown",
        sellingPrice: 6500,
        estimatedCost: 3100,
      },
      {
        id: "var-007",
        sku: "BAG-001-BLK-L",
        variantName: "Black / Large",
        size: "Large",
        color: "Black",
        sellingPrice: 7200,
        estimatedCost: 3450,
      },
    ],
  },
  {
    id: "prod-cat-003",
    productCode: "BELT-001",
    productName: "Classic Leather Belt 38mm",
    category: "Belts",
    description: "Heavy duty buffalo harness leather belt with brass buckle.",
    basePrice: 1250,
    estimatedCost: 520,
    variants: [
      {
        id: "var-008",
        sku: "BELT-001-BRN-32",
        variantName: "Dark Brown / Size 32",
        size: "32",
        color: "Dark Brown",
        sellingPrice: 1250,
        estimatedCost: 520,
      },
      {
        id: "var-009",
        sku: "BELT-001-BRN-34",
        variantName: "Dark Brown / Size 34",
        size: "34",
        color: "Dark Brown",
        sellingPrice: 1250,
        estimatedCost: 520,
      },
      {
        id: "var-010",
        sku: "BELT-001-BRN-36",
        variantName: "Dark Brown / Size 36",
        size: "36",
        color: "Dark Brown",
        sellingPrice: 1250,
        estimatedCost: 520,
      },
    ],
  },
  {
    id: "prod-cat-004",
    productCode: "WLT-001",
    productName: "Slim Leather Bifold Wallet",
    category: "Wallets",
    description: "Compact 6-pocket leather wallet.",
    basePrice: 950,
    estimatedCost: 380,
    variants: [
      {
        id: "var-011",
        sku: "WLT-001-BLK-OS",
        variantName: "Black / Standard",
        size: "Standard",
        color: "Black",
        sellingPrice: 950,
        estimatedCost: 380,
      },
    ],
  },
];

const SEED_BOMS: BillOfMaterial[] = [
  {
    id: "bom-001",
    productId: "prod-cat-001",
    productCode: "SHOE-001",
    productName: "Classic Leather Shoe",
    variantId: "var-002",
    variantSku: "SHOE-001-BLK-08",
    variantName: "Black / Size 8",
    ingredients: [
      {
        itemId: "rm-001",
        itemCode: "RM-LEATH-001",
        itemName: "Full Grain Cow Leather - Black",
        materialCategory: "Raw Material",
        unit: "Sq.ft",
        quantityRequired: 12,
        wastagePercent: 5,
        unitCost: 110,
      },
      {
        itemId: "rm-003",
        itemCode: "RM-LEATH-003",
        itemName: "Goat Leather Lining - Tan",
        materialCategory: "Raw Material",
        unit: "Sq.ft",
        quantityRequired: 2,
        wastagePercent: 5,
        unitCost: 75,
      },
      {
        itemId: "cmp-001",
        itemCode: "CMP-SOLE-001",
        itemName: "TPR Shoe Rubber Sole (Size 8)",
        materialCategory: "Component",
        unit: "Pair",
        quantityRequired: 1,
        wastagePercent: 0,
        unitCost: 280,
      },
      {
        itemId: "cmp-002",
        itemCode: "CMP-SOLE-002",
        itemName: "Leather Insole Board 3mm",
        materialCategory: "Component",
        unit: "Piece",
        quantityRequired: 2,
        wastagePercent: 0,
        unitCost: 45,
      },
      {
        itemId: "cmp-005",
        itemCode: "CMP-ACC-003",
        itemName: "Bonded Nylon Thread (Black 0.8mm)",
        materialCategory: "Component",
        unit: "Meter",
        quantityRequired: 20,
        wastagePercent: 10,
        unitCost: 0.8,
      },
      {
        itemId: "cmp-006",
        itemCode: "CMP-CHEM-001",
        itemName: "Leather Contact Adhesive Glue",
        materialCategory: "Component",
        unit: "Ltr",
        quantityRequired: 0.1,
        wastagePercent: 5,
        unitCost: 220,
      },
      {
        itemId: "cmp-007",
        itemCode: "CMP-PKG-001",
        itemName: "Premium Shoe Box - Rigid Craft",
        materialCategory: "Accessory",
        unit: "Piece",
        quantityRequired: 1,
        wastagePercent: 0,
        unitCost: 40,
      },
    ],
    totalMaterialCost: 1845,
    otherCost: 200, // labor & overhead
    totalEstimatedCost: 2045,
    updatedAt: "18 Sep 2026",
  },
  {
    id: "bom-002",
    productId: "prod-cat-003",
    productCode: "BELT-001",
    productName: "Classic Leather Belt 38mm",
    variantId: "var-009",
    variantSku: "BELT-001-BRN-34",
    variantName: "Dark Brown / Size 34",
    ingredients: [
      {
        itemId: "rm-005",
        itemCode: "RM-LEATH-005",
        itemName: "Heavy Buffalo Harness Leather - Dark Brown",
        materialCategory: "Raw Material",
        unit: "Sq.ft",
        quantityRequired: 2,
        wastagePercent: 5,
        unitCost: 150,
      },
      {
        itemId: "cmp-003",
        itemCode: "CMP-ACC-001",
        itemName: "Solid Brass Belt Buckle 38mm",
        materialCategory: "Accessory",
        unit: "Piece",
        quantityRequired: 1,
        wastagePercent: 0,
        unitCost: 120,
      },
      {
        itemId: "cmp-005",
        itemCode: "CMP-ACC-003",
        itemName: "Bonded Nylon Thread (Black 0.8mm)",
        materialCategory: "Component",
        unit: "Meter",
        quantityRequired: 5,
        wastagePercent: 5,
        unitCost: 0.8,
      },
    ],
    totalMaterialCost: 439,
    otherCost: 80,
    totalEstimatedCost: 519,
    updatedAt: "17 Sep 2026",
  },
];

const SEED_PRODUCTION_ORDERS: ProductionOrder[] = [
  {
    id: "po-001",
    orderNumber: "PROD-00001",
    productId: "prod-cat-001",
    productCode: "SHOE-001",
    productName: "Classic Leather Shoe",
    variantId: "var-002",
    variantSku: "SHOE-001-BLK-08",
    variantName: "Black / Size 8",
    plannedQuantity: 100,
    producedQuantity: 0,
    rejectedQuantity: 0,
    wastageQuantity: 0,
    productionDate: "18 Sep 2026",
    expectedCompletion: "20 Sep 2026",
    status: "In Production",
    currentStage: "Stitching / Assembly",
    materialsIssued: true,
    materialRequirements: [
      {
        itemId: "rm-001",
        itemCode: "RM-LEATH-001",
        itemName: "Full Grain Cow Leather - Black",
        unit: "Sq.ft",
        requiredQty: 1260, // 100 pairs * 12 * 1.05
        availableQty: 1500,
        shortageQty: 0,
        hasShortage: false,
      },
      {
        itemId: "cmp-001",
        itemCode: "CMP-SOLE-001",
        itemName: "TPR Shoe Rubber Sole (Size 8)",
        unit: "Pair",
        requiredQty: 100,
        availableQty: 350,
        shortageQty: 0,
        hasShortage: false,
      },
    ],
    notes: "Order prioritized for ABC Retail autumn catalog.",
    createdBy: "R. Geetha",
  },
  {
    id: "po-002",
    orderNumber: "PROD-00002",
    productId: "prod-cat-002",
    productCode: "BAG-001",
    productName: "Executive Leather Tote Bag",
    variantId: "var-006",
    variantSku: "BAG-001-COG-M",
    variantName: "Cognac Brown / Medium",
    plannedQuantity: 40,
    producedQuantity: 0,
    rejectedQuantity: 0,
    wastageQuantity: 0,
    productionDate: "17 Sep 2026",
    expectedCompletion: "22 Sep 2026",
    status: "Planned",
    currentStage: "Material Issue",
    materialsIssued: false,
    materialRequirements: [
      {
        itemId: "rm-002",
        itemCode: "RM-LEATH-002",
        itemName: "Full Grain Cow Leather - Cognac Brown",
        unit: "Sq.ft",
        requiredQty: 600,
        availableQty: 950,
        shortageQty: 0,
        hasShortage: false,
      },
      {
        itemId: "cmp-004",
        itemCode: "CMP-ACC-002",
        itemName: "Metal Zipper #5 Antique Brass (35cm)",
        unit: "Piece",
        requiredQty: 40,
        availableQty: 450,
        shortageQty: 0,
        hasShortage: false,
      },
    ],
    notes: "Awaiting material issue confirmation.",
    createdBy: "M. Saravanan",
  },
];

const SEED_WASTAGE_RECORDS: WastageRecord[] = [
  {
    id: "wst-001",
    wastageNumber: "WST-2026-001",
    date: "17 Sep 2026",
    productionOrderId: "po-001",
    productionOrderNumber: "PROD-00001",
    productName: "Classic Leather Shoe",
    itemId: "rm-001",
    itemCode: "RM-LEATH-001",
    itemName: "Full Grain Cow Leather - Black",
    materialCategory: "Raw Material",
    quantity: 15,
    unit: "Sq.ft",
    reason: "Leather Cutting Waste",
    recordedBy: "M. Saravanan",
    notes: "Flawed hide section discarded during upper panel die cutting.",
  },
  {
    id: "wst-002",
    wastageNumber: "WST-2026-002",
    date: "16 Sep 2026",
    productionOrderId: "po-001",
    productionOrderNumber: "PROD-00001",
    productName: "Classic Leather Shoe",
    itemId: "cmp-001",
    itemCode: "CMP-SOLE-001",
    itemName: "TPR Shoe Rubber Sole (Size 8)",
    materialCategory: "Component",
    quantity: 2,
    unit: "Pair",
    reason: "Defective Sole / Component",
    recordedBy: "P. Karthik",
    notes: "Air bubble cavity defect found on heel during lasting.",
  },
];

const SEED_STOCK_TRANSFERS: StockTransferRecord[] = [
  {
    id: "trf-001",
    transferNumber: "TRF-2026-001",
    date: "17 Sep 2026",
    itemId: "rm-001",
    itemCode: "RM-LEATH-001",
    itemName: "Full Grain Cow Leather - Black",
    category: "Raw Material",
    quantity: 300,
    unit: "Sq.ft",
    fromLocation: "Main Warehouse",
    toLocation: "Production Store",
    reason: "Issued for Production Order PROD-00001",
    transferredBy: "R. Geetha",
    status: "Completed",
  },
];

const SEED_STOCK_ADJUSTMENTS: StockAdjustmentRecord[] = [
  {
    id: "adj-001",
    adjustmentNumber: "ADJ-2026-001",
    date: "16 Sep 2026",
    itemId: "rm-003",
    itemCode: "RM-LEATH-003",
    itemName: "Goat Leather Lining - Tan",
    category: "Raw Material",
    systemStock: 825,
    physicalStock: 850,
    difference: 25,
    unit: "Sq.ft",
    adjustmentType: "Addition",
    reason: "Physical Count",
    user: "Admin",
    notes: "Found unrecorded roll during monthly stock audit.",
  },
];

const SEED_STOCK_MOVEMENTS: ExtendedStockMovement[] = [
  {
    id: "mov-101",
    movementId: "MOV-01250",
    date: "18 Sep 2026",
    dateTime: "18 Sep 2026, 11:30 AM",
    itemId: "fp-001",
    itemCode: "SHOE-001-BLK-08",
    itemName: "Classic Leather Shoe (Black / Size 8)",
    category: "Finished Goods",
    type: "Production Output",
    quantity: 60,
    quantityDisplay: "+60 Pair",
    previousBalance: 60,
    newBalance: 120,
    balanceDisplay: "120 Pair",
    reference: "PROD-00001",
    location: "Finished Goods",
    user: "R. Geetha",
    notes: "Batch completion output from production floor.",
  },
  {
    id: "mov-102",
    movementId: "MOV-01249",
    date: "17 Sep 2026",
    dateTime: "17 Sep 2026, 02:15 PM",
    itemId: "rm-001",
    itemCode: "RM-LEATH-001",
    itemName: "Full Grain Cow Leather - Black",
    category: "Raw Material",
    type: "Material Issue",
    quantity: -1260,
    quantityDisplay: "-1,260 Sq.ft",
    previousBalance: 2760,
    newBalance: 1500,
    balanceDisplay: "1,500 Sq.ft",
    reference: "PROD-00001",
    location: "Main Warehouse",
    user: "M. Saravanan",
    notes: "Issued raw hide panels for shoe manufacturing batch PROD-00001.",
  },
  {
    id: "mov-103",
    movementId: "MOV-01248",
    date: "17 Sep 2026",
    dateTime: "17 Sep 2026, 09:30 AM",
    itemId: "rm-001",
    itemCode: "RM-LEATH-001",
    itemName: "Full Grain Cow Leather - Black",
    category: "Raw Material",
    type: "Incoming",
    quantity: 500,
    quantityDisplay: "+500 Sq.ft",
    previousBalance: 2260,
    newBalance: 2760,
    balanceDisplay: "2,760 Sq.ft",
    reference: "IN-00125",
    location: "Main Warehouse",
    user: "R. Geetha",
    notes: "Raw hide batch delivery received from ABC Leather Suppliers.",
  },
  {
    id: "mov-104",
    movementId: "MOV-01247",
    date: "16 Sep 2026",
    dateTime: "16 Sep 2026, 04:00 PM",
    itemId: "rm-001",
    itemCode: "RM-LEATH-001",
    itemName: "Full Grain Cow Leather - Black",
    category: "Raw Material",
    type: "Wastage",
    quantity: -15,
    quantityDisplay: "-15 Sq.ft",
    previousBalance: 2275,
    newBalance: 2260,
    balanceDisplay: "2,260 Sq.ft",
    reference: "WST-2026-001",
    location: "Main Warehouse",
    user: "M. Saravanan",
    notes: "Defective leather section discarded during cutting.",
  },
];

/* ==========================================================================
   GLOBAL REACTIVE STORE SYSTEM
   ========================================================================== */

export interface FactoryState {
  rawMaterials: RawMaterialItem[];
  components: ComponentItem[];
  wipItems: WIPItem[];
  finishedProducts: FinishedProductItem[];
  productsCatalog: ProductCatalogItem[];
  boms: BillOfMaterial[];
  productionOrders: ProductionOrder[];
  wastageRecords: WastageRecord[];
  stockTransfers: StockTransferRecord[];
  stockAdjustments: StockAdjustmentRecord[];
  stockMovements: ExtendedStockMovement[];
}

const STORAGE_KEY = "leather_factory_store_v1";

function loadInitialState(): FactoryState {
  if (typeof window === "undefined") {
    return {
      rawMaterials: SEED_RAW_MATERIALS,
      components: SEED_COMPONENTS,
      wipItems: SEED_WIP_ITEMS,
      finishedProducts: SEED_FINISHED_PRODUCTS,
      productsCatalog: SEED_PRODUCT_CATALOG,
      boms: SEED_BOMS,
      productionOrders: SEED_PRODUCTION_ORDERS,
      wastageRecords: SEED_WASTAGE_RECORDS,
      stockTransfers: SEED_STOCK_TRANSFERS,
      stockAdjustments: SEED_STOCK_ADJUSTMENTS,
      stockMovements: SEED_STOCK_MOVEMENTS,
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        rawMaterials: parsed.rawMaterials || SEED_RAW_MATERIALS,
        components: parsed.components || SEED_COMPONENTS,
        wipItems: parsed.wipItems || SEED_WIP_ITEMS,
        finishedProducts: parsed.finishedProducts || SEED_FINISHED_PRODUCTS,
        productsCatalog: parsed.productsCatalog || SEED_PRODUCT_CATALOG,
        boms: parsed.boms || SEED_BOMS,
        productionOrders: parsed.productionOrders || SEED_PRODUCTION_ORDERS,
        wastageRecords: parsed.wastageRecords || SEED_WASTAGE_RECORDS,
        stockTransfers: parsed.stockTransfers || SEED_STOCK_TRANSFERS,
        stockAdjustments: parsed.stockAdjustments || SEED_STOCK_ADJUSTMENTS,
        stockMovements: parsed.stockMovements || SEED_STOCK_MOVEMENTS,
      };
    }
  } catch (e) {
    console.warn("Failed to load factory store from localStorage:", e);
  }

  return {
    rawMaterials: SEED_RAW_MATERIALS,
    components: SEED_COMPONENTS,
    wipItems: SEED_WIP_ITEMS,
    finishedProducts: SEED_FINISHED_PRODUCTS,
    productsCatalog: SEED_PRODUCT_CATALOG,
    boms: SEED_BOMS,
    productionOrders: SEED_PRODUCTION_ORDERS,
    wastageRecords: SEED_WASTAGE_RECORDS,
    stockTransfers: SEED_STOCK_TRANSFERS,
    stockAdjustments: SEED_STOCK_ADJUSTMENTS,
    stockMovements: SEED_STOCK_MOVEMENTS,
  };
}

let currentState: FactoryState = loadInitialState();
const listeners = new Set<() => void>();

function notify() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    } catch (e) {
      console.warn("Failed to save factory store:", e);
    }
  }
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): FactoryState {
  return currentState;
}

export function useFactoryStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/* ==========================================================================
   MUTATION ACTIONS & BUSINESS LOGIC
   ========================================================================== */

function generateId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
}

function formatTodayDate() {
  const d = new Date();
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatNowDateTime() {
  const d = new Date();
  return (
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );
}

// Internal stock status helper
function calcStatus(qty: number, min: number): "In Stock" | "Low Stock" | "Out of Stock" {
  if (qty <= 0) return "Out of Stock";
  if (qty <= min) return "Low Stock";
  return "In Stock";
}

// 1. Log Stock Movement (Immutable Audit Ledger)
export function addStockMovement(movement: {
  itemId: string;
  itemCode: string;
  itemName: string;
  category: MaterialCategory | string;
  type: MovementTypeExtended;
  quantity: number;
  unit: string;
  previousBalance: number;
  newBalance: number;
  reference: string;
  location: Location;
  user?: string;
  notes?: string;
}) {
  const sign = movement.quantity >= 0 ? "+" : "";
  const movRecord: ExtendedStockMovement = {
    id: generateId("mov"),
    movementId: `MOV-${Math.floor(10000 + Math.random() * 90000)}`,
    date: formatTodayDate(),
    dateTime: formatNowDateTime(),
    itemId: movement.itemId,
    itemCode: movement.itemCode,
    itemName: movement.itemName,
    category: movement.category,
    type: movement.type,
    quantity: movement.quantity,
    quantityDisplay: `${sign}${movement.quantity.toLocaleString()} ${movement.unit}`,
    previousBalance: movement.previousBalance,
    newBalance: movement.newBalance,
    balanceDisplay: `${movement.newBalance.toLocaleString()} ${movement.unit}`,
    reference: movement.reference,
    location: movement.location,
    user: movement.user || "R. Geetha",
    notes: movement.notes,
  };

  currentState = {
    ...currentState,
    stockMovements: [movRecord, ...currentState.stockMovements],
  };
}

// 2. Add / Edit Raw Material
export function saveRawMaterial(material: Partial<RawMaterialItem>) {
  const existingIndex = currentState.rawMaterials.findIndex((m) => m.id === material.id);
  let updatedMaterials = [...currentState.rawMaterials];

  if (existingIndex >= 0) {
    const prev = updatedMaterials[existingIndex];
    const newQty = material.currentStock ?? prev.currentStock;
    const minQty = material.minStock ?? prev.minStock;
    const newStatus = calcStatus(newQty, minQty);

    updatedMaterials[existingIndex] = {
      ...prev,
      ...material,
      currentStock: newQty,
      status: newStatus,
      lastUpdated: formatTodayDate(),
    } as RawMaterialItem;
  } else {
    const qty = material.currentStock || 0;
    const min = material.minStock || 100;
    const newItem: RawMaterialItem = {
      id: generateId("rm"),
      itemCode: material.itemCode || `RM-${Math.floor(1000 + Math.random() * 9000)}`,
      itemName: material.itemName || "New Raw Leather",
      category: "Raw Material",
      leatherType: material.leatherType || "Cow Leather",
      grade: material.grade || "Grade A",
      color: material.color || "Natural",
      thickness: material.thickness || "1.2mm",
      unit: material.unit || "Sq.ft",
      currentStock: qty,
      minStock: min,
      location: material.location || "Main Warehouse",
      batchLot: material.batchLot || `LOT-${formatTodayDate()}`,
      averageCost: material.averageCost || 100,
      status: calcStatus(qty, min),
      description: material.description,
      lastUpdated: formatTodayDate(),
    };

    updatedMaterials = [newItem, ...updatedMaterials];

    addStockMovement({
      itemId: newItem.id,
      itemCode: newItem.itemCode,
      itemName: newItem.itemName,
      category: "Raw Material",
      type: "Opening Stock",
      quantity: newItem.currentStock,
      unit: newItem.unit,
      previousBalance: 0,
      newBalance: newItem.currentStock,
      reference: "INITIAL",
      location: newItem.location,
    });
  }

  currentState = { ...currentState, rawMaterials: updatedMaterials };
  notify();
}

// 3. Add / Edit Component
export function saveComponent(component: Partial<ComponentItem>) {
  const existingIndex = currentState.components.findIndex((c) => c.id === component.id);
  let updated = [...currentState.components];

  if (existingIndex >= 0) {
    const prev = updated[existingIndex];
    const qty = component.currentStock ?? prev.currentStock;
    const min = component.minStock ?? prev.minStock;
    updated[existingIndex] = {
      ...prev,
      ...component,
      currentStock: qty,
      status: calcStatus(qty, min),
      lastUpdated: formatTodayDate(),
    } as ComponentItem;
  } else {
    const qty = component.currentStock || 0;
    const min = component.minStock || 50;
    const newItem: ComponentItem = {
      id: generateId("cmp"),
      itemCode: component.itemCode || `CMP-${Math.floor(1000 + Math.random() * 9000)}`,
      itemName: component.itemName || "New Component",
      category: component.category || "Component",
      unit: component.unit || "Piece",
      currentStock: qty,
      minStock: min,
      location: component.location || "Production Store",
      supplierName: component.supplierName,
      cost: component.cost || 50,
      status: calcStatus(qty, min),
      description: component.description,
      lastUpdated: formatTodayDate(),
    };
    updated = [newItem, ...updated];

    addStockMovement({
      itemId: newItem.id,
      itemCode: newItem.itemCode,
      itemName: newItem.itemName,
      category: newItem.category,
      type: "Opening Stock",
      quantity: newItem.currentStock,
      unit: newItem.unit,
      previousBalance: 0,
      newBalance: newItem.currentStock,
      reference: "INITIAL",
      location: newItem.location,
    });
  }

  currentState = { ...currentState, components: updated };
  notify();
}

// 4. Add / Edit Finished Product
export function saveFinishedProduct(product: Partial<FinishedProductItem>) {
  const existingIndex = currentState.finishedProducts.findIndex((fp) => fp.id === product.id);
  let updated = [...currentState.finishedProducts];

  if (existingIndex >= 0) {
    const prev = updated[existingIndex];
    const qty = product.currentStock ?? prev.currentStock;
    const min = product.minStock ?? prev.minStock;
    updated[existingIndex] = {
      ...prev,
      ...product,
      currentStock: qty,
      status: calcStatus(qty, min),
      lastUpdated: formatTodayDate(),
    } as FinishedProductItem;
  } else {
    const qty = product.currentStock || 0;
    const min = product.minStock || 20;
    const newItem: FinishedProductItem = {
      id: generateId("fp"),
      sku: product.sku || `SKU-${Math.floor(10000 + Math.random() * 90000)}`,
      productName: product.productName || "New Finished Product",
      productType: product.productType || "Shoes",
      category: "Finished Goods",
      variantName: product.variantName || "Standard",
      size: product.size,
      color: product.color,
      material: product.material,
      currentStock: qty,
      minStock: min,
      location: product.location || "Finished Goods",
      sellingPrice: product.sellingPrice || 1500,
      productionCost: product.productionCost || 800,
      status: calcStatus(qty, min),
      description: product.description,
      lastUpdated: formatTodayDate(),
    };
    updated = [newItem, ...updated];
  }

  currentState = { ...currentState, finishedProducts: updated };
  notify();
}

// 5. Save Product Catalog Item
export function saveProductCatalogItem(product: Partial<ProductCatalogItem>) {
  const existingIndex = currentState.productsCatalog.findIndex((p) => p.id === product.id);
  let updated = [...currentState.productsCatalog];

  if (existingIndex >= 0) {
    updated[existingIndex] = { ...updated[existingIndex], ...product } as ProductCatalogItem;
  } else {
    const newItem: ProductCatalogItem = {
      id: generateId("prod-cat"),
      productCode: product.productCode || `PROD-${Math.floor(100 + Math.random() * 900)}`,
      productName: product.productName || "New Product",
      category: product.category || "Shoes",
      description: product.description || "",
      variants: product.variants || [],
      basePrice: product.basePrice || 2000,
      estimatedCost: product.estimatedCost || 1000,
    };
    updated = [newItem, ...updated];
  }

  currentState = { ...currentState, productsCatalog: updated };
  notify();
}

// 6. Save Bill of Materials (BOM)
export function saveBOM(bom: Partial<BillOfMaterial>) {
  const existingIndex = currentState.boms.findIndex((b) => b.id === bom.id);
  let updated = [...currentState.boms];

  const ingredients = bom.ingredients || [];
  let totalMatCost = 0;
  ingredients.forEach((ing) => {
    const qtyWithWastage = ing.quantityRequired * (1 + (ing.wastagePercent || 0) / 100);
    totalMatCost += qtyWithWastage * ing.unitCost;
  });

  const otherCost = bom.otherCost || 200;
  const totalEstCost = Math.round(totalMatCost + otherCost);

  if (existingIndex >= 0) {
    updated[existingIndex] = {
      ...updated[existingIndex],
      ...bom,
      ingredients,
      totalMaterialCost: Math.round(totalMatCost),
      otherCost,
      totalEstimatedCost: totalEstCost,
      updatedAt: formatTodayDate(),
    } as BillOfMaterial;
  } else {
    const newBom: BillOfMaterial = {
      id: generateId("bom"),
      productId: bom.productId || "",
      productCode: bom.productCode || "",
      productName: bom.productName || "",
      variantId: bom.variantId,
      variantSku: bom.variantSku,
      variantName: bom.variantName,
      ingredients,
      totalMaterialCost: Math.round(totalMatCost),
      otherCost,
      totalEstimatedCost: totalEstCost,
      updatedAt: formatTodayDate(),
    };
    updated = [newBom, ...updated];
  }

  currentState = { ...currentState, boms: updated };
  notify();
}

// 7. Check Material Shortage for Production Order
export function calculateProductionMaterialRequirement(
  productId: string,
  variantId: string | undefined,
  plannedQty: number
): MaterialRequirementCheck[] {
  const bom = currentState.boms.find(
    (b) => b.productId === productId && (!variantId || b.variantId === variantId)
  ) || currentState.boms.find((b) => b.productId === productId);

  if (!bom) return [];

  return bom.ingredients.map((ing) => {
    const rawMat = currentState.rawMaterials.find(
      (m) => m.id === ing.itemId || m.itemCode === ing.itemCode
    );
    const compMat = currentState.components.find(
      (c) => c.id === ing.itemId || c.itemCode === ing.itemCode
    );

    const availableQty = rawMat ? rawMat.currentStock : compMat ? compMat.currentStock : 0;
    const requiredPerUnit = ing.quantityRequired * (1 + (ing.wastagePercent || 0) / 100);
    const totalRequired = Math.ceil(requiredPerUnit * plannedQty);
    const shortageQty = Math.max(0, totalRequired - availableQty);

    return {
      itemId: ing.itemId,
      itemCode: ing.itemCode,
      itemName: ing.itemName,
      unit: ing.unit,
      requiredQty: totalRequired,
      availableQty,
      shortageQty,
      hasShortage: shortageQty > 0,
    };
  });
}

// 8. Create / Update Production Order
export function createProductionOrder(order: Partial<ProductionOrder>) {
  const reqs = calculateProductionMaterialRequirement(
    order.productId || "",
    order.variantId,
    order.plannedQuantity || 100
  );

  const poNumber = `PROD-${Math.floor(10000 + Math.random() * 90000)}`;

  const newOrder: ProductionOrder = {
    id: generateId("po"),
    orderNumber: order.orderNumber || poNumber,
    productId: order.productId || "",
    productCode: order.productCode || "",
    productName: order.productName || "",
    variantId: order.variantId,
    variantSku: order.variantSku,
    variantName: order.variantName || "Standard",
    plannedQuantity: order.plannedQuantity || 100,
    producedQuantity: 0,
    rejectedQuantity: 0,
    wastageQuantity: 0,
    productionDate: order.productionDate || formatTodayDate(),
    expectedCompletion: order.expectedCompletion || formatTodayDate(),
    status: order.status || "Planned",
    currentStage: "Material Issue",
    materialsIssued: false,
    materialRequirements: reqs,
    notes: order.notes,
    createdBy: order.createdBy || "R. Geetha",
  };

  currentState = {
    ...currentState,
    productionOrders: [newOrder, ...currentState.productionOrders],
  };
  notify();
  return newOrder;
}

// 9. Issue Materials for Production Order
export function issueMaterialsForProduction(orderId: string) {
  const orderIndex = currentState.productionOrders.findIndex((p) => p.id === orderId);
  if (orderIndex < 0) return { success: false, message: "Order not found" };

  const order = currentState.productionOrders[orderIndex];
  if (order.materialsIssued)
    return { success: false, message: "Materials already issued for this order" };

  const reqs = calculateProductionMaterialRequirement(
    order.productId,
    order.variantId,
    order.plannedQuantity
  );
  const shortages = reqs.filter((r) => r.hasShortage);

  if (shortages.length > 0) {
    const list = shortages.map((s) => `${s.itemName} (Shortage: ${s.shortageQty} ${s.unit})`).join(", ");
    return {
      success: false,
      message: `Cannot issue materials due to shortage: ${list}`,
    };
  }

  let updatedRaw = [...currentState.rawMaterials];
  let updatedCmp = [...currentState.components];

  reqs.forEach((r) => {
    const rmIndex = updatedRaw.findIndex((m) => m.id === r.itemId || m.itemCode === r.itemCode);
    if (rmIndex >= 0) {
      const prev = updatedRaw[rmIndex];
      const newStock = Math.max(0, prev.currentStock - r.requiredQty);
      updatedRaw[rmIndex] = {
        ...prev,
        currentStock: newStock,
        status: calcStatus(newStock, prev.minStock),
        lastUpdated: formatTodayDate(),
      };

      addStockMovement({
        itemId: prev.id,
        itemCode: prev.itemCode,
        itemName: prev.itemName,
        category: "Raw Material",
        type: "Material Issue",
        quantity: -r.requiredQty,
        unit: r.unit,
        previousBalance: prev.currentStock,
        newBalance: newStock,
        reference: order.orderNumber,
        location: prev.location,
        notes: `Issued for production order ${order.orderNumber}`,
      });
    } else {
      const cmpIndex = updatedCmp.findIndex((c) => c.id === r.itemId || c.itemCode === r.itemCode);
      if (cmpIndex >= 0) {
        const prev = updatedCmp[cmpIndex];
        const newStock = Math.max(0, prev.currentStock - r.requiredQty);
        updatedCmp[cmpIndex] = {
          ...prev,
          currentStock: newStock,
          status: calcStatus(newStock, prev.minStock),
          lastUpdated: formatTodayDate(),
        };

        addStockMovement({
          itemId: prev.id,
          itemCode: prev.itemCode,
          itemName: prev.itemName,
          category: prev.category,
          type: "Material Issue",
          quantity: -r.requiredQty,
          unit: r.unit,
          previousBalance: prev.currentStock,
          newBalance: newStock,
          reference: order.orderNumber,
          location: prev.location,
          notes: `Issued for production order ${order.orderNumber}`,
        });
      }
    }
  });

  const newWIP: WIPItem = {
    id: generateId("wip"),
    wipCode: `WIP-${Math.floor(10000 + Math.random() * 90000)}`,
    productName: order.productName,
    productCode: order.productCode,
    variantName: order.variantName,
    productionOrderId: order.id,
    productionOrderNumber: order.orderNumber,
    stage: "Cutting",
    quantity: order.plannedQuantity,
    completedQuantity: 0,
    unit: "Pair",
    productionDate: formatTodayDate(),
    currentLocation: "Production Store",
    status: "In Production",
  };

  let updatedOrders = [...currentState.productionOrders];
  updatedOrders[orderIndex] = {
    ...order,
    status: "In Production",
    currentStage: "Cutting",
    materialsIssued: true,
  };

  currentState = {
    ...currentState,
    rawMaterials: updatedRaw,
    components: updatedCmp,
    wipItems: [newWIP, ...currentState.wipItems],
    productionOrders: updatedOrders,
  };

  notify();
  return { success: true, message: "Materials issued successfully and order placed In Production." };
}

// 10. Update Production Stage / Progress
export function updateProductionStage(
  orderId: string,
  stage: ProductionStage,
  completedQty?: number
) {
  const orderIndex = currentState.productionOrders.findIndex((p) => p.id === orderId);
  if (orderIndex < 0) return;

  const order = currentState.productionOrders[orderIndex];
  const isFinished = stage === "Completed";

  let updatedOrders = [...currentState.productionOrders];
  updatedOrders[orderIndex] = {
    ...order,
    currentStage: stage,
    status: isFinished ? "Completed" : stage === "Quality Check" ? "Quality Check" : "In Production",
  };

  let updatedWip = currentState.wipItems.map((w) => {
    if (w.productionOrderId === orderId) {
      return {
        ...w,
        stage,
        completedQuantity: completedQty !== undefined ? completedQty : w.completedQuantity,
        status: isFinished ? ("Completed" as const) : ("In Production" as const),
      };
    }
    return w;
  });

  currentState = {
    ...currentState,
    productionOrders: updatedOrders,
    wipItems: updatedWip,
  };
  notify();
}

// 11. Complete Production Order (Creates Finished Goods & Records Rejections/Wastage)
export function completeProductionOrder(params: {
  orderId: string;
  producedQty: number;
  rejectedQty: number;
  wastageQty: number;
  notes?: string;
}) {
  const orderIndex = currentState.productionOrders.findIndex((p) => p.id === params.orderId);
  if (orderIndex < 0) return { success: false, message: "Order not found" };

  const order = currentState.productionOrders[orderIndex];

  let updatedFinished = [...currentState.finishedProducts];
  const fpIndex = updatedFinished.findIndex(
    (fp) =>
      fp.productName === order.productName &&
      (fp.variantName === order.variantName || fp.sku === order.variantSku)
  );

  let targetFpId = "";
  let fpSku = order.variantSku || `SKU-${order.productCode}-01`;

  if (fpIndex >= 0) {
    const prev = updatedFinished[fpIndex];
    const newStock = prev.currentStock + params.producedQty;
    updatedFinished[fpIndex] = {
      ...prev,
      currentStock: newStock,
      status: calcStatus(newStock, prev.minStock),
      lastUpdated: formatTodayDate(),
    };
    targetFpId = prev.id;
    fpSku = prev.sku;

    addStockMovement({
      itemId: prev.id,
      itemCode: prev.sku,
      itemName: `${prev.productName} (${prev.variantName})`,
      category: "Finished Goods",
      type: "Production Output",
      quantity: params.producedQty,
      unit: "Pair",
      previousBalance: prev.currentStock,
      newBalance: newStock,
      reference: order.orderNumber,
      location: prev.location,
      notes: `Batch output for production order ${order.orderNumber}`,
    });
  } else {
    const newFp: FinishedProductItem = {
      id: generateId("fp"),
      sku: fpSku,
      productName: order.productName,
      productType: "Shoes",
      category: "Finished Goods",
      variantName: order.variantName || "Standard",
      currentStock: params.producedQty,
      minStock: 25,
      location: "Finished Goods",
      sellingPrice: 3800,
      productionCost: 1850,
      status: calcStatus(params.producedQty, 25),
      lastUpdated: formatTodayDate(),
    };
    updatedFinished = [newFp, ...updatedFinished];
    targetFpId = newFp.id;

    addStockMovement({
      itemId: newFp.id,
      itemCode: newFp.sku,
      itemName: `${newFp.productName} (${newFp.variantName})`,
      category: "Finished Goods",
      type: "Production Output",
      quantity: params.producedQty,
      unit: "Pair",
      previousBalance: 0,
      newBalance: params.producedQty,
      reference: order.orderNumber,
      location: newFp.location,
    });
  }

  let updatedWastage = [...currentState.wastageRecords];

  if (params.rejectedQty > 0) {
    const wstRec: WastageRecord = {
      id: generateId("wst"),
      wastageNumber: `WST-${Math.floor(10000 + Math.random() * 90000)}`,
      date: formatTodayDate(),
      productionOrderId: order.id,
      productionOrderNumber: order.orderNumber,
      productName: order.productName,
      itemId: targetFpId,
      itemCode: fpSku,
      itemName: `${order.productName} (${order.variantName})`,
      materialCategory: "Finished Goods",
      quantity: params.rejectedQty,
      unit: "Pair",
      reason: "Production Rejection",
      recordedBy: "R. Geetha",
      notes: `Quality check rejection during production of ${order.orderNumber}`,
    };
    updatedWastage = [wstRec, ...updatedWastage];
  }

  if (params.wastageQty > 0) {
    const wstRec: WastageRecord = {
      id: generateId("wst"),
      wastageNumber: `WST-${Math.floor(10000 + Math.random() * 90000)}`,
      date: formatTodayDate(),
      productionOrderId: order.id,
      productionOrderNumber: order.orderNumber,
      productName: order.productName,
      itemId: "rm-001",
      itemCode: "RM-LEATH-001",
      itemName: "Leather Cutting Waste",
      materialCategory: "Raw Material",
      quantity: params.wastageQty,
      unit: "Sq.ft",
      reason: "Leather Cutting Waste",
      recordedBy: "R. Geetha",
      notes: `Cutting waste recorded for ${order.orderNumber}`,
    };
    updatedWastage = [wstRec, ...updatedWastage];
  }

  let updatedOrders = [...currentState.productionOrders];
  updatedOrders[orderIndex] = {
    ...order,
    producedQuantity: params.producedQty,
    rejectedQuantity: params.rejectedQty,
    wastageQuantity: params.wastageQty,
    status: "Completed",
    currentStage: "Completed",
  };

  let updatedWip = currentState.wipItems.map((w) => {
    if (w.productionOrderId === order.id) {
      return {
        ...w,
        stage: "Completed" as const,
        completedQuantity: params.producedQty,
        status: "Completed" as const,
      };
    }
    return w;
  });

  currentState = {
    ...currentState,
    finishedProducts: updatedFinished,
    wastageRecords: updatedWastage,
    productionOrders: updatedOrders,
    wipItems: updatedWip,
  };

  notify();
  return { success: true, message: `Production order ${order.orderNumber} completed. ${params.producedQty} units added to Finished Goods.` };
}

// 12. Record Wastage directly
export function logWastage(wastage: Partial<WastageRecord>) {
  const newRec: WastageRecord = {
    id: generateId("wst"),
    wastageNumber: wastage.wastageNumber || `WST-${Math.floor(10000 + Math.random() * 90000)}`,
    date: wastage.date || formatTodayDate(),
    productionOrderId: wastage.productionOrderId,
    productionOrderNumber: wastage.productionOrderNumber,
    productName: wastage.productName,
    itemId: wastage.itemId || "",
    itemCode: wastage.itemCode || "",
    itemName: wastage.itemName || "Material",
    materialCategory: wastage.materialCategory || "Raw Material",
    quantity: wastage.quantity || 1,
    unit: wastage.unit || "Sq.ft",
    reason: wastage.reason || "Leather Cutting Waste",
    recordedBy: wastage.recordedBy || "R. Geetha",
    notes: wastage.notes,
  };

  let updatedRaw = [...currentState.rawMaterials];
  let updatedCmp = [...currentState.components];

  const rmIdx = updatedRaw.findIndex((m) => m.id === wastage.itemId || m.itemCode === wastage.itemCode);
  if (rmIdx >= 0) {
    const prev = updatedRaw[rmIdx];
    const newStock = Math.max(0, prev.currentStock - (wastage.quantity || 0));
    updatedRaw[rmIdx] = {
      ...prev,
      currentStock: newStock,
      status: calcStatus(newStock, prev.minStock),
      lastUpdated: formatTodayDate(),
    };

    addStockMovement({
      itemId: prev.id,
      itemCode: prev.itemCode,
      itemName: prev.itemName,
      category: "Raw Material",
      type: "Wastage",
      quantity: -(wastage.quantity || 0),
      unit: prev.unit,
      previousBalance: prev.currentStock,
      newBalance: newStock,
      reference: newRec.wastageNumber,
      location: prev.location,
      notes: wastage.notes,
    });
  }

  currentState = {
    ...currentState,
    rawMaterials: updatedRaw,
    components: updatedCmp,
    wastageRecords: [newRec, ...currentState.wastageRecords],
  };
  notify();
}

// 13. Customer Dispatch (Finished Goods Outgoing)
export function dispatchFinishedGoods(dispatchData: {
  customerName: string;
  sku: string;
  quantity: number;
  referenceNumber?: string;
  destination?: string;
  issuedBy?: string;
  notes?: string;
}) {
  const fpIndex = currentState.finishedProducts.findIndex(
    (fp) => fp.sku === dispatchData.sku || fp.id === dispatchData.sku
  );

  if (fpIndex < 0) {
    return { success: false, message: "Finished Product not found." };
  }

  const item = currentState.finishedProducts[fpIndex];

  if (item.currentStock < dispatchData.quantity) {
    return {
      success: false,
      message: `Insufficient finished product stock. Requested ${dispatchData.quantity}, but only ${item.currentStock} available in inventory.`,
    };
  }

  const newStock = item.currentStock - dispatchData.quantity;
  let updatedFinished = [...currentState.finishedProducts];

  updatedFinished[fpIndex] = {
    ...item,
    currentStock: newStock,
    status: calcStatus(newStock, item.minStock),
    lastUpdated: formatTodayDate(),
  };

  addStockMovement({
    itemId: item.id,
    itemCode: item.sku,
    itemName: `${item.productName} (${item.variantName})`,
    category: "Finished Goods",
    type: "Outgoing",
    quantity: -dispatchData.quantity,
    unit: "Pair",
    previousBalance: item.currentStock,
    newBalance: newStock,
    reference: dispatchData.referenceNumber || `SO-${Math.floor(10000 + Math.random() * 90000)}`,
    location: item.location,
    user: dispatchData.issuedBy || "R. Geetha",
    notes: `Dispatched to customer ${dispatchData.customerName}`,
  });

  currentState = {
    ...currentState,
    finishedProducts: updatedFinished,
  };
  notify();

  return { success: true, message: `Successfully dispatched ${dispatchData.quantity} units to ${dispatchData.customerName}.` };
}

// 14. Receive Incoming Stock (GRN)
export function receiveIncomingStock(entry: Partial<IncomingEntry>) {
  let updatedRaw = [...currentState.rawMaterials];
  let updatedCmp = [...currentState.components];

  const grnRef = entry.grnNumber || `IN-${Math.floor(10000 + Math.random() * 90000)}`;

  (entry.items || []).forEach((item) => {
    const rmIdx = updatedRaw.findIndex((m) => m.id === item.itemId || m.itemCode === item.itemCode);
    if (rmIdx >= 0) {
      const prev = updatedRaw[rmIdx];
      const newStock = prev.currentStock + item.quantity;
      updatedRaw[rmIdx] = {
        ...prev,
        currentStock: newStock,
        status: calcStatus(newStock, prev.minStock),
        lastUpdated: formatTodayDate(),
      };

      addStockMovement({
        itemId: prev.id,
        itemCode: prev.itemCode,
        itemName: prev.itemName,
        category: "Raw Material",
        type: "Incoming",
        quantity: item.quantity,
        unit: item.unit,
        previousBalance: prev.currentStock,
        newBalance: newStock,
        reference: grnRef,
        location: entry.warehouse || prev.location,
        user: entry.receivedBy || "R. Geetha",
        notes: `Received from ${entry.supplier}`,
      });
    } else {
      const cmpIdx = updatedCmp.findIndex((c) => c.id === item.itemId || c.itemCode === item.itemCode);
      if (cmpIdx >= 0) {
        const prev = updatedCmp[cmpIdx];
        const newStock = prev.currentStock + item.quantity;
        updatedCmp[cmpIdx] = {
          ...prev,
          currentStock: newStock,
          status: calcStatus(newStock, prev.minStock),
          lastUpdated: formatTodayDate(),
        };

        addStockMovement({
          itemId: prev.id,
          itemCode: prev.itemCode,
          itemName: prev.itemName,
          category: prev.category,
          type: "Incoming",
          quantity: item.quantity,
          unit: item.unit,
          previousBalance: prev.currentStock,
          newBalance: newStock,
          reference: grnRef,
          location: entry.warehouse || prev.location,
          user: entry.receivedBy || "R. Geetha",
          notes: `Received from ${entry.supplier}`,
        });
      }
    }
  });

  currentState = {
    ...currentState,
    rawMaterials: updatedRaw,
    components: updatedCmp,
  };
  notify();
  return { success: true, message: `GRN ${grnRef} received and inventory updated.` };
}

// 15. Stock Transfer
export function executeStockTransfer(transfer: {
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  fromLocation: Location;
  toLocation: Location;
  reason: string;
  user?: string;
}) {
  const trfRecord: StockTransferRecord = {
    id: generateId("trf"),
    transferNumber: `TRF-${Math.floor(10000 + Math.random() * 90000)}`,
    date: formatTodayDate(),
    itemId: transfer.itemId,
    itemCode: transfer.itemCode,
    itemName: transfer.itemName,
    category: transfer.category,
    quantity: transfer.quantity,
    unit: transfer.unit,
    fromLocation: transfer.fromLocation,
    toLocation: transfer.toLocation,
    reason: transfer.reason,
    transferredBy: transfer.user || "R. Geetha",
    status: "Completed",
  };

  addStockMovement({
    itemId: transfer.itemId,
    itemCode: transfer.itemCode,
    itemName: transfer.itemName,
    category: transfer.category,
    type: "Transfer",
    quantity: -transfer.quantity,
    unit: transfer.unit,
    previousBalance: 1000,
    newBalance: 1000 - transfer.quantity,
    reference: trfRecord.transferNumber,
    location: transfer.fromLocation,
    user: transfer.user,
    notes: `Transferred from ${transfer.fromLocation} to ${transfer.toLocation}: ${transfer.reason}`,
  });

  currentState = {
    ...currentState,
    stockTransfers: [trfRecord, ...currentState.stockTransfers],
  };
  notify();
  return { success: true, message: `Stock transfer ${trfRecord.transferNumber} completed.` };
}

// 16. Stock Adjustment
export function executeStockAdjustment(adj: {
  itemId: string;
  itemCode: string;
  itemName: string;
  category: string;
  systemStock: number;
  physicalStock: number;
  unit: string;
  reason: "Physical Count" | "Damage" | "Missing Stock" | "Data Correction" | "Other";
  notes?: string;
  user?: string;
}) {
  const diff = adj.physicalStock - adj.systemStock;
  const adjType = diff >= 0 ? "Addition" : "Deduction";

  const adjRecord: StockAdjustmentRecord = {
    id: generateId("adj"),
    adjustmentNumber: `ADJ-${Math.floor(10000 + Math.random() * 90000)}`,
    date: formatTodayDate(),
    itemId: adj.itemId,
    itemCode: adj.itemCode,
    itemName: adj.itemName,
    category: adj.category,
    systemStock: adj.systemStock,
    physicalStock: adj.physicalStock,
    difference: diff,
    unit: adj.unit,
    adjustmentType: adjType,
    reason: adj.reason,
    user: adj.user || "R. Geetha",
    notes: adj.notes,
  };

  let updatedRaw = [...currentState.rawMaterials];
  let updatedCmp = [...currentState.components];
  let updatedFp = [...currentState.finishedProducts];

  const rmIdx = updatedRaw.findIndex((m) => m.id === adj.itemId || m.itemCode === adj.itemCode);
  if (rmIdx >= 0) {
    const prev = updatedRaw[rmIdx];
    updatedRaw[rmIdx] = {
      ...prev,
      currentStock: adj.physicalStock,
      status: calcStatus(adj.physicalStock, prev.minStock),
      lastUpdated: formatTodayDate(),
    };
  }

  const cmpIdx = updatedCmp.findIndex((c) => c.id === adj.itemId || c.itemCode === adj.itemCode);
  if (cmpIdx >= 0) {
    const prev = updatedCmp[cmpIdx];
    updatedCmp[cmpIdx] = {
      ...prev,
      currentStock: adj.physicalStock,
      status: calcStatus(adj.physicalStock, prev.minStock),
      lastUpdated: formatTodayDate(),
    };
  }

  const fpIdx = updatedFp.findIndex((f) => f.id === adj.itemId || f.sku === adj.itemCode);
  if (fpIdx >= 0) {
    const prev = updatedFp[fpIdx];
    updatedFp[fpIdx] = {
      ...prev,
      currentStock: adj.physicalStock,
      status: calcStatus(adj.physicalStock, prev.minStock),
      lastUpdated: formatTodayDate(),
    };
  }

  addStockMovement({
    itemId: adj.itemId,
    itemCode: adj.itemCode,
    itemName: adj.itemName,
    category: adj.category,
    type: "Adjustment",
    quantity: diff,
    unit: adj.unit,
    previousBalance: adj.systemStock,
    newBalance: adj.physicalStock,
    reference: adjRecord.adjustmentNumber,
    location: "Main Warehouse",
    user: adj.user,
    notes: `Stock adjustment: ${adj.reason}. ${adj.notes || ""}`,
  });

  currentState = {
    ...currentState,
    rawMaterials: updatedRaw,
    components: updatedCmp,
    finishedProducts: updatedFp,
    stockAdjustments: [adjRecord, ...currentState.stockAdjustments],
  };
  notify();
  return { success: true, message: `Stock adjustment ${adjRecord.adjustmentNumber} saved.` };
}
