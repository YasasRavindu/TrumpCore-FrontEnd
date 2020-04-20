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
  Checkbox,
  Modal,
  Spin,
  Badge,
} from 'antd';
import { green, red, orange, blue } from '@ant-design/colors';
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
const bulkStatus = {
  0: { status: 'OnPremise', color: blue[4] },
  1: { status: 'Deliver', color: green[4] },
  2: { status: 'Deliver with Error', color: red[4] },
};
const bulkRecordStatus = {
  0: { status: 'OnPremise', color: blue[4] },
  1: { status: 'Switch Failure', color: orange[4] },
  2: { status: 'Core Bank Failure', color: red[4] },
  3: { status: 'Success', color: green[4] },
};
const bulkRecordFilters = {
  0: { label: 'All', tcFail: false, ibFail: false, searchType: 'all' },
  // 1: { label: 'OnPremise', tcFail: false, ibFail: false, searchType: 'filter' },
  // 2: { label: 'Switch Failure', tcFail: true, ibFail: false, searchType: 'filter' },
  // 3: { label: 'Core Bank Failure', tcFail: false, ibFail: true, searchType: 'filter' },
  // 4: { label: 'Success', tcFail: false, ibFail: false, searchType: 'filter' },
};

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
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
      bulkList: [],
      selectedBulk: null,
      bulkRecordList: [],
      // cbAll: true,
      // cbTCFail: false,
      // cbIBFail: false,
      filterValue: 0,
      visible: false,
      selectedRecord: null,
      loaderCsvUpload: false,
      loaderBulkTable: false,
      loaderRecordTable: false,
      loaderRecordModal: false,
      bulkSuccessRecordCount: 0,
      bulkFailRecordCount: 0,
      bulkOnPremiseRecordCount: 0,
    };
  }
  async componentDidMount() {
    this._isMounted = true;
    this.loadAccountData();
    this.loadBulkData();
  }

  loadAccountData = () => {
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
            accountList: response.data.content,
            filteredAccountList: response.data.content.slice(0, 100),
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

  loadBulkData = () => {
    this.setState({
      loaderBulkTable: true,
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
            loaderBulkTable: false,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  onDrop = recordList => {
    console.log('===== data', recordList);

    this._isMounted &&
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
        message.success('File Successfully Uploaded!');

        this._isMounted &&
          this.setState({
            showBtn: true,
            accountListProcessed: records,
            salaryTotal: SalaryTotal,
          });
      }
    }
    //-----------------------------------------------------------------------------------------------
  };

  onError = (err, file, inputElem, reason) => {
    console.log(err);
    message.error(err);
  };

  csvDataProceed = () => {
    let { salaryTotal, selectedAccount, accountListProcessed } = this.state;

    this.setState({
      loaderCsvUpload: true,
    });

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
        message.success('Bulk Upload Success!');
        this.pageReset();
      })
      .catch(error => {
        console.log('------------------- error - ', error);
        this.pageReset();
        message.error('Bulk Upload Failed!');
      });
  };

  pageReset = () => {
    // this._isMounted &&
    //   this.setState({
    //     showBtn: false,
    //     accountListProcessed: {},
    //     salaryTotal: 0,
    //     selectedAccount: undefined,
    //     loaderCsvUpload: false,
    //   });
    // this.updateAccountList('');
    // this.loadBulkData();
    window.location.reload(false);
  };
  
  // resetForm(){
  //   window.location.reload(false);
  // }


  onFilterChange = v => {
    console.log(v);

    this.setState(
      {
        filterValue: v,
      },
      () => {
        this.viewBulk(this.state.selectedBulk);
      }
    );
  };

  // checkBoxChange = event => {
  //   let { cbAll, cbTCFail, cbIBFail } = this.state;
  //   let name = event.target.name;
  //   let value = event.target.checked;
  //   console.log(value);

  //   let cbAllValue = false;
  //   let cbTCFailValue = cbTCFail;
  //   let cbIBFailValue = cbIBFail;

  //   if (name === 'cbAll' && value) {
  //     cbAllValue = true;
  //     cbTCFailValue = cbIBFailValue = false;
  //   }

  //   if (name === 'cbTCFail') {
  //     if (value) {
  //       cbTCFailValue = true;
  //     } else {
  //       cbTCFailValue = false;
  //     }
  //   } else if (name === 'cbIBFail') {
  //     if (value) {
  //       cbIBFailValue = true;
  //     } else {
  //       cbIBFailValue = false;
  //     }
  //   }

  //   if (this.state[event.target.name] !== event.target.checked) {
  //     this._isMounted &&
  //       this.setState(
  //         {
  //           cbAll: cbAllValue,
  //           cbTCFail: cbTCFailValue,
  //           cbIBFail: cbIBFailValue,
  //         },
  //         () => {
  //           if (this.state.selectedBulk) {
  //             this.viewBulk(this.state.selectedBulk);
  //           }
  //         }
  //       );
  //   }
  // };

  viewBulk = bulk => {
    console.log('======== id', bulk);

    let { filterValue } = this.state;
    let cbValue = bulkRecordFilters[filterValue];

    this._isMounted &&
      this.setState({
        selectedBulk: bulk,
        loaderRecordTable: true,
        bulkSuccessRecordCount: 0,
        bulkFailRecordCount: 0,
        bulkOnPremiseRecordCount: 0,
      });

    let url = `${environment.baseUrl}bulkPay/${bulk.id}/${cbValue.tcFail}/${cbValue.ibFail}/${cbValue.searchType}`;

    axios
      .get(url)
      .then(response => {
        console.log('------------------- response - ', response.data.content);

        let bulkSuccessRecordCount = 0;
        let bulkFailRecordCount = 0;
        let bulkOnPremiseRecordCount = 0;

        const bulkRecordList = response.data.content.map(record => {
          record.key = record.id;

          let status = 0;
          if (record.tcFail) {
            status = 1;
            bulkFailRecordCount++;
          } else if (record.ibFail) {
            status = 2;
            bulkFailRecordCount++;
          } else if (record.success) {
            status = 3;
            bulkSuccessRecordCount++;
          } else {
            bulkOnPremiseRecordCount++;
          }

          record.status = status;
          return record;
        });
        this._isMounted &&
          this.setState({
            bulkRecordList: bulkRecordList,
            loaderRecordTable: false,
            bulkSuccessRecordCount: bulkSuccessRecordCount,
            bulkFailRecordCount: bulkFailRecordCount,
            bulkOnPremiseRecordCount: bulkOnPremiseRecordCount,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
        message.error('Something went wrong with bulk view!');
      });
  };

  proceedBulk = bulk => {
    console.log('======== id', bulk);

    this.setState({
      loaderBulkTable: true,
    });
    axios
      .get(environment.baseUrl + 'bulkPay/proceedBulkPay/' + bulk.id)
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        message.success('Bulk Salary Process Started. The Process is running in background!');
        this.selectedBulk ? this.viewBulk() : this.loadBulkData();
      })
      .catch(error => {
        console.log('------------------- error - ', error);
        message.error('Bulk Proceed Failed!');
        this.selectedBulk ? this.viewBulk() : this.loadBulkData();
      });
  };

  proceedRecord = record => {
    this.setState({
      loaderRecordTable: true,
    });
    console.log('======== id', record);
    axios
      .get(environment.baseUrl + 'bulkPay/proceedSingle/' + record.id)
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        message.success('Bulk Record Proceed Success!');
        this.viewBulk(this.state.selectedBulk);
      })
      .catch(error => {
        console.log('------------------- error - ', error);
        message.error('Bulk Record Proceed Failed!');
        this.viewBulk(this.state.selectedBulk);
      });
  };

  pageBack = () => {
    this._isMounted &&
      this.setState({
        selectedBulk: null,
        bulkRecordList: [],
      });
  };

  toggleModal = record => {
    if (record) {
      this.props.form.setFieldsValue({
        accountNumber:
          record.creditAccount && record.creditAccount.accountNumber
            ? record.creditAccount.accountNumber
            : '',
        payment: record.payment ? record.payment : '',
      });
      this.setAccount(
        record.creditAccount && record.creditAccount.accountNumber
          ? record.creditAccount.accountNumber
          : ''
      );
      this._isMounted &&
        this.setState({
          visible: true,
          selectedRecord: record,
        });
    } else {
      this._isMounted &&
        this.setState({
          visible: false,
          selectedRecord: null,
          loaderRecordModal: false,
        });

      this.setAccount('');
    }
  };

  updateRecord = e => {
    console.log('Update');
    let { selectedBulk, selectedRecord, selectedAccount } = this.state;
    e.preventDefault();

    this.setState({
      loaderRecordModal: true,
    });

    this.props.form.validateFields(['accountNumber', 'payment'], (err, values) => {
      if (!err && selectedAccount && selectedBulk) {
        axios
          .put(environment.baseUrl + `bulkPay/${selectedBulk.id}/${selectedRecord.id}`, {
            payment: values.payment,
            creditAccountNo: selectedAccount.accountNumber,
            creditAccount: {
              id: selectedAccount.id,
            },
          })
          .then(response => {
            console.log('------------------- response - ', response);
            message.success('Bulk Record Update Success!');
            this.viewBulk(this.state.selectedBulk);
            this.toggleModal(undefined);
          })
          .catch(error => {
            console.log('------------------- error - ', error);
            message.error('Bulk Record Update Failed!');
            this.viewBulk(this.state.selectedBulk);
            this.toggleModal(undefined);
          });
      } else {
        console.log('Error with Record Update!');
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      visible,
      filteredAccountList,
      bulkList,
      selectedBulk,
      bulkRecordList,
      bulkSuccessRecordCount,
      bulkFailRecordCount,
      bulkOnPremiseRecordCount,
      filterValue,
      bulkRecordFilters,
    } = this.state;

    let optionsAccounts = null;
    if (!visible) {
      optionsAccounts = filteredAccountList.map(account => (
        <Option key={account.id} value={account.id}>
          {`${account.accountNumber} - ${account.holder}`}
        </Option>
      ));
    }

    let optionsAccounts2 = null;
    if (visible) {
      optionsAccounts2 = filteredAccountList
        .map(account => {
          if (
            selectedBulk &&
            selectedBulk.debitAccount &&
            account.accountNumber !== selectedBulk.debitAccount.accountNumber
          ) {
            return (
              <Option key={account.id} value={account.id}>
                {`${account.accountNumber} - ${account.holder}`}
              </Option>
            );
          }
        })
        .filter(item => item);
    }

    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          {selectedBulk === null && (
            <React.Fragment>
              <div key="1">
                <Spin spinning={this.state.loaderCsvUpload}>
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
                                onClick={() => this.csvDataProceed()}
                              >
                                Proceed
                              </Button>
                            )}
                          </Col>
                        </Row>
                      </Form>
                    </div>
                  </div>
                </Spin>
              </div>
              <div key="2">
                <div className="box box-default mb-4">
                  <div className="box-header">Bulk Table</div>
                  <div className="box-body">
                    <article className="article mt-2">
                      <Spin spinning={this.state.loaderBulkTable}>
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
                          <Column
                            title="Total Records"
                            dataIndex="count"
                            key="count"
                            align="right"
                          />
                          {/* <Column
                            title="Success Records"
                            dataIndex="successCount"
                            key="successCount"
                            align="right"
                          /> */}
                          {/* <Column title="Status" dataIndex="status" key="status" align="center" /> */}
                          <Column
                            title="Status"
                            key="status"
                            align="center"
                            render={(text, record) => (
                              <Badge
                                count={bulkStatus[record.status].status}
                                style={{ backgroundColor: bulkStatus[record.status].color }}
                              />
                            )}
                          />
                          <Column
                            title="Action"
                            key="action"
                            render={(text, record) => (
                              <>
                                <span>
                                  <Tooltip title="View">
                                    <Icon onClick={() => this.viewBulk(record)} type="bars" />
                                  </Tooltip>
                                </span>
                                {/* {record.status === 0 && record.count === record.successCount && (
                                  <span className="ml-3">
                                    <Tooltip title="Proceed">
                                      <Icon
                                        onClick={() => this.proceedBulk(record)}
                                        type="play-circle-o"
                                      />
                                    </Tooltip>
                                  </span>
                                )} */}
                              </>
                            )}
                          />
                        </Table>
                      </Spin>
                    </article>
                  </div>
                </div>
              </div>
            </React.Fragment>
          )}
          {selectedBulk && (
            <div key="3">
              <h3>
                Bulk Details
                <Button
                  type="primary"
                  shape="round"
                  icon="arrow-left"
                  onClick={() => this.pageBack()}
                  className="float-right ml-1"
                >
                  Back
                </Button>
              </h3>
              <div className="row text-center mt-3">
                <div className="col-xl-3 col-sm-6">
                  <div className="number-card-v2 mb-3">
                    <span className="icon-btn icon-btn-round icon-btn-lg text-white bg-warning">
                      <Icon type="plus-square-o" />
                    </span>
                    <div className="box-info">
                      <p className="box-num">{selectedBulk.count}</p>
                      <p className="text-muted">Total</p>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-sm-6">
                  <div className="number-card-v2 mb-3">
                    <span className="icon-btn icon-btn-round icon-btn-lg text-white bg-success">
                      {/* <Icon type="like-o" /> */}
                      <Icon type="smile-o" />
                    </span>
                    <div className="box-info">
                      {/* <p className="box-num">{selectedBulk.successCount}</p> */}
                      <p className="box-num">{bulkSuccessRecordCount}</p>
                      <p className="text-muted">Success</p>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-sm-6">
                  <div className="number-card-v2 mb-3">
                    <span className="icon-btn icon-btn-round icon-btn-lg text-white bg-danger">
                      {/* <Icon type="dislike-o" /> */}
                      <Icon type="frown-o" />
                    </span>
                    <div className="box-info">
                      <p className="box-num">{bulkFailRecordCount}</p>
                      <p className="text-muted">Fail</p>
                    </div>
                  </div>
                </div>
                <div className="col-xl-3 col-sm-6">
                  <div className="number-card-v2 mb-3">
                    <span className="icon-btn icon-btn-round icon-btn-lg text-white bg-primary">
                      <Icon type="meh-o" />
                    </span>
                    <div className="box-info">
                      <p className="box-num">{bulkOnPremiseRecordCount}</p>
                      <p className="text-muted">OnPremise</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="box box-default mb-4">
                  <div className="box-header">
                    Bulk Details
                    <Button
                      type="primary"
                      shape="round"
                      icon="play-circle-o"
                      disabled={
                        // selectedBulk.status !== 0 ||
                        // selectedBulk.count !== bulkOnPremiseRecordCount
                        selectedBulk.count === bulkSuccessRecordCount || bulkFailRecordCount !== 0
                      }
                      onClick={() => this.proceedBulk(selectedBulk)}
                      className="float-right ml-1"
                    >
                      Proceed Bulk
                    </Button>
                  </div>
                  <div className="box-body">
                    <Row gutter={24}>
                      {/* <Col xs={{ span: 6, offset: 1 }} lg={{ span: 3, offset: 1 }}>
                        <FormItem>
                          <Checkbox
                            name="cbAll"
                            onChange={this.checkBoxChange}
                            checked={this.state.cbAll}
                          >
                            All
                          </Checkbox>
                        </FormItem>
                      </Col>
                      <Col xs={{ span: 6, offset: 1 }} lg={{ span: 3, offset: 1 }}>
                        <FormItem>
                          <Checkbox
                            name="cbTCFail"
                            onChange={this.checkBoxChange}
                            checked={this.state.cbTCFail}
                          >
                            TC Fail
                          </Checkbox>
                        </FormItem>
                      </Col>
                      <Col xs={{ span: 6, offset: 1 }} lg={{ span: 3, offset: 1 }}>
                        <FormItem>
                          <Checkbox
                            name="cbIBFail"
                            onChange={this.checkBoxChange}
                            checked={this.state.cbIBFail}
                          >
                            IB Fail
                          </Checkbox>
                        </FormItem>
                      </Col> */}

                      {/* <Col span={6}>
                        <FormItem label="Records Filter By Status">
                          <Select
                            onChange={this.onFilterChange}
                            value={filterValue}
                            style={{ width: 200 }}
                          >
                            <Option value={0}>All</Option>
                            <Option value={1}>OnPremise</Option>
                            <Option value={2}>TrumpCore Fail</Option>
                            <Option value={3}>Internet Bank Fail</Option>
                            <Option value={4}>Success</Option>
                          </Select>
                        </FormItem>
                      </Col> */}
                    </Row>
                    <article className="article mt-2">
                      <Spin spinning={this.state.loaderRecordTable}>
                        <Table dataSource={bulkRecordList}>
                          <Column
                            title="Account No"
                            key="creditAccount.accountNumber"
                            render={(text, record) => (
                              <>
                                {record && record.creditAccountNo ? (
                                  <span>{record.creditAccountNo}</span>
                                ) : (
                                  <span> -- </span>
                                )}
                              </>
                            )}
                          />
                          <Column title="Payment" dataIndex="payment" key="payment" align="right" />
                          <Column title="Switch Remark" dataIndex="tcRemarks" key="tcRemarks" />
                          <Column title="Core Bank Remark" dataIndex="ibRemarks" key="ibRemarks" />
                          {/* <Column
                            title="TC Fail"
                            key="tcFail"
                            render={(text, record) => (
                              <>
                                {record && record.tcFail ? <span>True</span> : <span> False </span>}
                              </>
                            )}
                          />
                          <Column
                            title="IB Fail"
                            key="ibFail"
                            render={(text, record) => (
                              <>
                                {record && record.ibFail ? <span>True</span> : <span> False </span>}
                              </>
                            )}
                          />
                          <Column
                            title="Success"
                            key="success"
                            render={(text, record) => (
                              <>
                                {record && record.success ? (
                                  <span>True</span>
                                ) : (
                                  <span> False </span>
                                )}
                              </>
                            )}
                          /> */}
                          <Column
                            title="Status"
                            render={(text, record) => (
                              <Badge
                                count={bulkRecordStatus[record.status].status}
                                style={{ backgroundColor: bulkRecordStatus[record.status].color }}
                              />
                            )}
                          />
                          <Column
                            title="Action"
                            key="action"
                            render={(text, record) => (
                              <>
                                {record.status !== 0 && record.status !== 3 && (
                                  <span className="ml-3">
                                    <Tooltip title="View">
                                      <Icon onClick={() => this.toggleModal(record)} type="edit" />
                                    </Tooltip>
                                  </span>
                                )}
                                {record.status === 0 && (
                                  <span className="ml-3">
                                    <Tooltip title="Proceed">
                                      <Icon
                                        onClick={() => this.proceedRecord(record)}
                                        type="play-circle-o"
                                      />
                                    </Tooltip>
                                  </span>
                                )}
                              </>
                            )}
                          />
                        </Table>
                      </Spin>
                    </article>
                  </div>
                </div>
              </div>
            </div>
          )}
        </QueueAnim>

        <Modal
          title="Record Update"
          visible={visible}
          onOk={this.updateRecord}
          confirmLoading={this.state.confirmLoading}
          maskClosable={false}
          onCancel={() => this.toggleModal(undefined)}
          width="300px"
        >
          <Spin spinning={this.state.loaderRecordTable}>
            <Form>
              <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                <Col span={24}>
                  <FormItem>
                    {getFieldDecorator('accountNumber', {
                      rules: [
                        {
                          required: true,
                          message: 'Please enter Account No',
                        },
                      ],
                    })(
                      <AutoComplete
                        dataSource={optionsAccounts2}
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
                <Col span={24}>
                  <FormItem>
                    {getFieldDecorator('payment', {
                      rules: [
                        {
                          required: true,
                          message: 'Please enter Payment',
                        },
                      ],
                    })(<Input placeholder="Payment" />)}
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </Spin>
        </Modal>
      </div>
    );
  }
}
const WrappedData = Form.create()(Data);
const salaryUpload = () => <WrappedData />;
export default salaryUpload;
