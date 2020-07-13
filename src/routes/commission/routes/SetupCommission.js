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
  Switch,
} from 'antd';

const FormItem = Form.Item;
const Search = Input.Search;
const { Column, ColumnGroup } = Table;

class Data extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div className="box box-default mb-4">
            <div className="box-header">IPG Service Management</div>
            <div className="box-body">
              <Form>
                <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                  <Col xs={24} sm={12} md={12} lg={6}>
                    <FormItem label="Agent Type Code">
                      {getFieldDecorator('agentTypeCode', {
                        rules: [
                          {
                            required: true,
                            message: 'Agent type code cannot be empty.',
                          },
                        ],
                      })(<Input style={{ width: '100%' }} />)}
                    </FormItem>
                  </Col>
                  <Col xs={24} sm={12} md={12} lg={6}>
                    <FormItem label="Channel Type">
                      {getFieldDecorator('channelType', {
                        rules: [
                          {
                            required: true,
                            message: 'Channel type cannot be empty.',
                          },
                        ],
                      })(<Input style={{ width: '100%' }} />)}
                    </FormItem>
                  </Col>
                  <Col xs={24} sm={12} md={12} lg={6}>
                    <FormItem label="Transaction Type Code">
                      {getFieldDecorator('tc_TransactionTypeCode', {
                        rules: [
                          {
                            required: true,
                            message: 'Transaction type code cannot be empty.',
                          },
                        ],
                      })(<Input style={{ width: '100%' }} />)}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>

          <div key="2">
            <div className="box box-default">
              <div className="box-body">
                <Row gutter={24}>
                  <Col span={8} order={3}>
                    <FormItem>
                      <Search
                        placeholder="Search account details and URLs"
                        onChange={this.searchTextHandler}
                      />
                    </FormItem>
                  </Col>
                </Row>

                <article className="article mt-2">
                  <Table
                    dataSource={this.state.loadFilterRecordList}
                    loading={this.state.tableLoading}
                    className="components-table-demo-nested"
                  >
                    <Column title="Account Holder" dataIndex="account.holder" key="holder" />
                    <Column title="Success URL" dataIndex="successUrl" key="successUrl" />
                    <Column title="Fail URL" dataIndex="failUrl" key="failUrl" />
                    {/* <Column
                          title="Status"
                          dataIndex="active"
                          key="active"
                          render={active => (
                            <Tag color={STATUS.IPG_SERVICE_RECORD[active].color}>
                              {STATUS.IPG_SERVICE_RECORD[active].label}
                            </Tag>
                          )}
                        /> */}
                    <Column
                      title="Action"
                      key="action"
                      render={(text, record) => (
                        <>
                          <span>
                            <Tooltip title="Update" className="mr-3">
                              <Icon onClick={() => this.toggleModal(record, 'edit')} type="edit" />
                            </Tooltip>
                            <Tooltip title="View Record" className="mr-3">
                              <Icon
                                onClick={() => this.toggleModal(record, 'view')}
                                type="menu-unfold"
                              />
                            </Tooltip>
                          </span>
                        </>
                      )}
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

const Manage = () => <WrappedData />;

export default Manage;
