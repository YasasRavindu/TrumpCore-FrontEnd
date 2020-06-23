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
  Upload,
  Tooltip,
  AutoComplete,
  Spin,
} from 'antd';
import axios from 'axios';
import { environment, commonUrl } from 'environments';
const Search = Input.Search;
const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;
const confirm = Modal.confirm;

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      accountList: [],
      filteredAccountList: [],
      selectedAccount: undefined,
      loading: false,
      recordList: [],
      loadFilterRecordList: [],
      searchText: '',
      tableLoading: false,
      editRecordId: undefined,
      visible: false,
      confirmLoading: false,
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    this.loadData();
  }

  loadData = () => {
    this._isMounted &&
      this.setState({
        loading: true,
        tableLoading: true,
      });
    axios
      .post(environment.baseUrl + 'account/filterSearch', {
        status: '1',
        context: 'filter',
        cardAssigned: '',
      })
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const accountList = response.data.content.map(account => {
          account.key = account.id;
          return account;
        });
        this._isMounted &&
          this.setState({
            accountList: accountList,
            loading: false,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
        this._isMounted &&
          this.setState({
            loading: false,
          });
      });

    axios
      .get(environment.baseUrl + 'ipg/all')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const recordList = response.data.content.map(report => {
          report.key = report.id;
          return report;
        });
        this._isMounted &&
          this.setState({
            recordList: recordList,
            loadFilterRecordList: recordList,
            tableLoading: false,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
        this._isMounted &&
          this.setState({
            tableLoading: false,
          });
      });
  };

  updateAccountList = input => {
    let accountList;
    if (input === '' || input === undefined) {
      accountList = this.state.accountList;
    } else {
      accountList = this.state.accountList.filter(account => {
        return account.accountNumber.indexOf(input) !== -1 || account.holder.indexOf(input) !== -1;
      });
    }
    this.setState({
      filteredAccountList: accountList.slice(0, 100),
    });
  };
  setAccount = inputValue => {
    let selectedAccount = undefined;
    this.state.accountList.map(account => {
      if (
        inputValue !== undefined &&
        (account.id.toUpperCase() === inputValue.toUpperCase() ||
          account.accountNumber.toUpperCase() === inputValue.toUpperCase() ||
          inputValue.toUpperCase().includes(account.accountNumber.toUpperCase()))
      ) {
        selectedAccount = account;
        // this.showAccountDetail(account);
      }
    });
    if (selectedAccount === undefined) {
      this.updateAccountList('');
    }
    this.setState({
      selectedAccount: selectedAccount,
    });
    this.props.form.setFieldsValue({
      accountNumber:
        selectedAccount === undefined
          ? ''
          : `${selectedAccount.accountNumber} - ${selectedAccount.holder}`,
    });
  };

  toggleModal = record => {
    this.setState({
      editRecordId: record.id,
      visible: true,
    });
  };

  handleCancel = e => {
    // console.log(e);
    this.setState({
      editRecordId: undefined,
      visible: false,
    });
    this.props.form.resetFields();
  };

  updateUrl = () => {
    this.props.form.validateFields(['edit_successUrl', 'edit_failUrl'], (err, values) => {
      this.setState({
        confirmLoading: true,
      });
      if (!err) {
        axios
          .put(environment.baseUrl + 'ipg/update/' + this.state.editRecordId, {
            successUrl: values.edit_successUrl,
            failUrl: values.edit_failUrl,
          })
          .then(response => {
            console.log('------------------- response - ', response.data.content);
            message.success("URL's were successfully updated");
            this.loadData();
            this.setState({
              editRecordId: undefined,
              visible: false,
              confirmLoading: false,
            });
            this.props.form.resetFields();
          })
          .catch(error => {
            console.log('------------------- error - ', error);
            //message.error(getErrorMessage(error, 'SCHEDULE_REPORT_ERROR'));
            message.error('Something wrong');
            this.setState({
              editRecordId: undefined,
              visible: false,
              confirmLoading: false,
            });
            this.props.form.resetFields();
          });
      } else {
        this.setState({
          confirmLoading: false,
        });
      }
    });
  };

  searchTextHandler = e => {
    this.scheduleDataFilter('searchText', e.target.value);
  };

  scheduleDataFilter = (key, value) => {
    this.setState(
      {
        [key]: value,
      },
      () => {
        let data = this.state.recordList;
        let searchText = this.state.searchText;
        if (searchText) {
          let returnable;
          data = data.filter(d => {
            returnable = true;
            if (returnable && searchText) {
              if (d.account !== null) {
                returnable =
                  d.account.holder.toLowerCase().includes(searchText.toLowerCase()) ||
                  d.successUrl.toLowerCase().includes(searchText.toLowerCase()) ||
                  d.failUrl.toLowerCase().includes(searchText.toLowerCase());
              } else {
                returnable =
                  d.successUrl.toLowerCase().includes(searchText.toLowerCase()) ||
                  d.failUrl.toLowerCase().includes(searchText.toLowerCase());
              }
            }
            return returnable;
          });
        }

        this.setState({
          loadFilterRecordList: data,
        });
      }
    );
  };

  submit = e => {
    e.preventDefault();
    const { selectedAccount } = this.state;
    this.props.form.validateFieldsAndScroll(['successUrl', 'failUrl'], (err, values) => {
      if (!err && selectedAccount !== undefined) {
        console.log(values.successUrl, values.failUrl, selectedAccount);
        axios
          .post(environment.baseUrl + 'ipg/create', {
            successUrl: values.successUrl,
            failUrl: values.failUrl,
            account: {
              id: selectedAccount.id,
            },
          })
          .then(response => {
            message.success('Successfully created IPG records');
            console.log('------------------- response - ', response);
            this.loadData();
            this.props.form.resetFields();
          })
          .catch(error => {
            //message.error(getErrorMessage(error, 'DEVICE_ASSIGN_ERROR'));
            message.error('IPG creation error');
            console.log('------------------- error - ', error);
          });
      } else {
        message.error('Please fill the Success Url,Fail Url and Account number');
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { filteredAccountList } = this.state;
    const optionsAccounts = filteredAccountList.map(account => (
      <Option key={account.id} value={account.id}>
        {`${account.accountNumber} - ${account.holder}`}
      </Option>
    ));
    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div key="1">
            <div className="box box-default mb-4">
              <div className="box-header">IPG Service Management</div>
              <div className="box-body">
                {/* <Spin spinning={this.state.loaderForm}> */}
                <Form>
                  <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                    <Col span={6} order={1}>
                      <FormItem>
                        {getFieldDecorator('accountNumber', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter your account number or name',
                            },
                          ],
                        })(
                          // <Input placeholder="Account Number" />
                          <AutoComplete
                            dataSource={optionsAccounts}
                            style={{ width: 250 }}
                            placeholder="Account Number"
                            onBlur={inputValue => {
                              this.setAccount(inputValue);
                            }}
                            onChange={inputValue => {
                              this.updateAccountList(inputValue);
                            }}
                            onSelect={inputValue => {
                              this.setAccount(inputValue);
                            }}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={9} order={2}>
                      <FormItem>
                        {getFieldDecorator('successUrl', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter Success Url',
                            },
                            {
                              type: 'url',
                              message: 'This field must be a valid url.',
                            },
                          ],
                        })(<Input placeholder="Success Url" />)}
                      </FormItem>
                    </Col>
                    <Col span={9} order={3}>
                      <FormItem>
                        {getFieldDecorator('failUrl', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter fail Url.',
                            },
                            {
                              type: 'url',
                              message: 'This field must be a valid url.',
                            },
                          ],
                        })(<Input placeholder="Fail Url" />)}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24} order={4}>
                      <Button
                        type="primary"
                        className="float-right"
                        loading={this.state.loading}
                        onClick={this.submit}
                      >
                        Create
                      </Button>
                    </Col>
                  </Row>
                </Form>
                {/* </Spin> */}
              </div>
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
                    <Column
                      title="Status"
                      dataIndex="active"
                      key="active"
                      render={active =>
                        active ? (
                          <Tag color="blue">Active</Tag>
                        ) : (
                          <Tag color="magenta">Deactive</Tag>
                        )
                      }
                    />
                    <Column
                      title="Action"
                      key="action"
                      render={(text, record) => (
                        <>
                          <span>
                            <Tooltip title="Update" className="mr-3">
                              <Icon onClick={() => this.toggleModal(record)} type="edit" />
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

        <Modal
          onOk={this.updateUrl}
          confirmLoading={this.state.confirmLoading}
          onCancel={this.handleCancel}
          title="Update URL's"
          visible={this.state.visible}
          width="500px"
        >
          <Form>
            <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
              <Col span={24}>
                <FormItem>
                  {getFieldDecorator('edit_successUrl', {
                    rules: [
                      {
                        required: true,
                        message: 'Please enter Success Url',
                      },
                      {
                        type: 'url',
                        message: 'This field must be a valid url.',
                      },
                    ],
                  })(<Input size="default" placeholder="Success Url" />)}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('edit_failUrl', {
                    rules: [
                      {
                        required: true,
                        message: 'Please enter Fail Url',
                      },
                      {
                        type: 'url',
                        message: 'This field must be a valid url.',
                      },
                    ],
                  })(<Input size="default" placeholder="Fail Url" />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  }
}

const WrappedData = Form.create()(Data);

const Management = () => <WrappedData />;

export default Management;
