import React from 'react';
import QueueAnim from 'rc-queue-anim';
import {
  Table,
  Input,
  Button,
  Form,
  Tag,
  Row,
  Col,
  Select,
  DatePicker,
  message,
  Slider,
  Icon,
  TreeSelect,
  Tooltip,
  Modal,
  Divider,
  ConfigProvider,
  Pagination,
  Statistic,
} from 'antd';
import { environment } from 'environments';
import axios from 'axios';
import { CSVLink } from 'react-csv';
const FormItem = Form.Item;
const Search = Input.Search;
const datenow = new Date();
const csvHeader = [
  { label: 'Full Name', key: 'fullName' },
  { label: 'User Name', key: 'userName' },
  { label: 'Account Balance', key: 'accountBalance' },
];
const columns = [
  {
    title: 'Full Name',
    dataIndex: 'fullName',
    key: 'fullName',
  },
  {
    title: 'User Name',
    dataIndex: 'userName',
    key: 'userName',
  },
  {
    title: 'Account Balance',
    dataIndex: 'accountBalance',
    key: 'accountBalance',
  },
];

class Agent extends React.Component {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      balanceData: [],
      loadingReport: false,
      tableLoading: false,
      searchText: '',
      loadFilterBalance: [],
    };
  }
  async componentDidMount() {
    this._isMounted = true;
    this.loadData();
  }

  loadData() {
    this.setState({
      loadingReport: true,
      tableLoading: true,
    });
    axios
      .get(environment.baseUrl + 'report/agentCurrentBalance')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const agentCurrentBalance = response.data.content;
        const firstLine = {
          fullName: '-------------',
          userName: '-------------',
          accountBalance: '----------------',
        };
        const secondLine = {
          fullName: 'Account Balance on ' + datenow,
          userName: '--------',
          accountBalance: '-------',
        };

        agentCurrentBalance.push(firstLine, secondLine);
        this._isMounted &&
          this.setState({
            balanceData: agentCurrentBalance,
            loadFilterBalance: agentCurrentBalance,
            loadingReport: false,
            tableLoading: false,
          });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
        this._isMounted &&
          this.setState({
            loadingReport: false,
            tableLoading: false,
          });
      });
  }

  searchTextHandler = e => {
    this.scheduleDataFilter('searchText', e.target.value);
  };

  scheduleDataFilter = (key, value) => {
    this.setState(
      {
        [key]: value,
      },
      () => {
        let data = this.state.balanceData;
        let searchText = this.state.searchText;
        if (searchText) {
          let returnable;
          data = data.filter(d => {
            returnable = true;
            if (returnable && searchText) {
              returnable =
                d.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
                d.accountBalance.toLowerCase().includes(searchText.toLowerCase()) ||
                d.userName.toLowerCase().includes(searchText.toLowerCase());
            }
            return returnable;
          });
        }

        this.setState({
          loadFilterBalance: data,
        });
      }
    );
  };

  render() {
    const { balanceData } = this.state;
    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div key="1">
            <div className="box box-default mb-4">
              <div className="box-header">Agent Current Balance</div>
              <div className="box-body">
                <Row>
                  <Col span={8} className="ml-5">
                    <Statistic title="Date Today" value={datenow} />
                  </Col>
                  <Col span={8} className="float-right">
                    {this.state.loadingReport && (
                      <Button
                        type="primary"
                        shape="round"
                        icon="download"
                        className="float-right ml-1"
                        loading={this.state.loadingReport}
                      >
                        Download Agent Current Balance Report
                      </Button>
                    )}
                    {!this.state.loadingReport && (
                      <CSVLink
                        data={balanceData.map(d => ({
                          fullName: d.fullName ? d.fullName : 'N/A',
                          userName: d.userName ? d.userName : 'N/A',
                          accountBalance: d.accountBalance ? d.accountBalance : 'N/A',
                        }))}
                        headers={csvHeader}
                        filename={'Agent_current_balance.csv'}
                        className="ant-btn ant-btn-primary ant-btn-round"
                      >
                        <Icon type="download" />
                        <span className="mr-1"></span>
                        Download Agent Current Balance Report
                      </CSVLink>
                    )}
                  </Col>
                </Row>
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
                        placeholder="Search agent current balance details"
                        onChange={this.searchTextHandler}
                      />
                    </FormItem>
                  </Col>
                </Row>
                <article className="article mt-2">
                  <Table
                    columns={columns}
                    dataSource={this.state.loadFilterBalance}
                    loading={this.state.tableLoading}
                    scroll={{ y: 300 }}
                    className="components-table-demo-nested"
                  />
                </article>
              </div>
            </div>
          </div>
        </QueueAnim>
      </div>
    );
  }
}

export default Agent;
