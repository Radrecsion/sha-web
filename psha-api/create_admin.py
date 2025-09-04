from app.database import SessionLocal
from app.models.users import User
from app.core.security import hash_password

def create_admin():
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            hashed_password = hash_password("admin123")  # default password
            admin = User(
                username="admin",
                email="admin@example.com",
                hashed_password=hashed_password
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)
            print("✅ Admin user created:", admin.username)
        else:
            print("⚠️ Admin already exists")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
