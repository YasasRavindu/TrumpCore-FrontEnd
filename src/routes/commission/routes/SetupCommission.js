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
  Typography,
} from 'antd';

const FormItem = Form.Item;
const Search = Input.Search;
const { Option } = Select;
const { Column, ColumnGroup } = Table;
const { Text, Link } = Typography;

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

const children = [];
for (let i = 1; i < 4; i++) {
  children.push(
    <Option key={i} value={'Dcode' + i}>
      {'DCode' + i}
    </Option>
  );
}

class Data extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dCode: [],
    };
  }

  handleChange = value => {
    console.log(`selected ${value}`);
    this.setState({
      dCode: value,
    });
  };

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
                      {getFieldDecorator('agentType', {
                        rules: [
                          {
                            required: true,
                            message: 'Please enter your agent type',
                          },
                        ],
                      })(
                        <AutoComplete
                          //dataSource={}
                          style={{ width: '100%' }}
                          placeholder="Agent Number"
                          // onBlur={inputValue => {
                          //   this.setAccount(inputValue);
                          // }}
                          // onChange={inputValue => {
                          //   this.updateAccountList(inputValue);
                          // }}
                          // onSelect={inputValue => {
                          //   this.setAccount(inputValue);
                          // }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col xs={24} sm={12} md={12} lg={6}>
                    <FormItem label="Channel Type Code">
                      {getFieldDecorator('channelType', {
                        rules: [
                          {
                            required: true,
                            message: 'Please enter your channel type',
                          },
                        ],
                      })(
                        <AutoComplete
                          //dataSource={}
                          style={{ width: '100%' }}
                          placeholder="Channel Type"
                          // onBlur={inputValue => {
                          //   this.setAccount(inputValue);
                          // }}
                          // onChange={inputValue => {
                          //   this.updateAccountList(inputValue);
                          // }}
                          // onSelect={inputValue => {
                          //   this.setAccount(inputValue);
                          // }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col xs={24} sm={12} md={12} lg={6}>
                    <FormItem label="Transaction Type Code">
                      {getFieldDecorator('transactionType', {
                        rules: [
                          {
                            required: true,
                            message: 'Please enter your transaction type',
                          },
                        ],
                      })(
                        <AutoComplete
                          //dataSource={}
                          style={{ width: '100%' }}
                          placeholder="Transaction Type"
                          // onBlur={inputValue => {
                          //   this.setAccount(inputValue);
                          // }}
                          // onChange={inputValue => {
                          //   this.updateAccountList(inputValue);
                          // }}
                          // onSelect={inputValue => {
                          //   this.setAccount(inputValue);
                          // }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col xs={24} sm={12} md={12} lg={6}>
                    <FormItem label="Distribution Code">
                      {getFieldDecorator('distributionCode', {
                        rules: [
                          {
                            required: true,
                            message: 'Please enter your Distribution codes',
                          },
                        ],
                      })(
                        <Select
                          mode="multiple"
                          style={{ width: '100%' }}
                          placeholder="Please select"
                          //defaultValue={['a10', 'c12']}
                          onChange={this.handleChange}
                        >
                          {children}
                        </Select>
                      )}
                    </FormItem>
                    {console.log(this.state.dCode)}
                  </Col>
                </Row>
                {this.state.dCode.length != 0 && (
                  <>
                    {this.state.dCode.map((item, i) => (
                      <Row key={i}>
                        <Col className="mt-2" span={4}>
                          <Text strong>{item}</Text>
                        </Col>
                        <Col span={6}>
                          <FormItem label="Fixed" {...layout}>
                            {getFieldDecorator(item + 'Fixed', {
                              rules: [
                                {
                                  required: true,
                                  message: 'Please enter your Distribution codes',
                                },
                              ],
                            })(
                              <InputNumber
                                initialValue={100}
                                min={0}
                                max={100}
                                formatter={value => `${value}%`}
                                parser={value => value.replace('%', '')}
                              />
                            )}
                          </FormItem>
                        </Col>
                        <Col span={6}>
                          <FormItem label="Amount" {...layout}>
                            {getFieldDecorator(item + 'Amount', {
                              rules: [
                                {
                                  required: true,
                                  message: 'Please enter your Distribution codes',
                                },
                              ],
                            })(<InputNumber initialValue={100} min={0} step={0.1} />)}
                          </FormItem>
                        </Col>
                      </Row>
                    ))}
                  </>
                )}
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
