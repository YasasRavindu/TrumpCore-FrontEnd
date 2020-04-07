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
  AutoComplete,
  Select,
} from 'antd';
import QueueAnim from 'rc-queue-anim';
import { CSVReader } from 'react-papaparse';
import axios from 'axios';
import { environment, commonUrl } from '../../../environments';
import { REGEX } from 'constants/validation/regex';

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
    console.log(
      '====show',
      this.state.showBtn,
      this.state.accountListProcessed,
      this.state.selectedAccount
    );
    // let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // if (currentUser.id) {
    //   //console.log(currentUser.id);
    //   axios
    //     .post(environment.baseUrl + 'maintenance/bulkAccount', {
    //       accounts: this.state.csvAccount,
    //       user: {
    //         id: currentUser.id,
    //       },
    //       records: [this.state.accountListProcessed],
    //     })
    //     .then(response => {
    //       console.log('------------------- response - ', response);
    //       this.setState({
    //         showBtn: false,
    //         accountListProcessed: {},
    //         csvAccount: 0,
    //       });
    //     })
    //     .catch(error => {
    //       console.log('------------------- error - ', error);
    //       this.setState({
    //         showBtn: false,
    //         accountListProcessed: {},
    //         csvAccount: 0,
    //       });
    //     });
    // } else {
    //   message.error("Couldn't verify your credentials. Please sign in again and try uploading.");
    // }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { filteredAccountList, filteredCardList, filteredAssignedList } = this.state;
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
              <div className="box-header">Salary Upload</div>
              <div className="box-body">
                <Form>
                  <Row gutter={24}>
                    <Col span={10} order={1}>
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
                            style={{ width: 400 }}
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
                    <Col span={8} order={2}>
                      <CSVReader
                        onDrop={this.onDrop}
                        onError={this.onError}
                        style={{ maxHeight: 140 }}
                        config={{ skipEmptyLines: true }}
                      >
                        <span>Drop CSV file here or click to upload.</span>
                      </CSVReader>
                    </Col>
                    <Col span={6} order={3}>
                      {this.state.showBtn && (
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
        </QueueAnim>
      </div>
    );
  }
}
const WrappedData = Form.create()(Data);
const salaryUpload = () => <WrappedData />;
export default salaryUpload;
