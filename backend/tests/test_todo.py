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

    def test_create_duplicate_todo_name_fails(
        self, client, auth_headers, test_user, test_db
    ):
        """同じ名前のタスク作成で422エラー（バリデーションエラー）"""
        # 最初のTodoを作成
        todo = Todo(name="Duplicate Task", detail="First one", owner_id=test_user.id)
        test_db.add(todo)
        test_db.commit()

        # 同じ名前で作成しようとする
        response = client.post(
            "/api/todo/",
            headers=auth_headers,
            json={"name": "Duplicate Task", "detail": "Second one"},
        )

        assert response.status_code == 422
        data = response.json()
        assert data["type"] == "validation_error"
        assert len(data["errors"]) == 1
        assert data["errors"][0]["field"] == "name"
        assert data["errors"][0]["reason"] == "unique_violation"

    def test_create_todo_name_too_long(self, client, auth_headers):
        """タスク名が100文字を超える場合は422エラー"""
        long_name = "a" * 101
        response = client.post(
            "/api/todo/",
            headers=auth_headers,
            json={"name": long_name, "detail": "Test Detail"},
        )

        assert response.status_code == 422
        data = response.json()
        assert data["type"] == "validation_error"
        assert len(data["errors"]) == 1
        assert data["errors"][0]["field"] == "name"
        assert data["errors"][0]["reason"] == "max_length"
        assert data["errors"][0]["limit"] == 100

    def test_create_todo_detail_too_long(self, client, auth_headers):
        """タスク詳細が500文字を超える場合は422エラー"""
        long_detail = "a" * 501
        response = client.post(
            "/api/todo/",
            headers=auth_headers,
            json={"name": "Test Task", "detail": long_detail},
        )

        assert response.status_code == 422
        data = response.json()
        assert data["type"] == "validation_error"
        assert len(data["errors"]) == 1
        assert data["errors"][0]["field"] == "detail"
        assert data["errors"][0]["reason"] == "max_length"
        assert data["errors"][0]["limit"] == 500

    def test_create_todo_name_empty(self, client, auth_headers):
        """タスク名が空の場合は422エラー"""
        response = client.post(
            "/api/todo/",
            headers=auth_headers,
            json={"name": "", "detail": "Test Detail"},
        )

        assert response.status_code == 422
        data = response.json()
        assert data["type"] == "validation_error"
        assert len(data["errors"]) == 1
        assert data["errors"][0]["field"] == "name"
        assert data["errors"][0]["reason"] == "required"

    def test_create_todo_name_missing(self, client, auth_headers):
        """タスク名フィールドが欠落している場合は422エラー"""
        response = client.post(
            "/api/todo/",
            headers=auth_headers,
            json={"detail": "Test Detail"},  # nameフィールドなし
        )

        assert response.status_code == 422
        data = response.json()
        assert data["type"] == "validation_error"
        assert len(data["errors"]) == 1
        assert data["errors"][0]["field"] == "name"
        assert data["errors"][0]["reason"] == "required"


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

    def test_update_to_duplicate_name_fails(
        self, client, auth_headers, test_user, test_db
    ):
        """他のタスクと重複する名前への更新で422エラー（バリデーションエラー）"""
        # 2つのTodoを作成
        todo1 = Todo(name="Task One", detail="First task", owner_id=test_user.id)
        todo2 = Todo(name="Task Two", detail="Second task", owner_id=test_user.id)
        test_db.add(todo1)
        test_db.add(todo2)
        test_db.commit()
        test_db.refresh(todo1)
        test_db.refresh(todo2)

        # todo2をtodo1と同じ名前に更新しようとする
        response = client.put(
            f"/api/todo/{todo2.id}/",
            headers=auth_headers,
            json={"name": "Task One", "detail": "Trying to duplicate"},
        )

        assert response.status_code == 422
        data = response.json()
        assert data["type"] == "validation_error"
        assert len(data["errors"]) == 1
        assert data["errors"][0]["field"] == "name"
        assert data["errors"][0]["reason"] == "unique_violation"

    def test_update_same_name_succeeds(self, client, auth_headers, test_user, test_db):
        """同じ名前のまま他フィールドを更新して成功"""
        # Todoを作成
        todo = Todo(name="Keep Name", detail="Original detail", owner_id=test_user.id)
        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        # 名前はそのままで詳細だけ更新
        response = client.put(
            f"/api/todo/{todo.id}/",
            headers=auth_headers,
            json={"name": "Keep Name", "detail": "Updated detail"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Keep Name"
        assert data["detail"] == "Updated detail"

    def test_different_users_can_have_same_task_name(
        self, client, auth_headers, test_user, test_db
    ):
        """異なるユーザーは同じ名前のタスクを作成可能"""
        # テストユーザーのTodoを作成
        todo1 = Todo(name="Same Name", detail="User 1 task", owner_id=test_user.id)
        test_db.add(todo1)
        test_db.commit()

        # 別のユーザーを作成
        other_user = User(username="otheruser", email="other@example.com")
        other_user.set_password("otherpassword")
        test_db.add(other_user)
        test_db.commit()
        test_db.refresh(other_user)

        # 別のユーザーで同じ名前のTodoを作成
        todo2 = Todo(name="Same Name", detail="User 2 task", owner_id=other_user.id)
        test_db.add(todo2)
        test_db.commit()  # これがエラーなく成功することを確認

        # 両方のTodoが存在することを確認
        assert test_db.query(Todo).filter(Todo.name == "Same Name").count() == 2

    def test_update_todo_name_too_long(self, client, auth_headers, test_user, test_db):
        """タスク名が100文字を超える場合は422エラー"""
        # Todoを作成
        todo = Todo(name="Original Task", detail="Original", owner_id=test_user.id)
        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        long_name = "a" * 101
        response = client.put(
            f"/api/todo/{todo.id}/",
            headers=auth_headers,
            json={"name": long_name, "detail": "Test Detail"},
        )

        assert response.status_code == 422
        data = response.json()
        assert data["type"] == "validation_error"
        assert len(data["errors"]) == 1
        assert data["errors"][0]["field"] == "name"
        assert data["errors"][0]["reason"] == "max_length"
        assert data["errors"][0]["limit"] == 100

    def test_update_todo_detail_too_long(
        self, client, auth_headers, test_user, test_db
    ):
        """タスク詳細が500文字を超える場合は422エラー"""
        # Todoを作成
        todo = Todo(name="Original Task", detail="Original", owner_id=test_user.id)
        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        long_detail = "a" * 501
        response = client.put(
            f"/api/todo/{todo.id}/",
            headers=auth_headers,
            json={"name": "Test Task", "detail": long_detail},
        )

        assert response.status_code == 422
        data = response.json()
        assert data["type"] == "validation_error"
        assert len(data["errors"]) == 1
        assert data["errors"][0]["field"] == "detail"
        assert data["errors"][0]["reason"] == "max_length"
        assert data["errors"][0]["limit"] == 500

    def test_update_todo_name_empty(self, client, auth_headers, test_user, test_db):
        """タスク名が空の場合は422エラー"""
        # Todoを作成
        todo = Todo(name="Original Task", detail="Original", owner_id=test_user.id)
        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        response = client.put(
            f"/api/todo/{todo.id}/",
            headers=auth_headers,
            json={"name": "", "detail": "Test Detail"},
        )

        assert response.status_code == 422
        data = response.json()
        assert data["type"] == "validation_error"
        assert len(data["errors"]) == 1
        assert data["errors"][0]["field"] == "name"
        assert data["errors"][0]["reason"] == "required"

    def test_update_todo_name_missing(self, client, auth_headers, test_user, test_db):
        """タスク名フィールドが欠落している場合でも他フィールドを更新できる"""
        # Todoを作成
        todo = Todo(name="Original Task", detail="Original", owner_id=test_user.id)
        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        response = client.put(
            f"/api/todo/{todo.id}/",
            headers=auth_headers,
            json={"detail": "Test Detail"},  # nameフィールドなし
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Original Task"
        assert data["detail"] == "Test Detail"

    def test_update_todo_preserves_fields_when_omitted(
        self, client, auth_headers, test_user, test_db
    ):
        """未指定のフィールドは既存値を保持する"""
        todo = Todo(
            name="Original Task",
            detail="Original detail",
            owner_id=test_user.id,
            due_date=None,
        )
        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        response = client.put(
            f"/api/todo/{todo.id}/",
            headers=auth_headers,
            json={"name": "Updated Task"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Task"
        assert data["detail"] == "Original detail"
        assert data["dueDate"] is None


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
