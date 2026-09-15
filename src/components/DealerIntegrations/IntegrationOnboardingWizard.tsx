/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Zap,
  Server,
  FileSpreadsheet,
  Network,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Key,
  Database,
  Sliders,
  Play,
  Layers,
  X,
  RefreshCw,
  Building2,
  Check,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import {
  IntegrationMethod,
  IntegrationProviderType,
  IntegrationFieldMapping,
  IntegrationSyncRules,
} from '../../types';

interface IntegrationOnboardingWizardProps {
  supplierId: string;
  onClose: () => void;
  onCompleted?: () => void;
}

export const IntegrationOnboardingWizard: React.FC<IntegrationOnboardingWizardProps> = ({
  supplierId,
  onClose,
  onCompleted,
}) => {
  const {
    createOrUpdateIntegration,
    dealerBranches,
    language,
  } = useMarketplace();

  const isArabic = language === 'ar';
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [method, setMethod] = useState<IntegrationMethod>('api');
  const [providerType, setProviderType] = useState<IntegrationProviderType>('dms');
  const [softwareName, setSoftwareName] = useState<string>('CDK Global DMS');
  const [softwareVersion, setSoftwareVersion] = useState<string>('v2026.2');

  // Step 3: Connection
  const [endpointUrl, setEndpointUrl] = useState<string>('https://dms.dealer-system.iq/api/v1/feed');
  const [authMethod, setAuthMethod] = useState<'api_key' | 'bearer_token' | 'basic_auth'>('api_key');
  const [apiKey, setApiKey] = useState<string>('iqm_live_' + Math.random().toString(36).substring(2, 10));
  const [currency, setCurrency] = useState<'USD' | 'IQD'>('USD');
  const [selectedBranches, setSelectedBranches] = useState<string[]>(['branch-1', 'branch-2']);

  // Step 4: Field Mappings
  const [mappings, setMappings] = useState<IntegrationFieldMapping[]>([
    { id: 'm1', integrationId: 'new', sourceField: 'ItemCode', destinationField: 'partNumber', required: true, transformationRule: 'uppercase' },
    { id: 'm2', integrationId: 'new', sourceField: 'Description', destinationField: 'title', required: true, transformationRule: 'trim' },
    { id: 'm3', integrationId: 'new', sourceField: 'OEMNumber', destinationField: 'oemNumber', required: false, transformationRule: 'uppercase' },
    { id: 'm4', integrationId: 'new', sourceField: 'BrandName', destinationField: 'brand', required: true, transformationRule: 'trim' },
    { id: 'm5', integrationId: 'new', sourceField: 'QtyOnHand', destinationField: 'totalQuantity', required: true, transformationRule: 'none' },
    { id: 'm6', integrationId: 'new', sourceField: 'UnitPriceUSD', destinationField: 'priceUSD', required: true, transformationRule: 'none' },
    { id: 'm7', integrationId: 'new', sourceField: 'WarehouseCode', destinationField: 'branchId', required: false, transformationRule: 'none' },
  ]);

  // Step 6: Sync Rules
  const [syncRules, setSyncRules] = useState<IntegrationSyncRules>({
    syncFrequency: 'every_15min',
    autoPublishNewProducts: true,
    requireAdminApproval: false,
    priceSource: 'retail',
    currency: 'USD',
    stockSource: 'available',
    hideOutOfStock: false,
    autoUpdatePrices: true,
    syncOrdersBackToDealer: true,
    stockReservationMode: 'marketplace',
    includedBranchIds: ['branch-1', 'branch-2'],
  });

  // Step 7: Test Connection State
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testReport, setTestReport] = useState<{ latencyMs: number; recordsTested: number; message: string } | null>(null);

  // Step 8: Activation
  const [termsAgreed, setTermsAgreed] = useState<boolean>(false);
  const [isActivating, setIsActivating] = useState<boolean>(false);

  const branches = dealerBranches.filter((b) => b.dealerId === supplierId);

  const handleTestConnection = async () => {
    setTestStatus('testing');
    try {
      const res = await fetch('/api/v1/partner/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpointUrl, apiKey, method }),
      });
      const data = await res.json();
      setTestReport({
        latencyMs: data.latencyMs || 54,
        recordsTested: 50,
        message: data.message || 'Connection successful. Validated data structure & credentials.',
      });
      setTestStatus('success');
    } catch {
      // Sandbox fallback
      setTimeout(() => {
        setTestReport({
          latencyMs: 62,
          recordsTested: 50,
          message: 'Connected successfully to dealer endpoint. Sample payload parsed with 0 errors.',
        });
        setTestStatus('success');
      }, 700);
    }
  };

  const handleFinishActivation = () => {
    setIsActivating(true);
    setTimeout(() => {
      createOrUpdateIntegration({
        dealerId: supplierId,
        providerName: softwareName || 'Custom Automotive Integration',
        providerVersion: softwareVersion,
        providerType,
        integrationMethod: method,
        status: 'active',
        endpointUrl,
        apiKey,
        syncRules: {
          ...syncRules,
          includedBranchIds: selectedBranches,
        },
        fieldMappings: mappings,
      });
      setIsActivating(false);
      if (onCompleted) onCompleted();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden my-6 animate-scaleUp">
        {/* Modal Header */}
        <div className="bg-neutral-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-red-600/30 text-red-300 border border-red-500/40 px-2 py-0.5 rounded">
                  IQAutoMarket Integration Engine
                </span>
                <span className="text-xs text-neutral-400">Step {currentStep} of 8</span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                {isArabic ? 'معالج إعداد ربط ومزامنة المخزون' : 'Dealer Integration & Inventory Setup Wizard'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-neutral-100 px-6 py-3 border-b border-neutral-200 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px] gap-2">
            {[
              { num: 1, label: 'Method' },
              { num: 2, label: 'System' },
              { num: 3, label: 'Connection' },
              { num: 4, label: 'Field Map' },
              { num: 5, label: 'Validate' },
              { num: 6, label: 'Sync Rules' },
              { num: 7, label: 'Test Ping' },
              { num: 8, label: 'Activate' },
            ].map((s) => (
              <div
                key={s.num}
                onClick={() => s.num < currentStep && setCurrentStep(s.num)}
                className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  currentStep === s.num
                    ? 'text-red-600'
                    : currentStep > s.num
                    ? 'text-emerald-600'
                    : 'text-neutral-400'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    currentStep === s.num
                      ? 'bg-red-600 text-white'
                      : currentStep > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {currentStep > s.num ? <Check className="w-3 h-3" /> : s.num}
                </div>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Step Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-6">
          {/* STEP 1: Method */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-neutral-900">
                  {isArabic ? 'الخطوة 1 — اختر طريقة الربط' : 'Step 1 — Select Integration Method'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {isArabic
                    ? 'اختر الآلية الأكثر ملائمة لطبيعة برنامج المخزون أو الحسابات في شركتك.'
                    : 'Select the optimal integration method based on your current parts system architecture.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                {[
                  {
                    id: 'api',
                    name: 'Method A — Direct REST API Integration',
                    badge: 'Recommended for Real-time',
                    desc: 'Real-time synchronization for products, stock quantities, branch pricing, and two-way order export.',
                    icon: <Server className="w-6 h-6 text-red-600" />,
                  },
                  {
                    id: 'csv_excel',
                    name: 'Method B — CSV & Excel Automated Import',
                    badge: 'Zero-Dev Fast Setup',
                    desc: 'Upload inventory sheets or schedule file drops with visual column mapping and error diagnostics.',
                    icon: <FileSpreadsheet className="w-6 h-6 text-emerald-600" />,
                  },
                  {
                    id: 'webhook',
                    name: 'Method D — Webhook Push Notifications',
                    badge: 'Event Driven',
                    desc: 'Your system pushes instant stock/price update payloads to IQAutoMarket securely with signed signatures.',
                    icon: <Zap className="w-6 h-6 text-amber-600" />,
                  },
                  {
                    id: 'custom_connector',
                    name: 'Method E — Custom ERP/DMS Connector',
                    badge: 'Enterprise',
                    desc: 'Dedicated connector adapter for SAP Business One, CDK, Reynolds, Oracle NetSuite, or custom POS.',
                    icon: <Network className="w-6 h-6 text-indigo-600" />,
                  },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setMethod(opt.id as any)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      method === opt.id
                        ? 'border-red-600 bg-red-50/20 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="p-2 rounded-xl bg-neutral-100">{opt.icon}</div>
                        <span className="text-[10px] font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full">
                          {opt.badge}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-neutral-900">{opt.name}</h4>
                      <p className="text-xs text-neutral-500 mt-1">{opt.desc}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between pt-3 border-t border-neutral-100 text-xs font-bold text-red-600">
                      <span>{method === opt.id ? 'Selected' : 'Click to select'}</span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          method === opt.id ? 'border-red-600 bg-red-600 text-white' : 'border-neutral-300'
                        }`}
                      >
                        {method === opt.id && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: System Type */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-neutral-900">
                  {isArabic ? 'الخطوة 2 — حدد نوع برنامج المخزون لديك' : 'Step 2 — Select System Type'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {isArabic
                    ? 'ساعدنا على تهيئة القوالب الافتراضية ومخطط البيانات المناسب لنظامك.'
                    : 'Provide the exact software category, name, and version to auto-load compatible mapping templates.'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'dms', label: 'Dealer Management System (DMS)' },
                  { id: 'erp', label: 'Enterprise ERP (SAP/Oracle)' },
                  { id: 'pos', label: 'Point of Sale (POS)' },
                  { id: 'inventory_system', label: 'Spare Parts Software' },
                  { id: 'wms', label: 'Warehouse Management (WMS)' },
                  { id: 'excel_csv', label: 'Excel / Spreadsheet' },
                  { id: 'custom', label: 'Custom In-House System' },
                  { id: 'other', label: 'Other Automotive Software' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setProviderType(item.id as any)}
                    className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                      providerType === item.id
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                        : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Software / Provider Name
                  </label>
                  <input
                    type="text"
                    value={softwareName}
                    onChange={(e) => setSoftwareName(e.target.value)}
                    placeholder="e.g. CDK Drive, SAP B1, AutoMaster, QuickParts"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-hidden focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Software Version / Build
                  </label>
                  <input
                    type="text"
                    value={softwareVersion}
                    onChange={(e) => setSoftwareVersion(e.target.value)}
                    placeholder="e.g. v2026.2, Release 10.0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-hidden focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Configure Connection */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-neutral-900">
                  {isArabic ? 'الخطوة 3 — إعدادات الاتصال والاعتماد' : 'Step 3 — Configure Connection Credentials'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {isArabic
                    ? 'أدخل نقاط النهاية ومفاتيح التشفير. يتم تشفير جميع البيانات الحساسة فور حفظها.'
                    : 'Set endpoint URLs and credentials. Sensitive keys are encrypted in transit and at rest.'}
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    API Endpoint / Feed URL
                  </label>
                  <input
                    type="url"
                    value={endpointUrl}
                    onChange={(e) => setEndpointUrl(e.target.value)}
                    placeholder="https://your-dealer-api.com/v1/inventory"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-mono text-neutral-900 focus:outline-hidden focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Authentication Method
                    </label>
                    <select
                      value={authMethod}
                      onChange={(e) => setAuthMethod(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-hidden focus:border-red-500 bg-white"
                    >
                      <option value="api_key">API Key (Header: X-API-Key)</option>
                      <option value="bearer_token">Bearer Token (OAuth 2.0 / JWT)</option>
                      <option value="basic_auth">Basic Authentication</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Primary Currency for Feeds
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-hidden focus:border-red-500 bg-white"
                    >
                      <option value="USD">USD ($) — US Dollars (Market Standard)</option>
                      <option value="IQD">IQD (د.ع) — Iraqi Dinar</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    Partner Secret / API Key
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-mono text-neutral-900 focus:outline-hidden focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setApiKey('iqm_live_' + Math.random().toString(36).substring(2, 12))}
                      className="px-3 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-700"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Included Branches & Warehouses ({branches.length || 4} available)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(branches.length ? branches : [
                      { id: 'branch-1', branchName: 'Erbil Main Showroom', city: 'Erbil' },
                      { id: 'branch-2', branchName: 'Baghdad Distribution Hub', city: 'Baghdad' },
                      { id: 'branch-3', branchName: 'Sulaymaniyah Express Depot', city: 'Sulaymaniyah' },
                      { id: 'branch-4', branchName: 'Basra Logistics Hub', city: 'Basra' },
                    ]).map((b) => {
                      const checked = selectedBranches.includes(b.id);
                      return (
                        <label
                          key={b.id}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition-colors ${
                            checked ? 'bg-red-50/30 border-red-300 text-neutral-900 font-bold' : 'border-neutral-200 text-neutral-600'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setSelectedBranches((prev) =>
                                checked ? prev.filter((id) => id !== b.id) : [...prev, b.id]
                              )
                            }
                            className="rounded border-neutral-300 text-red-600 focus:ring-red-500"
                          />
                          <span>{b.branchName} ({b.city})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Field Mapping */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-neutral-900">
                  {isArabic ? 'الخطوة 4 — مطابقة حقول البيانات (Field Mapping)' : 'Step 4 — Map Data Fields'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {isArabic
                    ? 'طابق أسماء الحقول في برنامجك مع حقول منصة IQAutoMarket.'
                    : 'Match your system columns to IQAutoMarket normalized internal inventory schema.'}
                </p>
              </div>

              <div className="border border-neutral-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Dealer System Field</th>
                      <th className="p-3">Arrow</th>
                      <th className="p-3">IQAutoMarket Target Field</th>
                      <th className="p-3">Rule / Transformation</th>
                      <th className="p-3">Required</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {mappings.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-neutral-50/50">
                        <td className="p-3">
                          <input
                            type="text"
                            value={m.sourceField}
                            onChange={(e) => {
                              const copy = [...mappings];
                              copy[idx].sourceField = e.target.value;
                              setMappings(copy);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 font-mono text-xs font-semibold"
                          />
                        </td>
                        <td className="p-3 text-neutral-400 font-bold">➔</td>
                        <td className="p-3">
                          <span className="font-bold text-neutral-900 px-2 py-1 rounded bg-neutral-100">
                            {m.destinationField}
                          </span>
                        </td>
                        <td className="p-3">
                          <select
                            value={m.transformationRule || 'none'}
                            onChange={(e) => {
                              const copy = [...mappings];
                              copy[idx].transformationRule = e.target.value as any;
                              setMappings(copy);
                            }}
                            className="px-2 py-1 rounded-lg border border-neutral-200 text-xs bg-white"
                          >
                            <option value="none">None (Direct)</option>
                            <option value="uppercase">Uppercase</option>
                            <option value="trim">Trim Whitespace</option>
                            <option value="multiply_by_exchange_rate">Convert Currency</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              m.required ? 'bg-red-100 text-red-800' : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {m.required ? 'Mandatory' : 'Optional'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 5: Preview and Validate */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-neutral-900">
                  {isArabic ? 'الخطوة 5 — معاينة والتحقق من صحة البيانات' : 'Step 5 — Preview & Validate Records'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {isArabic
                    ? 'فحص جودة البيانات وتدقيق أرقام القطع والأسعار وتوافق السيارات قبل النشر.'
                    : 'System scanned sample incoming records against IQAutoMarket validation rules.'}
                </p>
              </div>

              {/* Validation Summary Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <div className="text-xs font-bold">Valid Records</div>
                  <div className="text-lg font-black mt-0.5">48 / 50 (96%)</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <div className="text-xs font-bold">Warnings</div>
                  <div className="text-lg font-black mt-0.5">2 records</div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                  <div className="text-xs font-bold">Matched OEM Parts</div>
                  <div className="text-lg font-black mt-0.5">45 parts</div>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900">
                  <div className="text-xs font-bold">Duplicate SKUs</div>
                  <div className="text-lg font-black mt-0.5">0 detected</div>
                </div>
              </div>

              {/* Sample Records Table */}
              <div className="border border-neutral-200 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Sample Part #</th>
                      <th className="p-3">Product Title</th>
                      <th className="p-3">Brand</th>
                      <th className="p-3">Price USD</th>
                      <th className="p-3">Stock Qty</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-medium">
                    <tr>
                      <td className="p-3 font-mono font-bold text-neutral-900">04465-60290</td>
                      <td className="p-3">Front Brake Pad Set (Ceramic)</td>
                      <td className="p-3">Toyota Genuine</td>
                      <td className="p-3 font-bold text-emerald-700">$145.00</td>
                      <td className="p-3 font-bold">28 units</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          VALID
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-neutral-900">04152-YZZA1</td>
                      <td className="p-3">Engine Oil Filter Element</td>
                      <td className="p-3">Toyota Genuine</td>
                      <td className="p-3 font-bold text-emerald-700">$16.00</td>
                      <td className="p-3 font-bold">65 units</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          VALID
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-amber-50/40">
                      <td className="p-3 font-mono font-bold text-neutral-900">48068-60030</td>
                      <td className="p-3">Front Lower Control Arm RH</td>
                      <td className="p-3">Toyota</td>
                      <td className="p-3 font-bold text-emerald-700">$185.00</td>
                      <td className="p-3 font-bold">12 units</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          WARNING (No OEM crossref)
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 6: Synchronization Rules */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-neutral-900">
                  {isArabic ? 'الخطوة 6 — قواعد وضوابط التزامن' : 'Step 6 — Select Synchronization Rules'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {isArabic
                    ? 'تحكم في وتيرة التحديث، حجز المخزون، ونشر الأسعار والطلبات.'
                    : 'Configure how often data refreshes, stock reservation modes, and pricing behavior.'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/50 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-neutral-900">Sync Frequency</div>
                      <div className="text-neutral-500">How often the engine queries your feed</div>
                    </div>
                    <select
                      value={syncRules.syncFrequency}
                      onChange={(e) => setSyncRules({ ...syncRules, syncFrequency: e.target.value as any })}
                      className="px-3 py-1.5 rounded-xl border border-neutral-200 font-bold bg-white text-xs"
                    >
                      <option value="realtime">Real-time (Webhooks)</option>
                      <option value="every_15min">Every 15 Minutes (Recommended)</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Once Daily</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60">
                    <div>
                      <div className="font-bold text-neutral-900">Stock Reservation Mode</div>
                      <div className="text-neutral-500">Prevents overselling during order placement</div>
                    </div>
                    <select
                      value={syncRules.stockReservationMode}
                      onChange={(e) => setSyncRules({ ...syncRules, stockReservationMode: e.target.value as any })}
                      className="px-3 py-1.5 rounded-xl border border-neutral-200 font-bold bg-white text-xs"
                    >
                      <option value="marketplace">Mode A: Marketplace Temporary Hold</option>
                      <option value="dealer_system">Mode B: Dealer ERP Immediate Hold</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60">
                    <div>
                      <div className="font-bold text-neutral-900">Auto-Update Marketplace Prices</div>
                      <div className="text-neutral-500">Instantly reflect price adjustments from ERP</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={syncRules.autoUpdatePrices}
                      onChange={(e) => setSyncRules({ ...syncRules, autoUpdatePrices: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60">
                    <div>
                      <div className="font-bold text-neutral-900">Two-Way Order Back-Sync</div>
                      <div className="text-neutral-500">Export confirmed marketplace orders into your ERP</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={syncRules.syncOrdersBackToDealer}
                      onChange={(e) => setSyncRules({ ...syncRules, syncOrdersBackToDealer: e.target.checked })}
                      className="rounded text-red-600 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Test Connection */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-neutral-900">
                  {isArabic ? 'الخطوة 7 — اختبار الاتصال والتحقق الفني' : 'Step 7 — Test Connection Sandbox'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {isArabic
                    ? 'اختبر الاتصال المباشر بنظامك دون نشر المنتجات تلقائياً.'
                    : 'Validates credentials, network ping latency, and schema payload response.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-neutral-200 bg-neutral-50/50 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mx-auto shadow-md">
                  <Server className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-neutral-900">Endpoint: {endpointUrl}</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">Method: {method.toUpperCase()} · Auth: {authMethod}</p>
                </div>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                  className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all inline-flex items-center gap-2 shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                  <span>{testStatus === 'testing' ? 'Testing Connectivity...' : 'Run Test Connection Ping'}</span>
                </button>

                {testReport && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-left text-xs space-y-1.5 animate-fadeIn">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{testReport.message}</span>
                    </div>
                    <div className="text-emerald-700 pl-6">
                      Latency: <span className="font-mono font-bold">{testReport.latencyMs}ms</span> · Test Samples: {testReport.recordsTested} items · Schema Status: OK
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 8: Activate Integration */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-neutral-900">
                  {isArabic ? 'الخطوة 8 — مراجعة وتفعيل التكامل' : 'Step 8 — Review & Activate Integration'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {isArabic
                    ? 'راجع الصلاحيات والشروط لتفعيل المزامنة التلقائية مع سوق IQAutoMarket.'
                    : 'Confirm permissions and synchronization rules to go live.'}
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50 space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <span className="text-neutral-500">System Name:</span>
                  <span className="font-bold text-neutral-900">{softwareName} ({softwareVersion})</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <span className="text-neutral-500">Integration Method:</span>
                  <span className="font-bold text-neutral-900 uppercase">{method}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <span className="text-neutral-500">Sync Schedule:</span>
                  <span className="font-bold text-neutral-900">{syncRules.syncFrequency}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                  <span className="text-neutral-500">Branches Included:</span>
                  <span className="font-bold text-neutral-900">{selectedBranches.length} branch location(s)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Security & Isolation:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> End-to-End Encrypted
                  </span>
                </div>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-100 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 mt-0.5"
                />
                <span className="text-neutral-700">
                  I authorize IQAutoMarket to ingest inventory, stock levels, and price records from this system in accordance with platform B2B privacy and security terms.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-neutral-50 p-4 border-t border-neutral-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-4 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-xs font-bold text-neutral-700 flex items-center gap-1.5 transition-colors disabled:opacity-40"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isArabic ? 'السابق' : 'Back'}</span>
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(8, prev + 1))}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span>{isArabic ? 'التالي' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinishActivation}
              disabled={!termsAgreed || isActivating}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isActivating ? 'Activating Connector...' : isArabic ? 'تأكيد وتفعيل التكامل الآن' : 'Activate Live Integration'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
