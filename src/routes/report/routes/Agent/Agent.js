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
const deadline = new Date().toLocaleString();
const csvHeader = [
  { label: 'Full Name', key: 'fullName' },
  { label: 'User Name', key: 'userName' },
  { label: 'Account Balance', key: 'accountBalance' },
];

class Agent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      balanceData: [],
      loadingReport: false,
    };
  }
  async componentDidMount() {
    this.loadData();
  }

  loadData() {
    this.setState({
      loadingReport: true,
    });
    axios
      .get(environment.baseUrl + 'report/agentCurrentBalance')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const agentCurrentBalance = response.data.content;
        const newdata = { fullName: deadline, userName: '----------', accountBalance: '---------' };
        agentCurrentBalance.push(newdata);
        this.setState({
          balanceData: agentCurrentBalance,
          loadingReport: false,
        });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
        this.setState({
          loadingReport: false,
        });
      });
  }

  render() {
    const { balanceData } = this.state;
    return (
      <div className="container-fluid no-breadcrumb container-mw chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div key="1">
            <div className="box box-default">
              <div className="box-header">Agent Current Balance</div>
              <div className="box-body">
                <Row>
                  <Col span={8} className="ml-5">
                    <Statistic title="Date Today" value={deadline} />
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
        </QueueAnim>
      </div>
    );
  }
}

export default Agent;
