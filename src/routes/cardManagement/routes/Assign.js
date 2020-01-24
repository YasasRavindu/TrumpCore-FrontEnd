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
  Badge,
  AutoComplete,
  Tooltip,
  Popconfirm,
} from 'antd';

import { environment, commonUrl } from '../../../environments';
import axios from 'axios';
import Password from 'antd/lib/input/Password';
import CUSTOM_MESSAGE from 'constants/notification/message';
import moment from 'moment';
import { log } from 'util';

const cardStatus = {
  ACTIVE: { color: 'blue', label: 'ACTIVE', value: '1' },
  INACTIVE: { color: '', label: 'INACTIVE', value: '2' },
  LOCKED: { color: 'magenta', label: 'LOCKED', value: '3' },
  CANCELLED: { color: 'magenta', label: 'CANCELLED', value: '4' },
  EXPIRED: { color: 'magenta', label: 'EXPIRED', value: '5' },
};
const dateFormat = 'YYYY-MM-DD';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;

class Data extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cardList: [],
      assignList: [],
      filteredAssignedList: [],
      accountList: [],
      searchDate: ['', ''],
      searchText: '',
      visible: false,
      checkedID: '',
      checkedcardId: '',
      checkedaccountId: '',
    };
  }

  async componentDidMount() {
    this.loadData();
  }

  loadData = () => {
    axios
      .get(environment.baseUrl + 'card/search/debit/inactive')
      .then(response => {
        // console.log('------------------- response - ', response.data.content);
        const cardList = response.data.content.map(device => {
          device.key = device.id;
          return device;
        });
        this.setState({
          cardList: cardList,
        });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
    axios
      .post(environment.baseUrl + 'account/filterSearch', {
        status: '1',
        context: '',
        cardAssigned: '0',
      })
      .then(response => {
        // console.log('------------------- response - ', response.data.content);
        this.setState({
          accountList: response.data.content,
        });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });

    axios
      .get(environment.baseUrl + 'cardRegistry')
      .then(response => {
        // console.log('------------------- response - ', response.data.content);
        const assignList = response.data.content.map(device => {
          device.key = device.id;
          return device;
        });
        this.setState({
          assignList: assignList,
          filteredAssignedList: assignList,
        });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  searchDateHandler = (date, dateString) => {
    this.dataFilter('searchDate', dateString);
  };

  searchTextHandler = e => {
    this.dataFilter('searchText', e.target.value);
  };

  dataFilter = (key, value) => {
    this.setState(
      {
        [key]: value,
      },
      () => {
        let data = this.state.assignList;
        let searchDate = this.state.searchDate;
        let searchText = this.state.searchText;

        if (searchText) {
          data = data.filter(d => {
            return (
              (d.account &&
                (d.account.holder.toLowerCase().includes(searchText.toLowerCase()) ||
                  d.account.accountNumber.toLowerCase().includes(searchText.toLowerCase()))) ||
              (d.card && d.card.cardNo.toLowerCase().includes(searchText.toLowerCase()))
            );
          });
        }

        if (searchDate.length > 0 && searchDate[0] !== '' && searchDate[1] !== '') {
          var startDate = moment(searchDate[0]);
          var endDate = moment(searchDate[1]);
          data = data.filter(d => {
            var date = moment(d.assignedDate);
            return date.isAfter(startDate) && date.isBefore(endDate);
          });
        }

        this.setState({
          filteredAssignedList: data,
        });
      }
    );
  };

  handleUpdate = (id, cardId, accountId) => {
    if (id) {
      this.setState(
        {
          checkedID: id,
          checkedcardId: cardId,
          checkedaccountId: accountId,
        },
        () => {
          this.setState({
            visible: true,
          });
          console.log(this.state);
        }
      );
    }
  };

  assignmentSubmit = e => {
    e.preventDefault();
    const { checkedID, checkedaccountId } = this.state;
    this.props.form.validateFields(['updatecardNumber'], (err, values) => {
      if (!err) {
        axios
          .put(environment.baseUrl + 'cardRegistry/' + checkedID + '/card', {
            account: {
              id: checkedaccountId,
            },
            card: {
              id: values.updatecardNumber,
            },
          })
          .then(response => {
            message.success('Card Successfully Assign to Account');
            console.log('------------------- response - ', response);
            this.loadData();
            this.props.form.resetFields();
            this.setState({
              visible: false,
              checkedID: '',
              checkedcardId: '',
              checkedaccountId: '',
            });
          })
          .catch(error => {
            let msg = null;
            if (
              error &&
              error.response &&
              error.response.data &&
              error.response.data.validationFailures &&
              error.response.data.validationFailures[0] &&
              error.response.data.validationFailures[0].code
            ) {
              let errorCode = error.response.data.validationFailures[0].code;
              console.log('error code', errorCode);

              msg = CUSTOM_MESSAGE.CARD_REGISRTY_ERROR[errorCode];
              if (msg === undefined) {
                msg = CUSTOM_MESSAGE.CARD_REGISRTY_ERROR['defaultError'];
              }
            } else {
              msg = CUSTOM_MESSAGE.CARD_REGISRTY_ERROR['defaultError'];
            }
            message.error(msg);
            console.log('------------------- error - ', error);
          });
      }
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  handleStatus = (id, value) => {
    axios
      .put(environment.baseUrl + 'card/update', {
        id: id,
        status: value,
      })
      .then(response => {
        // console.log('------------------- response - ', response.data.content);
        this.loadData();
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  submit = e => {
    e.preventDefault();
    this.props.form.validateFields(['cardNumber', 'accountNumber'], (err, values) => {
      if (!err) {
        console.log(values);
        axios
          .post(environment.baseUrl + 'cardRegistry', {
            account: {
              id: values.accountNumber,
            },
            card: {
              id: values.cardNumber,
            },
          })
          .then(response => {
            message.success('Card Successfully Assign to Account');
            console.log('------------------- response - ', response);
            this.loadData();
            this.props.form.resetFields();
          })
          .catch(error => {
            let msg = null;
            if (
              error &&
              error.response &&
              error.response.data &&
              error.response.data.validationFailures &&
              error.response.data.validationFailures[0] &&
              error.response.data.validationFailures[0].code
            ) {
              let errorCode = error.response.data.validationFailures[0].code;
              msg = CUSTOM_MESSAGE.CARD_ASSIGN_ERROR[errorCode];
              if (msg === undefined) {
                msg = CUSTOM_MESSAGE.CARD_ASSIGN_ERROR['defaultError'];
              }
            } else {
              msg = CUSTOM_MESSAGE.CARD_ASSIGN_ERROR['defaultError'];
            }
            message.error(msg);
            console.log('------------------- error - ', error);
          });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { accountList, cardList, filteredAssignedList } = this.state;

    const optionsCards = cardList.map(card => (
      <Option key={card.id} value={card.id}>
        {card.cardNo}
      </Option>
    ));

    const optionsAccounts = accountList.map(account => (
      <Option key={account.id} value={account.id}>
        {account.accountNumber}
      </Option>
    ));

    return (
      <div className="container-fluid no-breadcrumb container-mw-xl chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div key="1">
            <div className="box box-default mb-4">
              <div className="box-header">Assign card to account</div>
              <div className="box-body">
                <Form layout="inline">
                  <FormItem>
                    {getFieldDecorator('cardNumber', {
                      rules: [
                        {
                          required: true,
                          message: 'Please enter your card number',
                        },
                      ],
                    })(
                      // (<Input placeholder="Serial Number" />)
                      <AutoComplete
                        allowClear
                        dataSource={optionsCards}
                        style={{ width: 200 }}
                        onBlur={inputValue => {
                          let keyCard = false;
                          cardList.map(card => {
                            if (
                              inputValue !== undefined &&
                              card.id.toUpperCase() === inputValue.toUpperCase()
                            ) {
                              keyCard = true;
                            }
                          });
                          if (!keyCard) {
                            this.props.form.setFieldsValue({
                              cardNumber: '',
                            });
                          }
                        }}
                        placeholder="Card Number"
                        filterOption={(inputValue, option) =>
                          option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !==
                          -1
                        }
                      />
                    )}
                  </FormItem>
                  <FormItem>
                    <Badge
                      count={'Assign to >'}
                      style={{
                        backgroundColor: '#fff',
                        color: '#999',
                        boxShadow: '0 0 0 1px #d9d9d9 inset',
                        marginTop: '10px',
                      }}
                    />
                  </FormItem>

                  <FormItem>
                    {getFieldDecorator('accountNumber', {
                      rules: [
                        {
                          required: true,
                          message: 'Please enter your Account number',
                        },
                      ],
                    })(
                      // <Input placeholder="Account Number" />
                      <AutoComplete
                        dataSource={optionsAccounts}
                        style={{ width: 200 }}
                        onBlur={inputValue => {
                          let keyCard = false;
                          accountList.map(account => {
                            if (
                              inputValue !== undefined &&
                              (account.accountNumber.toUpperCase() === inputValue.toUpperCase() ||
                                account.id.toUpperCase() === inputValue.toUpperCase())
                            ) {
                              keyCard = true;
                            }
                          });
                          if (!keyCard) {
                            this.props.form.setFieldsValue({
                              accountNumber: '',
                            });
                          }
                        }}
                        placeholder="Account Number"
                        filterOption={(inputValue, option) =>
                          option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !==
                          -1
                        }
                      />
                    )}
                  </FormItem>

                  <Button type="primary" className="float-right" onClick={this.submit}>
                    Assign
                  </Button>
                </Form>
              </div>
            </div>
          </div>
          <div key="2">
            <div className="box box-default">
              <div className="box-header">Card Management</div>
              <div className="box-body">
                <Form>
                  <Row gutter={24}>
                    <Col span={8} order={3}>
                      <FormItem>
                        <Input.Search
                          placeholder="input search text"
                          onChange={this.searchTextHandler}
                          style={{ width: 200 }}
                        />
                      </FormItem>
                    </Col>
                    <Col span={8} order={3}>
                      <FormItem {...formItemLayout} label="Date Range">
                        <DatePicker.RangePicker
                          onChange={this.searchDateHandler}
                          format={dateFormat}
                        />
                      </FormItem>
                    </Col>
                  </Row>
                </Form>

                <article className="article mt-2">
                  <Table dataSource={filteredAssignedList}>
                    <Column
                      title="Account Number"
                      dataIndex="account.accountNumber"
                      key="accountNumber"
                    />
                    <Column title="Account Holder" dataIndex="account.holder" key="accountHolder" />
                    <Column title="Card Number" dataIndex="card.cardNo" key="cardNo" />
                    <Column
                      title="Card Status"
                      dataIndex="card.status"
                      key="cardStatus"
                      render={status => (
                        <>
                          {status && (
                            <Tag color={cardStatus[status].color}>{cardStatus[status].label}</Tag>
                          )}
                        </>
                      )}
                    />
                    <Column title="Assigned Date" dataIndex="assignedDate" key="assignedDate" />
                    <Column
                      title="Action"
                      key="action"
                      render={(text, record) => (
                        <span>
                          {record.card.status &&
                            (record.card.status === 'ACTIVE' ||
                              record.card.status === 'LOCKED') && (
                              <>
                                {record.card.status === 'ACTIVE' && (
                                  <>
                                    <Tooltip title="lock">
                                      <Icon
                                        onClick={() => this.handleStatus(record.card.id, 'LOCKED')}
                                        type="lock"
                                      />
                                    </Tooltip>
                                    <Divider type="vertical" />
                                  </>
                                )}
                                {record.card.status === 'LOCKED' && (
                                  <>
                                    <Tooltip title="lock">
                                      <Icon
                                        onClick={() => this.handleStatus(record.card.id, 'ACTIVE')}
                                        type="unlock"
                                      />
                                    </Tooltip>
                                    <Divider type="vertical" />
                                  </>
                                )}
                                <Popconfirm
                                  title="Are you sure delete this assignment?"
                                  onConfirm={() => this.handleStatus(record.card.id, 'CANCELLED')}
                                  okText="Yes"
                                  cancelText="No"
                                >
                                  <Tooltip title="Cancel">
                                    <Icon type="close-circle-o" />
                                  </Tooltip>
                                </Popconfirm>
                              </>
                            )}

                          {record.card.status &&
                            (record.card.status === 'CANCELLED' ||
                              record.card.status === 'EXPIRED') && (
                              <Tooltip title="Assign New Card">
                                <Icon
                                  onClick={() =>
                                    this.handleUpdate(record.id, record.card.id, record.account.id)
                                  }
                                  type="edit"
                                />
                              </Tooltip>
                            )}
                        </span>
                      )}
                    />
                  </Table>
                </article>
                <Modal
                  title="Update card registry"
                  visible={this.state.visible}
                  onOk={this.assignmentSubmit}
                  onCancel={this.handleCancel}
                  okText="Assign"
                  centered
                >
                  <Form>
                    <FormItem>
                      {getFieldDecorator('updatecardNumber', {
                        rules: [
                          {
                            required: true,
                            message: 'Please enter your card number',
                          },
                        ],
                      })(
                        // (<Input placeholder="Serial Number" />)
                        <AutoComplete
                          dataSource={optionsCards}
                          style={{ width: 200 }}
                          onBlur={inputValue => {
                            let keyCard = false;
                            cardList.map(card => {
                              if (
                                inputValue !== undefined &&
                                card.id.toUpperCase() === inputValue.toUpperCase()
                              ) {
                                keyCard = true;
                              }
                            });
                            if (!keyCard) {
                              this.props.form.setFieldsValue({
                                updatecardNumber: '',
                              });
                            }
                          }}
                          placeholder="Card Number"
                          filterOption={(inputValue, option) =>
                            option.props.children
                              .toUpperCase()
                              .indexOf(inputValue.toUpperCase()) !== -1
                          }
                        />
                      )}
                    </FormItem>
                  </Form>
                </Modal>
              </div>
            </div>
          </div>
        </QueueAnim>
      </div>
    );
  }
}
const WrappedData = Form.create()(Data);
const Assign = () => <WrappedData />;
export default Assign;
