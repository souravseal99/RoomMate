import { Building2 } from 'lucide-react';

export function SidebarBrand() {
  return (
    <div className="flex flex-col items-start mb-8 px-2">
      <div className="w-12 h-12 bg-sidebar-primary rounded-xl flex items-center justify-center mb-4 shadow-sm">
        <Building2 className="text-sidebar-primary-foreground w-6 h-6" />
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight mb-1 text-sidebar-foreground">
        Roommate
      </h1>
      <p className="text-[10px] font-bold text-sidebar-muted tracking-[0.2em] uppercase">
        Shared Living, Simplified
      </p>
    </div>
  );
}
