import urllib.parse
from typing import Dict, Any, Tuple


class ParsedRequest:
    def __init__(
        self,
        method: str = "GET",
        url: str = "/",
        path: str = "/",
        headers: Dict[str, str] = None,
        query_params: Dict[str, str] = None,
        body: str = "",
        raw_text: str = "",
        http_version: str = "HTTP/1.1",
    ):
        self.method = method.upper().strip()
        self.url = url.strip()
        self.path = path.strip()
        self.headers = {k.strip(): v.strip() for k, v in (headers or {}).items()}
        # Normalize header keys for case-insensitive lookup
        self.headers_lower = {k.lower(): v for k, v in self.headers.items()}
        self.query_params = query_params or {}
        self.body = body or ""
        self.raw_text = raw_text or ""
        self.http_version = http_version

    def get_header(self, key: str, default: str = "") -> str:
        return self.headers_lower.get(key.lower(), default)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "method": self.method,
            "url": self.url,
            "path": self.path,
            "headers": self.headers,
            "query_params": self.query_params,
            "body": self.body,
            "http_version": self.http_version,
        }


def parse_raw_http_request(raw_text: str) -> ParsedRequest:
    """
    Parses a raw HTTP request string into a structured ParsedRequest object.
    Supports standard HTTP/1.0, HTTP/1.1, and simplified formats.
    """
    clean_text = raw_text.strip()
    if not clean_text:
        return ParsedRequest(raw_text=raw_text)

    # Split headers and body
    parts = clean_text.split("\r\n\r\n", 1)
    if len(parts) == 1:
        parts = clean_text.split("\n\n", 1)

    headers_part = parts[0]
    body_part = parts[1] if len(parts) > 1 else ""

    lines = [line.strip() for line in headers_part.splitlines() if line.strip()]
    if not lines:
        return ParsedRequest(body=body_part, raw_text=raw_text)

    # Parse request line (e.g., "GET /search?q=test HTTP/1.1")
    request_line = lines[0]
    tokens = request_line.split()

    method = "GET"
    target_url = "/"
    http_version = "HTTP/1.1"

    if len(tokens) >= 1:
        method = tokens[0].upper()
    if len(tokens) >= 2:
        target_url = tokens[1]
    if len(tokens) >= 3:
        http_version = tokens[2]

    # Parse headers
    headers: Dict[str, str] = {}
    for line in lines[1:]:
        if ":" in line:
            h_key, h_val = line.split(":", 1)
            headers[h_key.strip()] = h_val.strip()

    # Determine full path and query parameters
    parsed_url = urllib.parse.urlsplit(target_url)
    path = parsed_url.path or "/"
    query_str = parsed_url.query
    query_params: Dict[str, str] = {}

    if query_str:
        q_dict = urllib.parse.parse_qs(query_str, keep_blank_values=True)
        query_params = {k: v[0] if len(v) == 1 else ",".join(v) for k, v in q_dict.items()}

    # Also parse body query params if Content-Type is application/x-www-form-urlencoded
    content_type = headers.get("Content-Type", headers.get("content-type", ""))
    if "application/x-www-form-urlencoded" in content_type and body_part:
        try:
            b_dict = urllib.parse.parse_qs(body_part, keep_blank_values=True)
            for bk, bv in b_dict.items():
                if bk not in query_params:
                    query_params[f"body:{bk}"] = bv[0] if len(bv) == 1 else ",".join(bv)
        except Exception:
            pass

    return ParsedRequest(
        method=method,
        url=target_url,
        path=path,
        headers=headers,
        query_params=query_params,
        body=body_part,
        raw_text=raw_text,
        http_version=http_version,
    )


def parse_manual_request(
    method: str,
    url: str,
    headers: Dict[str, str] = None,
    query_params: Dict[str, str] = None,
    body: str = "",
) -> ParsedRequest:
    """
    Constructs a ParsedRequest from discrete manual inputs.
    """
    parsed_url = urllib.parse.urlsplit(url)
    path = parsed_url.path or "/"
    combined_params = dict(query_params or {})

    if parsed_url.query:
        q_dict = urllib.parse.parse_qs(parsed_url.query, keep_blank_values=True)
        for k, v in q_dict.items():
            if k not in combined_params:
                combined_params[k] = v[0] if len(v) == 1 else ",".join(v)

    # Reconstruct raw-like representation
    header_lines = [f"{k}: {v}" for k, v in (headers or {}).items()]
    raw_lines = [f"{method.upper()} {url} HTTP/1.1"] + header_lines
    if body:
        raw_lines.append("")
        raw_lines.append(body)
    raw_text = "\n".join(raw_lines)

    return ParsedRequest(
        method=method,
        url=url,
        path=path,
        headers=headers or {},
        query_params=combined_params,
        body=body or "",
        raw_text=raw_text,
    )
