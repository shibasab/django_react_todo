import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getTodos, deleteTodo } from '../../actions/todo';

export class Todo extends Component {
  static propTypes = {
    todo: PropTypes.array.isRequired,
    getTodos: PropTypes.func.isRequired,
    deleteTodo: PropTypes.func.isRequired
  };

  componentDidMount() {
    this.props.getTodos();
  }

  render() {
    return (
      <Fragment>
        <h2>Todo List</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Task</th>
              <th>Detail</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {this.props.todo.map(todo => (
              <tr key={todo.id}>
                <td>{todo.id}</td>
                <td>{todo.todo_task}</td>
                <td>{todo.detail}</td>
                <td>
                  <button
                    onClick={this.props.deleteTodo.bind(this, todo.id)}
                    className="btn btn-danger btn-sm"
                  >
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

const mapStateToProps = state => ({
  todo: state.todo.todo
});

export default connect(
  mapStateToProps,
  { getTodos, deleteTodo }
)(Todo);
