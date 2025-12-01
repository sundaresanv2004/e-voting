def send_password_reset_email(email: str, token: str):
    print("=== PASSWORD RESET EMAIL ===")
    print(f"To: {email}")
    print(f"Reset link: http://localhost:8000/auth/reset/confirm?token={token}")
    print("============================")


#CHANGE TO SMTP
