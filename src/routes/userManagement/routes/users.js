import React from 'react';
import { Form } from 'antd';

class Data extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="container-fluid no-breadcrumb container-mw-xl chapter">
        <h1>Users</h1>
      </div>
    );
  }
}

const WrappedData = Form.create()(Data);

const users = () => <WrappedData />;

export default users;
