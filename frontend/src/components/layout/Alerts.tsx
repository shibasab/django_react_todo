import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';

interface AlertsProps {
  error: {
    msg: {
      todo_task?: string[];
      non_field_errors?: string[];
      username?: string[];
      password?: string[];
    };
    status: number | null;
  };
  message: {
    deleteTodo?: string;
    addTodo?: string;
    passwordNotMatch?: string;
  };
}

export class Alerts extends Component<AlertsProps> {
  componentDidUpdate(prevProps: AlertsProps) {
    const { error, message } = this.props;
    if (error !== prevProps.error) {
      if (error.msg.todo_task) toast.error(`Task: ${error.msg.todo_task.join()}`);
      if (error.msg.non_field_errors) toast.error(error.msg.non_field_errors.join());
      if (error.msg.username) toast.error(`Username: ${error.msg.username.join()}`);
      if (error.msg.password) toast.error(`Password: ${error.msg.password.join()}`);
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

const mapStateToProps = (state: { errors: AlertsProps['error']; messages: AlertsProps['message'] }) => ({
  error: state.errors,
  message: state.messages,
});

export default connect(mapStateToProps)(Alerts);
