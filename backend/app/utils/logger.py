import logging
import sys
from typing import Any, Dict, List, Optional

from loguru import logger
from pydantic import BaseModel


class LogConfig(BaseModel):
    """Logging configuration"""
    LOGGER_NAME: str = "status_page"
    LOG_FORMAT: str = "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
    LOG_LEVEL: str = "INFO"

    # Various log handlers we want to use
    LOG_FILE_PATH: Optional[str] = None
    JSON_LOGS: bool = False


class InterceptHandler(logging.Handler):
    """
    Intercepts standard logging and redirects to loguru
    """

    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


def setup_logging(config: Optional[LogConfig] = None) -> None:
    """
    Setup logging configuration
    """
    if config is None:
        config = LogConfig()

    # Remove all existing loggers
    logger.remove()
    
    # Add console logger
    logger.add(
        sys.stderr,
        format=config.LOG_FORMAT,
        level=config.LOG_LEVEL,
        colorize=True,
    )
    
    # Add file logger if specified
    if config.LOG_FILE_PATH:
        logger.add(
            config.LOG_FILE_PATH,
            format=config.LOG_FORMAT,
            level=config.LOG_LEVEL,
            rotation="20 MB",
            compression="zip",
            serialize=config.JSON_LOGS,
        )
    
    # Intercept standard logging
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)
    
    # Replace standard library logger with loguru
    for _log in ["uvicorn", "uvicorn.access", "fastapi"]:
        _logger = logging.getLogger(_log)
        _logger.handlers = [InterceptHandler()]

    return logger


# Create a logger instance that can be imported
log = setup_logging()