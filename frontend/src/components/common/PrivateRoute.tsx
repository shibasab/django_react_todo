import React from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, RouteProps } from 'react-router-dom';

interface PrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  auth: {
    isLoading: boolean;
    isAuthenticated: boolean;
  };
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, auth, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (auth.isLoading) {
        return <h2>Loading...</h2>;
      } else if (!auth.isAuthenticated) {
        return <Redirect to="/login" />;
      } else {
        return <Component {...props} />;
      }
    }}
  />
);

const mapStateToProps = (state: { auth: { isLoading: boolean; isAuthenticated: boolean } }) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(PrivateRoute);
