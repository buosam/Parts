/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Partline - Inventory & Production Operations Console (Phase 2-4 Interactive Build)
 */

import React, { useState, useEffect, useMemo, useRef, useDeferredValue } from 'react';
import {
  Boxes,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  ChevronDown,
  X,
  RefreshCw,
  Layers,
  Wrench,
  Truck,
  TrendingUp,
  SlidersHorizontal,
  Download,
  Eye,
  Edit3,
  ShieldCheck,
  ShieldAlert,
  Archive,
  RotateCcw,
  Sparkles,
  Command,
  ArrowRight,
  ExternalLink,
  DollarSign,
  Activity,
  Check,
  ArrowUpRight,
  Store,
  Play,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';
import {
  PartlinePart,
  PartlineOrganization,
  WorkOrder,
  StockMovement,
  ActivityEvent,
  PurchaseOrder,
  ToastItem,
  PartCondition,
  PartStatus,
  StockReason,
} from '../../types/partline';
import {
  INITIAL_PARTS,
  INITIAL_WORK_ORDERS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_ACTIVITY,
  INITIAL_PURCHASE_ORDERS,
} from './PartlineMockData';

interface PartlineConsoleProps {
  onExitToMarketplace?: () => void;
}

type ConsoleTab = 'dashboard' | 'inventory' | 'production' | 'procurement';

export const PartlineConsole: React.FC<PartlineConsoleProps> = ({ onExitToMarketplace }) => {
  // --- Global State ---
  const [activeTab, setActiveTab] = useState<ConsoleTab>('dashboard');

  // --- Data Stores (In-memory reactive database) ---
  const [parts, setParts] = useState<PartlinePart[]>(INITIAL_PARTS);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>(INITIAL_ACTIVITY);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);

  // --- UI & Modals State ---
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandPaletteQuery, setCommandPaletteQuery] = useState('');
  const [selectedPartForDrawer, setSelectedPartForDrawer] = useState<PartlinePart | null>(null);
  const [drawerActiveTab, setDrawerActiveTab] = useState<'overview' | 'fitments' | 'stock' | 'history'>('overview');
  const [isNewPartWizardOpen, setIsNewPartWizardOpen] = useState(false);
  const [isColVisibilityOpen, setIsColVisibilityOpen] = useState(false);
  const [isSimulateLoading, setIsSimulateLoading] = useState(false);

  // --- Toasts Host ---
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const showToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Table Filters & URL-shaped State (nuqs pattern) ---
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'sku' | 'name' | 'stock' | 'price' | 'fitments'>('sku');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Multi-row Selection for Bulk Actions
  const [selectedPartIds, setSelectedPartIds] = useState<Set<string>>(new Set());

  // Visible Columns Configuration
  const [visibleCols, setVisibleCols] = useState({
    skuBrand: true,
    oemNumber: true,
    category: true,
    condition: true,
    stockOnHand: true,
    pricing: true,
    fitments: true,
    status: true,
    actions: true,
  });

  // --- Multi-Step New Part Wizard State & Draft Autosave ---
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [wizardDraft, setWizardDraft] = useState({
    sku: '',
    name: '',
    brand: '',
    oemNumber: '',
    category: 'Brake System',
    condition: 'oem' as PartCondition,
    unit: 'pc',
    costUSD: 50,
    priceUSD: 85,
    weightG: 1200,
    dimL: 200,
    dimW: 150,
    dimH: 80,
    fitmentMake: 'Toyota',
    fitmentModel: 'Land Cruiser Prado',
    fitmentEngine: '1GR-FE 4.0L V6',
    fitmentYear: '2020 - 2024',
    initialWarehouse: 'wh-bgd-01',
    initialQty: 10,
    binLocation: 'BAY-01-A',
  });
  const [lastAutosaveTime, setLastAutosaveTime] = useState<string | null>(null);

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('partline_wizard_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        setWizardDraft(parsed.data);
        setLastAutosaveTime(parsed.time);
      }
    } catch {
      // ignore
    }
  }, []);

  // Autosave draft changes
  const saveWizardDraft = (newData: typeof wizardDraft) => {
    setWizardDraft(newData);
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastAutosaveTime(now);
    try {
      localStorage.setItem('partline_wizard_draft', JSON.stringify({ data: newData, time: now }));
    } catch {
      // ignore
    }
  };

  const clearWizardDraft = () => {
    localStorage.removeItem('partline_wizard_draft');
    setLastAutosaveTime(null);
    setWizardDraft({
      sku: '',
      name: '',
      brand: '',
      oemNumber: '',
      category: 'Brake System',
      condition: 'oem',
      unit: 'pc',
      costUSD: 50,
      priceUSD: 85,
      weightG: 1200,
      dimL: 200,
      dimW: 150,
      dimH: 80,
      fitmentMake: 'Toyota',
      fitmentModel: 'Land Cruiser Prado',
      fitmentEngine: '1GR-FE 4.0L V6',
      fitmentYear: '2020 - 2024',
      initialWarehouse: 'wh-bgd-01',
      initialQty: 10,
      binLocation: 'BAY-01-A',
    });
    setWizardStep(1);
  };

  // --- Keyboard Shortcuts (⌘K, Escape, /) ---
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K opens Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // Escape closes open modals / drawer / palette
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
        else if (selectedPartForDrawer) setSelectedPartForDrawer(null);
        else if (isNewPartWizardOpen) setIsNewPartWizardOpen(false);
      }
      // / focuses search when not typing in an input
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setActiveTab('inventory');
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, selectedPartForDrawer, isNewPartWizardOpen]);

  // --- Filtered and Sorted Parts Table ---
  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const matchesSearch =
        !deferredSearch ||
        part.sku.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        part.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        (part.oemNumber && part.oemNumber.toLowerCase().includes(deferredSearch.toLowerCase())) ||
        part.brand.toLowerCase().includes(deferredSearch.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || part.categoryName === selectedCategory;
      const matchesCondition = selectedCondition === 'all' || part.condition === selectedCondition;
      const matchesStatus = selectedStatus === 'all' || part.status === selectedStatus;
      const matchesWarehouse =
        selectedWarehouse === 'all' ||
        part.stockLevels.some((sl) => sl.warehouseId === selectedWarehouse && sl.qtyOnHand > 0);

      return matchesSearch && matchesCategory && matchesCondition && matchesStatus && matchesWarehouse;
    });
  }, [parts, deferredSearch, selectedCategory, selectedCondition, selectedStatus, selectedWarehouse]);

  const sortedParts = useMemo(() => {
    return [...filteredParts].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'sku') comparison = a.sku.localeCompare(b.sku);
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      if (sortBy === 'stock') comparison = a.totalQtyOnHand - b.totalQtyOnHand;
      if (sortBy === 'price') comparison = a.priceCents - b.priceCents;
      if (sortBy === 'fitments') comparison = a.fitments.length - b.fitments.length;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredParts, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedParts.length / pageSize));
  const paginatedParts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedParts.slice(start, start + pageSize);
  }, [sortedParts, currentPage, pageSize]);

  // Handle Sort Change
  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // --- Multi-Row Selection Handlers ---
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPartIds(new Set(paginatedParts.map((p) => p.id)));
    } else {
      setSelectedPartIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const next = new Set(selectedPartIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedPartIds(next);
  };

  // --- Bulk Actions ---
  const handleBulkStatusChange = (status: PartStatus) => {
    const ids = Array.from(selectedPartIds);
    setParts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, status, updatedAt: new Date().toISOString() } : p))
    );
    setSelectedPartIds(new Set());
    showToast({
      type: 'success',
      title: 'Bulk Status Updated',
      message: `Successfully set status to '${status}' for ${ids.length} parts.`,
    });
  };

  const handleBulkStockAdjust = (delta: number) => {
    const ids = Array.from(selectedPartIds);
    setParts((prev) =>
      prev.map((p) => {
        if (!ids.includes(p.id)) return p;
        const updatedLevels = p.stockLevels.map((sl, idx) =>
          idx === 0 ? { ...sl, qtyOnHand: Math.max(0, sl.qtyOnHand + delta) } : sl
        );
        const newTotal = updatedLevels.reduce((sum, l) => sum + l.qtyOnHand, 0);
        return {
          ...p,
          stockLevels: updatedLevels,
          totalQtyOnHand: newTotal,
          isLowStock: newTotal <= 10,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    setSelectedPartIds(new Set());
    showToast({
      type: 'success',
      title: 'Bulk Stock Adjusted',
      message: `Adjusted inventory by ${delta > 0 ? `+${delta}` : delta} for ${ids.length} parts.`,
    });
  };

  const handleBulkExportCSV = () => {
    const selected = parts.filter((p) => selectedPartIds.has(p.id));
    const rows = (selected.length > 0 ? selected : sortedParts).map((p) => ({
      SKU: p.sku,
      Name: p.name,
      Brand: p.brand,
      OEM: p.oemNumber || '',
      Category: p.categoryName,
      Condition: p.condition,
      Status: p.status,
      StockOnHand: p.totalQtyOnHand,
      CostUSD: (p.costCents / 100).toFixed(2),
      PriceUSD: (p.priceCents / 100).toFixed(2),
    }));

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        Object.keys(rows[0] || {}).join(','),
        ...rows.map((r) => Object.values(r).map((v) => `"${v}"`).join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `partline_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: 'info',
      title: 'CSV Export Streamed',
      message: `Exported ${rows.length} parts to local download.`,
    });
  };

  // --- Resilience: Optimistic Mutation & Failure Simulation ---
  const testOptimisticMutationFailure = () => {
    if (parts.length === 0) return;
    const targetPart = parts[0];
    const originalStatus = targetPart.status;
    const nextStatus: PartStatus = originalStatus === 'active' ? 'draft' : 'active';

    // Step 1: Optimistic write to cache
    setParts((prev) =>
      prev.map((p) => (p.id === targetPart.id ? { ...p, status: nextStatus } : p))
    );
    showToast({
      type: 'info',
      title: 'Optimistic Write Dispatched',
      message: `Applied status '${nextStatus}' to ${targetPart.sku} (awaiting PgBouncer tx)...`,
    });

    // Step 2: Simulated network failure after 700ms
    setTimeout(() => {
      // Step 3: Rollback state
      setParts((prev) =>
        prev.map((p) => (p.id === targetPart.id ? { ...p, status: originalStatus } : p))
      );
      // Step 4: Surfaced actionable error toast with RETRY action
      showToast({
        type: 'error',
        title: 'Mutation Failed (Simulated)',
        message: `PgBouncer pool timeout on update ${targetPart.sku}. Rolled back to '${originalStatus}'.`,
        actionLabel: 'Retry Mutation',
        onAction: () => {
          // Re-apply successfully
          setParts((prev) =>
            prev.map((p) => (p.id === targetPart.id ? { ...p, status: nextStatus } : p))
          );
          showToast({
            type: 'success',
            title: 'Mutation Reconciled',
            message: `Successfully retried and committed status '${nextStatus}' for ${targetPart.sku}.`,
          });
        },
      });
    }, 800);
  };

  // --- Drawer Stock Adjustment Handler ---
  const handleDrawerStockAdjust = (
    partId: string,
    warehouseId: string,
    delta: number,
    reason: StockReason
  ) => {
    setParts((prev) =>
      prev.map((part) => {
        if (part.id !== partId) return part;
        const updatedLevels = part.stockLevels.map((sl) => {
          if (sl.warehouseId !== warehouseId) return sl;
          return {
            ...sl,
            qtyOnHand: Math.max(0, sl.qtyOnHand + delta),
            updatedAt: new Date().toISOString(),
          };
        });
        const total = updatedLevels.reduce((s, l) => s + l.qtyOnHand, 0);
        const updatedPart = {
          ...part,
          stockLevels: updatedLevels,
          totalQtyOnHand: total,
          isLowStock: total <= 10,
          updatedAt: new Date().toISOString(),
        };
        // Update drawer selected reference too
        if (selectedPartForDrawer && selectedPartForDrawer.id === partId) {
          setSelectedPartForDrawer(updatedPart);
        }
        return updatedPart;
      })
    );

    // Append to stock movements ledger
    const targetPart = parts.find((p) => p.id === partId);
    const targetWh = targetPart?.stockLevels.find((w) => w.warehouseId === warehouseId);
    const newMovement: StockMovement = {
      id: `mv-${Date.now()}`,
      partId,
      warehouseId,
      warehouseName: targetWh?.warehouseName || 'Warehouse',
      delta,
      reason,
      refType: 'manual_console_adjustment',
      refId: `ADJ-${Date.now().toString().slice(-4)}`,
      actorName: 'Operations Lead (Console)',
      createdAt: new Date().toISOString(),
    };
    setStockMovements((prev) => [newMovement, ...prev]);

    showToast({
      type: 'success',
      title: 'Stock Ledger Appended',
      message: `${delta > 0 ? `+${delta}` : delta} units adjusted with reason '${reason}' in ${targetWh?.city || 'hub'}.`,
    });
  };

  // --- New Part Wizard Submit ---
  const handleCreateNewPartSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardDraft.sku || !wizardDraft.name) {
      showToast({ type: 'warning', title: 'Validation Error', message: 'SKU and Part Name are mandatory.' });
      return;
    }

    const newPart: PartlinePart = {
      id: `part-${Date.now()}`,
      orgId: 'org-main',
      sku: wizardDraft.sku.toUpperCase(),
      name: wizardDraft.name,
      slug: wizardDraft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brand: wizardDraft.brand || 'Aftermarket OE Spec',
      categoryId: 'cat-custom',
      categoryName: wizardDraft.category,
      oemNumber: wizardDraft.oemNumber || undefined,
      condition: wizardDraft.condition,
      status: 'active',
      unit: wizardDraft.unit,
      costCents: Math.round(wizardDraft.costUSD * 100),
      priceCents: Math.round(wizardDraft.priceUSD * 100),
      currency: 'USD',
      weightG: wizardDraft.weightG,
      dimsMm: [wizardDraft.dimL, wizardDraft.dimW, wizardDraft.dimH],
      attrs: {
        registeredVia: 'Partline Ops Console Wizard',
        initialBin: wizardDraft.binLocation,
      },
      imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80',
      totalQtyOnHand: wizardDraft.initialQty,
      totalQtyReserved: 0,
      totalQtyIncoming: 0,
      isLowStock: wizardDraft.initialQty <= 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fitments: [
        {
          id: `fit-${Date.now()}`,
          partId: `part-${Date.now()}`,
          vehicleMake: wizardDraft.fitmentMake,
          vehicleModel: wizardDraft.fitmentModel,
          generation: 'Standard',
          yearRange: wizardDraft.fitmentYear,
          engineCode: wizardDraft.fitmentEngine,
          position: 'front',
          qty: 1,
          confidence: 0.95,
          verifiedAt: new Date().toISOString(),
          source: 'manual',
        },
      ],
      stockLevels: [
        {
          warehouseId: 'wh-bgd-01',
          warehouseCode: 'BGD-CENTRAL',
          warehouseName: 'Baghdad Distribution Hub',
          city: 'Baghdad',
          qtyOnHand: wizardDraft.initialWarehouse === 'wh-bgd-01' ? wizardDraft.initialQty : 0,
          qtyReserved: 0,
          qtyIncoming: 0,
          reorderPoint: 10,
          bin: wizardDraft.binLocation,
          updatedAt: new Date().toISOString(),
        },
        {
          warehouseId: 'wh-erbil-02',
          warehouseCode: 'ERB-DEPOT',
          warehouseName: 'Erbil North Logistics Hub',
          city: 'Erbil',
          qtyOnHand: wizardDraft.initialWarehouse === 'wh-erbil-02' ? wizardDraft.initialQty : 0,
          qtyReserved: 0,
          qtyIncoming: 0,
          reorderPoint: 8,
          bin: wizardDraft.binLocation,
          updatedAt: new Date().toISOString(),
        },
        {
          warehouseId: 'wh-basra-03',
          warehouseCode: 'BSR-TERM',
          warehouseName: 'Basra Marine Logistics Terminal',
          city: 'Basra',
          qtyOnHand: wizardDraft.initialWarehouse === 'wh-basra-03' ? wizardDraft.initialQty : 0,
          qtyReserved: 0,
          qtyIncoming: 0,
          reorderPoint: 5,
          bin: wizardDraft.binLocation,
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    setParts((prev) => [newPart, ...prev]);
    clearWizardDraft();
    setIsNewPartWizardOpen(false);
    showToast({
      type: 'success',
      title: 'Part Published',
      message: `Created SKU ${newPart.sku} with verified fitment and ${newPart.totalQtyOnHand} units initial stock.`,
    });
  };

  // --- Work Order Progress Advance Handler ---
  const handleAdvanceWorkOrderStatus = (woId: string) => {
    const statusFlow: Record<WorkOrder['status'], WorkOrder['status']> = {
      draft: 'released',
      released: 'in_progress',
      in_progress: 'qc',
      qc: 'completed',
      completed: 'completed',
      cancelled: 'cancelled',
    };

    setWorkOrders((prev) =>
      prev.map((wo) => {
        if (wo.id !== woId) return wo;
        const nextStatus = statusFlow[wo.status];
        return {
          ...wo,
          status: nextStatus,
          qtyProduced: nextStatus === 'completed' ? wo.qtyPlanned : wo.qtyProduced,
        };
      })
    );

    showToast({
      type: 'success',
      title: 'Work Order Step Advanced',
      message: `Work Order status updated along production pipeline.`,
    });
  };

  // --- Command Palette Filtered Actions ---
  const commandPaletteResults = useMemo(() => {
    if (!commandPaletteQuery.trim()) {
      return {
        actions: [
          { id: 'act-new-part', title: 'Create New Part Wizard', subtitle: 'Open multi-step creation modal', icon: Plus, run: () => { setIsNewPartWizardOpen(true); setIsCommandPaletteOpen(false); } },
          { id: 'act-inv', title: 'Go to Inventory & Parts Table', subtitle: 'View catalog, filter and bulk edit', icon: Boxes, run: () => { setActiveTab('inventory'); setIsCommandPaletteOpen(false); } },
          { id: 'act-dash', title: 'Go to Dashboard & Metrics', subtitle: 'KPIs, charts, and activity feed', icon: Activity, run: () => { setActiveTab('dashboard'); setIsCommandPaletteOpen(false); } },
          { id: 'act-prod', title: 'Go to Production Pipeline', subtitle: 'Work orders and routing stations', icon: Wrench, run: () => { setActiveTab('production'); setIsCommandPaletteOpen(false); } },
          { id: 'act-fail-sim', title: 'Simulate Mutation Failure & Rollback', subtitle: 'Verify resilience & optimistic error recovery', icon: RotateCcw, run: () => { testOptimisticMutationFailure(); setIsCommandPaletteOpen(false); } },
          { id: 'act-export', title: 'Export Catalog to CSV', subtitle: 'Download current filtered catalog snapshot', icon: Download, run: () => { handleBulkExportCSV(); setIsCommandPaletteOpen(false); } },
        ],
        parts: parts.slice(0, 3),
        workOrders: workOrders.slice(0, 2),
      };
    }

    const q = commandPaletteQuery.toLowerCase();
    const matchingParts = parts.filter(
      (p) => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || (p.oemNumber && p.oemNumber.toLowerCase().includes(q))
    );
    const matchingWos = workOrders.filter(
      (wo) => wo.code.toLowerCase().includes(q) || wo.partName.toLowerCase().includes(q) || wo.station.toLowerCase().includes(q)
    );

    return {
      actions: [
        { id: 'act-new-part', title: 'Create New Part Wizard', subtitle: 'Open multi-step creation modal', icon: Plus, run: () => { setIsNewPartWizardOpen(true); setIsCommandPaletteOpen(false); } },
        { id: 'act-export', title: 'Export Catalog to CSV', subtitle: 'Download current filtered catalog snapshot', icon: Download, run: () => { handleBulkExportCSV(); setIsCommandPaletteOpen(false); } },
      ].filter((a) => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q)),
      parts: matchingParts,
      workOrders: matchingWos,
    };
  }, [commandPaletteQuery, parts, workOrders]);

  // --- Aggregate Metrics ---
  const totalSkus = parts.length;
  const totalStockUnits = parts.reduce((sum, p) => sum + p.totalQtyOnHand, 0);
  const totalValuationUSD = parts.reduce((sum, p) => sum + (p.costCents * p.totalQtyOnHand) / 100, 0);
  const lowStockCount = parts.filter((p) => p.isLowStock).length;
  const activeWOCount = workOrders.filter((wo) => wo.status === 'in_progress' || wo.status === 'qc').length;

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 font-sans flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* ──────────────── Top Operations Shell Header ──────────────── */}
      <header className="sticky top-0 z-40 bg-[#090d18]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 py-2.5 shadow-xl">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-600/30">
                P
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-white">Partline</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Ops Console
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Command Palette Trigger */}
          <div className="flex-1 max-w-md hidden md:block">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 text-xs text-slate-400 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                <span>Search catalog, actions, work orders...</span>
              </div>
              <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.08] text-[10px] font-mono text-slate-300 border border-white/10">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right: Quick Actions, Simulation Toggles & Marketplace Exit */}
          <div className="flex items-center gap-2">
            {/* Simulate Loading Toggle */}
            <button
              onClick={() => {
                setIsSimulateLoading(true);
                setTimeout(() => setIsSimulateLoading(false), 900);
              }}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-xs text-slate-300 cursor-pointer transition-colors"
              title="Test Skeleton UI (0 CLS layout stability)"
            >
              <RefreshCw className={`w-3 h-3 text-indigo-400 ${isSimulateLoading ? 'animate-spin' : ''}`} />
              <span className="text-[11px]">Test Skeletons</span>
            </button>

            {/* Simulate Error / Rollback */}
            <button
              onClick={testOptimisticMutationFailure}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs text-amber-300 cursor-pointer transition-colors"
              title="Test Optimistic Update Failure & Actionable Rollback"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span className="text-[11px]">Test Resilience</span>
            </button>

            {/* New Part Wizard Button */}
            <button
              onClick={() => setIsNewPartWizardOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Part</span>
            </button>

            {/* Return to Marketplace */}
            {onExitToMarketplace && (
              <button
                onClick={onExitToMarketplace}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white border border-white/10 font-semibold text-xs transition-colors cursor-pointer ml-1"
                title="Return to Public Customer Marketplace"
              >
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Marketplace</span>
              </button>
            )}
          </div>
        </div>

        {/* Console Navigation Tabs Bar */}
        <div className="max-w-[1600px] mx-auto mt-2 flex items-center justify-between border-t border-white/5 pt-2">
          <nav className="flex items-center gap-1 overflow-x-auto pb-0.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Overview & KPIs</span>
            </button>

            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Inventory & Catalog</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-indigo-200">
                {parts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('production')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'production'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Production (Work Orders)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                {activeWOCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('procurement')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'procurement'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Procurement & POs</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-slate-300 font-mono">
                {purchaseOrders.length}
              </span>
            </button>
          </nav>

          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              RLS Tenancy Enforced
            </span>
            <span className="text-white/20">•</span>
            <span>Postgres 16 + Redis</span>
          </div>
        </div>
      </header>

      {/* ──────────────── Main View Area ──────────────── */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & KPIS (Phase 4 Dashboard) */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Card 1: Total SKUs */}
              <div className="p-4 rounded-2xl bg-[#0e1424] border border-white/10 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catalog SKUs</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <Boxes className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">{totalSkus.toLocaleString()}</div>
                <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-400">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+8.2% this month</span>
                  <span className="text-slate-500 text-[10px]">({totalStockUnits} units)</span>
                </div>
              </div>

              {/* Card 2: Stock Valuation */}
              <div className="p-4 rounded-2xl bg-[#0e1424] border border-white/10 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stock Valuation</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  ${totalValuationUSD.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="text-slate-400 text-xs mt-2 truncate font-medium">
                  ≈ {(totalValuationUSD * 1310).toLocaleString()} IQD
                </div>
              </div>

              {/* Card 3: Low Stock Alerts */}
              <div
                onClick={() => {
                  setActiveTab('inventory');
                  setSelectedWarehouse('all');
                }}
                className="p-4 rounded-2xl bg-[#0e1424] border border-rose-500/30 hover:border-rose-500/60 shadow-lg cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Low Stock Alerts</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-rose-400">{lowStockCount} Items</div>
                <div className="text-rose-300/80 text-xs mt-2 flex items-center justify-between font-medium">
                  <span>Critical reorder point</span>
                  <span className="underline group-hover:text-white">View & PO →</span>
                </div>
              </div>

              {/* Card 4: Active Work Orders */}
              <div
                onClick={() => setActiveTab('production')}
                className="p-4 rounded-2xl bg-[#0e1424] border border-white/10 hover:border-indigo-500/40 shadow-lg cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Work Orders</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Wrench className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">{activeWOCount} in flight</div>
                <div className="text-slate-400 text-xs mt-2 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>OEE Target: 92.4%</span>
                </div>
              </div>

              {/* Card 5: Guaranteed Fitment Verification */}
              <div className="p-4 rounded-2xl bg-[#0e1424] border border-white/10 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fitment Engine</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-400">97.8%</div>
                <div className="text-slate-400 text-xs mt-2 flex items-center gap-1 font-medium">
                  <span>Audited Fitment Coverage</span>
                </div>
              </div>
            </div>

            {/* Middle Section: Stock Flow Velocity Chart & Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Inbound vs Outbound Velocity Chart */}
              <div className="lg:col-span-2 p-5 rounded-3xl bg-[#0e1424] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-white">Stock Flow & Dispatch Velocity</h3>
                    <p className="text-xs text-slate-400">Monthly receipt delta vs marketplace dispatches (6 Months)</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-indigo-500" />
                      <span className="text-slate-300">Inbound Receipts</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-emerald-400" />
                      <span className="text-slate-300">Dispatched Orders</span>
                    </div>
                  </div>
                </div>

                {/* SVG Visual Flow Chart */}
                <div className="h-64 w-full pt-4">
                  <svg className="w-full h-full" viewBox="0 0 700 220" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="inboundGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="outboundGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line x1="0" y1="40" x2="700" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                    <line x1="0" y1="100" x2="700" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                    <line x1="0" y1="160" x2="700" y2="160" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

                    {/* Area under curves */}
                    <path
                      d="M 50 160 Q 150 120 250 80 T 450 110 T 650 40 L 650 200 L 50 200 Z"
                      fill="url(#inboundGrad)"
                    />
                    <path
                      d="M 50 180 Q 150 150 250 110 T 450 130 T 650 60 L 650 200 L 50 200 Z"
                      fill="url(#outboundGrad)"
                    />

                    {/* Inbound Line */}
                    <path
                      d="M 50 160 Q 150 120 250 80 T 450 110 T 650 40"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="3"
                    />
                    {/* Outbound Line */}
                    <path
                      d="M 50 180 Q 150 150 250 110 T 450 130 T 650 60"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                    />

                    {/* Plot points */}
                    {[
                      { x: 50, y: 160, label: 'Apr' },
                      { x: 170, y: 110, label: 'May' },
                      { x: 290, y: 75, label: 'Jun' },
                      { x: 410, y: 115, label: 'Jul' },
                      { x: 530, y: 80, label: 'Aug' },
                      { x: 650, y: 40, label: 'Sep' },
                    ].map((pt, i) => (
                      <g key={i}>
                        <circle cx={pt.x} cy={pt.y} r="4" fill="#6366f1" />
                        <text x={pt.x} y="215" textAnchor="middle" fill="#94a3b8" fontSize="11">
                          {pt.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Stock Condition & Health Breakdown */}
              <div className="p-5 rounded-3xl bg-[#0e1424] border border-white/10 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-white mb-1">Catalog Condition Distribution</h3>
                  <p className="text-xs text-slate-400 mb-4">Stock split across quality classifications</p>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-emerald-300">Original OEM (Advics, Denso, Toyota)</span>
                        <span className="text-white">62%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '62%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-indigo-300">OEM Surplus (Bosch, Hitachi)</span>
                        <span className="text-white">18%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '18%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-amber-300">Certified Aftermarket (Mahle OE)</span>
                        <span className="text-white">15%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '15%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-purple-300">Reconditioned & Refurb</span>
                        <span className="text-white">5%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: '5%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs text-indigo-200 font-medium">Reconciliation Drift</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">0.00% (Balanced)</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Work Orders Pipeline & Live Activity Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Work Orders Pipeline Snapshot */}
              <div className="p-5 rounded-3xl bg-[#0e1424] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-base text-white">Live Production Work Orders</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('production')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full Kanban</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {workOrders.map((wo) => (
                    <div
                      key={wo.id}
                      className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-400">{wo.code}</span>
                          <span className="text-xs font-semibold text-white truncate max-w-[220px]">
                            {wo.partName}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">{wo.station}</div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            wo.status === 'in_progress'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : wo.status === 'qc'
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                              : wo.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                          }`}
                        >
                          {wo.status.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => handleAdvanceWorkOrderStatus(wo.id)}
                          className="px-2 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-[11px] font-bold transition-colors cursor-pointer"
                          title="Advance to next production gate"
                        >
                          Advance →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Activity & Audit Stream */}
              <div className="p-5 rounded-3xl bg-[#0e1424] border border-white/10 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-base text-white">Platform Activity & Audit Trail</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Partitioned Ledger</span>
                </div>

                <div className="space-y-3">
                  {activityFeed.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 text-xs">
                      <div className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{event.title}</span>
                          <span className="text-[10px] text-slate-500">{event.timestamp}</span>
                        </div>
                        <p className="text-slate-400 mt-0.5 leading-relaxed">{event.description}</p>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Actor: {event.actor}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: INVENTORY & CATALOG (Phase 3 Table, Filters, Bulk, Skeletons) */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Filter Toolbar (URL State Shape) */}
            <div className="p-4 rounded-2xl bg-[#0e1424] border border-white/10 shadow-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Search Bar with / shortcut */}
                <div className="relative flex-1 min-w-[260px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by SKU, part name, OEM number, or brand (Press '/' to focus)..."
                    className="w-full pl-9 pr-12 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Dropdowns */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                    className="px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all" className="bg-[#0e1424]">All Categories</option>
                    <option value="Brake System" className="bg-[#0e1424]">Brake System</option>
                    <option value="Fuel & Emission" className="bg-[#0e1424]">Fuel & Emission</option>
                    <option value="Steering & Suspension" className="bg-[#0e1424]">Steering & Suspension</option>
                    <option value="Cooling & Lubrication" className="bg-[#0e1424]">Cooling & Lubrication</option>
                    <option value="Electrical & Ignition" className="bg-[#0e1424]">Electrical & Ignition</option>
                    <option value="Engine Core" className="bg-[#0e1424]">Engine Core</option>
                  </select>

                  {/* Condition Filter */}
                  <select
                    value={selectedCondition}
                    onChange={(e) => { setSelectedCondition(e.target.value); setCurrentPage(1); }}
                    className="px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all" className="bg-[#0e1424]">All Conditions</option>
                    <option value="oem" className="bg-[#0e1424]">Original OEM</option>
                    <option value="oem_surplus" className="bg-[#0e1424]">OEM Surplus</option>
                    <option value="aftermarket" className="bg-[#0e1424]">Aftermarket Spec</option>
                    <option value="refurb" className="bg-[#0e1424]">Refurbished</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
                    className="px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all" className="bg-[#0e1424]">All Statuses</option>
                    <option value="active" className="bg-[#0e1424]">Active Only</option>
                    <option value="draft" className="bg-[#0e1424]">Draft Only</option>
                    <option value="discontinued" className="bg-[#0e1424]">Discontinued</option>
                  </select>

                  {/* Warehouse Filter */}
                  <select
                    value={selectedWarehouse}
                    onChange={(e) => { setSelectedWarehouse(e.target.value); setCurrentPage(1); }}
                    className="px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="all" className="bg-[#0e1424]">All Warehouses</option>
                    <option value="wh-bgd-01" className="bg-[#0e1424]">Baghdad Hub</option>
                    <option value="wh-erbil-02" className="bg-[#0e1424]">Erbil Depot</option>
                    <option value="wh-basra-03" className="bg-[#0e1424]">Basra Terminal</option>
                  </select>

                  {/* Column Visibility Popover */}
                  <div className="relative">
                    <button
                      onClick={() => setIsColVisibilityOpen(!isColVisibilityOpen)}
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                      title="Toggle visible columns"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Columns</span>
                    </button>

                    {isColVisibilityOpen && (
                      <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#0e1424] border border-white/10 shadow-2xl p-3 z-50 space-y-2">
                        <div className="text-[11px] font-bold text-white border-b border-white/10 pb-1">
                          Visible Columns
                        </div>
                        {Object.entries(visibleCols).map(([colKey, isVisible]) => (
                          <label key={colKey} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isVisible}
                              onChange={(e) =>
                                setVisibleCols((prev) => ({ ...prev, [colKey]: e.target.checked }))
                              }
                              className="rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="capitalize">{colKey.replace(/([A-Z])/g, ' $1')}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Export CSV */}
                  <button
                    onClick={handleBulkExportCSV}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                    title="Export Current View as CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              </div>

              {/* Active Filter Chips */}
              {(selectedCategory !== 'all' || selectedCondition !== 'all' || selectedStatus !== 'all' || selectedWarehouse !== 'all' || searchQuery) && (
                <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                  <span className="font-semibold">Active filters:</span>
                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                      Category: {selectedCategory}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
                    </span>
                  )}
                  {selectedCondition !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                      Condition: {selectedCondition}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCondition('all')} />
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedCondition('all');
                      setSelectedStatus('all');
                      setSelectedWarehouse('all');
                      setSearchQuery('');
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 underline ml-2 cursor-pointer"
                  >
                    Reset all
                  </button>
                </div>
              )}
            </div>

            {/* Floating Bulk Actions Bar (Shown when rows selected) */}
            {selectedPartIds.size > 0 && (
              <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-indigo-950/90 border border-indigo-500/40 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2 text-xs font-bold text-white pl-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs">
                    {selectedPartIds.size}
                  </span>
                  <span>Items Selected</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleBulkStockAdjust(10)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-bold text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    +10 Stock
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('active')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-xs font-bold text-emerald-200 border border-emerald-500/30 transition-colors cursor-pointer"
                  >
                    Set Active
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('draft')}
                    className="px-3 py-1.5 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-white/10 transition-colors cursor-pointer"
                  >
                    Set Draft
                  </button>
                  <button
                    onClick={handleBulkExportCSV}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Export Selected
                  </button>
                  <button
                    onClick={() => setSelectedPartIds(new Set())}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Data Table */}
            <div className="rounded-2xl bg-[#0e1424] border border-white/10 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#090d18] text-slate-400 font-bold uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th scope="col" className="p-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            paginatedParts.length > 0 &&
                            paginatedParts.every((p) => selectedPartIds.has(p.id))
                          }
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>

                      {visibleCols.skuBrand && (
                        <th
                          scope="col"
                          onClick={() => handleSort('sku')}
                          className="p-3 cursor-pointer hover:text-white transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>SKU & Brand</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-500" />
                          </div>
                        </th>
                      )}

                      <th
                        scope="col"
                        onClick={() => handleSort('name')}
                        className="p-3 cursor-pointer hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          <span>Part Name</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-500" />
                        </div>
                      </th>

                      {visibleCols.oemNumber && (
                        <th scope="col" className="p-3">OEM Reference</th>
                      )}

                      {visibleCols.category && (
                        <th scope="col" className="p-3">Category</th>
                      )}

                      {visibleCols.condition && (
                        <th scope="col" className="p-3">Condition</th>
                      )}

                      {visibleCols.stockOnHand && (
                        <th
                          scope="col"
                          onClick={() => handleSort('stock')}
                          className="p-3 cursor-pointer hover:text-white transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Stock on Hand</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-500" />
                          </div>
                        </th>
                      )}

                      {visibleCols.pricing && (
                        <th
                          scope="col"
                          onClick={() => handleSort('price')}
                          className="p-3 cursor-pointer hover:text-white transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Cost / Price</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-500" />
                          </div>
                        </th>
                      )}

                      {visibleCols.fitments && (
                        <th
                          scope="col"
                          onClick={() => handleSort('fitments')}
                          className="p-3 cursor-pointer hover:text-white transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <span>Fitment Coverage</span>
                            <ArrowUpDown className="w-3 h-3 text-slate-500" />
                          </div>
                        </th>
                      )}

                      {visibleCols.status && (
                        <th scope="col" className="p-3">Status</th>
                      )}

                      {visibleCols.actions && (
                        <th scope="col" className="p-3 text-right">Actions</th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {/* Skeleton loading simulation (0 CLS layout stability) */}
                    {isSimulateLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="p-3 text-center"><div className="w-4 h-4 bg-white/10 rounded mx-auto" /></td>
                          <td className="p-3"><div className="h-4 w-28 bg-white/10 rounded mb-1" /><div className="h-3 w-16 bg-white/5 rounded" /></td>
                          <td className="p-3"><div className="h-4 w-44 bg-white/10 rounded" /></td>
                          <td className="p-3"><div className="h-4 w-24 bg-white/10 rounded" /></td>
                          <td className="p-3"><div className="h-4 w-20 bg-white/10 rounded" /></td>
                          <td className="p-3"><div className="h-4 w-16 bg-white/10 rounded" /></td>
                          <td className="p-3"><div className="h-4 w-20 bg-white/10 rounded" /></td>
                          <td className="p-3"><div className="h-4 w-20 bg-white/10 rounded" /></td>
                          <td className="p-3"><div className="h-4 w-16 bg-white/10 rounded" /></td>
                          <td className="p-3"><div className="h-4 w-14 bg-white/10 rounded" /></td>
                          <td className="p-3 text-right"><div className="h-6 w-16 bg-white/10 rounded ml-auto" /></td>
                        </tr>
                      ))
                    ) : paginatedParts.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="p-12 text-center text-slate-400">
                          <Boxes className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                          <div className="font-bold text-white text-sm">No parts match active criteria</div>
                          <p className="text-xs text-slate-500 mt-1">Try resetting filters or adjusting search terms</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedParts.map((part) => {
                        const isSelected = selectedPartIds.has(part.id);
                        return (
                          <tr
                            key={part.id}
                            className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${
                              isSelected ? 'bg-indigo-900/15' : ''
                            }`}
                            onClick={() => setSelectedPartForDrawer(part)}
                          >
                            {/* Checkbox */}
                            <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleSelectRow(part.id, e.target.checked)}
                                className="rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-indigo-500"
                              />
                            </td>

                            {/* SKU & Brand */}
                            {visibleCols.skuBrand && (
                              <td className="p-3 font-medium">
                                <div className="font-mono font-bold text-indigo-300 text-[11px]">{part.sku}</div>
                                <div className="text-[11px] text-slate-400">{part.brand}</div>
                              </td>
                            )}

                            {/* Part Name */}
                            <td className="p-3">
                              <div className="font-bold text-white line-clamp-1 max-w-[280px]">{part.name}</div>
                              <div className="text-[10px] text-slate-500">Unit: {part.unit}</div>
                            </td>

                            {/* OEM Reference */}
                            {visibleCols.oemNumber && (
                              <td className="p-3 font-mono text-[11px] text-slate-300">
                                {part.oemNumber || <span className="text-slate-600">—</span>}
                              </td>
                            )}

                            {/* Category */}
                            {visibleCols.category && (
                              <td className="p-3 text-slate-300">{part.categoryName}</td>
                            )}

                            {/* Condition */}
                            {visibleCols.condition && (
                              <td className="p-3">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                    part.condition === 'oem'
                                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                      : part.condition === 'oem_surplus'
                                      ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                                      : part.condition === 'aftermarket'
                                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                      : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                                  }`}
                                >
                                  {part.condition.replace('_', ' ')}
                                </span>
                              </td>
                            )}

                            {/* Stock on Hand */}
                            {visibleCols.stockOnHand && (
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`font-mono font-bold text-sm ${
                                      part.isLowStock ? 'text-rose-400' : 'text-white'
                                    }`}
                                  >
                                    {part.totalQtyOnHand}
                                  </span>
                                  {part.isLowStock && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                      LOW
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  Res: {part.totalQtyReserved} • Inc: {part.totalQtyIncoming}
                                </div>
                              </td>
                            )}

                            {/* Pricing & Margin */}
                            {visibleCols.pricing && (
                              <td className="p-3 font-mono">
                                <div className="text-white font-bold">${(part.priceCents / 100).toFixed(2)}</div>
                                <div className="text-[10px] text-slate-400">
                                  Cost: ${(part.costCents / 100).toFixed(2)} (
                                  {Math.round(((part.priceCents - part.costCents) / part.priceCents) * 100)}%)
                                </div>
                              </td>
                            )}

                            {/* Fitment Coverage & Audit Flag */}
                            {visibleCols.fitments && (
                              <td className="p-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-white">{part.fitments.length} models</span>
                                  {part.fitments.some((f) => f.confidence < 0.85) ? (
                                    <span
                                      className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                      title="Confidence < 0.85 requires human review"
                                    >
                                      <ShieldAlert className="w-2.5 h-2.5" />
                                      Audit
                                    </span>
                                  ) : (
                                    <span
                                      className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                      title="Audited guaranteed fitment"
                                    >
                                      <ShieldCheck className="w-2.5 h-2.5" />
                                      Verified
                                    </span>
                                  )}
                                </div>
                              </td>
                            )}

                            {/* Status */}
                            {visibleCols.status && (
                              <td className="p-3">
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    part.status === 'active'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : part.status === 'draft'
                                      ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  }`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                  {part.status}
                                </span>
                              </td>
                            )}

                            {/* Row Action Trigger */}
                            {visibleCols.actions && (
                              <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => setSelectedPartForDrawer(part)}
                                  className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-indigo-600 hover:text-white text-slate-300 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                                >
                                  Detail →
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Bar */}
              <div className="p-3 bg-[#090d18] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div>
                  Showing{' '}
                  <span className="font-bold text-white">
                    {Math.min(filteredParts.length, (currentPage - 1) * pageSize + 1)} -{' '}
                    {Math.min(filteredParts.length, currentPage * pageSize)}
                  </span>{' '}
                  of <span className="font-bold text-white">{filteredParts.length}</span> parts
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 disabled:pointer-events-none text-xs text-slate-300 cursor-pointer"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        currentPage === i + 1
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:bg-white/[0.05]'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-40 disabled:pointer-events-none text-xs text-slate-300 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PRODUCTION / WORK ORDERS (Phase 5 Pattern) */}
        {/* ========================================================================= */}
        {activeTab === 'production' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Production & Assembly Work Orders</h2>
                <p className="text-xs text-slate-400">Linear routing gates, station tracking & OEE metrics</p>
              </div>
              <button
                onClick={() => {
                  showToast({ type: 'info', title: 'Work Order Dispatched', message: 'New Work Order WO-2026-0486 created for Prado Rotors.' });
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Work Order</span>
              </button>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(['released', 'in_progress', 'qc', 'completed'] as WorkOrder['status'][]).map((colStatus) => {
                const colWos = workOrders.filter((wo) => wo.status === colStatus);
                return (
                  <div key={colStatus} className="p-4 rounded-3xl bg-[#0e1424] border border-white/10 shadow-xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                        {colStatus.replace('_', ' ')}
                      </span>
                      <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-bold">
                        {colWos.length}
                      </span>
                    </div>

                    <div className="space-y-3 min-h-[300px]">
                      {colWos.map((wo) => (
                        <div
                          key={wo.id}
                          className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 space-y-3 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-indigo-400">{wo.code}</span>
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                wo.priority === 'urgent'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : wo.priority === 'high'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                              }`}
                            >
                              {wo.priority}
                            </span>
                          </div>

                          <div>
                            <div className="font-bold text-white text-xs">{wo.partName}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{wo.partSku}</div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-[11px] text-slate-400">
                              <span>Output Progress</span>
                              <span className="font-bold text-white">
                                {wo.qtyProduced} / {wo.qtyPlanned}
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${(wo.qtyProduced / wo.qtyPlanned) * 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="text-[10px] text-slate-400 border-t border-white/5 pt-2 flex items-center justify-between">
                            <span className="truncate max-w-[140px]">{wo.assigneeName}</span>
                            {wo.status !== 'completed' && (
                              <button
                                onClick={() => handleAdvanceWorkOrderStatus(wo.id)}
                                className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                              >
                                Advance →
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PROCUREMENT & POs */}
        {/* ========================================================================= */}
        {activeTab === 'procurement' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Procurement & Purchase Orders</h2>
                <p className="text-xs text-slate-400">Supplier PO tracking, line receiving, and stock movement sync</p>
              </div>
              <button
                onClick={() => {
                  showToast({ type: 'info', title: 'New PO Drafted', message: 'Purchase Order PO-2026-0201 initialized for Denso Middle East.' });
                }}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Purchase Order</span>
              </button>
            </div>

            <div className="space-y-4">
              {purchaseOrders.map((po) => (
                <div key={po.id} className="p-5 rounded-3xl bg-[#0e1424] border border-white/10 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
                        PO
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-white">{po.code}</span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {po.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{po.supplierName}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Expected ETA</div>
                        <div className="text-xs font-bold text-white">{new Date(po.expectedAt).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Total PO Value</div>
                        <div className="text-sm font-mono font-bold text-emerald-400">
                          ${(po.totalCents / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lines */}
                  <div className="space-y-2">
                    {po.lines.map((line) => (
                      <div
                        key={line.id}
                        className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{line.partName}</div>
                          <div className="text-[10px] font-mono text-indigo-400">{line.partSku}</div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div>
                            Qty: <span className="font-bold text-white">{line.qty}</span>
                          </div>
                          <div>
                            Received: <span className="font-bold text-emerald-400">{line.receivedQty}</span>
                          </div>
                          <button
                            onClick={() => {
                              showToast({
                                type: 'success',
                                title: 'PO Line Received',
                                message: `Received ${line.qty} units of ${line.partSku}. Stock ledger and onHand balance incremented.`,
                              });
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            Receive Line →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ──────────────── Part Detail Slide-Over Drawer (Phase 3) ──────────────── */}
      {selectedPartForDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedPartForDrawer(null)}
          />

          {/* Drawer Container */}
          <div className="relative w-full max-w-2xl bg-[#090e1a] border-l border-white/10 shadow-2xl z-10 flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/10 bg-[#070a12] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-400">
                    {selectedPartForDrawer.sku}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      selectedPartForDrawer.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-500/10 text-slate-300 border-slate-500/30'
                    }`}
                  >
                    {selectedPartForDrawer.status}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white mt-1 line-clamp-1">
                  {selectedPartForDrawer.name}
                </h2>
              </div>

              <button
                onClick={() => setSelectedPartForDrawer(null)}
                className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex items-center gap-2 px-5 pt-3 border-b border-white/5 bg-[#090d18]">
              <button
                onClick={() => setDrawerActiveTab('overview')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  drawerActiveTab === 'overview'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview & Specs
              </button>
              <button
                onClick={() => setDrawerActiveTab('fitments')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  drawerActiveTab === 'fitments'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Vehicle Fitment</span>
                <span className="text-[10px] px-1.5 rounded-full bg-white/10">
                  {selectedPartForDrawer.fitments.length}
                </span>
              </button>
              <button
                onClick={() => setDrawerActiveTab('stock')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  drawerActiveTab === 'stock'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Stock & Warehouses</span>
                <span className="text-[10px] px-1.5 rounded-full bg-white/10 font-mono">
                  {selectedPartForDrawer.totalQtyOnHand}
                </span>
              </button>
              <button
                onClick={() => setDrawerActiveTab('history')}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
                  drawerActiveTab === 'history'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Ledger & Movements
              </button>
            </div>

            {/* Drawer Content Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-6">
              {/* TAB: OVERVIEW */}
              {drawerActiveTab === 'overview' && (
                <div className="space-y-5">
                  {/* Financial Metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Cost (Internal)</div>
                      <div className="text-base font-mono font-bold text-white mt-1">
                        ${(selectedPartForDrawer.costCents / 100).toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Selling Price</div>
                      <div className="text-base font-mono font-bold text-emerald-400 mt-1">
                        ${(selectedPartForDrawer.priceCents / 100).toFixed(2)}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Gross Margin</div>
                      <div className="text-base font-mono font-bold text-indigo-400 mt-1">
                        {Math.round(
                          ((selectedPartForDrawer.priceCents - selectedPartForDrawer.costCents) /
                            selectedPartForDrawer.priceCents) *
                            100
                        )}
                        %
                      </div>
                    </div>
                  </div>

                  {/* Attributes JSON KV */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Technical Specifications</h4>
                    <div className="p-4 rounded-2xl bg-[#0e1424] border border-white/5 divide-y divide-white/5 text-xs">
                      <div className="py-1.5 flex justify-between">
                        <span className="text-slate-400">Brand Manufacturer</span>
                        <span className="font-bold text-white">{selectedPartForDrawer.brand}</span>
                      </div>
                      <div className="py-1.5 flex justify-between">
                        <span className="text-slate-400">OEM Number</span>
                        <span className="font-mono text-white">{selectedPartForDrawer.oemNumber || 'N/A'}</span>
                      </div>
                      <div className="py-1.5 flex justify-between">
                        <span className="text-slate-400">Condition Classification</span>
                        <span className="font-semibold text-indigo-300 uppercase">{selectedPartForDrawer.condition}</span>
                      </div>
                      <div className="py-1.5 flex justify-between">
                        <span className="text-slate-400">Weight</span>
                        <span className="font-mono text-white">{selectedPartForDrawer.weightG ? `${selectedPartForDrawer.weightG} g` : 'N/A'}</span>
                      </div>
                      {selectedPartForDrawer.dimsMm && (
                        <div className="py-1.5 flex justify-between">
                          <span className="text-slate-400">Dimensions (L × W × H)</span>
                          <span className="font-mono text-white">{selectedPartForDrawer.dimsMm.join(' × ')} mm</span>
                        </div>
                      )}
                      {Object.entries(selectedPartForDrawer.attrs).map(([k, v]) => (
                        <div key={k} className="py-1.5 flex justify-between">
                          <span className="text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="font-mono text-white">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: FITMENTS */}
              {drawerActiveTab === 'fitments' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Compatible Vehicles & Engines
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Confidence &lt; 0.85 flags row for engineering inspection
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {selectedPartForDrawer.fitments.map((fit) => (
                      <div
                        key={fit.id}
                        className="p-3.5 rounded-2xl bg-[#0e1424] border border-white/5 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-white text-xs">
                            {fit.vehicleMake} {fit.vehicleModel} ({fit.generation})
                          </div>
                          {fit.confidence >= 0.85 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <ShieldCheck className="w-3 h-3 text-emerald-400" />
                              Guaranteed Fit ({(fit.confidence * 100).toFixed(0)}%)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <ShieldAlert className="w-3 h-3 text-amber-400" />
                              Requires Review ({(fit.confidence * 100).toFixed(0)}%)
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                          <div>
                            Engine: <span className="text-white font-mono">{fit.engineCode}</span>
                          </div>
                          <div>
                            Years: <span className="text-white">{fit.yearRange}</span>
                          </div>
                          <div>
                            Position: <span className="text-white uppercase">{fit.position}</span>
                          </div>
                        </div>

                        {fit.confidence < 0.85 && (
                          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                            <span className="text-[10px] text-amber-300">Awaiting human catalog approval</span>
                            <button
                              onClick={() => {
                                setParts((prev) =>
                                  prev.map((p) => {
                                    if (p.id !== selectedPartForDrawer.id) return p;
                                    const updatedFits = p.fitments.map((f) =>
                                      f.id === fit.id ? { ...f, confidence: 0.98 } : f
                                    );
                                    const updated = { ...p, fitments: updatedFits };
                                    setSelectedPartForDrawer(updated);
                                    return updated;
                                  })
                                );
                                showToast({
                                  type: 'success',
                                  title: 'Fitment Approved',
                                  message: `Verified guaranteed fitment for ${fit.vehicleMake} ${fit.vehicleModel}.`,
                                });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] cursor-pointer"
                            >
                              Approve Fitment →
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: STOCK & WAREHOUSES */}
              {drawerActiveTab === 'stock' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Warehouse Balances & Multi-Hub Sync
                  </h4>

                  <div className="space-y-3">
                    {selectedPartForDrawer.stockLevels.map((wh) => (
                      <div
                        key={wh.warehouseId}
                        className="p-4 rounded-2xl bg-[#0e1424] border border-white/5 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white text-xs">{wh.warehouseName}</div>
                            <div className="text-[10px] text-slate-400">{wh.city} Hub • Bin: {wh.bin}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-mono font-bold text-white">{wh.qtyOnHand} units</div>
                            <div className="text-[10px] text-slate-400">Reorder Point: {wh.reorderPoint}</div>
                          </div>
                        </div>

                        {/* Inline Stock Adjustment Controls */}
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400 font-semibold">Inline Adjust:</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                handleDrawerStockAdjust(selectedPartForDrawer.id, wh.warehouseId, 5, 'receipt')
                              }
                              className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-emerald-400 cursor-pointer"
                            >
                              +5 Receive
                            </button>
                            <button
                              onClick={() =>
                                handleDrawerStockAdjust(selectedPartForDrawer.id, wh.warehouseId, -1, 'sale')
                              }
                              className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-slate-300 cursor-pointer"
                            >
                              -1 Dispatch
                            </button>
                            <button
                              onClick={() =>
                                handleDrawerStockAdjust(selectedPartForDrawer.id, wh.warehouseId, -2, 'transfer')
                              }
                              className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/[0.12] text-xs font-bold text-amber-400 cursor-pointer"
                            >
                              -2 Transfer
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: HISTORY */}
              {drawerActiveTab === 'history' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Append-Only Stock Ledger
                  </h4>
                  <div className="space-y-2.5">
                    {stockMovements
                      .filter((m) => m.partId === selectedPartForDrawer.id)
                      .map((m) => (
                        <div
                          key={m.id}
                          className="p-3 rounded-2xl bg-[#0e1424] border border-white/5 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                                  m.delta > 0
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/20 text-rose-400'
                                }`}
                              >
                                {m.delta > 0 ? `+${m.delta}` : m.delta}
                              </span>
                              <span className="font-bold text-white capitalize">{m.reason}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {m.warehouseName} • By: {m.actorName}
                            </div>
                          </div>
                          <div className="text-right text-[10px] text-slate-500">
                            <div>{m.refId || 'Manual'}</div>
                            <div>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── Multi-Step New Part Wizard with Draft Autosave ──────────────── */}
      {isNewPartWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsNewPartWizardOpen(false)} />
          <div className="relative w-full max-w-xl bg-[#0e1424] border border-white/10 rounded-3xl shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Wizard Header */}
            <div className="p-5 border-b border-white/10 bg-[#090d18] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">Create New Catalog Part</h3>
                <p className="text-xs text-slate-400">Step {wizardStep} of 3 • Guided Setup</p>
              </div>

              {lastAutosaveTime && (
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Draft saved at {lastAutosaveTime}</span>
                </div>
              )}

              <button
                onClick={() => setIsNewPartWizardOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Steps */}
            <form onSubmit={handleCreateNewPartSubmit} className="p-5 space-y-4">
              {/* STEP 1: IDENTITY */}
              {wizardStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Part SKU / Code *</label>
                    <input
                      type="text"
                      required
                      value={wizardDraft.sku}
                      onChange={(e) => saveWizardDraft({ ...wizardDraft, sku: e.target.value })}
                      placeholder="e.g. BRK-TOY-43512-PRD"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white uppercase font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Part Name *</label>
                    <input
                      type="text"
                      required
                      value={wizardDraft.name}
                      onChange={(e) => saveWizardDraft({ ...wizardDraft, name: e.target.value })}
                      placeholder="e.g. Front Vented Brake Disc Rotors (Pair)"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Manufacturer</label>
                      <input
                        type="text"
                        value={wizardDraft.brand}
                        onChange={(e) => saveWizardDraft({ ...wizardDraft, brand: e.target.value })}
                        placeholder="e.g. Advics, Denso, Bosch"
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">OEM Number</label>
                      <input
                        type="text"
                        value={wizardDraft.oemNumber}
                        onChange={(e) => saveWizardDraft({ ...wizardDraft, oemNumber: e.target.value })}
                        placeholder="e.g. 43512-60191"
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                      <select
                        value={wizardDraft.category}
                        onChange={(e) => saveWizardDraft({ ...wizardDraft, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#090d18] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option>Brake System</option>
                        <option>Fuel & Emission</option>
                        <option>Steering & Suspension</option>
                        <option>Cooling & Lubrication</option>
                        <option>Electrical & Ignition</option>
                        <option>Engine Core</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Condition</label>
                      <select
                        value={wizardDraft.condition}
                        onChange={(e) => saveWizardDraft({ ...wizardDraft, condition: e.target.value as PartCondition })}
                        className="w-full px-3 py-2 rounded-xl bg-[#090d18] border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="oem">Original OEM</option>
                        <option value="oem_surplus">OEM Surplus</option>
                        <option value="aftermarket">Certified Aftermarket</option>
                        <option value="refurb">Refurbished</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PRICING & SPECS */}
              {wizardStep === 2 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Cost Price ($ USD)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={wizardDraft.costUSD}
                        onChange={(e) => saveWizardDraft({ ...wizardDraft, costUSD: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Selling Price ($ USD)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={wizardDraft.priceUSD}
                        onChange={(e) => saveWizardDraft({ ...wizardDraft, priceUSD: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Length (mm)</label>
                      <input
                        type="number"
                        value={wizardDraft.dimL}
                        onChange={(e) => saveWizardDraft({ ...wizardDraft, dimL: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Width (mm)</label>
                      <input
                        type="number"
                        value={wizardDraft.dimW}
                        onChange={(e) => saveWizardDraft({ ...wizardDraft, dimW: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Height (mm)</label>
                      <input
                        type="number"
                        value={wizardDraft.dimH}
                        onChange={(e) => saveWizardDraft({ ...wizardDraft, dimH: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Weight in Grams (g)</label>
                    <input
                      type="number"
                      value={wizardDraft.weightG}
                      onChange={(e) => saveWizardDraft({ ...wizardDraft, weightG: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: FITMENT & STOCK */}
              {wizardStep === 3 && (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 font-medium">
                    Primary Fitment & Warehouse Balance
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Make</label>
                      <input
                        type="text"
                        value={wizardDraft.fitmentMake}
                        onChange={(e) => saveWizardDraft({ ...wizardDraft, fitmentMake: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Model</label>
                      <input
                        type="text"
                        value={wizardDraft.fitmentModel}
                        onChange={(e) => saveWizardDraft({ ...wizardDraft, fitmentModel: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Engine Code</label>
                      <input
                        type="text"
                        value={wizardDraft.fitmentEngine}
                        onChange={(e) => saveWizardDraft({ ...wizardDraft, fitmentEngine: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Year Range</label>
                      <input
                        type="text"
                        value={wizardDraft.fitmentYear}
                        onChange={(e) => saveWizardDraft({ ...wizardDraft, fitmentYear: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Warehouse</label>
                      <select
                        value={wizardDraft.initialWarehouse}
                        onChange={(e) => saveWizardDraft({ ...wizardDraft, initialWarehouse: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#090d18] border border-white/10 text-xs text-white"
                      >
                        <option value="wh-bgd-01">Baghdad Hub</option>
                        <option value="wh-erbil-02">Erbil Depot</option>
                        <option value="wh-basra-03">Basra Terminal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Qty</label>
                      <input
                        type="number"
                        min="0"
                        value={wizardDraft.initialQty}
                        onChange={(e) => saveWizardDraft({ ...wizardDraft, initialQty: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Bin Location</label>
                      <input
                        type="text"
                        value={wizardDraft.binLocation}
                        onChange={(e) => saveWizardDraft({ ...wizardDraft, binLocation: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Nav Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  {wizardStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setWizardStep((s) => (s - 1) as any)}
                      className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-semibold text-slate-300 cursor-pointer"
                    >
                      ← Back
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={clearWizardDraft}
                      className="text-xs text-slate-500 hover:text-slate-300 underline cursor-pointer"
                    >
                      Discard Draft
                    </button>
                  )}
                </div>

                <div>
                  {wizardStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!wizardDraft.sku || !wizardDraft.name) {
                          showToast({ type: 'warning', title: 'Required Fields', message: 'Please provide SKU and Part Name.' });
                          return;
                        }
                        setWizardStep((s) => (s + 1) as any);
                      }}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md"
                    >
                      Continue →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-md"
                    >
                      Publish Part to Catalog
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────── Command Palette (⌘K) Modal ──────────────── */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsCommandPaletteOpen(false)} />
          <div className="relative w-full max-w-xl bg-[#0e1424] border border-white/10 rounded-2xl shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-100">
            {/* Search Input Bar */}
            <div className="p-3.5 border-b border-white/10 flex items-center gap-3">
              <Search className="w-4 h-4 text-indigo-400" />
              <input
                autoFocus
                type="text"
                value={commandPaletteQuery}
                onChange={(e) => setCommandPaletteQuery(e.target.value)}
                placeholder="Type a command, part SKU, or work order..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
              />
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono text-slate-400">
                ESC
              </kbd>
            </div>

            {/* Results Body */}
            <div className="max-h-96 overflow-y-auto p-2 space-y-3">
              {/* Actions Section */}
              {commandPaletteResults.actions.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Console Actions
                  </div>
                  {commandPaletteResults.actions.map((act) => {
                    const Icon = act.icon;
                    return (
                      <button
                        key={act.id}
                        onClick={act.run}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.05] text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{act.title}</div>
                            <div className="text-[10px] text-slate-400">{act.subtitle}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Parts Section */}
              {commandPaletteResults.parts.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Catalog Parts
                  </div>
                  {commandPaletteResults.parts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPartForDrawer(p);
                        setIsCommandPaletteOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.05] text-left transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-white text-xs">{p.name}</div>
                        <div className="text-[10px] font-mono text-indigo-400">{p.sku} • {p.brand}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">
                        {p.totalQtyOnHand} in stock
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Work Orders Section */}
              {commandPaletteResults.workOrders.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Work Orders
                  </div>
                  {commandPaletteResults.workOrders.map((wo) => (
                    <button
                      key={wo.id}
                      onClick={() => {
                        setActiveTab('production');
                        setIsCommandPaletteOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.05] text-left transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-mono font-bold text-indigo-400 text-xs">{wo.code}</div>
                        <div className="text-[10px] text-white">{wo.partName}</div>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">{wo.status}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── Toast Notifications Host (Polite ARIA Region) ──────────────── */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start justify-between gap-3 animate-in slide-in-from-bottom-3 ${
              t.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-100'
                : t.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
                : t.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-100'
                : 'bg-indigo-950/90 border-indigo-500/40 text-indigo-100'
            }`}
          >
            <div className="min-w-0">
              <div className="font-bold text-xs text-white">{t.title}</div>
              <div className="text-[11px] opacity-90 mt-0.5 leading-relaxed">{t.message}</div>
              {t.actionLabel && t.onAction && (
                <button
                  onClick={() => {
                    t.onAction?.();
                    removeToast(t.id);
                  }}
                  className="mt-2 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-[10px] transition-colors cursor-pointer"
                >
                  {t.actionLabel}
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-white/60 hover:text-white shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
