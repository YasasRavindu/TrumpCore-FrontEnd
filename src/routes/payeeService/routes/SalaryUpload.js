import React from 'react';
import {
  Icon,
  Upload,
  message,
  Button,
  Table,
  Form,
  Empty,
  Row,
  Col,
  Input,
  Tooltip,
  AutoComplete,
  Select,
} from 'antd';
import QueueAnim from 'rc-queue-anim';
import { CSVReader } from 'react-papaparse';
import axios from 'axios';
import { environment, commonUrl } from '../../../environments';
import { REGEX } from 'constants/validation/regex';
const { Column, ColumnGroup } = Table;
const tableData = [
  { key: 1, id: '1', batchName: '1234567' },
  {
    key: 2,
    id: '2',
    batchName: '2020838',
  },
];

// ! -- Can add more columns.
// ! --'payment' => Name is a constant value and column required
const definedHeader = ['accountNo', 'payment'];

// const formItemLayout = {
//   labelCol: { span: 10 },
//   wrapperCol: { span: 14 },
// };
const FormItem = Form.Item;
const { Option } = Select;

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      accountList: [],
      filteredAccountList: [],
      selectedAccount: undefined,
      showBtn: false,
      accountListProcessed: {},
      salaryTotal: 0,
      BatchDetails: false,
      bulkList: [],
      selectedBulk: null,
      bulkRecordList: [],
    };
  }
  async componentDidMount() {
    this._isMounted = true;
    this.loadData();
  }

  loadData = () => {
    axios
      .post(environment.baseUrl + 'account/filterSearch', {
        status: '',
        context: 'all',
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
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
    axios
      .get(environment.baseUrl + 'bulkPay/getAll')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const bulkList = response.data.content.map(bulk => {
          bulk.key = bulk.id;
          return bulk;
        });
        this._isMounted &&
          this.setState({
            bulkList: bulkList,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
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

  onDrop = recordList => {
    console.log('===== data', recordList);

    this.setState({
      showBtn: false,
    });

    let errorHeaderFormat = false;
    let errorCountNull = 0;
    let errorCountPaymentInvalid = 0;
    let SalaryTotal = 0;
    let records = [];

    //----- Check CSV Headers -----------------------------------------------------------------------
    if (recordList[0] && recordList[0].data && recordList[0].data.length === definedHeader.length) {
      recordList[0].data.map(data => {
        if (definedHeader.indexOf(data) == -1) {
          errorHeaderFormat = true;
        }
      });
    } else {
      errorHeaderFormat = true;
    }
    //-----------------------------------------------------------------------------------------------

    //----- Check CSV Values ------------------------------------------------------------------------
    if (errorHeaderFormat) {
      message.error("Uploaded CSV header doesn't match!");
    } else {
      recordList.slice(1, recordList.length).map((record, index) => {
        let data = record.data;
        let salaryObj = {};

        for (let i = 0; i < definedHeader.length; i++) {
          if (!data[i]) {
            errorCountNull++;
          } else if (definedHeader[i] === 'payment') {
            // if (/^\$?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(.[0-9]{1,2})?$/.test(data[i])) {
            if (REGEX.CURRENCY.test(data[i])) {
              SalaryTotal += +data[i];
            } else {
              errorCountPaymentInvalid++;
            }
          }
          salaryObj[definedHeader[i]] = data[i];
        }

        records[index] = salaryObj;
      });

      if (errorCountNull > 0) {
        message.error(
          'We have identified ' +
            errorCountNull +
            ' empty values in your CSV file. Please fill them out and upload again.'
        );
      } else if (errorCountPaymentInvalid) {
        message.error(
          'We have identified ' +
            errorCountPaymentInvalid +
            ' invalid payment values in your CSV file. Please check them out and upload again.'
        );
      } else {
        console.log(SalaryTotal);
        console.log(records);
        message.success('File Successfully Uploaded!');

        this.setState({
          showBtn: true,
          accountListProcessed: records,
          salaryTotal: SalaryTotal,
        });
      }
    }
    //-----------------------------------------------------------------------------------------------

    // this.setState({
    //   showBtn: false,
    // });

    // const headerCheck = definedHeader.some(r => recordList[0].data.indexOf(r) >= 0);

    // if (headerCheck) {
    //   const i = 0;
    //   const dataList = recordList
    //     .slice(0, i)
    //     .concat(recordList.slice(i + 1, recordList.length))
    //     .map(d => d.data);

    //   console.log('=====dataList', dataList);

    //   let nullCount = 0;
    //   dataList.forEach(element => {
    //     const checkValue = element.includes('');
    //     if (checkValue) {
    //       nullCount++;
    //     }
    //   });
    //   if (nullCount === 0) {
    //     let account = 0;
    //     let obj = {};
    //     let dataObject = {};
    //     dataList.map((data, index) => {
    //       dataObject = {
    //         accountNo: data[0],
    //         payment: data[1],
    //       };
    //       obj[index] = dataObject;
    //       account++;
    //     });
    //     //console.log(obj, account);

    //     if (obj && account > 0) {
    //       this.setState({
    //         showBtn: true,
    //         accountListProcessed: obj,
    //         csvAccount: account,
    //       });
    //     } else {
    //       message.error('Something Wrong');
    //     }
    //   } else {
    //     message.error(
    //       'We have identified ' +
    //         nullCount +
    //         ' empty values in your CSV file. Please fill them out and upload again.'
    //     );
    //   }
    // } else {
    //   message.error("Uploaded csv header doesn't match");
    // }
  };

  onError = (err, file, inputElem, reason) => {
    console.log(err);
    message.error(err);
  };

  dataParse = () => {
    let { salaryTotal, selectedAccount, accountListProcessed } = this.state;

    axios
      .post(environment.baseUrl + 'bulkPay', {
        total: salaryTotal,
        debitAccount: {
          id: selectedAccount.id,
        },
        records: accountListProcessed,
      })
      .then(response => {
        console.log('------------------- response - ', response);
        this.setState({
          showBtn: false,
          accountListProcessed: {},
          salaryTotal: 0,
          selectedAccount: undefined,
        });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
        this.setState({
          showBtn: false,
          accountListProcessed: {},
          salaryTotal: 0,
          selectedAccount: undefined,
        });
      });
  };

  viewAccount(bulk) {
    console.log('======== id', bulk);
    this._isMounted &&
      this.setState({
        BatchDetails: true,
        selectedBulk: bulk,
      });

    axios
      .get(environment.baseUrl + 'bulkPay/' + bulk.id + '/true/true/all')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const bulkRecordList = response.data.content.map(bulk => {
          bulk.key = bulk.id;
          return bulk;
        });
        this._isMounted &&
          this.setState({
            bulkRecordList: bulkRecordList,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { filteredAccountList, bulkList, selectedBulk, bulkRecordList } = this.state;
    const optionsAccounts = filteredAccountList.map(account => (
      <Option key={account.id} value={account.id}>
        {`${account.accountNumber} - ${account.holder}`}
      </Option>
    ));
    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          {selectedBulk === null && (
            <React.Fragment>
              <div key="1">
                <div className="box box-default mb-4">
                  <div className="box-header">Salary Upload</div>
                  <div className="box-body">
                    <Form>
                      <Row gutter={24}>
                        <Col span={12} order={1}>
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
                                //style={{ width: 400 }}
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
                        <Col span={12} order={2}>
                          <CSVReader
                            onDrop={this.onDrop}
                            onError={this.onError}
                            style={{ maxHeight: 140 }}
                            config={{ skipEmptyLines: true }}
                          >
                            <span>Drop CSV file here or click to upload.</span>
                          </CSVReader>
                          {this.state.showBtn && this.state.selectedAccount && (
                            <Button
                              type="primary"
                              className="float-right mt-2"
                              onClick={() => this.dataParse()}
                            >
                              submit
                            </Button>
                          )}
                        </Col>
                      </Row>
                    </Form>
                  </div>
                </div>
              </div>
              <div key="2">
                <div className="box box-default mb-4">
                  <div className="box-header">Bulk Table</div>
                  <div className="box-body">
                    <article className="article mt-2">
                      <Table dataSource={bulkList}>
                        <Column
                          title="Name"
                          dataIndex="debitAccount.holder"
                          key="debitAccount.holder"
                        />
                        <Column
                          title="Account"
                          dataIndex="debitAccount.accountNumber"
                          key="debitAccount.accountNumber"
                        />
                        <Column title="Total" dataIndex="total" key="total" align="right" />
                        <Column title="Total Records" dataIndex="count" key="count" align="right" />
                        <Column
                          title="Success Records"
                          dataIndex="successCount"
                          key="successCount"
                          align="right"
                        />
                        <Column title="Status" dataIndex="status" key="status" align="center" />
                        <Column
                          title="Action"
                          key="action"
                          render={(text, record) => (
                            <span>
                              <Tooltip title="View">
                                <Icon onClick={() => this.viewAccount(record)} type="menu-unfold" />
                              </Tooltip>
                            </span>
                          )}
                        />
                      </Table>
                    </article>
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}
          {selectedBulk && bulkRecordList.length > 0 && (
            <div key="3">
              <h3>Bulk Details</h3>
              <div className="row text-center mt-3">
                <div className="col-xl-3 col-sm-6">
                  <div className="number-card-v2 mb-3">
                    <span className="icon-btn icon-btn-round icon-btn-lg text-white bg-success">
                      <Icon type="like-o" />
                    </span>
                    <div className="box-info">
                      <p className="box-num">
                        16 <span className="size-h4">%</span>
                      </p>
                      <p className="text-muted">Pass</p>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-sm-6">
                  <div className="number-card-v2 mb-3">
                    <span className="icon-btn icon-btn-round icon-btn-lg text-white bg-danger">
                      <Icon type="dislike-o" />
                    </span>
                    <div className="box-info">
                      <p className="box-num">
                        16 <span className="size-h4">%</span>
                      </p>
                      <p className="text-muted">Fail</p>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-sm-6">
                  <div className="number-card-v2 mb-3">
                    <span className="icon-btn icon-btn-round icon-btn-lg text-white bg-info">
                      <Icon type="plus-square-o" />
                    </span>
                    <div className="box-info">
                      <p className="box-num">
                        16 <span className="size-h4">%</span>
                      </p>
                      <p className="text-muted">Total</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="box box-default mb-4">
                  <div className="box-header">Bulk Details</div>
                  <div className="box-body">
                    <article className="article mt-2">
                      <Table dataSource={bulkRecordList}>
                        <Column
                          title="Account No"
                          dataIndex="creditAccount.accountNumber"
                          key="creditAccount.accountNumber"
                        />
                        <Column title="Payment" dataIndex="payment" key="payment" align="right" />
                        <Column title="Remark" dataIndex="tcRemarks" key="tcRemarks" />
                        <Column title="TC Fail" dataIndex="tcFail" key="tcFail" />
                        <Column title="IB Fail" dataIndex="ibFail" key="ibFail" />
                        <Column
                          title="Action"
                          key="action"
                          render={(text, record) => (
                            <span>
                              <Tooltip title="View">
                                <Icon
                                  onClick={() => this.viewAccount(record.id)}
                                  type="menu-unfold"
                                />
                              </Tooltip>
                            </span>
                          )}
                        />
                      </Table>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          )}
        </QueueAnim>
      </div>
    );
  }
}
const WrappedData = Form.create()(Data);
const salaryUpload = () => <WrappedData />;
export default salaryUpload;
