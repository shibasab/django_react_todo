import { Component, Fragment } from 'react';

import {
  HashRouter as Router,
  Route,
  Switch
} from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Header from './layout/Header';
import Dashboard from './todo/Dashboard';
import Alerts from './layout/Alerts';
import Login from './accounts/Login';
import Register from './accounts/Register';
import PrivateRoute from './common/PrivateRoute';

import { Provider } from 'react-redux';
import store from '../store';
import { loadUser } from '../actions/auth';



class App extends Component {
  componentDidMount() {
    store.dispatch(loadUser());
  }

  render() {
    return (
      <Provider store={store}>
        <Fragment>
          <ToastContainer />
          <Router>
            <Fragment>
              <Header />
              <Alerts />
              <div className="container" style={{ background: '#F7FFF7' }}>
                <Switch>
                  <PrivateRoute exact path="/" component={Dashboard} />
                  <Route exact path="/register" component={Register} />
                  <Route exact path="/login" component={Login} />
                </Switch>
              </div>
            </Fragment>
          </Router>
        </Fragment>
      </Provider>
    );
  }
}

export default App;
