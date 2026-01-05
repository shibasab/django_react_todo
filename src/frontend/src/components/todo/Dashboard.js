import React, { Fragment } from 'react';
import Form from './Form';
import Todo from './Todo';

export default function Dashboard() {
  return (
    <Fragment>
      <Todo />
      <Form />
    </Fragment>
  );
}
