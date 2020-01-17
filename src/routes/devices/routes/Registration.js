import React from 'react';
import QueueAnim from 'rc-queue-anim';
import {
  Table,
  Icon,
  Input,
  Button,
  Modal,
  Form,
  Tag,
  Divider,
  Row,
  Col,
  Select,
  InputNumber,
  DatePicker,
  message,
} from 'antd';

import { environment, commonUrl } from '../../../environments';
import axios from 'axios';
import Password from 'antd/lib/input/Password';
import CUSTOM_MESSAGE from 'constants/notification/message';

const userStatus = {
  ACTIVE: { color: '', label: 'ACTIVE' },
  INACTIVE: { color: 'blue', label: 'INACTIVE' },
  DELETED: { color: 'magenta', label: 'DELETED' },
  PENDING_ACTIVATION: { color: 'magenta', label: 'PENDING' },
  TEMP_LOCKED_BAD_CREDENTIALS: { color: 'magenta', label: 'LOCKED' },
};

const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;

const tableData = [
  {
    key: '1',
    serialNo: '123424443uur',
    date: '2013-02-09',
    status: 'Registerd',
  },
  {
    key: '2',
    serialNo: '123424443Ate',
    date: '2013-02-09',
    status: 'Removed',
  },
  {
    key: '3',
    serialNo: '12344we43ee',
    date: '2013-02-09',
    status: 'Registerd',
  },
];

class Data extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadDevices: [],
      loadFilterDevices: [],
      search: '',
    };
  }

  async componentDidMount() {
    this.setState({
      loadDevices: tableData,
      loadFilterDevices: tableData,
    });
  }

  onChange = e => {
    console.log(this.state.loadFilterDevices);

    this.setState({ search: e.target.value }, () => {
      let data = this.state.loadDevices.filter(d => {
        return (
          d.serialNo.toLowerCase().includes(this.state.search.toLowerCase()) ||
          d.status.toLowerCase().includes(this.state.search.toLowerCase())
        );
      });

      this.setState({
        loadFilterDevices: data,
      });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { userRole, userList } = this.state;

    return (
      <div className="container-fluid no-breadcrumb container-mw-xl chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div key="1">
            <div className="box box-default mb-4">
              <div className="box-header">Device Registration</div>
              <div className="box-body">
                <Form>
                  <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                    <Col span={6} order={2}>
                      <FormItem>
                        {getFieldDecorator('Serial number', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter your Serial number',
                            },
                          ],
                        })(<Input placeholder="Serial number" />)}
                      </FormItem>
                    </Col>
                    <Col span={6} order={1}>
                      <Button type="primary" className="float-right" onClick={this.submit}>
                        Submit
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            </div>
          </div>
          <div key="2">
            <div className="box box-default">
              <div className="box-header">Search Devices</div>
              <div className="box-body">
                <Form>
                  <Row gutter={24}>
                    <Col span={8} order={3}>
                      <FormItem>
                        <Input placeholder="Serial number" onChange={this.onChange} />
                      </FormItem>
                    </Col>
                    {/* <Col span={6} order={2}>
                      <FormItem {...formItemLayout} label="Card Type">
                        <Select
                          style={{ width: 120 }}
                          onChange={this.searchTypeHandler}
                          value={this.state.searchType}
                        >
                          <Option value="all">All</Option>
                          <Option value="cash">Cash</Option>
                          <Option value="debit">Debit</Option>
                        </Select>
                      </FormItem>
                    </Col>
                    <Col span={6} order={1}>
                      <FormItem {...formItemLayout} label="Status">
                        <Select
                          style={{ width: 120 }}
                          onChange={this.searchStatusHandler}
                          value={this.state.searchStatus}
                        >
                          <Option value="all">All</Option>
                          <Option value="initiated">Initiated</Option>
                          <Option value="downloaded">Downloaded</Option>
                          <Option value="activated">Activated</Option>
                        </Select>
                      </FormItem>
                    </Col> */}
                  </Row>
                </Form>

                <article className="article mt-2">
                  <Table dataSource={this.state.loadFilterDevices}>
                    <Column title="Serial Number" dataIndex="serialNo" key="serialNumber" />
                    <Column
                      title="Status"
                      dataIndex="status"
                      key="status"
                      // render={status => (
                      //   <Tag color={userStatus[status].color}>{userStatus[status].label}</Tag>
                      // )}
                    />
                  </Table>
                </article>
              </div>
            </div>
          </div>
        </QueueAnim>
      </div>
    );
  }
}

const WrappedData = Form.create()(Data);

const registration = () => <WrappedData />;

export default registration;
