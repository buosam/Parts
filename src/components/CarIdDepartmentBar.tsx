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
      label: 'Brakes & Rotors',
      labelAr: 'الفرامل والأقراص',
      icon: Disc,
    },
    {
      id: 'Suspension',
      label: 'Suspension & Steering',
      labelAr: 'المساعدات والتعليق',
      icon: Wrench,
    },
    {
      id: 'Engine',
      label: 'Engine & Drivetrain',
      labelAr: 'المحرك وناقل الحركة',
      icon: Flame,
    },
    {
      id: 'Body Parts',
      label: 'Exterior & Body',
      labelAr: 'الهيكل والقطع الخارجية',
      icon: Shield,
    },
    {
      id: 'Cooling',
      label: 'Cooling & AC',
      labelAr: 'التبريد والمكيف',
      icon: Lightbulb,
    },
    {
      id: 'Filters',
      label: 'Oil & Air Filters',
      labelAr: 'فلاتر وزيوت الصيانة',
      icon: Filter,
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
              className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer micro-press ${
                isActive
                  ? 'bg-white/[0.12] text-white border border-white/20 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? 'text-[#335aff]' : 'text-slate-500'
                }`}
              />
              <span>{isArabic ? dept.labelAr : dept.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
