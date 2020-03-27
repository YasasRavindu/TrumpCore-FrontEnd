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
const definedHeader = ['accountNo', 'payment'];
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
      showBtn: false,
      csvObject: {},
      csvAccount: 0,
      accountList: [],
      filteredAccountList: [],
      selectedAccount: undefined,
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

  onDrop = data => {
    console.log('=====data', data);
    this.setState({
      showBtn: false,
    });
    const headerCheck = definedHeader.some(r => data[0].data.indexOf(r) >= 0);

    if (headerCheck) {
      const i = 0;
      const dataList = data
        .slice(0, i)
        .concat(data.slice(i + 1, data.length))
        .map(d => d.data);
      let nullCount = 0;
      dataList.forEach(element => {
        const checkValue = element.includes('');
        if (checkValue) {
          nullCount++;
        }
      });
      if (nullCount === 0) {
        let account = 0;
        let obj = {};
        let dataObject = {};
        dataList.map((data, index) => {
          dataObject = {
            accountNo: data[0],
            payment: data[1],
          };
          obj[index] = dataObject;
          account++;
        });
        //console.log(obj, account);

        if (obj && account > 0) {
          this.setState({
            showBtn: true,
            csvObject: obj,
            csvAccount: account,
          });
        } else {
          message.error('Something Wrong');
        }
      } else {
        message.error(
          'We have identified ' +
            nullCount +
            ' empty values in your CSV file. Please fill them out and upload again.'
        );
      }
    } else {
      message.error("Uploaded csv header doesn't match");
    }
  };

  onError = (err, file, inputElem, reason) => {
    console.log(err);
    message.error(err);
  };

  dataParse = () => {
    console.log(
      '====show',
      this.state.showBtn,
      this.state.csvObject,
      this.state.csvAccount,
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
    //       records: [this.state.csvObject],
    //     })
    //     .then(response => {
    //       console.log('------------------- response - ', response);
    //       this.setState({
    //         showBtn: false,
    //         csvObject: {},
    //         csvAccount: 0,
    //       });
    //     })
    //     .catch(error => {
    //       console.log('------------------- error - ', error);
    //       this.setState({
    //         showBtn: false,
    //         csvObject: {},
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
