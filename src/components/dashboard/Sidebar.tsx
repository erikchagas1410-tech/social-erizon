"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavGroup } from "@/types/dashboard";

type SidebarProps = {
  groups: NavGroup[];
};

export function Sidebar({ groups }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sidebar-shell">
      <div>
        <div className="brand-lockup">
          <span className="brand-lockup__eyebrow">ERIZON SOCIAL AI</span>
          <h1 className="brand-lockup__title">Central Operacional</h1>
          <p className="brand-lockup__copy">
            Inteligencia, aprovacao e execucao em uma unica superficie.
          </p>
        </div>

        <nav className="sidebar-nav" aria-label="Navegacao da central">
          {groups.map((group) => (
            <section key={group.label} className="sidebar-group">
              <span className="sidebar-group__label">{group.label}</span>
              <div className="sidebar-group__links">
                {group.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`sidebar-link${pathname === item.href ? " is-active" : ""}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </nav>
      </div>

      <footer className="sidebar-footer">
        <div className="sidebar-status">
          <span className="sidebar-status__dot" />
          <div>
            <strong>IA ativa 24/7</strong>
            <p>Monitorando operacao e sinais de performance.</p>
          </div>
        </div>
        <div className="sidebar-monitor">
          <span>Monitoramento de agendamentos</span>
          <strong>Estavel</strong>
        </div>
      </footer>
    </aside>
  );
}
