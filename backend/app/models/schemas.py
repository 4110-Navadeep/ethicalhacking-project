from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class SeverityLevel(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"
    INFORMATIONAL = "Informational"


class RiskCategory(str, Enum):
    CRITICAL = "Critical Risk"
    HIGH = "High Risk"
    MEDIUM = "Medium Risk"
    LOW = "Low Risk"


class RemediationStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"


class DetectionType(str, Enum):
    INDICATOR = "Detected Indicator"
    POTENTIAL = "Potential Vulnerability"
    CONFIRMED_INDICATOR = "Confirmed Indicator Pattern"


class ConfidenceLevel(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class Finding(BaseModel):
    id: str = Field(..., description="Unique temporary finding identifier")
    name: str = Field(..., description="Vulnerability name")
    category: str = Field(..., description="Vulnerability category")
    severity: SeverityLevel = Field(..., description="Severity level")
    risk_score: int = Field(..., ge=0, le=100, description="Risk score between 0 and 100")
    risk_category: RiskCategory = Field(..., description="Risk tier")
    risk_rationale: str = Field(..., description="Transparent explanation of how risk score was derived")
    description: str = Field(..., description="Technical description")
    evidence: str = Field(..., description="Matched pattern, payload fragment, or missing element")
    affected_target: str = Field(..., description="Affected URL, endpoint, header, or parameter")
    detection_source: str = Field(..., description="Source of detection (e.g. Raw HTTP Request, File Import, Sample Data)")
    detection_type: DetectionType = Field(default=DetectionType.INDICATOR)
    confidence: ConfidenceLevel = Field(default=ConfidenceLevel.MEDIUM)
    detection_limitation: str = Field(..., description="Notice explaining heuristic detection scope without active exploitation")
    remediation_summary: str = Field(..., description="Summary of recommended fix")
    remediation_details: Optional[Dict[str, Any]] = Field(default=None, description="Detailed remediation instructions and code sample")
    remediation_status: RemediationStatus = Field(default=RemediationStatus.OPEN)
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    request_snippet: Optional[str] = None
    is_sample: bool = Field(default=False)


class RawRequestInput(BaseModel):
    raw_request: str = Field(..., min_length=5, description="Raw HTTP request text")


class ManualRequestInput(BaseModel):
    method: str = Field(default="GET", description="HTTP Method")
    url: str = Field(..., min_length=1, description="Target URL or endpoint path")
    headers: Dict[str, str] = Field(default_factory=dict, description="HTTP Headers")
    query_params: Dict[str, str] = Field(default_factory=dict, description="Query parameters")
    body: Optional[str] = Field(default="", description="Request body")


class StatusUpdateRequest(BaseModel):
    status: RemediationStatus


class DistributionItem(BaseModel):
    name: str
    count: int
    color: Optional[str] = None


class DashboardStats(BaseModel):
    total_findings: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    informational_count: int
    open_count: int
    in_progress_count: int
    resolved_count: int
    average_risk_score: float
    max_risk_score: int
    severity_distribution: List[Dict[str, Any]]
    category_distribution: List[Dict[str, Any]]
    status_distribution: List[Dict[str, Any]]
    risk_distribution: List[Dict[str, Any]]
    recent_findings: List[Finding]
    priority_findings: List[Finding]
    session_notice: str = "Temporary session-based data. Findings are stored in memory only and will reset upon backend restart or clearing."


class AnalyzeResponse(BaseModel):
    analysis_status: str
    target_summary: str
    total_detected: int
    findings: List[Finding]
    session_notice: str = "All findings are stored temporarily in-memory and will not persist to a database."
