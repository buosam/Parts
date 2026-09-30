/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket - Automotive Departments & Category Filter
 */

import React from 'react';
import {
  Disc,
  Flame,
  Shield,
  Lightbulb,
  Wrench,
  Layers,
  Filter,
  Gavel,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const CarIdDepartmentBar: React.FC = () => {
  const { selectedCategory, setSelectedCategory, language } = useMarketplace();
  const isArabic = language === 'ar';

  const departments = [
    {
      id: 'All',
      label: 'All Parts',
      labelAr: 'جميع القطع',
      icon: Layers,
    },
    {
      id: 'Brake',
      label: 'Brakes',
      labelAr: 'الفرامل',
      icon: Disc,
    },
    {
      id: 'Suspension',
      label: 'Suspension',
      labelAr: 'التعليق',
      icon: Wrench,
    },
    {
      id: 'Engine',
      label: 'Engine',
      labelAr: 'المحرك',
      icon: Flame,
    },
    {
      id: 'Body Parts',
      label: 'Body',
      labelAr: 'الهيكل',
      icon: Shield,
    },
    {
      id: 'Cooling',
      label: 'Cooling & AC',
      labelAr: 'التبريد',
      icon: Lightbulb,
    },
    {
      id: 'Filters',
      label: 'Filters',
      labelAr: 'الفلاتر',
      icon: Filter,
    },
    {
      id: 'requests',
      label: 'Dealer Quotes',
      labelAr: 'عروض الأسعار',
      icon: Gavel,
      isLive: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
        {departments.map((dept) => {
          const Icon = dept.icon;
          const isActive = selectedCategory === dept.id;

          return (
            <button
              key={dept.id}
              id={`dept-tab-${dept.id}`}
              type="button"
              onClick={() => setSelectedCategory(dept.id)}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#2554d7] text-white font-semibold'
                  : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.05] border border-transparent hover:border-white/[0.06]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{isArabic ? dept.labelAr : dept.label}</span>
              {(dept as any).isLive && (
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-[#d9730d]'}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
