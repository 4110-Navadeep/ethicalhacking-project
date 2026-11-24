from typing import Dict, List, Optional
from datetime import datetime
from ..models.schemas import (
    Finding,
    SeverityLevel,
    RiskCategory,
    RemediationStatus,
    DashboardStats,
)


class SessionStore:
    """
    In-memory temporary session store.
    NO DATABASE IS USED.
    All findings are stored in memory and reset upon server restart or manual clear.
    """
    def __init__(self):
        self._findings: Dict[str, Finding] = {}
        self._created_at: str = datetime.utcnow().isoformat()

    def add_finding(self, finding: Finding) -> Finding:
        self._findings[finding.id] = finding
        return finding

    def add_many(self, findings: List[Finding]) -> List[Finding]:
        for f in findings:
            self._findings[f.id] = f
        return findings

    def get_all_findings(self) -> List[Finding]:
        # Return sorted by risk_score descending
        return sorted(self._findings.values(), key=lambda x: x.risk_score, reverse=True)

    def get_finding(self, finding_id: str) -> Optional[Finding]:
        return self._findings.get(finding_id)

    def update_status(self, finding_id: str, status: RemediationStatus) -> Optional[Finding]:
        finding = self._findings.get(finding_id)
        if finding:
            finding.remediation_status = status
            return finding
        return None

    def clear(self) -> None:
        self._findings.clear()

    def get_count(self) -> int:
        return len(self._findings)

    def get_dashboard_stats(self) -> DashboardStats:
        all_items = list(self._findings.values())
        total = len(all_items)

        critical_count = sum(1 for f in all_items if f.severity == SeverityLevel.CRITICAL)
        high_count = sum(1 for f in all_items if f.severity == SeverityLevel.HIGH)
        medium_count = sum(1 for f in all_items if f.severity == SeverityLevel.MEDIUM)
        low_count = sum(1 for f in all_items if f.severity == SeverityLevel.LOW)
        info_count = sum(1 for f in all_items if f.severity == SeverityLevel.INFORMATIONAL)

        open_count = sum(1 for f in all_items if f.remediation_status == RemediationStatus.OPEN)
        in_progress_count = sum(1 for f in all_items if f.remediation_status == RemediationStatus.IN_PROGRESS)
        resolved_count = sum(1 for f in all_items if f.remediation_status == RemediationStatus.RESOLVED)

        avg_risk = round(sum(f.risk_score for f in all_items) / total, 1) if total > 0 else 0.0
        max_risk = max((f.risk_score for f in all_items), default=0)

        # Severity distribution with professional light-theme color accents
        severity_dist = [
            {"name": "Critical", "count": critical_count, "color": "#ef4444"},
            {"name": "High", "count": high_count, "color": "#f97316"},
            {"name": "Medium", "count": medium_count, "color": "#f59e0b"},
            {"name": "Low", "count": low_count, "color": "#3b82f6"},
            {"name": "Informational", "count": info_count, "color": "#64748b"},
        ]

        # Category distribution
        cat_counts: Dict[str, int] = {}
        for f in all_items:
            cat_counts[f.category] = cat_counts.get(f.category, 0) + 1
        category_dist = [{"category": k, "count": v} for k, v in cat_counts.items()]
        category_dist.sort(key=lambda x: x["count"], reverse=True)

        # Status distribution
        status_dist = [
            {"status": "Open", "count": open_count, "color": "#ef4444"},
            {"status": "In Progress", "count": in_progress_count, "color": "#f59e0b"},
            {"status": "Resolved", "count": resolved_count, "color": "#10b981"},
        ]

        # Risk distribution bands
        risk_dist = [
            {"range": "Critical (85-100)", "count": sum(1 for f in all_items if f.risk_score >= 85), "color": "#ef4444"},
            {"range": "High (65-84)", "count": sum(1 for f in all_items if 65 <= f.risk_score < 85), "color": "#f97316"},
            {"range": "Medium (40-64)", "count": sum(1 for f in all_items if 40 <= f.risk_score < 65), "color": "#f59e0b"},
            {"range": "Low (0-39)", "count": sum(1 for f in all_items if f.risk_score < 40), "color": "#3b82f6"},
        ]

        sorted_by_risk = sorted(all_items, key=lambda x: x.risk_score, reverse=True)
        sorted_by_date = sorted(all_items, key=lambda x: x.created_at, reverse=True)

        return DashboardStats(
            total_findings=total,
            critical_count=critical_count,
            high_count=high_count,
            medium_count=medium_count,
            low_count=low_count,
            informational_count=info_count,
            open_count=open_count,
            in_progress_count=in_progress_count,
            resolved_count=resolved_count,
            average_risk_score=avg_risk,
            max_risk_score=max_risk,
            severity_distribution=severity_dist,
            category_distribution=category_dist,
            status_distribution=status_dist,
            risk_distribution=risk_dist,
            recent_findings=sorted_by_date[:6],
            priority_findings=sorted_by_risk[:5],
        )


# Global singleton in-memory session store
session_store = SessionStore()
