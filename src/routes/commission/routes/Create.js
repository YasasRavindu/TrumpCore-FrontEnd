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
import axios from 'axios';
import moment from 'moment';

import { Redirect } from 'react-router-dom';
// -------------- IMPORT AUTHORITY -----------------------------------------
import {
  UNAUTHORIZED_ACCESS_EXCEPTION_ROUTE,
  USER_AUTHORITY_CODE,
  getActiveAuthorities,
  checkAuthority,
} from 'constants/authority/authority';
// -------------------------------------------------------------------------

// -------------- OTHER CUSTOM IMPORTS -------------------------------------
import { environment } from 'environments';
import STATUS from 'constants/notification/status';
import getErrorMessage from 'constants/notification/message';
// -------------------------------------------------------------------------

// -------------- ANT DESIGN -----------------------------------------------
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const { Column, ColumnGroup } = Table;
// -------------------------------------------------------------------------

// -------------- CUSTOM ---------------------------------------------------
const DATA = {
  TABLE_KEY: {
    1: 'agentTypeID',
    2: 'channelTypeID',
    3: 'distributionTypeID',
    4: 'tcTransactionTypeID',
  },
  FORM: {
    1: ['agentTypeCode', 'agentTypeName', 'agentTypeStatus'],
    2: ['channelType', 'channelTypeStatus'],
    3: ['distributionTypeCode', 'distributionTypeName', 'distributionTypeStatus'],
    4: ['transactionTypeCode', 'transactionTypeName', 'transactionTypeStatus'],
  },
  URL: {
    1: 'commission/agentType',
    2: 'commission/channelType',
    3: 'commission/distributionType',
    4: 'commission/tcTransactionType',
  },
  TABLE_HEADER: {
    1: [
      { title: 'Agent Type Code', dataIndex: 'agentTypeCode', key: 'agentTypeCode' },
      { title: 'Agent Type Name', dataIndex: 'agentTypeName', key: 'agentTypeName' },
      {
        title: 'Agent Type Status',
        dataIndex: 'isActive',
        key: 'isActive',
        render: status => (
          <Tag color={STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].color}>
            {STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].label}
          </Tag>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        render: status => (
          <Tooltip title="Edit">
            <Icon
              // onClick={() => this.downloadCsv(record.id, record.createDate)}
              type="edit"
              className="mr-3"
            />
          </Tooltip>
        ),
      },
    ],
    2: [
      { title: 'Channel Type', dataIndex: 'channelType', key: 'channelType' },
      {
        title: 'Channel Type Status',
        dataIndex: 'isActive',
        key: 'isActive',
        render: status => (
          <Tag color={STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].color}>
            {STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].label}
          </Tag>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        render: status => (
          <Tooltip title="Edit">
            <Icon
              // onClick={() => this.downloadCsv(record.id, record.createDate)}
              type="edit"
              className="mr-3"
            />
          </Tooltip>
        ),
      },
    ],
    3: [
      {
        title: 'Distribution Type Code',
        dataIndex: 'distributionTypeCode',
        key: 'distributionTypeCode',
      },
      { title: 'Distribution Type Name', dataIndex: 'distribution', key: 'distribution' },
      {
        title: 'Distribution Type Status',
        dataIndex: 'isActive',
        key: 'isActive',
        render: status => (
          <Tag color={STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].color}>
            {STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].label}
          </Tag>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        render: status => (
          <Tooltip title="Edit">
            <Icon
              // onClick={() => this.downloadCsv(record.id, record.createDate)}
              type="edit"
              className="mr-3"
            />
          </Tooltip>
        ),
      },
    ],
    4: [
      {
        title: 'Transaction Type Code',
        dataIndex: 'tc_TransactionTypeCode',
        key: 'tc_TransactionTypeCode',
      },
      {
        title: 'Transaction Type Name',
        dataIndex: 'tc_TransactionType',
        key: 'tc_TransactionType',
      },
      {
        title: 'Deduct Commission',
        dataIndex: 'isDeductCommision',
        key: 'isDeductCommision',
        render: status => (
          <Tag color={STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].color}>
            {STATUS.COMMON_STATUS_ACTIVE_INACTIVE[status].label}
          </Tag>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        render: status => (
          <Tooltip title="Edit">
            <Icon
              // onClick={() => this.downloadCsv(record.id, record.createDate)}
              type="edit"
              className="mr-3"
            />
          </Tooltip>
        ),
      },
    ],
  },
};
// -------------------------------------------------------------------------

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;

    this.state = {
      loadingForm: false,
      loadingTable: false,
      activeKey: 1,
      tableDataList: [],
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.loadTable();
  }

  loadTable = () => {
    let { activeKey } = this.state;
    this._isMounted &&
      this.setState({
        loadingTable: true,
      });
    axios
      .get(environment.baseUrl + DATA.URL[activeKey] + '/all')
      .then(response => {
        console.log('------------------- response - ', response.data.content);

        const tableDataList = response.data.content.map(record => {
          record.key = record[DATA.TABLE_KEY[activeKey]];
          return record;
        });
        this._isMounted &&
          this.setState({
            tableDataList: tableDataList,
            loadingTable: false,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
        this._isMounted &&
          this.setState({
            loadingTable: false,
          });
      });
  };

  tabOnChange = activeKey => {
    this._isMounted &&
      this.setState(
        {
          activeKey: activeKey,
          tableDataList: [],
        },
        () => {
          this.loadTable();
        }
      );
  };

  submit = () => {
    this.props.form.validateFields(DATA.FORm[this.state.activeKey], (err, values) => {
      if (!err) {
        console.log(values);
      }
    });
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    // -------------- GET ACTIVE AUTHORITIES -----------------------------------------
    // const viewAuthorities = getActiveAuthorities(USER_AUTHORITY_CODE.CARD_GENERATE);
    // -------------------------------------------------------------------------------

    // -------------- IF UNAUTHORIZED ------------------------------------------------
    // if (viewAuthorities === 'UNAUTHORIZED') {
    //   return <Redirect to={UNAUTHORIZED_ACCESS_EXCEPTION_ROUTE} />;
    // }
    // -------------------------------------------------------------------------------

    // -------------------------------------------------------------------------------
    const { loadingForm, loadingTable, tableDataList, activeKey } = this.state;
    const { getFieldDecorator } = this.props.form;
    const columns = DATA.TABLE_HEADER[activeKey];
    // -------------------------------------------------------------------------------

    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div className="box box-default mb-4">
            <Tabs tabPosition="top" onChange={this.tabOnChange}>
              <TabPane tab="Agent Type" key="1">
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
                        <FormItem label="Agent Type Name">
                          {getFieldDecorator('agentTypeName', {
                            rules: [
                              {
                                required: true,
                                message: 'Agent type name cannot be empty.',
                              },
                            ],
                          })(<Input style={{ width: '100%' }} />)}
                        </FormItem>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={6}>
                        <FormItem label="Agent Type Status">
                          {getFieldDecorator('agentTypeStatus', {
                            valuePropName: 'checked',
                            initialValue: true,
                          })(
                            <Switch
                              checkedChildren="Active"
                              unCheckedChildren="Inactive"
                              style={{ width: '120px' }}
                            />
                          )}
                        </FormItem>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={6}>
                        <Button
                          type="primary"
                          loading={loadingForm}
                          className="float-right"
                          onClick={this.submit}
                          style={{ marginTop: 43 }}
                        >
                          Submit
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </TabPane>
              <TabPane tab="Channel type" key="2">
                <div className="box-body">
                  <Form>
                    <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
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
                      <Col xs={12} sm={6} md={6} lg={6}>
                        <FormItem label="Channel Type Status">
                          {getFieldDecorator('channelTypeStatus', {
                            valuePropName: 'checked',
                            initialValue: true,
                          })(
                            <Switch
                              checkedChildren="Active"
                              unCheckedChildren="Inactive"
                              style={{ width: '120px' }}
                            />
                          )}
                        </FormItem>
                      </Col>
                      <Col xs={12} sm={6} md={6} lg={12}>
                        <Button
                          type="primary"
                          loading={loadingForm}
                          className="float-right"
                          onClick={this.submit}
                          style={{ marginTop: 43 }}
                        >
                          Submit
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </TabPane>
              <TabPane tab="Distribution Type" key="3">
                <div className="box-body">
                  <Form>
                    <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                      <Col xs={24} sm={12} md={12} lg={6}>
                        <FormItem label="Distribution Type Code">
                          {getFieldDecorator('distributionTypeCode', {
                            rules: [
                              {
                                required: true,
                                message: 'Distribution type code cannot be empty.',
                              },
                            ],
                          })(<Input style={{ width: '100%' }} />)}
                        </FormItem>
                      </Col>
                      <Col xs={24} sm={12} md={12} lg={6}>
                        <FormItem label="Distribution Type Name">
                          {getFieldDecorator('distributionTypeName', {
                            rules: [
                              {
                                required: true,
                                message: 'Distribution type name cannot be empty.',
                              },
                            ],
                          })(<Input style={{ width: '100%' }} />)}
                        </FormItem>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={6}>
                        <FormItem label="Distribution Type Status">
                          {getFieldDecorator('distributionTypeStatus', {
                            valuePropName: 'checked',
                            initialValue: true,
                          })(
                            <Switch
                              checkedChildren="Active"
                              unCheckedChildren="Inactive"
                              style={{ width: '120px' }}
                            />
                          )}
                        </FormItem>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={6}>
                        <Button
                          type="primary"
                          loading={loadingForm}
                          className="float-right"
                          onClick={this.submit}
                          style={{ marginTop: 43 }}
                        >
                          Submit
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </TabPane>
              <TabPane tab="Transaction Type" key="4">
                <div className="box-body">
                  <Form>
                    <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                      <Col xs={24} sm={12} md={12} lg={6}>
                        <FormItem label="Transaction Type Code">
                          {getFieldDecorator('transactionTypeCode', {
                            rules: [
                              {
                                required: true,
                                message: 'Transaction type code cannot be empty.',
                              },
                            ],
                          })(<Input style={{ width: '100%' }} />)}
                        </FormItem>
                      </Col>
                      <Col xs={24} sm={12} md={12} lg={6}>
                        <FormItem label="Transaction Type Name">
                          {getFieldDecorator('transactionTypeName', {
                            rules: [
                              {
                                required: true,
                                message: 'Transaction type name cannot be empty.',
                              },
                            ],
                          })(<Input style={{ width: '100%' }} />)}
                        </FormItem>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={6}>
                        <FormItem label="Deduct Commission">
                          {getFieldDecorator('transactionTypeStatus', {
                            valuePropName: 'checked',
                            initialValue: true,
                          })(
                            <Switch
                              checkedChildren="Active"
                              unCheckedChildren="Inactive"
                              style={{ width: '120px' }}
                            />
                          )}
                        </FormItem>
                      </Col>
                      <Col xs={12} sm={12} md={12} lg={6}>
                        <Button
                          type="primary"
                          loading={loadingForm}
                          className="float-right"
                          onClick={this.submit}
                          style={{ marginTop: 43 }}
                        >
                          Submit
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                </div>
              </TabPane>
            </Tabs>
          </div>
          <div className="box box-default">
            <div className="box-body">
              <article className="article mt-2">
                {/* ------------------------- Table ---------------------------------------------------- */}
                <Table
                  columns={columns}
                  dataSource={tableDataList}
                  loading={loadingTable}
                  // scroll={{ x: 1500, y: 300 }}
                  className="ant-table-v1"
                />
                {/* ------------------------- ---------------------------------------------------------- */}
              </article>
            </div>
          </div>
        </QueueAnim>
      </div>
    );
  }
}

const WrappedData = Form.create()(Data);

const Create = () => <WrappedData />;

export default Create;
