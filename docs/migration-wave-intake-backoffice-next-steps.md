# TrustShield Migration Wave – Intake & Backoffice Next Steps

## Ziel dieser Welle

Diese Datei überführt zwei Alexandria-HTML-Artefakte in konkrete Migrationsbausteine für die Produktcodebasis:

- [`trustshield/trustshield_admin_support_dashboard/code.html`](../trustshield_admin_support_dashboard/code.html)
- [`trustshield/trustshield_removal_center/code.html`](../trustshield_removal_center/code.html)

Fokus liegt auf belastbaren UI-Blöcken, Datenmodellen, Zustandsschnitten und einer sinnvollen Umsetzungsreihenfolge für [`trustshield/apps/admin/`](../apps/admin/) und später ggf. [`trustshield/apps/web/`](../apps/web/).

---

## 1. Admin Support Dashboard – Migrationsbausteine

Quelle: [`trustshield/trustshield_admin_support_dashboard/code.html`](../trustshield_admin_support_dashboard/code.html)

### 1.1 Zielscreen

Ein Backoffice-Dashboard für Support-Triage, SLA-Sicht, Queue-Übersicht und Eskalationen.

### 1.2 Zu extrahierende UI-Bausteine

1. **AdminShell / Workspace Layout**
   - Topbar mit Notifications, Profil, Primärnavigation
   - linke Bereichsnavigation für Backoffice
   - Alexandria-konforme Surface-Hierarchie ohne harte Borders

2. **Support KPI Hero**
   - Queue-Größe
   - Plattformzustand / Uptime
   - Removal Success Rate
   - Lastspitzen / Trendmetriken

3. **Support Queue Table**
   - Request ID / Nutzerreferenz
   - Priorität
   - Anliegen-Typ
   - Status
   - zugewiesene Person / Aktion

4. **Activity / Timeline Panel**
   - letzte Statuswechsel
   - Eskalationen
   - SLA-Hinweise

### 1.3 Empfohlenes Datenmodell

```ts
type SupportQueueItem = {
  id: string;
  requesterLabel: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestType: 'support' | 'removal' | 'upload-review' | 'identity-review';
  status: 'new' | 'triage' | 'waiting-user' | 'assigned' | 'escalated' | 'closed';
  assignedTo?: string;
  slaDueAt?: string;
  updatedAt: string;
};
```

### 1.4 Benötigte Zustände

- loading
- empty queue
- filtered result empty
- normal queue
- overdue / SLA risk
- permissions restricted
- partial backend failure

### 1.5 Zielstruktur im Code

- [`trustshield/apps/admin/src/app/page.tsx`](../apps/admin/src/app/page.tsx) als erste Dashboard-Route konsolidieren
- spätere Extraktion nach:
  - [`trustshield/apps/admin/src/components/support/admin-shell.tsx`](../apps/admin/src/components/support/admin-shell.tsx)
  - [`trustshield/apps/admin/src/components/support/support-kpi-hero.tsx`](../apps/admin/src/components/support/support-kpi-hero.tsx)
  - [`trustshield/apps/admin/src/components/support/support-queue-table.tsx`](../apps/admin/src/components/support/support-queue-table.tsx)
  - [`trustshield/apps/admin/src/components/support/support-activity-feed.tsx`](../apps/admin/src/components/support/support-activity-feed.tsx)

### 1.6 Umsetzungsreihenfolge

1. Layout + Navigation angleichen
2. KPI-Hero mit Mockdaten einführen
3. Queue-Tabelle mit lokalem Statusmodell aufbauen
4. Filter-/Sortierzustände ergänzen
5. danach Query-Anbindung an echte Support-Endpoints

---

## 2. Removal Center – Migrationsbausteine

Quelle: [`trustshield/trustshield_removal_center/code.html`](../trustshield_removal_center/code.html)

### 2.1 Zielscreen

Operatives Removal-Workspace für laufende Löschfälle mit Fallstatus, Plattformbezug und letzter Aktion.

### 2.2 Zu extrahierende UI-Bausteine

1. **Removal Workspace Header**
   - Titel
   - Suche
   - Notifications / Security Entry Points

2. **Removal Summary Grid**
   - globale Removal Rate
   - aktive Requests
   - abgeschlossene Requests
   - trendbasierte Kennzahlen

3. **Removal Cases Table**
   - Plattform
   - Ziel-URL
   - Status
   - letztes Update
   - Aktionen

4. **Case Detail / Action Rail**
   - nächste Provider-Aktion
   - Antwortfristen
   - Evidenzbezug
   - Eskalationspfad

### 2.3 Empfohlenes Datenmodell

```ts
type RemovalCaseListItem = {
  id: string;
  platform: string;
  targetUrl: string;
  status: 'draft' | 'submitted' | 'provider-review' | 'waiting-evidence' | 'escalated' | 'removed' | 'rejected';
  severity: 'low' | 'medium' | 'high';
  evidenceCoverage: 'complete' | 'partial' | 'missing';
  lastUpdateAt: string;
  nextActionLabel?: string;
};
```

### 2.4 Benötigte Zustände

- initial empty state
- active cases
- waiting for user evidence
- provider pending / long-running
- removal successful
- rejection with reason
- retention / privacy note required

### 2.5 Zielstruktur im Code

- neue Route vorbereiten, z. B. [`trustshield/apps/web/src/app/(app)/removal/page.tsx`](../apps/web/src/app/(app)/removal/page.tsx) oder Backoffice-Pendant in [`trustshield/apps/admin/src/app/`](../apps/admin/src/app/)
- spätere Extraktion nach:
  - [`trustshield/apps/web/src/components/removal/removal-summary-grid.tsx`](../apps/web/src/components/removal/removal-summary-grid.tsx)
  - [`trustshield/apps/web/src/components/removal/removal-case-table.tsx`](../apps/web/src/components/removal/removal-case-table.tsx)
  - [`trustshield/apps/web/src/components/removal/removal-case-status-badge.tsx`](../apps/web/src/components/removal/removal-case-status-badge.tsx)
  - [`trustshield/apps/web/src/components/removal/removal-next-action-card.tsx`](../apps/web/src/components/removal/removal-next-action-card.tsx)

### 2.6 Umsetzungsreihenfolge

1. Tabellen- und Statusmodell definieren
2. Summary Grid als Alexandria-Surface portieren
3. Status-Badges und Guidance-Zustände ergänzen
4. Such-/Filterzustände modellieren
5. API- und Workflow-Verknüpfungen nachziehen

---

## 3. Gemeinsame Querschnittsanforderungen

### Alexandria-Konformität

- Primärfarbe nur für Fokus, aktive Zustände und primäre CTA
- keine harten 1px-Linien als Standardstruktur
- Tiefe über Surface-Layer statt dominante Schatten
- Serif nur für Headings und narrative Hervorhebung

### Datenfluss / State

Gemäß [`docs/21_state_management_und_datenfluss_konzept.md`](../../docs/21_state_management_und_datenfluss_konzept.md) sollten lokal modelliert werden:

- Filterzustände
- aktive Tabellenzeilen
- Suchbegriffe
- temporäre Status-Badges

Server-State später separat für:

- Support Requests
- Removal Cases
- SLA-/Workflow-Daten
- Audit-/Activity-Feeds

### Fehler- und Sonderzustände

Beide Screens brauchen explizite Modellierung für:

- Auth / Forbidden
- Partial Failure
- Empty Results
- Queue Delay
- Sensitive Content / Evidence Missing
- abgestufte Human-Support-Hinweise

---

## 4. Direkt anschließbare nächste Implementierungspakete

1. **Admin Dashboard MVP in [`trustshield/apps/admin/src/app/page.tsx`](../apps/admin/src/app/page.tsx)**
   - Alexandria-Shell
   - Queue-Tabelle
   - KPI-Hero

2. **Removal Center MVP als neue Route**
   - Summary Grid
   - Tabelle mit Status-Badges
   - Guidance-Panel für Evidence-Lücken

3. **Geteilte Status-/Badge-Konventionen**
   - Priorität
   - SLA-Risiko
   - Removal-Status
   - Evidence-Coverage
