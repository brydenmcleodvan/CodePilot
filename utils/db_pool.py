"""
Database Connection Pool Module

This module provides a connection pool for PostgreSQL database 
to improve performance and resource utilization.
"""

import os
import logging
from psycopg2 import pool
from contextlib import contextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get database connection parameters from environment variables
DB_HOST = os.environ.get('PGHOST', 'localhost')
DB_PORT = os.environ.get('PGPORT', '5432')
DB_NAME = os.environ.get('PGDATABASE', 'postgres')
DB_USER = os.environ.get('PGUSER', 'postgres')
DB_PASSWORD = os.environ.get('PGPASSWORD', 'postgres')
DB_URL = os.environ.get('DATABASE_URL')

# Create connection pool
try:
    if DB_URL:
        connection_pool = pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=DB_URL
        )
    else:
        connection_pool = pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
    logger.info("Database connection pool initialized successfully")
except Exception as e:
    logger.error(f"Error initializing connection pool: {e}")
    connection_pool = None

@contextmanager
def get_db_connection():
    """
    Context manager for database connections.
    Retrieves a connection from the pool and returns it after use.
    """
    connection = None
    try:
        if connection_pool:
            connection = connection_pool.getconn()
            yield connection
        else:
            logger.error("Connection pool not initialized")
            raise Exception("Database connection pool is not initialized")
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise
    finally:
        if connection and connection_pool:
            connection_pool.putconn(connection)

@contextmanager
def get_db_cursor(commit=False):
    """
    Context manager for database cursors.
    Gets a connection and cursor, commits if specified, and handles cleanup.
    
    Args:
        commit (bool): Whether to commit the transaction after operations
    """
    with get_db_connection() as connection:
        cursor = connection.cursor()
        try:
            yield cursor
            if commit:
                connection.commit()
        except Exception as e:
            connection.rollback()
            logger.error(f"Database cursor error: {e}")
            raise
        finally:
            cursor.close()

def close_pool():
    """Close the connection pool."""
    global connection_pool
    if connection_pool:
        try:
            connection_pool.closeall()
            logger.info("Database connection pool closed")
        except Exception as e:
            logger.error(f"Error closing connection pool: {e}")
        finally:
            connection_pool = None