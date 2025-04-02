from database import engine
from models.models import User
from sqlalchemy.orm import Session

def clear_users():
    with Session(engine) as session:
        # Delete all users
        session.query(User).delete()
        session.commit()
        print("All users have been deleted from the database.")

if __name__ == "__main__":
    clear_users() 