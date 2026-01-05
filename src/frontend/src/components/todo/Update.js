import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { updateTodo } from '../../actions/todo';

export class Form extends Component {
  state = {
    todo_task: '',
    detail: ''
  };

  static propTypes = {
    updateTodo: PropTypes.func.isRequired
  };

  onChange = e => this.setState({ [e.target.name]: e.target.value });

  onSubmit = e => {
    e.preventDefault();
    const { todo_task, detail } = this.state;
    const todo = { todo_task, detail };
    this.props.updateTodo(todo);
    this.setState({
      todo_task: '',
      detail: ''
    });
  };

  render() {
    const { todo_task, detail } = this.state;
    return (
      <div className="card card-body mt-4 mb-4">
        <h2>Add Todo</h2>
        <form onSubmit={this.onSubmit}>
          <div className="form-group">
            <label>Task</label>
            <input
              className="form-control"
              type="text"
              name="todo_task"
              onChange={this.onChange}
              value={todo_task}
            />
          </div>
          <div className="form-group">
            <label>Detail</label>
            <input
              className="form-control"
              type="text"
              name="detail"
              onChange={this.onChange}
              value={detail}
            />
          </div>

          <div className="form-group">
            <button type="submit" className="btn btn-primary">
              Update
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default connect(
  null,
  { updateTodo }
)(Form);
