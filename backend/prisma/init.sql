DROP TABLE IF EXISTS "InvestigationNote";
DROP TABLE IF EXISTS "Incident";
DROP TABLE IF EXISTS "Alert";

CREATE TABLE "Alert" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "service" TEXT NOT NULL,
  "severity" TEXT NOT NULL CHECK ("severity" IN ('Low', 'Medium', 'High', 'Critical')),
  "status" TEXT NOT NULL DEFAULT 'New' CHECK ("status" IN ('New', 'Acknowledged', 'Investigating', 'Closed')),
  "triggeredAt" DATETIME NOT NULL,
  "acknowledgedBy" TEXT,
  "investigationStartedAt" DATETIME,
  "lastUpdatedBy" TEXT,
  "relatedIncidentId" TEXT,
  "shiftDate" DATETIME NOT NULL,
  "tags" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Incident" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL CHECK ("category" IN ('Infrastructure', 'Network', 'Application', 'Security', 'Database', 'Third-Party', 'Other')),
  "severity" TEXT NOT NULL CHECK ("severity" IN ('Low', 'Medium', 'High', 'Critical')),
  "status" TEXT NOT NULL DEFAULT 'Open' CHECK ("status" IN ('Open', 'Investigating', 'Monitoring', 'Resolved', 'Closed')),
  "affectedService" TEXT NOT NULL,
  "environment" TEXT NOT NULL CHECK ("environment" IN ('Production', 'Staging', 'Internal', 'Other')),
  "reportedBy" TEXT NOT NULL,
  "assignedTo" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" DATETIME,
  "sourceAlertId" TEXT UNIQUE,
  FOREIGN KEY ("sourceAlertId") REFERENCES "Alert"("id") ON DELETE SET NULL
);

CREATE TABLE "InvestigationNote" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "alertId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL CHECK ("type" IN ('Note', 'Action', 'Escalation', 'Update')),
  "createdBy" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("alertId") REFERENCES "Alert"("id") ON DELETE CASCADE
);

CREATE INDEX "Alert_status_idx" ON "Alert"("status");
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");
CREATE INDEX "Alert_source_idx" ON "Alert"("source");
CREATE INDEX "Alert_service_idx" ON "Alert"("service");
CREATE INDEX "Alert_triggeredAt_idx" ON "Alert"("triggeredAt");
CREATE UNIQUE INDEX "Alert_relatedIncidentId_key" ON "Alert"("relatedIncidentId");
CREATE INDEX "Incident_status_idx" ON "Incident"("status");
CREATE INDEX "Incident_severity_idx" ON "Incident"("severity");
CREATE INDEX "Incident_category_idx" ON "Incident"("category");
CREATE INDEX "Incident_affectedService_idx" ON "Incident"("affectedService");
CREATE INDEX "Incident_createdAt_idx" ON "Incident"("createdAt");
CREATE INDEX "InvestigationNote_alertId_createdAt_idx" ON "InvestigationNote"("alertId", "createdAt");
