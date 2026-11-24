from typing import Dict, Any, Tuple
from ..models.schemas import SeverityLevel, RiskCategory, ConfidenceLevel


def calculate_risk_score(
    severity: str,
    category: str,
    affected_target: str,
    confidence: str,
    detection_type: str,
) -> Tuple[int, RiskCategory, str]:
    """
    Transparent rule-based risk scoring system (0 - 100).
    Explicitly documents scoring metrics for academic capstone demonstration.
    Does NOT claim to be official CVSS; uses a documented composite triage formula:
    
    Risk Score = Base Severity (max 40) + Impact Potential (max 25) + 
                 Exploitability Vector (max 25) + Confidence / Evidence Quality (max 10)
    """

    # 1. Base Severity Weight (Max 40)
    sev_upper = severity.upper()
    if sev_upper == "CRITICAL":
        base_weight = 40
    elif sev_upper == "HIGH":
        base_weight = 30
    elif sev_upper == "MEDIUM":
        base_weight = 20
    elif sev_upper == "LOW":
        base_weight = 10
    else:
        base_weight = 5

    # 2. Impact Potential (Max 25) based on vulnerability category
    cat_lower = category.lower()
    if "command" in cat_lower or "remote code" in cat_lower or "stacked" in cat_lower:
        impact_pts = 25
        impact_label = "Maximum (Host Compromise / RCE)"
    elif "sql" in cat_lower or "traversal" in cat_lower:
        impact_pts = 22
        impact_label = "High (Critical Data Access / System Files)"
    elif "cross-site scripting" in cat_lower or "xss" in cat_lower or "idor" in cat_lower:
        impact_pts = 18
        impact_label = "High-Moderate (Client Hijacking / Object Access)"
    elif "sensitive" in cat_lower or "credential" in cat_lower:
        impact_pts = 15
        impact_label = "Moderate (Information Disclosure / Token Exposure)"
    elif "header" in cat_lower:
        impact_pts = 10
        impact_label = "Low-Moderate (Defense-in-depth posture)"
    else:
        impact_pts = 8
        impact_label = "Low (Informational / General weakness)"

    # 3. Exploitability Delivery Vector (Max 25) based on input location
    target_lower = affected_target.lower()
    if "query parameter" in target_lower or "url path" in target_lower or "path" in target_lower:
        exploit_pts = 25
        exploit_label = "High (Trivial / URL reflection & zero-auth delivery)"
    elif "body" in target_lower or "payload" in target_lower:
        exploit_pts = 18
        exploit_label = "Moderate (Requires POST/PUT body manipulation)"
    elif "header" in target_lower or "cookie" in target_lower:
        exploit_pts = 12
        exploit_label = "Moderate-Low (Requires header tampering or interception)"
    else:
        exploit_pts = 8
        exploit_label = "Low (Indirect component context)"

    # 4. Confidence / Evidence Quality (Max 10)
    conf_upper = confidence.upper()
    if conf_upper == "HIGH" and "potential" in detection_type.lower():
        conf_pts = 10
        conf_label = "High (Strong pattern match + contextual relevance)"
    elif conf_upper == "HIGH":
        conf_pts = 8
        conf_label = "High (Clear deterministic signature match)"
    elif conf_upper == "MEDIUM":
        conf_pts = 5
        conf_label = "Medium (Heuristic pattern indicator)"
    else:
        conf_pts = 3
        conf_label = "Low (General indicator)"

    # Total score calculation clamped between 0 and 100
    total_score = min(100, max(0, base_weight + impact_pts + exploit_pts + conf_pts))

    # Determine Risk Category
    if total_score >= 85:
        risk_category = RiskCategory.CRITICAL
    elif total_score >= 65:
        risk_category = RiskCategory.HIGH
    elif total_score >= 40:
        risk_category = RiskCategory.MEDIUM
    else:
        risk_category = RiskCategory.LOW

    # Human-readable transparent explanation
    rationale = (
        f"Score {total_score}/100 derived from: "
        f"Base Severity ({base_weight}/40, {severity}); "
        f"Impact Potential ({impact_pts}/25, {impact_label}); "
        f"Exploitability Vector ({exploit_pts}/25, {exploit_label}); "
        f"Evidence Quality ({conf_pts}/10, {conf_label}). "
        f"Calculated via Project-Specific Triage Metric."
    )

    return total_score, risk_category, rationale
