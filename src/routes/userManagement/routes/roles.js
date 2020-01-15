import React from 'react';
import { Form, Collapse } from 'antd';
const Panel = Collapse.Panel;

class Data extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="container-fluid no-breadcrumb container-mw-md chapter">
        <article className="article">
          <div className="box box-default">
            <div className="box-header">Role Management</div>
            <div className="box-body">
              {/* <Collapse defaultActiveKey={['1']}>
                <Panel header="This is panel header 1" key="1">
                  <p />
                </Panel>
                <Panel header="This is panel header 2" key="2">
                  <p />
                </Panel>
                <Panel header="This is panel header 3" key="3">
                  <p />
                </Panel>
              </Collapse> */}
            </div>
          </div>
        </article>
      </div>
    );
  }
}

const WrappedData = Form.create()(Data);

const roles = () => <WrappedData />;

export default roles;
