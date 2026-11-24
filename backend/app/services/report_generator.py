import io
from datetime import datetime
from typing import List, Dict, Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether,
)

from ..models.schemas import Finding


def generate_pdf_report(findings: List[Finding]) -> io.BytesIO:
    """
    Generates a professional, print-ready PDF executive summary and technical triage report
    using ReportLab entirely in-memory.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    # Custom styling with professional cybersecurity SaaS aesthetic
    header_title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0f172a"),  # Dark Navy
    )

    header_subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569"),  # Slate 600
    )

    section_heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#1e3a8a"),  # Navy Blue
        spaceBefore=14,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
    )

    bold_label_style = ParagraphStyle(
        "BoldLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0f172a"),
    )

    code_style = ParagraphStyle(
        "CodeText",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor("#1e293b"),
    )

    elements = []

    # Title & Metadata
    elements.append(Paragraph("Intelligent Web Application Vulnerability Triage Framework", header_title_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph("Security Assessment & Risk Prioritization Report (Capstone Project)", header_subtitle_style))
    elements.append(Spacer(1, 6))

    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    meta_text = f"<b>Generated:</b> {now_str} &nbsp;|&nbsp; <b>Session Scope:</b> Temporary In-Memory Analysis (No Database)"
    elements.append(Paragraph(meta_text, body_style))
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#cbd5e1"), spaceBefore=2, spaceAfter=10))

    # Executive Summary Box
    total = len(findings)
    critical_c = sum(1 for f in findings if f.severity.value == "Critical")
    high_c = sum(1 for f in findings if f.severity.value == "High")
    med_c = sum(1 for f in findings if f.severity.value == "Medium")
    low_c = sum(1 for f in findings if f.severity.value == "Low")
    info_c = sum(1 for f in findings if f.severity.value == "Informational")
    avg_risk = round(sum(f.risk_score for f in findings) / total, 1) if total > 0 else 0

    elements.append(Paragraph("Executive Summary & Risk Metrics", section_heading_style))

    summary_summary_text = (
        f"This report presents an automated, rule-based vulnerability triage assessment. "
        f"A total of <b>{total}</b> findings were analyzed with an overall average risk score of <b>{avg_risk}/100</b>. "
        f"Critical and high-severity issues represent immediate threats to data integrity, confidentiality, and system availability."
    )
    elements.append(Paragraph(summary_summary_text, body_style))
    elements.append(Spacer(1, 8))

    # Metric summary table
    stat_table_data = [
        [
            Paragraph("<b>Total Findings</b>", bold_label_style),
            Paragraph("<b>Critical</b>", bold_label_style),
            Paragraph("<b>High</b>", bold_label_style),
            Paragraph("<b>Medium</b>", bold_label_style),
            Paragraph("<b>Low / Info</b>", bold_label_style),
            Paragraph("<b>Avg Risk Score</b>", bold_label_style),
        ],
        [
            Paragraph(f"<font size=12><b>{total}</b></font>", body_style),
            Paragraph(f"<font size=12 color='#dc2626'><b>{critical_c}</b></font>", body_style),
            Paragraph(f"<font size=12 color='#ea580c'><b>{high_c}</b></font>", body_style),
            Paragraph(f"<font size=12 color='#d97706'><b>{med_c}</b></font>", body_style),
            Paragraph(f"<font size=12 color='#2563eb'><b>{low_c + info_c}</b></font>", body_style),
            Paragraph(f"<font size=12><b>{avg_risk}</b>/100</font>", body_style),
        ],
    ]
    t_stat = Table(stat_table_data, colWidths=[90, 85, 85, 85, 95, 92])
    t_stat.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(t_stat)
    elements.append(Spacer(1, 14))

    # Prioritized Findings Table
    elements.append(Paragraph("Prioritized Vulnerability Queue", section_heading_style))
    elements.append(Paragraph("Ranked by composite triage risk score (0-100), incorporating base severity, impact potential, exploitability vector, and detection confidence.", body_style))
    elements.append(Spacer(1, 6))

    sorted_findings = sorted(findings, key=lambda x: x.risk_score, reverse=True)

    table_headers = [
        Paragraph("<b>ID</b>", bold_label_style),
        Paragraph("<b>Vulnerability Name</b>", bold_label_style),
        Paragraph("<b>Category</b>", bold_label_style),
        Paragraph("<b>Severity</b>", bold_label_style),
        Paragraph("<b>Risk Score</b>", bold_label_style),
        Paragraph("<b>Status</b>", bold_label_style),
    ]

    p_table_data = [table_headers]

    for f in sorted_findings[:15]:
        sev_color = {
            "Critical": "#dc2626",
            "High": "#ea580c",
            "Medium": "#d97706",
            "Low": "#2563eb",
            "Informational": "#64748b",
        }.get(f.severity.value, "#334155")

        row = [
            Paragraph(f"<b>{f.id}</b>", body_style),
            Paragraph(f.name[:36], body_style),
            Paragraph(f.category, body_style),
            Paragraph(f"<font color='{sev_color}'><b>{f.severity.value}</b></font>", body_style),
            Paragraph(f"<b>{f.risk_score}</b>/100", body_style),
            Paragraph(f.remediation_status.value, body_style),
        ]
        p_table_data.append(row)

    t_prio = Table(p_table_data, colWidths=[70, 155, 120, 65, 60, 62])
    t_prio.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(t_prio)
    elements.append(Spacer(1, 14))

    # Detailed Findings & Remediation Section
    elements.append(Paragraph("Technical Finding Details & Remediation Guidance", section_heading_style))
    elements.append(Paragraph("In-depth breakdown of detected indicators, technical evidence, impact assessment, and defensive remediation practices.", body_style))
    elements.append(Spacer(1, 8))

    for idx, f in enumerate(sorted_findings[:8]):
        finding_box = []
        finding_box.append(Paragraph(f"<b>Finding {idx+1}: {f.name} ({f.id})</b>", ParagraphStyle(
            "FindingHeading",
            parent=bold_label_style,
            fontSize=10.5,
            textColor=colors.HexColor("#1e3a8a"),
        )))
        finding_box.append(Spacer(1, 3))

        detail_text = (
            f"<b>Severity:</b> {f.severity.value} &nbsp;|&nbsp; "
            f"<b>Risk Score:</b> {f.risk_score}/100 ({f.risk_category.value}) &nbsp;|&nbsp; "
            f"<b>Status:</b> {f.remediation_status.value}<br/>"
            f"<b>Affected Target:</b> {f.affected_target}<br/>"
            f"<b>Detection Type:</b> {f.detection_type.value} &nbsp;|&nbsp; <b>Confidence:</b> {f.confidence.value}<br/>"
            f"<b>Evidence:</b> {f.evidence}<br/>"
            f"<b>Risk Derivation:</b> {f.risk_rationale}<br/>"
            f"<b>Remediation Summary:</b> {f.remediation_summary}"
        )
        finding_box.append(Paragraph(detail_text, body_style))

        if f.remediation_details and f.remediation_details.get("prevention_techniques"):
            techniques = "<br/>".join([f"• {t}" for t in f.remediation_details["prevention_techniques"][:3]])
            finding_box.append(Spacer(1, 3))
            finding_box.append(Paragraph(f"<b>Key Defensive Controls:</b><br/>{techniques}", body_style))

        finding_box.append(Spacer(1, 6))
        finding_box.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0"), spaceBefore=2, spaceAfter=6))

        elements.append(KeepTogether(finding_box))

    # Academic Disclaimer Footer
    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#64748b"),
    )
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(
        "Notice: This report was automatically compiled by the Intelligent Web Application Vulnerability Triage and Risk "
        "Assessment Framework for academic demonstration purposes. Findings are evaluated via safe, local, rule-based "
        "heuristics without active exploitation or external network intrusion. All findings are ephemeral and stored "
        "exclusively in temporary memory.",
        disclaimer_style,
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer
