import re
from datetime import datetime, timezone
from typing import Optional


def slugify(text: str) -> str:
    """
    Convert a string to a URL-friendly slug.
    """
    # Convert to lowercase
    text = text.lower()
    
    # Replace spaces with hyphens
    text = re.sub(r'\s+', '-', text)
    
    # Remove special characters
    text = re.sub(r'[^a-z0-9\-]', '', text)
    
    # Remove duplicate hyphens
    text = re.sub(r'\-+', '-', text)
    
    # Remove leading and trailing hyphens
    text = text.strip('-')
    
    return text


def format_datetime(dt: Optional[datetime] = None, format: str = "%Y-%m-%d %H:%M:%S") -> str:
    """
    Format a datetime object as a string.
    """
    if dt is None:
        dt = datetime.now(timezone.utc)
    
    return dt.strftime(format)


def get_human_readable_time_diff(dt: datetime) -> str:
    """
    Get a human-readable time difference between now and a given datetime.
    """
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    
    diff = now - dt
    
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return f"{int(seconds)} seconds ago"
    elif seconds < 3600:
        minutes = int(seconds / 60)
        return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
    elif seconds < 86400:
        hours = int(seconds / 3600)
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    else:
        days = int(seconds / 86400)
        return f"{days} day{'s' if days != 1 else ''} ago"


def get_status_color(status: str) -> str:
    """
    Get a color for a status value.
    """
    status_colors = {
        "operational": "green",
        "degraded_performance": "yellow",
        "partial_outage": "orange",
        "major_outage": "red",
        "maintenance": "blue",
        
        "investigating": "yellow",
        "identified": "orange",
        "monitoring": "blue",
        "resolved": "green",
        
        "minor": "yellow",
        "major": "orange",
        "critical": "red",
    }
    
    return status_colors.get(status, "gray")


def get_status_display_name(status: str) -> str:
    """
    Get a human-readable display name for a status value.
    """
    status_display = {
        "operational": "Operational",
        "degraded_performance": "Degraded Performance",
        "partial_outage": "Partial Outage",
        "major_outage": "Major Outage",
        "maintenance": "Maintenance",
        
        "investigating": "Investigating",
        "identified": "Identified",
        "monitoring": "Monitoring",
        "resolved": "Resolved",
        
        "minor": "Minor",
        "major": "Major",
        "critical": "Critical",
        
        "incident": "Incident",
        "maintenance": "Maintenance",
    }
    
    return status_display.get(status, status.replace("_", " ").title())