"""
Script to clean up placeholder appointments from the database
"""
from sqlalchemy.orm import Session
from database import SessionLocal, Appointment

def cleanup_placeholder_appointments():
    """Remove any existing placeholder appointments"""
    db = SessionLocal()
    try:
        # Delete all existing appointments (assuming they are placeholders)
        deleted_count = db.query(Appointment).delete()
        db.commit()
        print(f"Deleted {deleted_count} placeholder appointments")
    except Exception as e:
        print(f"Error cleaning up appointments: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_placeholder_appointments()
    print("Cleanup completed!")