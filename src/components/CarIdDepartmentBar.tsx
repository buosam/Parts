/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
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
    <div className="max-w-7xl mx-auto px-4 mt-6">
      <div className="bg-white/[0.03] border border-white/10 text-slate-200 backdrop-blur-md rounded-2xl p-1.5 shadow-lg shadow-black/20">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {departments.map((dept) => {
            const Icon = dept.icon;
            const isActive = selectedCategory === dept.id;

            return (
              <button
                key={dept.id}
                id={`dept-tab-${dept.id}`}
                onClick={() => setSelectedCategory(dept.id)}
                className={`group shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-600/30 font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                  }`}
                />
                <span>{isArabic ? dept.labelAr : dept.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

