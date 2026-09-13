import os
import unittest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.main import app
from backend.auth.auth_db import AuthBase, AuthUser, PasswordResetToken, get_auth_db
from backend.auth.security import hash_password, verify_password

from sqlalchemy.pool import StaticPool

# Use in-memory SQLite database for testing auth
TEST_AUTH_DB_URL = "sqlite:///:memory:"
test_auth_engine = create_engine(
    TEST_AUTH_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingAuthSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_auth_engine)

AuthBase.metadata.create_all(bind=test_auth_engine)


def override_get_auth_db():
    db = TestingAuthSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_auth_db] = override_get_auth_db
client = TestClient(app)


class TestAuthenticationFull(unittest.TestCase):

    def setUp(self):
        app.dependency_overrides[get_auth_db] = override_get_auth_db
        AuthBase.metadata.drop_all(bind=test_auth_engine)
        AuthBase.metadata.create_all(bind=test_auth_engine)

    def test_register_and_login_flow(self):
        # Register user
        reg_payload = {
            "email": "analyst.test@socvigil.net",
            "password": "SecurePassword123!",
            "name": "Test Analyst",
            "role": "analyst"
        }
        res = client.post("/auth/register", json=reg_payload)
        self.assertEqual(res.status_code, 200, res.text)
        data = res.json()
        self.assertEqual(data["email"], "analyst.test@socvigil.net")
        self.assertEqual(data["name"], "Test Analyst")

        # Verify DB entry
        db = TestingAuthSessionLocal()
        db_user = db.query(AuthUser).filter(AuthUser.email == "analyst.test@socvigil.net").first()
        self.assertIsNotNone(db_user)
        self.assertEqual(db_user.auth_provider, "local")
        self.assertTrue(verify_password("SecurePassword123!", db_user.password_hash))
        db.close()

        # Reject duplicate registration
        res_dup = client.post("/auth/register", json=reg_payload)
        self.assertEqual(res_dup.status_code, 400)

        # Login with correct password
        login_res = client.post("/auth/login", json={
            "email": "analyst.test@socvigil.net",
            "password": "SecurePassword123!"
        })
        self.assertEqual(login_res.status_code, 200, login_res.text)
        login_data = login_res.json()
        self.assertIn("access_token", login_data)
        self.assertEqual(login_data["token_type"], "bearer")

        # Login with incorrect password
        bad_login = client.post("/auth/login", json={
            "email": "analyst.test@socvigil.net",
            "password": "WrongPassword"
        })
        self.assertEqual(bad_login.status_code, 401)

        # Test /auth/me endpoint
        token = login_data["access_token"]
        me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me_res.status_code, 200)
        me_data = me_res.json()
        self.assertEqual(me_data["email"], "analyst.test@socvigil.net")
        self.assertEqual(me_data["name"], "Test Analyst")

    def test_google_login_and_account_linking(self):
        # 1. New Google user
        google_payload = {
            "email": "google.analyst@socvigil.net",
            "name": "Google Operator",
            "google_id": "google-sub-998877",
            "picture": "https://example.com/avatar.jpg"
        }
        res = client.post("/auth/google", json=google_payload)
        self.assertEqual(res.status_code, 200, res.text)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["auth_provider"], "google")
        self.assertEqual(data["user"]["google_sub"], "google-sub-998877")

        # 2. Local user linking to Google
        reg_payload = {
            "email": "link.user@socvigil.net",
            "password": "LocalPassword123!",
            "name": "Link User"
        }
        client.post("/auth/register", json=reg_payload)

        # Sign in with Google using same email
        link_payload = {
            "email": "link.user@socvigil.net",
            "name": "Link User Google",
            "google_id": "google-sub-554433"
        }
        link_res = client.post("/auth/google", json=link_payload)
        self.assertEqual(link_res.status_code, 200)

        # Verify DB user linked
        db = TestingAuthSessionLocal()
        linked_user = db.query(AuthUser).filter(AuthUser.email == "link.user@socvigil.net").first()
        self.assertIsNotNone(linked_user)
        self.assertEqual(linked_user.google_sub, "google-sub-554433")
        # Local password hash preserved
        self.assertTrue(verify_password("LocalPassword123!", linked_user.password_hash))
        db.close()

    def test_forgot_and_reset_password_flow(self):
        # Register user
        reg_payload = {
            "email": "reset.user@socvigil.net",
            "password": "OldPassword123!",
            "name": "Reset Test User"
        }
        client.post("/auth/register", json=reg_payload)

        # Request forgot password
        forgot_res = client.post("/auth/forgot-password", json={"email": "reset.user@socvigil.net"})
        self.assertEqual(forgot_res.status_code, 200)
        self.assertIn("reset link has been sent", forgot_res.json()["message"])

        # Check token in DB
        db = TestingAuthSessionLocal()
        token_entry = db.query(PasswordResetToken).first()
        self.assertIsNotNone(token_entry)
        self.assertFalse(token_entry.used)
        reset_token = token_entry.token
        db.close()

        # Reset password with valid token
        reset_res = client.post("/auth/reset-password", json={
            "token": reset_token,
            "new_password": "NewSecretPassword456!"
        })
        self.assertEqual(reset_res.status_code, 200, reset_res.text)

        # Verify old password fails and new password succeeds
        old_login = client.post("/auth/login", json={
            "email": "reset.user@socvigil.net",
            "password": "OldPassword123!"
        })
        self.assertEqual(old_login.status_code, 401)

        new_login = client.post("/auth/login", json={
            "email": "reset.user@socvigil.net",
            "password": "NewSecretPassword456!"
        })
        self.assertEqual(new_login.status_code, 200)

        # Re-using the same token should fail
        reuse_res = client.post("/auth/reset-password", json={
            "token": reset_token,
            "new_password": "AnotherPassword789!"
        })
        self.assertEqual(reuse_res.status_code, 400)


if __name__ == "__main__":
    unittest.main()
