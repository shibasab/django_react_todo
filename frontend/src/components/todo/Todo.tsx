import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import { getTodos, deleteTodo } from '../../actions/todo';

interface TodoItem {
  id: number;
  todo_task: string;
  detail: string;
}

interface TodoProps {
  todo: TodoItem[];
  getTodos: () => void;
  deleteTodo: (id: number) => void;
}

export class Todo extends Component<TodoProps> {
  componentDidMount() {
    this.props.getTodos();
  }

  render() {
    return (
      <Fragment>
        <br></br>
        <h4>Todo List</h4>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Task</th>
              <th>Detail</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {this.props.todo.map((todo) => (
              <tr key={todo.id}>
                <td>{todo.todo_task}</td>
                <td>{todo.detail}</td>
                <td>
                  <button onClick={this.props.deleteTodo.bind(this, todo.id)} className="btn btn-danger btn-sm">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Fragment>
    );
  }
}

const mapStateToProps = (state: { todo: { todo: TodoItem[] } }) => ({
  todo: state.todo.todo,
});

export default connect(mapStateToProps, { getTodos, deleteTodo })(Todo);
