"""
認証APIのテスト
"""
class TestRegister:
    """ユーザー登録のテスト"""
    
    def test_register_success(self, client):
        """新規ユーザー登録が成功し、トークンが返される"""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "newuser",
                "password": "newpassword123",
                "email": "newuser@example.com"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["username"] == "newuser"
        assert data["user"]["email"] == "newuser@example.com"
    
    def test_register_duplicate_username(self, client, test_user):
        """既存ユーザー名で登録すると400エラー"""
        response = client.post(
            "/api/auth/register",
            json={
                "username": "testuser",  # test_userと同じユーザー名
                "password": "anotherpassword123",
                "email": "another@example.com"
            }
        )
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]


class TestLogin:
    """ログインのテスト"""
    
    def test_login_success(self, client, test_user):
        """正しい認証情報でログイン成功"""
        response = client.post(
            "/api/auth/login",
            json={
                "username": "testuser",
                "password": "testpassword123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["username"] == "testuser"
    
    def test_login_wrong_password(self, client, test_user):
        """不正なパスワードで400エラー"""
        response = client.post(
            "/api/auth/login",
            json={
                "username": "testuser",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 400
        assert "Incorrect Credentials" in response.json()["detail"]
    
    def test_login_nonexistent_user(self, client):
        """存在しないユーザーで400エラー"""
        response = client.post(
            "/api/auth/login",
            json={
                "username": "nonexistent",
                "password": "somepassword"
            }
        )
        
        assert response.status_code == 400
