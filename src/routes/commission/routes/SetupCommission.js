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
  Card,
} from 'antd';
import axios from 'axios';
import { environment } from 'environments';
const FormItem = Form.Item;
const Search = Input.Search;
const { Option } = Select;
const { Column, ColumnGroup } = Table;

const DATA = {
  KEY: {
    1: 'agentTypeID',
    2: 'channelTypeID',
    3: 'distributionTypeID',
    4: 'tc_TransactionTypeID',
  },
  URL: {
    1: 'commission/agentType',
    2: 'commission/channelType',
    3: 'commission/distributionType',
    4: 'commission/tcTransactionType',
  },
  LIST: {
    1: 'agentTypeList',
    2: 'channelTypeList',
    3: 'distributionTypeList',
    4: 'tc_TransactionTypeList',
  },
  FILTERLIST: {
    1: 'filteredAgentTypeList',
    2: 'filteredChannelTypeList',
    3: 'filteredDistributionTypeList',
    4: 'filteredTc_TransactionTypeList',
  },
  SELECTED: {
    1: 'selectedAgent',
    2: 'selectedChannel',
    3: 'selectedDistribution',
    4: 'selectedTc_Transaction',
  },
  ALLDATA: {
    1: {
      id: 'agentTypeID',
      code: 'agentTypeCode',
      name: 'agentTypeName',
      active: 'active',
      field: 'agentType',
    },
    2: { id: 'channelTypeID', name: 'channelType', active: 'active', field: 'channelType' },
    3: {
      id: 'distributionTypeID',
      code: 'distributionTypeCode',
      name: 'distribution',
      active: 'active',
      field: 'distributionCode',
    },
    4: {
      id: 'tc_TransactionTypeID',
      code: 'tc_TransactionTypeCode',
      name: 'tc_TransactionType',
      deduct: 'deductCommision',
      field: 'transactionType',
    },
  },
  OPTION: {
    1: 'Fixed',
    2: 'Percentage',
  },
};

const layout = {
  labelCol: {
    span: 12,
  },
  wrapperCol: {
    span: 12,
  },
};

class Data extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      dCode: [],
      [DATA.LIST[1]]: [],
      [DATA.LIST[2]]: [],
      [DATA.LIST[3]]: [],
      [DATA.LIST[4]]: [],
      [DATA.FILTERLIST[1]]: [],
      [DATA.FILTERLIST[2]]: [],
      [DATA.FILTERLIST[3]]: [],
      [DATA.FILTERLIST[4]]: [],
      [DATA.SELECTED[1]]: undefined,
      [DATA.SELECTED[2]]: undefined,
      [DATA.SELECTED[3]]: undefined,
      [DATA.SELECTED[4]]: undefined,
    };
  }

  async componentDidMount() {
    this._isMounted = true;
    // this.loadData();
    this.loadData(1);
    this.loadData(2);
    this.loadData(3);
    this.loadData(4);
  }

  loadData = type => {
    axios
      .get(environment.baseUrl + DATA.URL[type] + '/all')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const dataList = response.data.content
          .filter(data => data.active || data.deductCommision !== false)
          .map(data => {
            const key = data[DATA.KEY[type]];
            data.key = key;
            return data;
          });

        this._isMounted &&
          this.setState({
            [DATA.LIST[type]]: dataList,
          });
        console.log('---datalist', dataList);
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };
  updateAgentList = (input, key) => {
    let list;

    if (input === '' || input === undefined) {
      list = this.state[DATA.LIST[key]];
    } else {
      if (DATA.LIST[key] === DATA.LIST[2]) {
        list = this.state[DATA.LIST[key]].filter(data => {
          return (
            data[DATA.ALLDATA[key].name].toUpperCase().includes(input.toUpperCase()) ||
            data[DATA.ALLDATA[key].id].includes(input)
          );
        });
      } else {
        list = this.state[DATA.LIST[key]].filter(data => {
          return (
            data[DATA.ALLDATA[key].name].toUpperCase().includes(input.toUpperCase()) ||
            data[DATA.ALLDATA[key].id].includes(input) ||
            data[DATA.ALLDATA[key].code].toUpperCase().includes(input.toUpperCase())
          );
        });
      }
    }

    this.setState({
      [DATA.FILTERLIST[key]]: list.slice(0, 100),
    });
  };

  setAccount = (inputValue, key) => {
    let selected = undefined;

    if (DATA.LIST[key] === DATA.LIST[2]) {
      console.log('------selectedList2', this.state[DATA.LIST[key]]);

      this.state[DATA.LIST[key]].map(data => {
        if (
          inputValue !== undefined &&
          (data[DATA.ALLDATA[key].name].toUpperCase() === inputValue.toUpperCase() ||
            data[DATA.ALLDATA[key].id].includes(inputValue))
        ) {
          selected = data;
        }
      });
    } else {
      console.log('------selectedListall', this.state[DATA.LIST[key]]);
      this.state[DATA.LIST[key]].map(data => {
        if (
          inputValue !== undefined &&
          (data[DATA.ALLDATA[key].code].toUpperCase() === inputValue.toUpperCase() ||
            data[DATA.ALLDATA[key].name].toUpperCase() === inputValue.toUpperCase() ||
            data[DATA.ALLDATA[key].id].includes(inputValue))
        ) {
          selected = data;
          // this.showAccountDetail(account);
        }
      });
    }

    console.log('------selected', selected);
    if (selected === undefined) {
      this.updateAgentList('', key);
    }

    this.setState({
      [DATA.SELECTED[key]]: selected,
    });

    if (DATA.LIST[key] === DATA.LIST[2]) {
      this.props.form.setFieldsValue({
        [DATA.ALLDATA[key].field]:
          selected === undefined ? '' : `${selected[DATA.ALLDATA[key].name]}`,
      });
    } else {
      this.props.form.setFieldsValue({
        [DATA.ALLDATA[key].field]:
          selected === undefined
            ? ''
            : `${selected[DATA.ALLDATA[key].code]} - ${selected[DATA.ALLDATA[key].name]}`,
      });
    }
  };

  handleChange = value => {
    console.log(`selected ${value}`);
    let val;
    val = this.state[DATA.LIST[3]].filter(data => {
      return value.includes(data[DATA.ALLDATA[3].id]);
    });
    this.setState({
      dCode: val,
    });
  };

  onSubmit = () => {
    this.props.form.validateFields(
      [
        'agentType',
        'channelType',
        'transactionType',
        'fromAmount',
        'toAmount',
        'distributionCode',
        'Ownoption',
        'Merchantoption',
        'Agentoption',
        'Otheroption',
        'Ownamount',
        'Merchantamount',
        'Agentamount',
        'Otheramount',
      ],
      (err, values) => {
        console.log('--------done', values);
      }
    );
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    const optionsAgent = this.state[DATA.FILTERLIST[1]].map(data => (
      <Option key={data.key} value={data.key}>
        {`${data[DATA.ALLDATA[1].code]} - ${data[DATA.ALLDATA[1].name]}`}
      </Option>
    ));
    const optionsChannel = this.state[DATA.FILTERLIST[2]].map(data => (
      <Option key={data.key} value={data.key}>
        {`${data[DATA.ALLDATA[2].name]}`}
      </Option>
    ));
    const optionsTransaction = this.state[DATA.FILTERLIST[4]].map(data => (
      <Option key={data.key} value={data.key}>
        {`${data[DATA.ALLDATA[4].code]} - ${data[DATA.ALLDATA[4].name]}`}
      </Option>
    ));

    const children = this.state[DATA.LIST[3]].map(data => (
      <Option key={data.key} value={data.distributionTypeID}>
        {`${data[DATA.ALLDATA[3].code]} - ${data[DATA.ALLDATA[3].name]}`}
      </Option>
    ));

    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div className="box box-default mb-4">
            <div className="box-header">Set-up Commission</div>
            <div className="box-body">
              <Form>
                <Row>
                  <Col span={8}>
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
                          dataSource={optionsAgent}
                          placeholder="Agent Type Code"
                          style={{ width: '90%' }}
                          onBlur={inputValue => {
                            this.setAccount(inputValue, 1);
                          }}
                          onChange={inputValue => {
                            this.updateAgentList(inputValue, 1);
                          }}
                          onSelect={inputValue => {
                            this.setAccount(inputValue, 1);
                          }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
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
                          dataSource={optionsChannel}
                          placeholder="Channel Type"
                          style={{ width: '90%' }}
                          onBlur={inputValue => {
                            this.setAccount(inputValue, 2);
                          }}
                          onChange={inputValue => {
                            this.updateAgentList(inputValue, 2);
                          }}
                          onSelect={inputValue => {
                            this.setAccount(inputValue, 2);
                          }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
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
                          dataSource={optionsTransaction}
                          placeholder="Transaction Type"
                          style={{ width: '90%' }}
                          onBlur={inputValue => {
                            this.setAccount(inputValue, 4);
                          }}
                          onChange={inputValue => {
                            this.updateAgentList(inputValue, 4);
                          }}
                          onSelect={inputValue => {
                            this.setAccount(inputValue, 4);
                          }}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={6}>
                    <FormItem label="From Amount">
                      {getFieldDecorator('fromAmount', {
                        rules: [
                          {
                            required: true,
                            message: 'Please enter your transaction type',
                          },
                        ],
                      })(<InputNumber style={{ width: '90%' }} />)}
                    </FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem label="To Amount">
                      {getFieldDecorator('toAmount', {
                        rules: [
                          {
                            required: true,
                            message: 'Please enter your transaction type',
                          },
                        ],
                      })(<InputNumber style={{ width: '90%' }} />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
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
                          style={{ width: '90%' }}
                          placeholder="Please select"
                          onChange={inputValue => {
                            this.handleChange(inputValue);
                          }}
                        >
                          {children}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  {this.state.dCode.length !== 0 && (
                    <>
                      <Col span={16}>
                        <Card>
                          {this.state.dCode.map((item, i) => (
                            <Input.Group key={i} compact>
                              <FormItem
                                key={i}
                                label={item.distribution}
                                {...layout}
                                style={{ width: '40%' }}
                              >
                                {getFieldDecorator(item.distribution + 'option', {
                                  defaultValue: DATA.OPTION[1],
                                  rules: [
                                    {
                                      required: true,
                                      message: 'Please enter your ' + item.distribution + 'option',
                                    },
                                  ],
                                })(
                                  <Select style={{ width: '90%' }}>
                                    <Option value={DATA.OPTION[1]}>{DATA.OPTION[1]}</Option>
                                    <Option value={DATA.OPTION[2]}>{DATA.OPTION[2]}</Option>
                                  </Select>
                                )}
                              </FormItem>
                              <FormItem style={{ width: '60%' }}>
                                {getFieldDecorator(item.distribution + 'amount', {
                                  rules: [
                                    {
                                      required: true,
                                      message: 'Please enter your ' + item.distribution + ' amount',
                                    },
                                  ],
                                })(
                                  <InputNumber
                                    placeholder="Enter Amount"
                                    min={1}
                                    style={{ width: '90%' }}
                                  />
                                )}
                              </FormItem>
                            </Input.Group>
                          ))}
                        </Card>
                      </Col>
                      <Col span={3}>
                        <div style={{ width: '90%' }}>
                          <Button
                            type="primary"
                            // loading={loadingForm}
                            className="float-right"
                            onClick={this.onSubmit}
                          >
                            {/* {selectedRecord === null ? 'Create' : 'Update'} */}submit
                          </Button>
                        </div>
                      </Col>
                    </>
                  )}
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
