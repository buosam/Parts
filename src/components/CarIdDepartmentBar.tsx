/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Gavel,
  Disc,
  Flame,
  Shield,
  Lightbulb,
  Armchair,
  Wrench,
  Radio,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

interface DepartmentBarProps {
  activeView?: 'parts' | 'requests';
  setActiveView?: (view: 'parts' | 'requests') => void;
}

export const CarIdDepartmentBar: React.FC<DepartmentBarProps> = () => {
  const { selectedCategory, setSelectedCategory, language } = useMarketplace();
  const isArabic = language === 'ar';

  const departments = [
    {
      id: 'requests',
      label: 'Parts Bidding & Dealer Floor',
      labelAr: 'مناقصات ومزايدات القطع',
      icon: Gavel,
      isSpecial: true,
      badge: 'LIVE BIDS',
    },
    {
      id: 'All',
      label: 'All Auto Parts',
      labelAr: 'جميع القطع',
      icon: Layers,
      isCategory: true,
    },
    {
      id: 'Brake',
      label: 'Brakes & Rotors',
      labelAr: 'الفرامل والأقراص',
      icon: Disc,
      isCategory: true,
    },
    {
      id: 'Suspension',
      label: 'Suspension & Steering',
      labelAr: 'المساعدات والتعليق',
      icon: Wrench,
      isCategory: true,
    },
    {
      id: 'Engine',
      label: 'Performance & Engine',
      labelAr: 'المحرك والأداء',
      icon: Flame,
      isCategory: true,
    },
    {
      id: 'Body Parts',
      label: 'Exterior & Body Parts',
      labelAr: 'الهيكل والقطع الخارجية',
      icon: Shield,
      isCategory: true,
    },
    {
      id: 'Cooling',
      label: 'Cooling & Climate',
      labelAr: 'التبريد والمكيف',
      icon: Lightbulb,
      isCategory: true,
    },
    {
      id: 'Filters',
      label: 'Filters & Maintenance',
      labelAr: 'الفلاتر والصيانة',
      icon: Layers,
      isCategory: true,
    },
  ];

  const handleDeptClick = (dept: typeof departments[0]) => {
    setSelectedCategory(dept.id === 'requests' ? 'All' : dept.id);
  };

  return (
    <div className="bg-neutral-900 border-b border-neutral-800 text-neutral-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none">
          {departments.map((dept) => {
            const Icon = dept.icon;
            const isCategoryActive = dept.isCategory && selectedCategory === dept.id;
            const isRequestsActive = dept.id === 'requests' && selectedCategory === 'All';
            const isActive = isRequestsActive || isCategoryActive;

            return (
              <button
                key={dept.id}
                id={`dept-tab-${dept.id}`}
                onClick={() => handleDeptClick(dept)}
                className={`group shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  dept.isSpecial
                    ? isRequestsActive
                      ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-950/40 font-black'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : isActive
                    ? 'bg-neutral-800 text-white border border-neutral-700'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    dept.isSpecial
                      ? isRequestsActive
                        ? 'text-neutral-950'
                        : 'text-amber-400 animate-pulse'
                      : isActive
                      ? 'text-red-400'
                      : 'text-neutral-400 group-hover:text-neutral-200'
                  }`}
                />
                <span>{isArabic ? dept.labelAr : dept.label}</span>
                {dept.badge && (
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider ${
                      isRequestsActive ? 'bg-neutral-950 text-amber-400' : 'bg-amber-500 text-neutral-950'
                    }`}
                  >
                    {dept.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
