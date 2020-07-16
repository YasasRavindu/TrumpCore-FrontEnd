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
import CommonTable from './components/commonTable';
// -------------------------------------------------------------------------

// -------------- ANT DESIGN -----------------------------------------------
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const { Column, ColumnGroup } = Table;
const confirm = Modal.confirm;
// -------------------------------------------------------------------------

// -------------- CUSTOM ---------------------------------------------------
const DATA = {
  TABLE_KEY: {
    1: 'agentTypeID',
    2: 'channelTypeID',
    3: 'distributionTypeID',
    4: 'tc_TransactionTypeID',
  },
  FORM: {
    1: ['agentTypeCode', 'agentTypeName', 'active'],
    2: ['channelType', 'active'],
    3: ['distributionTypeCode', 'distribution', 'active'],
    4: ['tc_TransactionTypeCode', 'tc_TransactionType', 'deductCommision'],
  },
  URL: {
    1: 'commission/agentType',
    2: 'commission/channelType',
    3: 'commission/distributionType',
    4: 'commission/tcTransactionType',
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
      activeKey: '1',
      tableDataList: [],
      selectedRecord: null,
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
          selectedRecord: null,
        },
        () => {
          this.loadTable();
        }
      );
  };

  checkFormStatus = record => {
    let current = this;
    let key = this.state.selectedRecord !== null;

    // -------------- Advanced Validation ----------------------------------
    // let currentFrom = DATA.FORM[this.state.activeKey];
    // for (let i = 0; i < currentFrom.length - 1; i++) {
    //   if (
    //     this.props.form.getFieldValue(currentFrom[i]) !== undefined &&
    //     this.props.form.getFieldValue(currentFrom[i]) !== ''
    //   ) {
    //     console.log(currentFrom[i]);

    //     key = true;
    //     break;
    //   }
    // }
    // ---------------------------------------------------------------------

    if (key) {
      confirm({
        title: 'Do you Want to continue?',
        content: 'Continuing this process will be lost your current form data.',
        onOk() {
          current.onEdit(record);
        },
        onCancel() {},
      });
    } else {
      this.onEdit(record);
    }
  };

  onEdit = record => {
    this._isMounted &&
      this.setState(
        {
          selectedRecord: record,
        },
        () => {
          this.props.form.setFieldsValue(this.getFieldValues(record));
        }
      );
  };

  getFieldValues = record => {
    let param = {};
    DATA.FORM[this.state.activeKey].forEach(field => {
      param[field] = record[field];
    });
    return param;
  };

  onSubmit = () => {
    let { activeKey, selectedRecord } = this.state;
    this.props.form.validateFields(DATA.FORM[this.state.activeKey], (err, values) => {
      if (!err) {
        this._isMounted &&
          this.setState({
            loadingForm: true,
          });

        if (selectedRecord !== null) {
          values[DATA.TABLE_KEY[activeKey]] = selectedRecord[DATA.TABLE_KEY[activeKey]];
        }

        axios
          .post(environment.baseUrl + DATA.URL[activeKey], values)
          .then(response => {
            console.log('------------------- response - ', response.data.content);
            message.success(
              `Record Successfully ${selectedRecord === null ? 'Created' : 'Updated'}.`
            );
            this.props.form.resetFields();
            this._isMounted &&
              this.setState({
                loadingForm: false,
                selectedRecord: null,
              });
            this.loadTable();
          })
          .catch(error => {
            console.log('------------------- error - ', error);
            this.showErrorMsg(error);
            this._isMounted &&
              this.setState({
                loadingForm: false,
              });
          });
      }
    });
  };

  onCancel = () => {
    this.props.form.resetFields();
    this._isMounted &&
      this.setState({
        selectedRecord: null,
      });
  };

  showErrorMsg = error => {
    message.error(getErrorMessage(error, 'COMMISSION_ERROR'));
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    // -------------- GET ACTIVE AUTHORITIES -----------------------------------------
    const viewAuthorities = getActiveAuthorities(USER_AUTHORITY_CODE.COMMISSION_SETUP_ELEMENTS);
    // -------------------------------------------------------------------------------

    // -------------- IF UNAUTHORIZED ------------------------------------------------
    if (viewAuthorities === 'UNAUTHORIZED') {
      return <Redirect to={UNAUTHORIZED_ACCESS_EXCEPTION_ROUTE} />;
    }
    // -------------------------------------------------------------------------------

    // -------------------------------------------------------------------------------
    const { loadingForm, loadingTable, tableDataList, activeKey, selectedRecord } = this.state;
    const { getFieldDecorator } = this.props.form;
    const submitBtn = (
      <Button
        type="primary"
        loading={loadingForm}
        className="float-right"
        onClick={this.onSubmit}
        style={{ marginTop: 43 }}
      >
        {selectedRecord === null ? 'Create' : 'Update'}
      </Button>
    );
    const cancelBtn = (
      <Button
        type=""
        className="float-right mr-4"
        onClick={this.onCancel}
        style={{ marginTop: 43 }}
      >
        Cancel
      </Button>
    );
    // -------------------------------------------------------------------------------

    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div className="box box-default mb-4">
            <Tabs tabPosition="top" onChange={this.tabOnChange}>
              <TabPane tab="Agent Type" key="1">
                <div className="box-body">
                  {activeKey === '1' && (
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
                        <Col xs={10} sm={12} md={12} lg={5}>
                          <FormItem label="Agent Type Status">
                            {getFieldDecorator('active', {
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
                        <Col xs={14} sm={12} md={12} lg={7}>
                          {submitBtn}
                          {cancelBtn}
                        </Col>
                      </Row>
                    </Form>
                  )}
                </div>
              </TabPane>
              <TabPane tab="Channel Type" key="2">
                <div className="box-body">
                  {activeKey === '2' && (
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
                        <Col xs={12} sm={12} md={12} lg={6}>
                          <FormItem label="Channel Type Status">
                            {getFieldDecorator('active', {
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
                        <Col xs={12} sm={24} md={24} lg={12}>
                          {submitBtn}
                          {cancelBtn}
                        </Col>
                      </Row>
                    </Form>
                  )}
                </div>
              </TabPane>
              <TabPane tab="Distribution Type" key="3">
                <div className="box-body">
                  {activeKey === '3' && (
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
                            {getFieldDecorator('distribution', {
                              rules: [
                                {
                                  required: true,
                                  message: 'Distribution type name cannot be empty.',
                                },
                              ],
                            })(<Input style={{ width: '100%' }} />)}
                          </FormItem>
                        </Col>
                        <Col xs={10} sm={12} md={12} lg={5}>
                          <FormItem label="Distribution Type Status">
                            {getFieldDecorator('active', {
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
                        <Col xs={14} sm={12} md={12} lg={7}>
                          {submitBtn}
                          {cancelBtn}
                        </Col>
                      </Row>
                    </Form>
                  )}
                </div>
              </TabPane>
              <TabPane tab="Transaction Type" key="4">
                <div className="box-body">
                  {activeKey === '4' && (
                    <Form>
                      <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
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
                        <Col xs={24} sm={12} md={12} lg={6}>
                          <FormItem label="Transaction Type Name">
                            {getFieldDecorator('tc_TransactionType', {
                              rules: [
                                {
                                  required: true,
                                  message: 'Transaction type name cannot be empty.',
                                },
                              ],
                            })(<Input style={{ width: '100%' }} />)}
                          </FormItem>
                        </Col>
                        <Col xs={10} sm={12} md={12} lg={5}>
                          <FormItem label="Deduct Commission">
                            {getFieldDecorator('deductCommision', {
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
                        <Col xs={14} sm={12} md={12} lg={7}>
                          {submitBtn}
                          {cancelBtn}
                        </Col>
                      </Row>
                    </Form>
                  )}
                </div>
              </TabPane>
            </Tabs>
          </div>
          <div className="box box-default">
            <div className="box-body">
              <article className="article mt-2">
                {/* ------------------------- Table ---------------------------------------------------- */}
                <CommonTable
                  tableDataList={tableDataList}
                  loadingTable={loadingTable}
                  activeKey={activeKey}
                  checkFormStatus={this.checkFormStatus}
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
