import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const hoursAgo = (hours: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
};

const shiftDateFor = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const minutesAfter = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60_000);

async function main() {
  await prisma.investigationNote.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.alert.deleteMany();

  const alerts = [
    {
      title: 'Payment API latency spike detected',
      description:
        'p95 latency for the card authorization endpoint exceeded 2.3 seconds across the eu-west edge for 18 minutes.',
      source: 'Datadog',
      service: 'Payments API',
      severity: 'High',
      status: 'Investigating',
      triggeredAt: hoursAgo(2),
      acknowledgedBy: 'Nina Alvarez',
      investigationStartedAt: hoursAgo(1.8),
      lastUpdatedBy: 'Nina Alvarez',
      relatedIncidentId: null,
      tags: 'latency,payments,customer-impact'
    },
    {
      title: 'Elevated authentication failures',
      description:
        'Login failures rose 240% above baseline after a cache rotation on the primary identity nodes.',
      source: 'Prometheus',
      service: 'Identity Platform',
      severity: 'High',
      status: 'Acknowledged',
      triggeredAt: hoursAgo(4),
      acknowledgedBy: 'Jordan Kim',
      investigationStartedAt: hoursAgo(3.8),
      lastUpdatedBy: 'Jordan Kim',
      relatedIncidentId: null,
      tags: 'auth,login,cache'
    },
    {
      title: 'Database replication lag',
      description:
        'Read replica lag crossed 95 seconds for the transactions cluster and is affecting dashboard freshness.',
      source: 'Grafana',
      service: 'Postgres Cluster',
      severity: 'Critical',
      status: 'New',
      triggeredAt: hoursAgo(1),
      acknowledgedBy: null,
      investigationStartedAt: null,
      lastUpdatedBy: null,
      relatedIncidentId: null,
      tags: 'database,replication,lag'
    },
    {
      title: 'Fraud service timeout',
      description:
        'The fraud scoring service has intermittent timeout bursts on score submissions from the mobile checkout flow.',
      source: 'PagerDuty',
      service: 'Fraud Scoring',
      severity: 'Critical',
      status: 'Investigating',
      triggeredAt: hoursAgo(6),
      acknowledgedBy: 'Casey Nguyen',
      investigationStartedAt: hoursAgo(5.7),
      lastUpdatedBy: 'Casey Nguyen',
      relatedIncidentId: null,
      tags: 'fraud,timeout,mobile'
    },
    {
      title: 'Third-party disbursement degraded',
      description:
        'Partner payout acknowledgements are delayed by the external disbursement provider for South America traffic.',
      source: 'AWS CloudWatch',
      service: 'Disbursements Gateway',
      severity: 'Medium',
      status: 'New',
      acknowledgedBy: null,
      triggeredAt: hoursAgo(5),
      investigationStartedAt: null,
      lastUpdatedBy: null,
      relatedIncidentId: null,
      tags: 'partner,payouts,third-party'
    },
    {
      title: 'Queue backlog exceeded',
      description:
        'Settlement queue depth exceeded the operational threshold and processing ETA is trending beyond 12 minutes.',
      source: 'Kafka Exporter',
      service: 'Settlement Queue',
      severity: 'High',
      status: 'Acknowledged',
      acknowledgedBy: 'Taylor Brooks',
      triggeredAt: hoursAgo(8),
      investigationStartedAt: hoursAgo(7.7),
      lastUpdatedBy: 'Taylor Brooks',
      relatedIncidentId: null,
      tags: 'queue,settlement,throughput'
    },
    {
      title: 'SecOps suspicious login activity',
      description:
        'Multiple privileged console logins were detected from an unrecognized ASN and require validation.',
      source: 'Sentinel SIEM',
      service: 'SecOps IAM',
      severity: 'Critical',
      status: 'New',
      acknowledgedBy: null,
      triggeredAt: hoursAgo(3),
      investigationStartedAt: null,
      lastUpdatedBy: null,
      relatedIncidentId: null,
      tags: 'security,privileged-access,iam'
    },
    {
      title: 'Notification delivery retries climbing',
      description:
        'SMS delivery retries are spiking for OTP messages in the UK region after an upstream carrier issue.',
      source: 'Datadog',
      service: 'Customer Notifications',
      severity: 'Medium',
      status: 'Closed',
      acknowledgedBy: 'Jordan Kim',
      triggeredAt: hoursAgo(18),
      investigationStartedAt: hoursAgo(17.5),
      lastUpdatedBy: 'Jordan Kim',
      relatedIncidentId: null,
      tags: 'sms,otp,carrier'
    },
    {
      title: 'Analytics ETL job running behind schedule',
      description:
        'Hourly ETL completion is 37 minutes behind plan due to increased warehouse contention.',
      source: 'Airflow',
      service: 'Analytics ETL',
      severity: 'Low',
      status: 'Closed',
      acknowledgedBy: 'Priya Shah',
      triggeredAt: hoursAgo(26),
      investigationStartedAt: hoursAgo(25.8),
      lastUpdatedBy: 'Priya Shah',
      relatedIncidentId: null,
      tags: 'etl,warehouse,reporting'
    },
    {
      title: 'Edge router packet loss',
      description:
        'Packet loss has crossed 4% on the primary edge router serving east-coast retail sessions.',
      source: 'Prometheus',
      service: 'Edge Network',
      severity: 'High',
      status: 'Investigating',
      acknowledgedBy: 'Nina Alvarez',
      triggeredAt: hoursAgo(9),
      investigationStartedAt: hoursAgo(8.6),
      lastUpdatedBy: 'Nina Alvarez',
      relatedIncidentId: null,
      tags: 'network,packet-loss,edge'
    },
    {
      title: 'Partner webhook error surge',
      description:
        'Webhook deliveries to the reconciliation partner are returning 502 responses at 31% of attempts.',
      source: 'Grafana',
      service: 'Partner Webhooks',
      severity: 'Medium',
      status: 'Acknowledged',
      acknowledgedBy: 'Owen Price',
      triggeredAt: hoursAgo(11),
      investigationStartedAt: hoursAgo(10.7),
      lastUpdatedBy: 'Owen Price',
      relatedIncidentId: null,
      tags: 'webhooks,reconciliation,partners'
    },
    {
      title: 'Inventory sync drift detected',
      description:
        'The stock sync worker reported SKU count drift above 2% between commerce and warehouse ledgers.',
      source: 'Datadog',
      service: 'Inventory Sync',
      severity: 'Low',
      status: 'New',
      acknowledgedBy: null,
      triggeredAt: hoursAgo(14),
      investigationStartedAt: null,
      lastUpdatedBy: null,
      relatedIncidentId: null,
      tags: 'inventory,sync,warehouse'
    }
  ];

  const createdAlerts = await Promise.all(
    alerts.map((alert) =>
      prisma.alert.create({
        data: {
          ...alert,
          shiftDate: shiftDateFor(alert.triggeredAt)
        }
      })
    )
  );

  const alertByTitle = new Map(createdAlerts.map((alert) => [alert.title, alert]));

  const incidents = [
    {
      title: 'Payment API elevated latency incident',
      description:
        'Checkout authorization latency remains above SLO after the initial alert and has confirmed customer impact across the production payments path.',
      category: 'Application',
      severity: 'High',
      status: 'Investigating',
      affectedService: 'Payments API',
      environment: 'Production',
      reportedBy: 'Nina Alvarez',
      assignedTo: 'DevOps On-Call',
      resolvedAt: null,
      sourceAlertTitle: 'Payment API latency spike detected'
    },
    {
      title: 'OTP delivery carrier disruption',
      description:
        'A third-party SMS carrier degraded OTP delivery for UK traffic until partner routing was restored and delivery rates normalized.',
      category: 'ThirdParty',
      severity: 'Medium',
      status: 'Resolved',
      affectedService: 'Customer Notifications',
      environment: 'Production',
      reportedBy: 'Jordan Kim',
      assignedTo: 'Carrier Escalation Desk',
      resolvedAt: hoursAgo(16.7),
      sourceAlertTitle: 'Notification delivery retries climbing'
    },
    {
      title: 'Corporate VPN session instability',
      description:
        'Employees reported intermittent disconnects on the internal VPN concentrator affecting operations access to privileged tooling.',
      category: 'Infrastructure',
      severity: 'High',
      status: 'Open',
      affectedService: 'Corporate VPN',
      environment: 'Internal',
      reportedBy: 'Aisha Morgan',
      assignedTo: 'Network Operations',
      resolvedAt: null,
      sourceAlertTitle: null
    }
  ];

  for (const incident of incidents) {
    const sourceAlert = incident.sourceAlertTitle
      ? alertByTitle.get(incident.sourceAlertTitle) ?? null
      : null;

    const createdIncident = await prisma.incident.create({
      data: {
        title: incident.title,
        description: incident.description,
        category: incident.category,
        severity: incident.severity,
        status: incident.status,
        affectedService: incident.affectedService,
        environment: incident.environment,
        reportedBy: incident.reportedBy,
        assignedTo: incident.assignedTo,
        resolvedAt: incident.resolvedAt,
        sourceAlertId: sourceAlert?.id ?? null
      }
    });

    if (sourceAlert) {
      await prisma.alert.update({
        where: { id: sourceAlert.id },
        data: {
          relatedIncidentId: createdIncident.id,
          status: sourceAlert.status === 'Closed' ? 'Closed' : 'Investigating',
          acknowledgedBy: sourceAlert.acknowledgedBy ?? incident.reportedBy,
          investigationStartedAt: sourceAlert.investigationStartedAt ?? new Date(),
          lastUpdatedBy: incident.reportedBy
        }
      });
    }
  }

  const notes = [
    {
      alertTitle: 'Payment API latency spike detected',
      message:
        'Validated elevated latency against trace samples; saturation is isolated to card authorization pods.',
      type: 'Note',
      createdBy: 'Nina Alvarez',
      createdAt: minutesAfter(alertByTitle.get('Payment API latency spike detected')!.triggeredAt, 11)
    },
    {
      alertTitle: 'Payment API latency spike detected',
      message:
        'Escalated to DevOps on-call to review pod autoscaling lag on the payments cluster.',
      type: 'Escalation',
      createdBy: 'Nina Alvarez',
      createdAt: minutesAfter(alertByTitle.get('Payment API latency spike detected')!.triggeredAt, 22)
    },
    {
      alertTitle: 'Payment API latency spike detected',
      message:
        'Monitoring p95 after scaling event; latency is trending down but remains above target.',
      type: 'Update',
      createdBy: 'Nina Alvarez',
      createdAt: minutesAfter(alertByTitle.get('Payment API latency spike detected')!.triggeredAt, 36)
    },
    {
      alertTitle: 'Fraud service timeout',
      message:
        'Restarted the timeout-prone fraud worker pool in eu-west-1 to clear stale connections.',
      type: 'Action',
      createdBy: 'Casey Nguyen',
      createdAt: minutesAfter(alertByTitle.get('Fraud service timeout')!.triggeredAt, 18)
    },
    {
      alertTitle: 'Fraud service timeout',
      message: 'Checked downstream dependency health; no elevated database errors observed.',
      type: 'Note',
      createdBy: 'Casey Nguyen',
      createdAt: minutesAfter(alertByTitle.get('Fraud service timeout')!.triggeredAt, 31)
    },
    {
      alertTitle: 'Edge router packet loss',
      message: 'Opened network bridge with Tier2 to verify packet loss on the east-coast edge path.',
      type: 'Escalation',
      createdBy: 'Nina Alvarez',
      createdAt: minutesAfter(alertByTitle.get('Edge router packet loss')!.triggeredAt, 12)
    },
    {
      alertTitle: 'Edge router packet loss',
      message: 'Metrics are stable after route preference shift; continuing to monitor for recurrence.',
      type: 'Update',
      createdBy: 'Nina Alvarez',
      createdAt: minutesAfter(alertByTitle.get('Edge router packet loss')!.triggeredAt, 39)
    },
    {
      alertTitle: 'Notification delivery retries climbing',
      message: 'Carrier acknowledged upstream routing issue and applied a remediation on their side.',
      type: 'Escalation',
      createdBy: 'Jordan Kim',
      createdAt: minutesAfter(alertByTitle.get('Notification delivery retries climbing')!.triggeredAt, 14)
    },
    {
      alertTitle: 'Notification delivery retries climbing',
      message: 'Retry rate returned to baseline and customer OTP delivery success is within SLO again.',
      type: 'Update',
      createdBy: 'Jordan Kim',
      createdAt: minutesAfter(alertByTitle.get('Notification delivery retries climbing')!.triggeredAt, 47)
    }
  ];

  await prisma.investigationNote.createMany({
    data: notes.map((note) => ({
      alertId: alertByTitle.get(note.alertTitle)!.id,
      message: note.message,
      type: note.type,
      createdBy: note.createdBy,
      createdAt: note.createdAt
    }))
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Failed to seed alerts', error);
    await prisma.$disconnect();
    process.exit(1);
  });
