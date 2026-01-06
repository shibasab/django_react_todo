import { Component, Fragment } from 'react';
import { toast } from 'react-toastify';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

export class Alerts extends Component {
  static propTypes = {
    error: PropTypes.object.isRequired,
    message: PropTypes.object.isRequired
  };

  componentDidUpdate(prevProps) {
    const { error, message } = this.props;
    if (error !== prevProps.error) {
      if (error.msg.todo_task)
        toast.error(`Task: ${error.msg.todo_task.join()}`);
      if (error.msg.non_field_errors)
        toast.error(error.msg.non_field_errors.join());
      if (error.msg.username)
        toast.error(`Username: ${error.msg.username.join()}`);
      if (error.msg.password)
        toast.error(`Password: ${error.msg.password.join()}`);
    }

    if (message !== prevProps.message) {
      if (message.deleteTodo) toast.success(message.deleteTodo);
      if (message.addTodo) toast.success(message.addTodo);
      if (message.passwordNotMatch) toast.error(message.passwordNotMatch);
    }
  }

  render() {
    return <Fragment />;
  }
}

const mapStateToProps = state => ({
  error: state.errors,
  message: state.messages
});

export default connect(mapStateToProps)(Alerts);
