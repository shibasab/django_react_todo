import React, { Component } from 'react';
import { connect } from 'react-redux';

// TODO: updateTodo関数が未実装のためコメントアウト
// import { updateTodo } from '../../actions/todo';

interface UpdateState {
  todo_task: string;
  detail: string;
}

// TODO: updateTodo実装後に型を追加
interface UpdateProps {}

export class Update extends Component<UpdateProps, UpdateState> {
  state: UpdateState = {
    todo_task: '',
    detail: '',
  };

  onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    this.setState({ [e.target.name]: e.target.value } as Pick<UpdateState, keyof UpdateState>);

  onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { todo_task, detail } = this.state;
    const todo = { todo_task, detail };
    // TODO: updateTodo関数実装後に有効化
    // this.props.updateTodo(todo);
    console.log('Update todo:', todo);
    this.setState({
      todo_task: '',
      detail: '',
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
            <input className="form-control" type="text" name="todo_task" onChange={this.onChange} value={todo_task} />
          </div>
          <div className="form-group">
            <label>Detail</label>
            <input className="form-control" type="text" name="detail" onChange={this.onChange} value={detail} />
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

// TODO: updateTodo関数実装後に有効化
export default connect(null, {})(Update);
