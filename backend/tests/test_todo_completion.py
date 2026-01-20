"""
タスク完了ステータス機能のテスト
"""

from app.models.todo import Todo
from app.models.user import User


class TestTodoCompletion:
    """完了ステータス機能のテスト"""

    def test_create_todo_default_not_completed(self, client, auth_headers):
        """isCompletedを省略した場合はfalseがデフォルト"""
        response = client.post(
            "/api/todo/",
            headers=auth_headers,
            json={"name": "New Task", "detail": "Some detail"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["isCompleted"] is False

    def test_create_todo_with_completed_false(self, client, auth_headers):
        """isCompleted=falseを明示的に指定してタスク作成"""
        response = client.post(
            "/api/todo/",
            headers=auth_headers,
            json={
                "name": "Not Completed Task",
                "detail": "Some detail",
                "isCompleted": False,
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["isCompleted"] is False

    def test_create_todo_with_completed_true(self, client, auth_headers):
        """isCompleted=trueを指定してタスク作成"""
        response = client.post(
            "/api/todo/",
            headers=auth_headers,
            json={
                "name": "Already Completed Task",
                "detail": "Some detail",
                "isCompleted": True,
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["isCompleted"] is True

    def test_update_todo_to_completed(self, client, auth_headers, test_user, test_db):
        """未完了タスクを完了にする"""
        # 未完了のタスクを作成
        todo = Todo(
            name="Task to Complete",
            detail="Some detail",
            owner_id=test_user.id,
            is_completed=False,
        )
        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        # 完了に更新
        response = client.put(
            f"/api/todo/{todo.id}/",
            headers=auth_headers,
            json={
                "name": "Task to Complete",
                "detail": "Some detail",
                "isCompleted": True,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["isCompleted"] is True

    def test_update_todo_to_not_completed(
        self, client, auth_headers, test_user, test_db
    ):
        """完了タスクを未完了に戻す"""
        # 完了済みのタスクを作成
        todo = Todo(
            name="Completed Task",
            detail="Some detail",
            owner_id=test_user.id,
            is_completed=True,
        )
        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        # 未完了に戻す
        response = client.put(
            f"/api/todo/{todo.id}/",
            headers=auth_headers,
            json={
                "name": "Completed Task",
                "detail": "Some detail",
                "isCompleted": False,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["isCompleted"] is False

    def test_update_preserves_completion_status(
        self, client, auth_headers, test_user, test_db
    ):
        """タスク名/詳細を編集しても完了状態は維持される"""
        # 完了済みのタスクを作成
        todo = Todo(
            name="Original Name",
            detail="Original detail",
            owner_id=test_user.id,
            is_completed=True,
        )
        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        # 名前と詳細を更新（完了状態を維持）
        response = client.put(
            f"/api/todo/{todo.id}/",
            headers=auth_headers,
            json={
                "name": "Updated Name",
                "detail": "Updated detail",
                "isCompleted": True,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["detail"] == "Updated detail"
        assert data["isCompleted"] is True

    def test_list_todos_includes_completion_status(
        self, client, auth_headers, test_user, test_db
    ):
        """タスク一覧にisCompletedフィールドが含まれる"""
        # 未完了と完了のタスクを作成
        todo1 = Todo(
            name="Incomplete Task",
            owner_id=test_user.id,
            is_completed=False,
        )
        todo2 = Todo(
            name="Complete Task",
            owner_id=test_user.id,
            is_completed=True,
        )
        test_db.add(todo1)
        test_db.add(todo2)
        test_db.commit()

        response = client.get("/api/todo/", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

        # 完了ステータスを含むことを確認
        statuses = {item["name"]: item["isCompleted"] for item in data}
        assert statuses["Incomplete Task"] is False
        assert statuses["Complete Task"] is True

    def test_get_todo_includes_completion_status(
        self, client, auth_headers, test_user, test_db
    ):
        """タスク取得時にisCompletedフィールドが含まれる"""
        todo = Todo(
            name="Single Task",
            detail="Some detail",
            owner_id=test_user.id,
            is_completed=True,
        )
        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        response = client.get(f"/api/todo/{todo.id}/", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["isCompleted"] is True

    def test_cannot_update_others_todo_completion(
        self, client, auth_headers, test_user, test_db
    ):
        """他ユーザーのタスクの完了状態を変更しようとすると404"""
        # 別のユーザーを作成
        other_user = User(username="otheruser", email="other@example.com")
        other_user.set_password("otherpassword")
        test_db.add(other_user)
        test_db.commit()
        test_db.refresh(other_user)

        # 別のユーザーのタスクを作成
        other_todo = Todo(
            name="Other's Task",
            detail="Other's detail",
            owner_id=other_user.id,
            is_completed=False,
        )
        test_db.add(other_todo)
        test_db.commit()
        test_db.refresh(other_todo)

        # テストユーザーで完了状態を変更しようとする
        response = client.put(
            f"/api/todo/{other_todo.id}/",
            headers=auth_headers,
            json={
                "name": "Other's Task",
                "detail": "Other's detail",
                "isCompleted": True,
            },
        )

        assert response.status_code == 404
