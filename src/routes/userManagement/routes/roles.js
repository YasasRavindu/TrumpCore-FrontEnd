import React from 'react';
import { Form } from 'antd';

class Data extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="container-fluid no-breadcrumb container-mw-xl chapter">
        <h1>Roles</h1>
      </div>
    );
  }
}

const WrappedData = Form.create()(Data);

const roles = () => <WrappedData />;

export default roles;
