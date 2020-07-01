import React from 'react';
import QueueAnim from 'rc-queue-anim';
import {
  Table,
  Icon,
  Input,
  Button,
  Modal,
  Form,
  Tabs,
  Tag,
  Divider,
  Row,
  Col,
  Select,
  InputNumber,
  DatePicker,
  message,
  Upload,
  Tooltip,
  AutoComplete,
  Spin,
} from 'antd';
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const { Column, ColumnGroup } = Table;

class Data extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tabPosition: 'top',
    };
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div className="box box-default mb-4">
            <Tabs tabPosition={this.state.tabPosition}>
              <TabPane tab="Agent Code" key="1">
                <div className="box-body">
                  <Form>
                    <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                      <Col span={6} order={1}>
                        <FormItem>
                          {getFieldDecorator('agentCode', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter your agent code',
                              },
                            ],
                          })(<Input placeholder="Agent Code" />)}
                        </FormItem>
                      </Col>
                      <Col span={9} order={2}>
                        <FormItem>
                          {getFieldDecorator('description', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter descriptionl',
                              },
                            ],
                          })(<Input placeholder="description" />)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24} order={4}>
                        <Button
                          type="primary"
                          className="float-right"
                          // loading={this.state.loading}
                          // onClick={this.submit}
                        >
                          Create
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                  <article className="article mt-2">
                    <Table
                      // dataSource={this.state.loadFilterRecordList}
                      // loading={this.state.tableLoading}
                      className="components-table-demo-nested"
                    >
                      <Column title="Agent Code" dataIndex="" key="" />
                      <Column title="Description" dataIndex="" key="" />
                      <Column
                        title="Action"
                        key="action"
                        render={(text, record) => (
                          <>
                            <span>
                              <Tooltip title="Update" className="mr-3">
                                <Icon type="edit" />
                              </Tooltip>
                            </span>
                          </>
                        )}
                      />
                    </Table>
                  </article>
                </div>
              </TabPane>
              <TabPane tab="Channel type" key="2">
                <div className="box-body">
                  <Form>
                    <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                      <Col span={6} order={1}>
                        <FormItem>
                          {getFieldDecorator('channelCode', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter your channel code',
                              },
                            ],
                          })(<Input placeholder="Channel Code" />)}
                        </FormItem>
                      </Col>
                      <Col span={9} order={2}>
                        <FormItem>
                          {getFieldDecorator('description', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter descriptionl',
                              },
                            ],
                          })(<Input placeholder="description" />)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24} order={4}>
                        <Button
                          type="primary"
                          className="float-right"
                          // loading={this.state.loading}
                          // onClick={this.submit}
                        >
                          Create
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                  <article className="article mt-2">
                    <Table
                      // dataSource={this.state.loadFilterRecordList}
                      // loading={this.state.tableLoading}
                      className="components-table-demo-nested"
                    >
                      <Column title="Channel Code" dataIndex="" key="" />
                      <Column title="Description" dataIndex="" key="" />
                      <Column
                        title="Action"
                        key="action"
                        render={(text, record) => (
                          <>
                            <span>
                              <Tooltip title="Update" className="mr-3">
                                <Icon type="edit" />
                              </Tooltip>
                            </span>
                          </>
                        )}
                      />
                    </Table>
                  </article>
                </div>
              </TabPane>
              <TabPane tab="Transaction Type" key="3">
                <div className="box-body">
                  <Form>
                    <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                      <Col span={6} order={1}>
                        <FormItem>
                          {getFieldDecorator('transactionCode', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter your transaction code',
                              },
                            ],
                          })(<Input placeholder="transaction Code" />)}
                        </FormItem>
                      </Col>
                      <Col span={9} order={2}>
                        <FormItem>
                          {getFieldDecorator('description', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter descriptionl',
                              },
                            ],
                          })(<Input placeholder="description" />)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24} order={4}>
                        <Button
                          type="primary"
                          className="float-right"
                          // loading={this.state.loading}
                          // onClick={this.submit}
                        >
                          Create
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                  <article className="article mt-2">
                    <Table
                      // dataSource={this.state.loadFilterRecordList}
                      // loading={this.state.tableLoading}
                      className="components-table-demo-nested"
                    >
                      <Column title="Transaction Code" dataIndex="" key="" />
                      <Column title="Description" dataIndex="" key="" />
                      <Column
                        title="Action"
                        key="action"
                        render={(text, record) => (
                          <>
                            <span>
                              <Tooltip title="Update" className="mr-3">
                                <Icon type="edit" />
                              </Tooltip>
                            </span>
                          </>
                        )}
                      />
                    </Table>
                  </article>
                </div>
              </TabPane>
              <TabPane tab="Distribution Type" key="4">
                <div className="box-body">
                  <Form>
                    <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                      <Col span={6} order={1}>
                        <FormItem>
                          {getFieldDecorator('distributionCode', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter your distribution code',
                              },
                            ],
                          })(<Input placeholder="Distribution Code" />)}
                        </FormItem>
                      </Col>
                      <Col span={9} order={2}>
                        <FormItem>
                          {getFieldDecorator('description', {
                            rules: [
                              {
                                required: true,
                                message: 'Please enter description',
                              },
                            ],
                          })(<Input placeholder="description" />)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24} order={4}>
                        <Button
                          type="primary"
                          className="float-right"
                          // loading={this.state.loading}
                          // onClick={this.submit}
                        >
                          Create
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                  <article className="article mt-2">
                    <Table
                      // dataSource={this.state.loadFilterRecordList}
                      // loading={this.state.tableLoading}
                      className="components-table-demo-nested"
                    >
                      <Column title="Distribution Code" dataIndex="" key="" />
                      <Column title="Description" dataIndex="" key="" />
                      <Column
                        title="Action"
                        key="action"
                        render={(text, record) => (
                          <>
                            <span>
                              <Tooltip title="Update" className="mr-3">
                                <Icon type="edit" />
                              </Tooltip>
                            </span>
                          </>
                        )}
                      />
                    </Table>
                  </article>
                </div>
              </TabPane>
            </Tabs>
          </div>
        </QueueAnim>
      </div>
    );
  }
}

const WrappedData = Form.create()(Data);

const Create = () => <WrappedData />;

export default Create;
