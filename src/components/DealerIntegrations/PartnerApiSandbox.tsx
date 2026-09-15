/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Code2,
  Play,
  Copy,
  Check,
  Server,
  Zap,
  Layers,
  Building2,
  ShoppingBag,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

interface PartnerApiSandboxProps {
  supplierId: string;
  onClose?: () => void;
}

interface EndpointDef {
  id: string;
  category: 'Products' | 'Inventory' | 'Prices' | 'Branches' | 'Orders' | 'Webhooks';
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  defaultBody?: any;
}

const ENDPOINTS: EndpointDef[] = [
  {
    id: 'get-products',
    category: 'Products',
    method: 'GET',
    path: '/api/v1/partner/products',
    description: 'Retrieve paginated catalog of products synchronized with IQAutoMarket.',
  },
  {
    id: 'post-product',
    category: 'Products',
    method: 'POST',
    path: '/api/v1/partner/products',
    description: 'Create or update a master automotive spare part record in the marketplace.',
    defaultBody: {
      externalId: 'EXT-04465-DEMO',
      sku: 'ABC-BRK-9921',
      partNumber: '04465-60290',
      oemNumber: '04465-60290',
      title: 'Front Brake Pad Set (Ceramic Performance)',
      brand: 'Toyota Genuine',
      category: 'Brake',
      priceUSD: 145,
      availableStock: 25,
      condition: 'genuine',
    },
  },
  {
    id: 'get-inventory',
    category: 'Inventory',
    method: 'GET',
    path: '/api/v1/partner/inventory',
    description: 'Query real-time stock levels and reserved quantities across all dealer branches.',
  },
  {
    id: 'bulk-inventory',
    category: 'Inventory',
    method: 'POST',
    path: '/api/v1/partner/inventory/bulk',
    description: 'High-throughput bulk stock quantity and price updates (up to 5,000 SKUs/batch).',
    defaultBody: {
      items: [
        { externalProductId: 'EXT-04465', availableStock: 35, priceUSD: 142 },
        { externalProductId: 'EXT-04152', availableStock: 80, priceUSD: 15.5 },
      ],
    },
  },
  {
    id: 'sync-queue',
    category: 'Inventory',
    method: 'POST',
    path: '/api/v1/partner/inventory/sync',
    description: 'Trigger asynchronous background full reconciliation job.',
  },
  {
    id: 'get-prices',
    category: 'Prices',
    method: 'GET',
    path: '/api/v1/partner/prices',
    description: 'Retrieve current effective pricing table for retail and wholesale feeds.',
  },
  {
    id: 'get-branches',
    category: 'Branches',
    method: 'GET',
    path: '/api/v1/partner/branches',
    description: 'List dealer warehouses and showroom branches with fulfillment settings.',
  },
  {
    id: 'get-orders',
    category: 'Orders',
    method: 'GET',
    path: '/api/v1/partner/orders',
    description: 'Export pending and confirmed buyer orders destined for dealer ERP fulfillment.',
  },
  {
    id: 'confirm-order',
    category: 'Orders',
    method: 'POST',
    path: '/api/v1/partner/orders/ORD-7821/confirm',
    description: 'Dealer confirms stock reservation and provides internal ERP sales order number.',
    defaultBody: {
      externalOrderId: 'ERP-SO-884102',
      estimatedDeliveryHours: 2,
    },
  },
  {
    id: 'wh-stock',
    category: 'Webhooks',
    method: 'POST',
    path: '/api/v1/partner/webhooks/inventory',
    description: 'Simulate inbound real-time stock change webhook event from dealer system.',
    defaultBody: {
      eventType: 'stock.changed',
      partNumber: '04465-60290',
      newQuantity: 42,
      timestamp: new Date().toISOString(),
    },
  },
];

export const PartnerApiSandbox: React.FC<PartnerApiSandboxProps> = ({
  supplierId,
  onClose,
}) => {
  const { language, simulatePartnerWebhook } = useMarketplace();
  const isArabic = language === 'ar';

  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDef>(ENDPOINTS[0]);
  const [requestBody, setRequestBody] = useState<string>(
    ENDPOINTS[0].defaultBody ? JSON.stringify(ENDPOINTS[0].defaultBody, null, 2) : ''
  );
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);
  const [liveStateNotification, setLiveStateNotification] = useState<string | null>(null);

  const handleSelectEndpoint = (ep: EndpointDef) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.defaultBody ? JSON.stringify(ep.defaultBody, null, 2) : '');
    setResponseStatus(null);
    setResponseData(null);
  };

  const handleExecuteRequest = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseData(null);

    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer iqm_live_sandbox_partner_key',
          'X-API-Key': 'iqm_live_9f83a09b2e1f40d7c58e8b2a7d41',
        },
      };

      if (selectedEndpoint.method !== 'GET' && requestBody.trim()) {
        options.body = requestBody;
      }

      const res = await fetch(selectedEndpoint.path, options);
      const json = await res.json();
      setResponseStatus(res.status);
      setResponseData(json);

      // If webhook or inventory change, also trigger real-time state update in context
      if (selectedEndpoint.id === 'wh-stock') {
        const parsed = JSON.parse(requestBody);
        const result = simulatePartnerWebhook(supplierId, 'stock.changed', parsed);
        setLiveStateNotification(result.message);
        setTimeout(() => setLiveStateNotification(null), 5000);
      }
    } catch (err: any) {
      setResponseStatus(500);
      setResponseData({ error: 'FETCH_ERROR', message: err?.message || String(err) });
    } finally {
      setIsLoading(false);
    }
  };

  const getCurlSnippet = () => {
    let curl = `curl -X ${selectedEndpoint.method} "https://iqautomarket.iq${selectedEndpoint.path}" \\\n  -H "Authorization: Bearer iqm_live_••••••••" \\\n  -H "Content-Type: application/json"`;
    if (selectedEndpoint.method !== 'GET' && requestBody) {
      curl += ` \\\n  -d '${requestBody.replace(/\n/g, '')}'`;
    }
    return curl;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(getCurlSnippet());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-neutral-950 flex items-center justify-center font-black">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-neutral-900">
              {isArabic ? 'بوابة ومنصة اختبار API الشركاء (Partner API Sandbox)' : 'Partner REST API Portal & Sandbox'}
            </h3>
            <p className="text-xs text-neutral-500">
              {isArabic
                ? 'واجهة تفاعلية لتجربة استدعاءات API، مزامنة الكتالوج، وإرسال إشعارات Webhooks المباشرة.'
                : 'Interactive sandbox to test product/stock endpoints, two-way order exports, and live webhooks.'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors"
          >
            {isArabic ? 'العودة للوحة' : 'Back to Overview'}
          </button>
        )}
      </div>

      {liveStateNotification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>{liveStateNotification}</span>
        </div>
      )}

      {/* Main Grid: Left Endpoint Selector, Right Interactive Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs p-4 space-y-3">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-2">
            Available Partner Endpoints
          </div>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {ENDPOINTS.map((ep) => {
              const active = selectedEndpoint.id === ep.id;
              return (
                <div
                  key={ep.id}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                    active
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                      : 'bg-neutral-50/50 border-neutral-200/80 hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded font-mono ${
                        ep.method === 'GET'
                          ? 'bg-blue-500 text-white'
                          : ep.method === 'POST'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-neutral-950'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-[11px] truncate">{ep.path}</span>
                  </div>
                  <div className={`text-[11px] ${active ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {ep.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sandbox Runner */}
        <div className="lg:col-span-8 space-y-4">
          {/* Endpoint Bar & Run Trigger */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-black px-2.5 py-1 rounded-md font-mono ${
                    selectedEndpoint.method === 'GET'
                      ? 'bg-blue-500 text-white'
                      : selectedEndpoint.method === 'POST'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-neutral-950'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-xs font-bold text-neutral-900">{selectedEndpoint.path}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCurl}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCurl ? 'Copied cURL' : 'Copy cURL'}</span>
                </button>

                <button
                  onClick={handleExecuteRequest}
                  disabled={isLoading}
                  className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Executing...' : 'Send Request'}</span>
                </button>
              </div>
            </div>

            {/* Request Body Editor (if not GET) */}
            {selectedEndpoint.method !== 'GET' && (
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-neutral-500 mb-1.5">
                  <span>JSON Request Payload</span>
                  <span className="text-[10px] text-neutral-400">Content-Type: application/json</span>
                </div>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={6}
                  className="w-full p-3 rounded-xl border border-neutral-200 font-mono text-xs text-neutral-800 bg-neutral-50 focus:outline-hidden focus:border-red-500"
                />
              </div>
            )}
          </div>

          {/* Response Inspector */}
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 shadow-md p-5 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Live Response</span>
                {responseStatus && (
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    STATUS {responseStatus}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-neutral-500 font-mono">Format: application/json</span>
            </div>

            <pre className="p-4 rounded-xl bg-black/60 border border-neutral-800 text-neutral-200 font-mono text-xs overflow-x-auto max-h-[280px]">
              {isLoading
                ? '// Transmitting request to IQAutoMarket Partner Gateway...'
                : responseData
                ? JSON.stringify(responseData, null, 2)
                : '// Click "Send Request" to test endpoint.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
