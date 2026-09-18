export type Category = "Raw Leather" | "Chemicals" | "Accessories" | "Hardware" | "Finished Goods";

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type IncomingStatus = "Received" | "Pending" | "Cancelled";

export type OutgoingStatus = "Issued" | "Pending" | "Cancelled";

export type MovementType = "Incoming" | "Outgoing" | "Adjustment" | "Return" | "Transfer";

export type SupplierStatus = "Active" | "Inactive";

export type OutgoingPurpose =
  | "Production"
  | "Customer Order"
  | "Internal Transfer"
  | "Sample"
  | "Damaged"
  | "Other";

export type Location = "Warehouse A" | "Warehouse B" | "Chemical Store" | "Finishing Unit";

export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: Category;
  unit: string;
  currentStock: number;
  minStock: number;
  status: StockStatus;
  location: Location;
  description?: string;
  lastUpdated?: string;
}

export interface IncomingLineItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  rate: number;
  total: number;
}

export interface IncomingEntry {
  id: string;
  grnNumber: string;
  date: string;
  supplier: string;
  invoiceNumber?: string;
  warehouse: Location;
  receivedBy: string;
  itemCount: number;
  totalQuantity: number;
  quantityDisplay: string;
  subtotal: number;
  otherCharges: number;
  grandTotal: number;
  status: IncomingStatus;
  notes?: string;
  items: IncomingLineItem[];
}

export interface OutgoingLineItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  availableStock: number;
  quantity: number;
  unit: string;
  rate: number;
  total: number;
}

export interface OutgoingEntry {
  id: string;
  issueNumber: string;
  date: string;
  destination: string;
  purpose: OutgoingPurpose;
  referenceNumber?: string;
  warehouse: Location;
  issuedBy: string;
  itemCount: number;
  totalQuantity: number;
  quantityDisplay: string;
  totalValue: number;
  status: OutgoingStatus;
  notes?: string;
  items: OutgoingLineItem[];
}

export interface StockMovement {
  id: string;
  movementId: string;
  date: string;
  dateTime?: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  type: MovementType;
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

export interface SuppliedMaterial {
  itemCode: string;
  itemName: string;
  category: Category;
  lastReceived: string;
  totalQuantity: string;
}

export interface SupplierRecord {
  id: string;
  supplierCode: string;
  supplierName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address?: string;
  city: string;
  state?: string;
  gstNumber?: string;
  location: string;
  itemsSuppliedCount: number;
  mainCategory: Category;
  itemsSuppliedList: string;
  status: SupplierStatus;
  notes?: string;
  materials: SuppliedMaterial[];
}

export const SUPPLIERS: string[] = [
  "ABC Leather Suppliers",
  "Chennai Hide Traders",
  "South India Leather Materials",
  "Apex Chemical Corp",
  "Precision Hardware Co",
  "Global Tannery Supplies",
];

export const PURPOSES: OutgoingPurpose[] = [
  "Production",
  "Customer Order",
  "Internal Transfer",
  "Sample",
  "Damaged",
  "Other",
];

export const MOVEMENT_TYPES: MovementType[] = [
  "Incoming",
  "Outgoing",
  "Adjustment",
  "Return",
  "Transfer",
];

export const CATEGORIES: Category[] = [
  "Raw Leather",
  "Chemicals",
  "Accessories",
  "Hardware",
  "Finished Goods",
];

export const LOCATIONS: Location[] = [
  "Warehouse A",
  "Warehouse B",
  "Chemical Store",
  "Finishing Unit",
];

export const STATUSES: StockStatus[] = ["In Stock", "Low Stock", "Out of Stock"];

export const INCOMING_STATUSES: IncomingStatus[] = ["Received", "Pending", "Cancelled"];

export const OUTGOING_STATUSES: OutgoingStatus[] = ["Issued", "Pending", "Cancelled"];

export const SUPPLIER_STATUSES: SupplierStatus[] = ["Active", "Inactive"];

export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: "lf-001",
    itemCode: "LF-001",
    itemName: "Full Grain Cow Leather",
    category: "Raw Leather",
    unit: "Sq.ft",
    currentStock: 2450,
    minStock: 1000,
    status: "In Stock",
    location: "Warehouse A",
    description: "Premium full-grain cowhide suitable for footwear and upper leather crafting.",
    lastUpdated: "Today, 09:30 AM",
  },
  {
    id: "lf-002",
    itemCode: "LF-002",
    itemName: "Goat Leather",
    category: "Raw Leather",
    unit: "Sq.ft",
    currentStock: 850,
    minStock: 1000,
    status: "Low Stock",
    location: "Warehouse A",
    description: "Soft vegetable-tanned goat skins used for linings and small goods.",
    lastUpdated: "Today, 11:15 AM",
  },
  {
    id: "ch-001",
    itemCode: "CH-001",
    itemName: "Leather Dye",
    category: "Chemicals",
    unit: "Kg",
    currentStock: 120,
    minStock: 50,
    status: "In Stock",
    location: "Chemical Store",
    description: "Concentrated cognac brown water-based penetrating dye.",
    lastUpdated: "Yesterday, 04:20 PM",
  },
  {
    id: "ac-001",
    itemCode: "AC-001",
    itemName: "Leather Thread",
    category: "Accessories",
    unit: "Roll",
    currentStock: 35,
    minStock: 40,
    status: "Low Stock",
    location: "Warehouse B",
    description: "Heavy-duty waxed polyester thread (0.8mm) for heavy stitching.",
    lastUpdated: "Yesterday, 02:10 PM",
  },
  {
    id: "ch-003",
    itemCode: "CH-003",
    itemName: "Solvent Degreaser",
    category: "Chemicals",
    unit: "Ltr",
    currentStock: 0,
    minStock: 25,
    status: "Out of Stock",
    location: "Chemical Store",
    description: "Industrial grade solvent for hide surface cleaning prior to tanning.",
    lastUpdated: "3 days ago",
  },
  {
    id: "hw-001",
    itemCode: "HW-001",
    itemName: "Brass Buckles 40mm",
    category: "Hardware",
    unit: "Pcs",
    currentStock: 1200,
    minStock: 500,
    status: "In Stock",
    location: "Warehouse B",
    description: "Solid antique brass belt buckle 40mm width.",
    lastUpdated: "Today, 08:45 AM",
  },
  {
    id: "lf-003",
    itemCode: "LF-003",
    itemName: "Suede Calfskin",
    category: "Raw Leather",
    unit: "Sq.ft",
    currentStock: 1500,
    minStock: 500,
    status: "In Stock",
    location: "Warehouse A",
    description: "Velvety texture calf suede for premium jacket and shoe production.",
    lastUpdated: "2 days ago",
  },
  {
    id: "ch-002",
    itemCode: "CH-002",
    itemName: "Tanning Oil",
    category: "Chemicals",
    unit: "Ltr",
    currentStock: 15,
    minStock: 30,
    status: "Low Stock",
    location: "Chemical Store",
    description: "Natural neatsfoot oil blend for fatliquoring process.",
    lastUpdated: "Yesterday, 05:00 PM",
  },
  {
    id: "ac-002",
    itemCode: "AC-002",
    itemName: "Metal Zippers 30cm",
    category: "Accessories",
    unit: "Pcs",
    currentStock: 450,
    minStock: 200,
    status: "In Stock",
    location: "Warehouse B",
    description: "Antique brass #5 metal teeth zippers with locking sliders.",
    lastUpdated: "4 days ago",
  },
  {
    id: "fg-001",
    itemCode: "FG-001",
    itemName: "Finished Belt Strips",
    category: "Finished Goods",
    unit: "Roll",
    currentStock: 0,
    minStock: 15,
    status: "Out of Stock",
    location: "Finishing Unit",
    description: "Pre-cut 38mm edge-painted full-grain belt strips ready for assembly.",
    lastUpdated: "5 days ago",
  },
  {
    id: "ch-004",
    itemCode: "CH-004",
    itemName: "Edge Paint Brown",
    category: "Chemicals",
    unit: "Ltr",
    currentStock: 45,
    minStock: 20,
    status: "In Stock",
    location: "Finishing Unit",
    description: "Flexible matte finish brown leather edge coat.",
    lastUpdated: "Today, 10:00 AM",
  },
  {
    id: "hw-002",
    itemCode: "HW-002",
    itemName: "Heavy Duty Rivets",
    category: "Hardware",
    unit: "Box",
    currentStock: 80,
    minStock: 100,
    status: "Low Stock",
    location: "Warehouse B",
    description: "Copper cap rivets with setting burrs (100 pcs per box).",
    lastUpdated: "Yesterday, 11:30 AM",
  },
];

export const INITIAL_INCOMING_ENTRIES: IncomingEntry[] = [
  {
    id: "in-00125",
    grnNumber: "IN-00125",
    date: "17 Sep 2026",
    supplier: "ABC Leather Suppliers",
    invoiceNumber: "INV-2026-881",
    warehouse: "Warehouse A",
    receivedBy: "R. Geetha",
    itemCount: 3,
    totalQuantity: 850,
    quantityDisplay: "850 Sq.ft",
    subtotal: 82000,
    otherCharges: 3000,
    grandTotal: 85000,
    status: "Received",
    notes: "Direct batch arrival from tanneries in Ranipet. Hides verified clean and graded A.",
    items: [
      {
        itemId: "lf-001",
        itemCode: "LF-001",
        itemName: "Full Grain Cow Leather",
        quantity: 500,
        unit: "Sq.ft",
        rate: 110,
        total: 55000,
      },
      {
        itemId: "lf-002",
        itemCode: "LF-002",
        itemName: "Goat Leather",
        quantity: 250,
        unit: "Sq.ft",
        rate: 80,
        total: 20000,
      },
      {
        itemId: "lf-003",
        itemCode: "LF-003",
        itemName: "Suede Calfskin",
        quantity: 100,
        unit: "Sq.ft",
        rate: 70,
        total: 7000,
      },
    ],
  },
  {
    id: "in-00124",
    grnNumber: "IN-00124",
    date: "16 Sep 2026",
    supplier: "Chennai Hide Traders",
    invoiceNumber: "CHT-5542",
    warehouse: "Warehouse A",
    receivedBy: "Kumar",
    itemCount: 2,
    totalQuantity: 500,
    quantityDisplay: "500 Sq.ft",
    subtotal: 50000,
    otherCharges: 2000,
    grandTotal: 52000,
    status: "Received",
    notes: "Bulk shipment delivered on pallet #4. Quality check passed.",
    items: [
      {
        itemId: "lf-001",
        itemCode: "LF-001",
        itemName: "Full Grain Cow Leather",
        quantity: 300,
        unit: "Sq.ft",
        rate: 110,
        total: 33000,
      },
      {
        itemId: "lf-002",
        itemCode: "LF-002",
        itemName: "Goat Leather",
        quantity: 200,
        unit: "Sq.ft",
        rate: 85,
        total: 17000,
      },
    ],
  },
  {
    id: "in-00123",
    grnNumber: "IN-00123",
    date: "16 Sep 2026",
    supplier: "South India Leather Materials",
    invoiceNumber: "SIL-9901",
    warehouse: "Chemical Store",
    receivedBy: "Geetha",
    itemCount: 4,
    totalQuantity: 320,
    quantityDisplay: "320 Kg",
    subtotal: 27000,
    otherCharges: 1500,
    grandTotal: 28500,
    status: "Pending",
    notes: "Awaiting final lab test approval for chemical purity before stock transfer.",
    items: [
      {
        itemId: "ch-001",
        itemCode: "CH-001",
        itemName: "Leather Dye",
        quantity: 100,
        unit: "Kg",
        rate: 150,
        total: 15000,
      },
      {
        itemId: "ch-002",
        itemCode: "CH-002",
        itemName: "Tanning Oil",
        quantity: 80,
        unit: "Ltr",
        rate: 100,
        total: 8000,
      },
      {
        itemId: "ch-004",
        itemCode: "CH-004",
        itemName: "Edge Paint Brown",
        quantity: 40,
        unit: "Ltr",
        rate: 100,
        total: 4000,
      },
    ],
  },
];

export const INITIAL_OUTGOING_ENTRIES: OutgoingEntry[] = [
  {
    id: "out-00089",
    issueNumber: "OUT-00089",
    date: "17 Sep 2026",
    destination: "Production",
    purpose: "Production",
    referenceNumber: "WO-2026-441",
    warehouse: "Warehouse A",
    issuedBy: "R. Geetha",
    itemCount: 3,
    totalQuantity: 420,
    quantityDisplay: "420 Sq.ft",
    totalValue: 44200,
    status: "Issued",
    notes: "Raw hide dispatch to Cutting Floor #2 for autumn shoe collection upper assembly.",
    items: [
      {
        itemId: "lf-001",
        itemCode: "LF-001",
        itemName: "Full Grain Cow Leather",
        availableStock: 2450,
        quantity: 250,
        unit: "Sq.ft",
        rate: 110,
        total: 27500,
      },
      {
        itemId: "lf-002",
        itemCode: "LF-002",
        itemName: "Goat Leather",
        availableStock: 850,
        quantity: 120,
        unit: "Sq.ft",
        rate: 85,
        total: 10200,
      },
      {
        itemId: "lf-003",
        itemCode: "LF-003",
        itemName: "Suede Calfskin",
        availableStock: 1500,
        quantity: 50,
        unit: "Sq.ft",
        rate: 130,
        total: 6500,
      },
    ],
  },
  {
    id: "out-00088",
    issueNumber: "OUT-00088",
    date: "16 Sep 2026",
    destination: "ABC Leather Works",
    purpose: "Customer Order",
    referenceNumber: "SO-88210",
    warehouse: "Warehouse A",
    issuedBy: "Kumar",
    itemCount: 2,
    totalQuantity: 300,
    quantityDisplay: "300 Sq.ft",
    totalValue: 36000,
    status: "Issued",
    notes: "Direct customer order dispatch via express freight truck #TN-09-AX-4012.",
    items: [
      {
        itemId: "lf-001",
        itemCode: "LF-001",
        itemName: "Full Grain Cow Leather",
        availableStock: 2450,
        quantity: 200,
        unit: "Sq.ft",
        rate: 120,
        total: 24000,
      },
      {
        itemId: "lf-003",
        itemCode: "LF-003",
        itemName: "Suede Calfskin",
        availableStock: 1500,
        quantity: 100,
        unit: "Sq.ft",
        rate: 120,
        total: 12000,
      },
    ],
  },
  {
    id: "out-00087",
    issueNumber: "OUT-00087",
    date: "16 Sep 2026",
    destination: "Production",
    purpose: "Production",
    referenceNumber: "WO-2026-439",
    warehouse: "Chemical Store",
    issuedBy: "Geetha",
    itemCount: 4,
    totalQuantity: 250,
    quantityDisplay: "250 Kg",
    totalValue: 26500,
    status: "Pending",
    notes: "Chemical dye requisition for batch dyeing scheduled for second shift.",
    items: [
      {
        itemId: "ch-001",
        itemCode: "CH-001",
        itemName: "Leather Dye",
        availableStock: 120,
        quantity: 50,
        unit: "Kg",
        rate: 150,
        total: 7500,
      },
      {
        itemId: "ch-002",
        itemCode: "CH-002",
        itemName: "Tanning Oil",
        availableStock: 15,
        quantity: 10,
        unit: "Ltr",
        rate: 100,
        total: 1000,
      },
      {
        itemId: "hw-001",
        itemCode: "HW-001",
        itemName: "Brass Buckles 40mm",
        availableStock: 1200,
        quantity: 150,
        unit: "Pcs",
        rate: 120,
        total: 18000,
      },
    ],
  },
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: "mov-01248",
    movementId: "MOV-01248",
    date: "17 Sep 2026",
    dateTime: "17 Sep 2026, 09:30 AM",
    itemId: "lf-001",
    itemCode: "LF-001",
    itemName: "Full Grain Cow Leather",
    type: "Incoming",
    quantity: 500,
    quantityDisplay: "+500 Sq.ft",
    previousBalance: 1950,
    newBalance: 2450,
    balanceDisplay: "2,450 Sq.ft",
    reference: "IN-00125",
    location: "Warehouse A",
    user: "R. Geetha",
    notes: "Raw hide batch delivery received from ABC Leather Suppliers.",
  },
  {
    id: "mov-01247",
    movementId: "MOV-01247",
    date: "17 Sep 2026",
    dateTime: "17 Sep 2026, 11:15 AM",
    itemId: "lf-002",
    itemCode: "LF-002",
    itemName: "Goat Leather",
    type: "Outgoing",
    quantity: -120,
    quantityDisplay: "-120 Sq.ft",
    previousBalance: 970,
    newBalance: 850,
    balanceDisplay: "850 Sq.ft",
    reference: "OUT-00089",
    location: "Warehouse A",
    user: "Kumar",
    notes: "Dispatched to Cutting Floor #2 for shoe lining production.",
  },
  {
    id: "mov-01246",
    movementId: "MOV-01246",
    date: "16 Sep 2026",
    dateTime: "16 Sep 2026, 04:20 PM",
    itemId: "ch-001",
    itemCode: "CH-001",
    itemName: "Leather Dye",
    type: "Incoming",
    quantity: 50,
    quantityDisplay: "+50 Kg",
    previousBalance: 70,
    newBalance: 120,
    balanceDisplay: "120 Kg",
    reference: "IN-00124",
    location: "Chemical Store",
    user: "Geetha",
    notes: "Concentrated cognac brown dye batch restock.",
  },
  {
    id: "mov-01245",
    movementId: "MOV-01245",
    date: "16 Sep 2026",
    dateTime: "16 Sep 2026, 02:45 PM",
    itemId: "lf-001",
    itemCode: "LF-001",
    itemName: "Buffalo Leather",
    type: "Adjustment",
    quantity: 25,
    quantityDisplay: "+25 Sq.ft",
    previousBalance: 1215,
    newBalance: 1240,
    balanceDisplay: "1,240 Sq.ft",
    reference: "ADJ-00018",
    location: "Warehouse A",
    user: "Admin",
    notes: "Physical stock audit correction following quarter-end stock take.",
  },
  {
    id: "mov-01244",
    movementId: "MOV-01244",
    date: "15 Sep 2026",
    dateTime: "15 Sep 2026, 03:10 PM",
    itemId: "ac-001",
    itemCode: "AC-001",
    itemName: "Leather Thread",
    type: "Return",
    quantity: 10,
    quantityDisplay: "+10 Roll",
    previousBalance: 25,
    newBalance: 35,
    balanceDisplay: "35 Roll",
    reference: "RET-00004",
    location: "Warehouse B",
    user: "R. Geetha",
    notes: "Unused rolls returned from Production Floor #1 stitching unit.",
  },
  {
    id: "mov-01243",
    movementId: "MOV-01243",
    date: "15 Sep 2026",
    dateTime: "15 Sep 2026, 10:00 AM",
    itemId: "hw-001",
    itemCode: "HW-001",
    itemName: "Brass Buckles 40mm",
    type: "Transfer",
    quantity: -200,
    quantityDisplay: "-200 Pcs",
    previousBalance: 1400,
    newBalance: 1200,
    balanceDisplay: "1,200 Pcs",
    reference: "TRF-00012",
    location: "Warehouse B",
    user: "Admin",
    notes: "Internal warehouse transfer to Finishing Unit stock bin.",
  },
  {
    id: "mov-01242",
    movementId: "MOV-01242",
    date: "14 Sep 2026",
    dateTime: "14 Sep 2026, 05:00 PM",
    itemId: "ch-003",
    itemCode: "CH-003",
    itemName: "Solvent Degreaser",
    type: "Outgoing",
    quantity: -25,
    quantityDisplay: "-25 Ltr",
    previousBalance: 25,
    newBalance: 0,
    balanceDisplay: "0 Ltr",
    reference: "OUT-00085",
    location: "Chemical Store",
    user: "Kumar",
    notes: "Final degreasing solvent drum issued for surface degreasing.",
  },
  {
    id: "mov-01241",
    movementId: "MOV-01241",
    date: "14 Sep 2026",
    dateTime: "14 Sep 2026, 01:20 PM",
    itemId: "lf-003",
    itemCode: "LF-003",
    itemName: "Suede Calfskin",
    type: "Incoming",
    quantity: 300,
    quantityDisplay: "+300 Sq.ft",
    previousBalance: 1200,
    newBalance: 1500,
    balanceDisplay: "1,500 Sq.ft",
    reference: "IN-00120",
    location: "Warehouse A",
    user: "Geetha",
    notes: "Calf suede lot received from Chennai Hide Traders.",
  },
];

export const INITIAL_SUPPLIERS: SupplierRecord[] = [
  {
    id: "sup-001",
    supplierCode: "SUP-001",
    supplierName: "ABC Leather Suppliers",
    contactPerson: "Raj Kumar",
    phone: "98765 43210",
    email: "abc@example.com",
    address: "42 Tannery Street, Ranipet Industrial Estate",
    city: "Chennai",
    state: "Tamil Nadu",
    gstNumber: "33ABCDE1234F1Z5",
    location: "Chennai",
    itemsSuppliedCount: 8,
    mainCategory: "Raw Leather",
    itemsSuppliedList: "Full Grain Cow Leather, Goat Leather, Calfskin Suede",
    status: "Active",
    notes: "Primary vendor for premium full grain cow hide and lining skins.",
    materials: [
      {
        itemCode: "LF-001",
        itemName: "Full Grain Cow Leather",
        category: "Raw Leather",
        lastReceived: "17 Sep 2026",
        totalQuantity: "5,400 Sq.ft",
      },
      {
        itemCode: "LF-002",
        itemName: "Goat Leather",
        category: "Raw Leather",
        lastReceived: "17 Sep 2026",
        totalQuantity: "2,250 Sq.ft",
      },
      {
        itemCode: "LF-003",
        itemCode: "LF-003",
        itemName: "Suede Calfskin",
        category: "Raw Leather",
        lastReceived: "14 Sep 2026",
        totalQuantity: "1,800 Sq.ft",
      },
    ],
  },
  {
    id: "sup-002",
    supplierCode: "SUP-002",
    supplierName: "South India Leather Materials",
    contactPerson: "Suresh",
    phone: "98765 12345",
    email: "south@example.com",
    address: "18 Bypass Road, Ambur Tannery Cluster",
    city: "Ambur",
    state: "Tamil Nadu",
    gstNumber: "33SILM5678G2Z1",
    location: "Ambur",
    itemsSuppliedCount: 12,
    mainCategory: "Chemicals",
    itemsSuppliedList: "Leather Dye, Tanning Oil, Edge Paint, Finishing Auxiliaries",
    status: "Active",
    notes: "Authorized supplier for eco-certified water-based leather dyes and tanning oils.",
    materials: [
      {
        itemCode: "CH-001",
        itemName: "Leather Dye",
        category: "Chemicals",
        lastReceived: "16 Sep 2026",
        totalQuantity: "680 Kg",
      },
      {
        itemCode: "CH-002",
        itemName: "Tanning Oil",
        category: "Chemicals",
        lastReceived: "16 Sep 2026",
        totalQuantity: "450 Ltr",
      },
      {
        itemCode: "CH-004",
        itemName: "Edge Paint Brown",
        category: "Chemicals",
        lastReceived: "10 Sep 2026",
        totalQuantity: "320 Ltr",
      },
    ],
  },
  {
    id: "sup-003",
    supplierCode: "SUP-003",
    supplierName: "Chennai Hide Traders",
    contactPerson: "Anand",
    phone: "98450 12345",
    email: "chennai@example.com",
    address: "105 GST Road, Guindy",
    city: "Chennai",
    state: "Tamil Nadu",
    gstNumber: "33CHTT9012H3Z8",
    location: "Chennai",
    itemsSuppliedCount: 5,
    mainCategory: "Raw Leather",
    itemsSuppliedList: "Raw Buffalo Hides, Wet Blue Cow Hides",
    status: "Inactive",
    notes: "Account temporarily paused pending contract renewal.",
    materials: [
      {
        itemCode: "LF-001",
        itemName: "Full Grain Cow Leather",
        category: "Raw Leather",
        lastReceived: "16 Sep 2026",
        totalQuantity: "3,100 Sq.ft",
      },
      {
        itemCode: "LF-002",
        itemName: "Goat Leather",
        category: "Raw Leather",
        lastReceived: "08 Sep 2026",
        totalQuantity: "1,200 Sq.ft",
      },
    ],
  },
  {
    id: "sup-004",
    supplierCode: "SUP-004",
    supplierName: "Apex Chemical Corp",
    contactPerson: "Ramesh Babu",
    phone: "97890 65432",
    email: "apex@chemcorp.in",
    address: "Plot 88 SIPCOT Phase II",
    city: "Ranipet",
    state: "Tamil Nadu",
    gstNumber: "33APEX7890J4Z3",
    location: "Ranipet",
    itemsSuppliedCount: 9,
    mainCategory: "Chemicals",
    itemsSuppliedList: "Solvent Degreaser, Chrome Tanning Salts, Edge Finishes",
    status: "Active",
    notes: "Specialty tannery degreasers and chrome liquors supplier.",
    materials: [
      {
        itemCode: "CH-003",
        itemName: "Solvent Degreaser",
        category: "Chemicals",
        lastReceived: "14 Sep 2026",
        totalQuantity: "1,200 Ltr",
      },
    ],
  },
  {
    id: "sup-005",
    supplierCode: "SUP-005",
    supplierName: "Precision Hardware Co",
    contactPerson: "Venkatesh",
    phone: "96543 21098",
    email: "sales@precisionhw.com",
    address: "14 Industrial Estate Road",
    city: "Vaniyambadi",
    state: "Tamil Nadu",
    gstNumber: "33PHWC3456K5Z2",
    location: "Vaniyambadi",
    itemsSuppliedCount: 15,
    mainCategory: "Hardware",
    itemsSuppliedList: "Brass Buckles, Metal Zippers, Heavy Duty Rivets, D-Rings",
    status: "Active",
    notes: "High quality solid brass hardware and heavy duty copper burr rivets.",
    materials: [
      {
        itemCode: "HW-001",
        itemName: "Brass Buckles 40mm",
        category: "Hardware",
        lastReceived: "15 Sep 2026",
        totalQuantity: "12,500 Pcs",
      },
      {
        itemCode: "HW-002",
        itemName: "Heavy Duty Rivets",
        category: "Hardware",
        lastReceived: "12 Sep 2026",
        totalQuantity: "850 Box",
      },
      {
        itemCode: "AC-002",
        itemName: "Metal Zippers 30cm",
        category: "Accessories",
        lastReceived: "05 Sep 2026",
        totalQuantity: "4,000 Pcs",
      },
    ],
  },
];

export function calculateStockStatus(currentStock: number, minStock: number): StockStatus {
  if (currentStock <= 0) return "Out of Stock";
  if (currentStock <= minStock) return "Low Stock";
  return "In Stock";
}

/* -------------------------------- Customers ------------------------------- */

export type CustomerStatus = "Active" | "Inactive";

export type CustomerType = "Business" | "Individual" | "Distributor" | "Other";

export const CUSTOMER_STATUSES: CustomerStatus[] = ["Active", "Inactive"];

export const CUSTOMER_TYPES: CustomerType[] = ["Business", "Individual", "Distributor", "Other"];

export interface RecentCustomerOutgoing {
  date: string;
  issueNumber: string;
  items: string;
  quantity: string;
  purpose: string;
}

export interface CustomerRecord {
  id: string;
  customerCode: string;
  customerName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  location: string;
  gstNumber: string;
  customerType: CustomerType;
  ordersCount: number;
  lastTransaction: string;
  status: CustomerStatus;
  notes?: string;
  recentTransactions: RecentCustomerOutgoing[];
}

export const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: "cus-001",
    customerCode: "CUS-001",
    customerName: "ABC Leather Works",
    contactPerson: "Raj Kumar",
    phone: "98765 43210",
    email: "raj@abcleatherworks.com",
    address: "45 Tannery Street, Guindy Industrial Estate",
    city: "Chennai",
    state: "Tamil Nadu",
    location: "Chennai",
    gstNumber: "33ABCDE1234F1Z5",
    customerType: "Business",
    ordersCount: 24,
    lastTransaction: "17 Sep 2026",
    status: "Active",
    notes: "Primary client for full grain cow leather and lining material.",
    recentTransactions: [
      {
        date: "17 Sep 2026",
        issueNumber: "OUT-00089",
        items: "Full Grain Cow Leather",
        quantity: "420 Sq.ft",
        purpose: "Customer Order",
      },
      {
        date: "10 Sep 2026",
        issueNumber: "OUT-00078",
        items: "Goat Leather, Brass Buckles",
        quantity: "350 Sq.ft",
        purpose: "Customer Order",
      },
      {
        date: "01 Sep 2026",
        issueNumber: "OUT-00065",
        items: "Full Grain Cow Leather",
        quantity: "600 Sq.ft",
        purpose: "Customer Order",
      },
    ],
  },
  {
    id: "cus-002",
    customerCode: "CUS-002",
    customerName: "Royal Leather Products",
    contactPerson: "Suresh",
    phone: "98765 12345",
    email: "suresh@royalleather.in",
    address: "12 Bypass Road, Near Railway Station",
    city: "Ambur",
    state: "Tamil Nadu",
    location: "Ambur",
    gstNumber: "33ROYAL5678G2Z1",
    customerType: "Business",
    ordersCount: 18,
    lastTransaction: "15 Sep 2026",
    status: "Active",
    notes: "Major footwear upper manufacturer in Ambur cluster.",
    recentTransactions: [
      {
        date: "15 Sep 2026",
        issueNumber: "OUT-00082",
        items: "Goat Leather",
        quantity: "300 Sq.ft",
        purpose: "Customer Order",
      },
      {
        date: "05 Sep 2026",
        issueNumber: "OUT-00071",
        items: "Suede Leather",
        quantity: "450 Sq.ft",
        purpose: "Customer Order",
      },
    ],
  },
  {
    id: "cus-003",
    customerCode: "CUS-003",
    customerName: "Premium Leather Goods",
    contactPerson: "Anand",
    phone: "98450 12345",
    email: "anand@premiumgoods.co.in",
    address: "89 Katpadi Main Road",
    city: "Vellore",
    state: "Tamil Nadu",
    location: "Vellore",
    gstNumber: "33PREM9012H3Z8",
    customerType: "Distributor",
    ordersCount: 7,
    lastTransaction: "10 Aug 2026",
    status: "Inactive",
    notes: "Distributes finished leather items to local artisan shops.",
    recentTransactions: [
      {
        date: "10 Aug 2026",
        issueNumber: "OUT-00054",
        items: "Buffalo Harness Leather",
        quantity: "200 Sq.ft",
        purpose: "Customer Order",
      },
    ],
  },
  {
    id: "cus-004",
    customerCode: "CUS-004",
    customerName: "Metro Footwear Pvt Ltd",
    contactPerson: "Vikram Singh",
    phone: "97890 11223",
    email: "procurement@metrofootwear.com",
    address: "Plot 102 SIPCOT Industrial Park",
    city: "Ranipet",
    state: "Tamil Nadu",
    location: "Ranipet",
    gstNumber: "33METRO3456J4Z2",
    customerType: "Business",
    ordersCount: 31,
    lastTransaction: "16 Sep 2026",
    status: "Active",
    notes: "Bulk buyer for safety shoe raw leather and chrome tanned crusts.",
    recentTransactions: [
      {
        date: "16 Sep 2026",
        issueNumber: "OUT-00086",
        items: "Full Grain Cow Leather",
        quantity: "850 Sq.ft",
        purpose: "Customer Order",
      },
      {
        date: "08 Sep 2026",
        issueNumber: "OUT-00074",
        items: "Heavy Cow Hide",
        quantity: "1,200 Sq.ft",
        purpose: "Customer Order",
      },
    ],
  },
  {
    id: "cus-005",
    customerCode: "CUS-005",
    customerName: "Craftsman Leather Exports",
    contactPerson: "S. Mehra",
    phone: "96789 22334",
    email: "exports@craftsmanleather.org",
    address: "15 Jajmau Industrial Zone",
    city: "Kanpur",
    state: "Uttar Pradesh",
    location: "Kanpur",
    gstNumber: "09CRAFT7890K5Z3",
    customerType: "Distributor",
    ordersCount: 12,
    lastTransaction: "14 Sep 2026",
    status: "Active",
    notes: "Exports leather accessories and bags to European buyers.",
    recentTransactions: [
      {
        date: "14 Sep 2026",
        issueNumber: "OUT-00080",
        items: "Lamb Nappa Leather",
        quantity: "500 Sq.ft",
        purpose: "Customer Order",
      },
    ],
  },
  {
    id: "cus-006",
    customerCode: "CUS-006",
    customerName: "Apex Saddlery & Harness",
    contactPerson: "D. Sharma",
    phone: "95678 33445",
    email: "sales@apexsaddlery.in",
    address: "78 Nunhai Industrial Area",
    city: "Agra",
    state: "Uttar Pradesh",
    location: "Agra",
    gstNumber: "09APEXS1234L6Z9",
    customerType: "Business",
    ordersCount: 15,
    lastTransaction: "02 Sep 2026",
    status: "Active",
    notes: "Specializes in equestrian products, bridles, and saddles.",
    recentTransactions: [
      {
        date: "02 Sep 2026",
        issueNumber: "OUT-00068",
        items: "Vegetable Tanned Bridle Leather",
        quantity: "350 Sq.ft",
        purpose: "Customer Order",
      },
    ],
  },
  {
    id: "cus-007",
    customerCode: "CUS-007",
    customerName: "Heritage Garments & Belts",
    contactPerson: "K. Balaji",
    phone: "94567 44556",
    email: "info@heritagegarments.co",
    address: "24 Mosque Street",
    city: "Vaniyambadi",
    state: "Tamil Nadu",
    location: "Vaniyambadi",
    gstNumber: "33HERIT5678M7Z4",
    customerType: "Individual",
    ordersCount: 3,
    lastTransaction: "18 Jul 2026",
    status: "Inactive",
    notes: "Small custom belt workshop.",
    recentTransactions: [
      {
        date: "18 Jul 2026",
        issueNumber: "OUT-00042",
        items: "Belt Strip Leather Rolls",
        quantity: "150 Sq.ft",
        purpose: "Customer Order",
      },
    ],
  },
];

/* -------------------------------- Settings -------------------------------- */

export interface CompanySetting {
  factoryName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  gstNumber: string;
  logoUrl?: string;
}

export interface InventorySetting {
  defaultUnit: string;
  currency: string;
  defaultMinStock: number;
  allowNegativeStock: boolean;
  stockValuationMethod: "Average Cost" | "FIFO";
}

export interface LocationSetting {
  id: string;
  location: string;
  description: string;
  status: "Active" | "Inactive";
}

export interface CategorySetting {
  id: string;
  category: string;
  description: string;
  itemsCount: number;
  status: "Active" | "Inactive";
}

export interface NumberingSetting {
  id: string;
  entity: string;
  prefix: string;
  example: string;
}

export interface UserSetting {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "Admin" | "Inventory Manager" | "Staff";
  status: "Active" | "Inactive";
  lastLogin: string;
}

export const INITIAL_COMPANY_SETTINGS: CompanySetting = {
  factoryName: "Leather Factory (Unit 4 — Chennai Plant)",
  phone: "044 2234 5678",
  email: "store@leatherfactory.in",
  address: "Plot 14, Guindy Industrial Estate, Mount Road",
  city: "Chennai",
  state: "Tamil Nadu",
  gstNumber: "33AAACL1234F1Z9",
};

export const INITIAL_INVENTORY_SETTINGS: InventorySetting = {
  defaultUnit: "Sq.ft",
  currency: "₹ (INR)",
  defaultMinStock: 500,
  allowNegativeStock: false,
  stockValuationMethod: "FIFO",
};

export const INITIAL_LOCATIONS_SETTINGS: LocationSetting[] = [
  {
    id: "loc-1",
    location: "Main Warehouse",
    description: "Primary storage location for raw cow & goat leather hides.",
    status: "Active",
  },
  {
    id: "loc-2",
    location: "Production Store",
    description: "In-factory buffer store for current work-in-progress lines.",
    status: "Active",
  },
  {
    id: "loc-3",
    location: "Finished Goods",
    description: "Inspected finished leather rolls ready for dispatch.",
    status: "Active",
  },
  {
    id: "loc-4",
    location: "Chemical Store",
    description: "Hazardous tannery chemicals, solvents, and chrome salts store.",
    status: "Active",
  },
  {
    id: "loc-5",
    location: "Warehouse B",
    description: "Secondary overflow warehouse for hardware & accessories.",
    status: "Active",
  },
];

export const INITIAL_CATEGORIES_SETTINGS: CategorySetting[] = [
  {
    id: "cat-1",
    category: "Raw Leather",
    description: "Full grain cow, goat, lamb, and buffalo crusts.",
    itemsCount: 42,
    status: "Active",
  },
  {
    id: "cat-2",
    category: "Semi-Finished",
    description: "Wet blue hides, shaved leather, and crust stages.",
    itemsCount: 18,
    status: "Active",
  },
  {
    id: "cat-3",
    category: "Finished Goods",
    description: "Tanned finished rolls, embossed panels, and straps.",
    itemsCount: 25,
    status: "Active",
  },
  {
    id: "cat-4",
    category: "Chemicals",
    description: "Tannery degreasers, chrome liquor, fatliquors, dyes.",
    itemsCount: 19,
    status: "Active",
  },
  {
    id: "cat-5",
    category: "Accessories",
    description: "Thread rolls, lining fabrics, edge paints, packaging.",
    itemsCount: 12,
    status: "Active",
  },
  {
    id: "cat-6",
    category: "Other",
    description: "Maintenance consumables, safety gear, miscellaneous items.",
    itemsCount: 8,
    status: "Active",
  },
];

export const INITIAL_NUMBERING_SETTINGS: NumberingSetting[] = [
  {
    id: "num-1",
    entity: "Inventory Item",
    prefix: "INV",
    example: "INV-00001",
  },
  {
    id: "num-2",
    entity: "Incoming",
    prefix: "IN",
    example: "IN-00001",
  },
  {
    id: "num-3",
    entity: "Outgoing",
    prefix: "OUT",
    example: "OUT-00001",
  },
  {
    id: "num-4",
    entity: "Stock Movement",
    prefix: "MOV",
    example: "MOV-00001",
  },
  {
    id: "num-5",
    entity: "Adjustment",
    prefix: "ADJ",
    example: "ADJ-00001",
  },
];

export const INITIAL_USERS_SETTINGS: UserSetting[] = [
  {
    id: "usr-1",
    name: "R. Geetha",
    email: "geetha.r@leatherfactory.in",
    phone: "98765 43210",
    role: "Admin",
    status: "Active",
    lastLogin: "17 Sep 2026, 09:30 AM",
  },
  {
    id: "usr-2",
    name: "M. Saravanan",
    email: "saravanan.m@leatherfactory.in",
    phone: "98765 88990",
    role: "Inventory Manager",
    status: "Active",
    lastLogin: "17 Sep 2026, 08:15 AM",
  },
  {
    id: "usr-3",
    name: "P. Karthik",
    email: "karthik.p@leatherfactory.in",
    phone: "98450 11223",
    role: "Staff",
    status: "Active",
    lastLogin: "16 Sep 2026, 05:45 PM",
  },
  {
    id: "usr-4",
    name: "S. Balakrishnan",
    email: "bala.s@leatherfactory.in",
    phone: "97890 33445",
    role: "Staff",
    status: "Inactive",
    lastLogin: "01 Aug 2026, 11:20 AM",
  },
];



