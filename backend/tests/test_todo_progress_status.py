"""
progressStatus API契約のテスト
"""

from app.models.todo import Todo


class TestTodoProgressStatusContract:
    def test_create_rejects_legacy_is_completed_field(self, client, auth_headers):
        response = client.post(
            "/api/todo/",
            headers=auth_headers,
            json={
                "name": "Legacy Field Task",
                "detail": "detail",
                "isCompleted": True,
            },
        )

        assert response.status_code == 422

    def test_update_rejects_legacy_is_completed_field(
        self, client, auth_headers, test_user, test_db
    ):
        todo = Todo(name="Task", detail="", owner_id=test_user.id)
        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        response = client.put(
            f"/api/todo/{todo.id}/",
            headers=auth_headers,
            json={"isCompleted": True},
        )

        assert response.status_code == 422

    def test_invalid_progress_status_returns_422(self, client, auth_headers):
        response = client.post(
            "/api/todo/",
            headers=auth_headers,
            json={
                "name": "Invalid Status Task",
                "detail": "detail",
                "progressStatus": "waiting",
            },
        )

        assert response.status_code == 422

    def test_response_does_not_include_legacy_is_completed_field(
        self, client, auth_headers, test_user, test_db
    ):
        todo = Todo(
            name="Progress Task",
            detail="detail",
            owner_id=test_user.id,
            progress_status="in_progress",
        )
        test_db.add(todo)
        test_db.commit()
        test_db.refresh(todo)

        response = client.get(f"/api/todo/{todo.id}/", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["progressStatus"] == "in_progress"
        assert "isCompleted" not in data

    def test_list_filter_by_progress_status(
        self, client, auth_headers, test_user, test_db
    ):
        test_db.add_all(
            [
                Todo(
                    name="Not Started",
                    detail="",
                    owner_id=test_user.id,
                    progress_status="not_started",
                ),
                Todo(
                    name="Completed",
                    detail="",
                    owner_id=test_user.id,
                    progress_status="completed",
                ),
            ]
        )
        test_db.commit()

        response = client.get(
            "/api/todo/",
            headers=auth_headers,
            params={"progress_status": "completed"},
        )

        assert response.status_code == 200
        data = response.json()
        assert [item["name"] for item in data] == ["Completed"]
