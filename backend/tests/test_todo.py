"""
Todo APIのテスト
"""

from app.models.user import User
from app.models.todo import Todo


class TestCreateTodo:
    """Todo作成のテスト"""

    def test_create_todo(self, client, auth_headers):
        """認証済みユーザーがTodo作成できる"""
        response = client.post(
            "/api/todo/",
            headers=auth_headers,
            json={"name": "Test Task", "detail": "Test Detail"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Task"
        assert data["detail"] == "Test Detail"
        assert "id" in data
        assert "created_at" in data

    def test_create_todo_without_auth(self, client):
        """認証なしでTodo作成すると403エラー"""
        response = client.post(
            "/api/todo/", json={"name": "Test Task", "detail": "Test Detail"}
        )

        assert response.status_code == 401


class TestListTodos:
    """Todo一覧取得のテスト"""

    def test_list_own_todos(self, client, auth_headers, test_user, test_db):
        """自分のTodoのみが一覧に表示される"""
        # テストユーザーのTodoを作成
        todo = Todo(name="My Task", detail="My Detail", owner_id=test_user.id)
        test_db.add(todo)
        test_db.commit()

        response = client.get("/api/todo/", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "My Task"

    def test_cannot_see_others_todos(self, client, auth_headers, test_user, test_db):
        """他人のTodoは一覧に表示されない"""
        # 別のユーザーを作成
        other_user = User(username="otheruser", email="other@example.com")
        other_user.set_password("otherpassword")
        test_db.add(other_user)
        test_db.commit()
        test_db.refresh(other_user)

        # 別のユーザーのTodoを作成
        other_todo = Todo(
            name="Other's Task", detail="Other's Detail", owner_id=other_user.id
        )
        test_db.add(other_todo)
        test_db.commit()

        # テストユーザーで取得
        response = client.get("/api/todo/", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0  # 他人のTodoは見えない


class TestAccessOthersTodo:
    """他人のTodoへのアクセス制限テスト"""

    def test_cannot_access_others_todo(self, client, auth_headers, test_user, test_db):
        """他人のTodoにアクセスすると404"""
        # 別のユーザーを作成
        other_user = User(username="otheruser", email="other@example.com")
        other_user.set_password("otherpassword")
        test_db.add(other_user)
        test_db.commit()
        test_db.refresh(other_user)

        # 別のユーザーのTodoを作成
        other_todo = Todo(
            name="Other's Task", detail="Other's Detail", owner_id=other_user.id
        )
        test_db.add(other_todo)
        test_db.commit()
        test_db.refresh(other_todo)

        # テストユーザーでアクセス
        response = client.get(f"/api/todo/{other_todo.id}/", headers=auth_headers)

        assert response.status_code == 404


class TestUpdateTodo:
    """Todo更新のテスト"""

    def test_update_todo(self, client, auth_headers, test_user, test_db):
        """Todoの更新が正しく動作"""
        # Todoを作成
        todo = Todo(
            name="Original Task", detail="Original Detail", owner_id=test_user.id
        )
        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        # 更新
        response = client.put(
            f"/api/todo/{todo.id}/",
            headers=auth_headers,
            json={"name": "Updated Task", "detail": "Updated Detail"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Task"
        assert data["detail"] == "Updated Detail"


class TestDeleteTodo:
    """Todo削除のテスト"""

    def test_delete_todo(self, client, auth_headers, test_user, test_db):
        """Todoの削除が正しく動作"""
        # Todoを作成
        todo = Todo(name="To Delete", detail="Will be deleted", owner_id=test_user.id)
        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        # 削除
        response = client.delete(f"/api/todo/{todo.id}/", headers=auth_headers)

        assert response.status_code == 204

        # 削除確認
        response = client.get(f"/api/todo/{todo.id}/", headers=auth_headers)
        assert response.status_code == 404
