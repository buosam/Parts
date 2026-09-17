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
  Wrench,
  Layers,
  Sparkles,
  Zap,
  Filter,
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

export const CarIdDepartmentBar: React.FC = () => {
  const { selectedCategory, setSelectedCategory, language } = useMarketplace();
  const isArabic = language === 'ar';

  const departments = [
    {
      id: 'All',
      label: 'All Auto Parts',
      labelAr: 'جميع قطع الغيار',
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
      label: 'Performance & Engine',
      labelAr: 'المحرك والأداء',
      icon: Flame,
    },
    {
      id: 'Body Parts',
      label: 'Exterior & Body Parts',
      labelAr: 'الهيكل والقطع الخارجية',
      icon: Shield,
    },
    {
      id: 'Cooling',
      label: 'Cooling & Climate',
      labelAr: 'التبريد والمكيف',
      icon: Lightbulb,
    },
    {
      id: 'Filters',
      label: 'Filters & Maintenance',
      labelAr: 'الفلاتر والصيانة',
      icon: Filter,
    },
    {
      id: 'requests',
      label: 'Parts Bidding Floor',
      labelAr: 'مناقصات ومزايدات القطع',
      icon: Gavel,
      isSpecial: true,
      badge: 'LIVE BIDS',
    },
  ];

  return (
    <div className="bg-[#080c16]/90 border-b border-white/10 text-slate-200 backdrop-blur-md sticky top-[88px] z-30 shadow-md shadow-black/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 scrollbar-none">
          {departments.map((dept) => {
            const Icon = dept.icon;
            const isActive = selectedCategory === dept.id;

            return (
              <button
                key={dept.id}
                id={`dept-tab-${dept.id}`}
                onClick={() => setSelectedCategory(dept.id)}
                className={`group shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dept.isSpecial
                    ? isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30 font-black'
                      : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    dept.isSpecial
                      ? isActive
                        ? 'text-slate-950'
                        : 'text-amber-400 animate-pulse'
                      : isActive
                      ? 'text-white'
                      : 'text-slate-400 group-hover:text-indigo-400'
                  }`}
                />
                <span>{isArabic ? dept.labelAr : dept.label}</span>
                {dept.badge && (
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
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
