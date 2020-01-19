import React from 'react';
import QueueAnim from 'rc-queue-anim';
import { Table, Input, Button, Form, Tag, Row, Col, Select, DatePicker, message } from 'antd';
import { environment } from '../../../environments';
import axios from 'axios';
import moment from 'moment';
import CUSTOM_MESSAGE from 'constants/notification/message';

const Search = Input.Search;
const userStatus = {
  REGISTERED: { color: '', label: 'REGISTERED' },
  REMOVED: { color: 'magenta', label: 'DELETED' },
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
      loadDevices: [],
      loadFilterDevices: [],
      loading: false,
      searchDate: ['', ''],
      searchText: '',
    };
  }

  async componentDidMount() {
    this.loadTable();
  }

  loadTable = () => {
    axios
      .get(environment.baseUrl + 'device/search/register')
      .then(response => {
        console.log('------------------- response - ', response.data.content);
        const devicesList = response.data.content.map(regDevices => {
          regDevices.key = regDevices.id;
          return regDevices;
        });

        this.setState({
          loadDevices: devicesList,
          loadFilterDevices: devicesList,
        });
      })
      .catch(error => {
        console.log('------------------- error - ', error);
      });
  };

  submit = e => {
    this.setState({ loading: true });
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        axios
          .post(environment.baseUrl + 'device', {
            serial: values.SerialNumber,
          })
          .then(response => {
            message.success('Congratulations! Your device successfully registered.');
            this.loadTable();
            this.props.form.resetFields();
            this.setState({ loading: false });
            console.log('------------------- response - ', response);
          })
          .catch(error => {
            console.log('------------------- error - ', error);

            let errorCode = error.response.data.validationFailures[0].code;
            let msg = CUSTOM_MESSAGE.DIVICES_REGISTRATION_ERROR[errorCode];
            if (msg === undefined) {
              msg = CUSTOM_MESSAGE.DIVICES_REGISTRATION_ERROR['defaultError'];
            }
            message.error(msg);
            this.setState({ loading: false });
          });
      }
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
        let data = this.state.loadDevices;
        let searchDate = this.state.searchDate;
        let searchText = this.state.searchText;

        if (searchText) {
          data = data.filter(d => {
            return (
              d.serial.toLowerCase().includes(searchText.toLowerCase()) ||
              d.status.toLowerCase().includes(searchText.toLowerCase())
            );
          });
        }

        if (searchDate.length > 0 && searchDate[0] !== '' && searchDate[1] !== '') {
          var startDate = moment(searchDate[0]);
          var endDate = moment(searchDate[1]);
          data = data.filter(d => {
            var date = moment(d.createDate);
            return date.isAfter(startDate) && date.isBefore(endDate);
          });
        }

        this.setState({
          loadFilterDevices: data,
        });
      }
    );
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <div className="container-fluid no-breadcrumb container-mw-xl chapter">
        <QueueAnim type="bottom" className="ui-animate">
          <div key="1">
            <div className="box box-default mb-4">
              <div className="box-header">Device Registration</div>
              <div className="box-body">
                <Form>
                  <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                    <Col span={6} order={2}>
                      <FormItem>
                        {getFieldDecorator('SerialNumber', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter your Serial number',
                            },
                          ],
                        })(<Input placeholder="Serial number" />)}
                      </FormItem>
                    </Col>
                    <Col span={6} order={1}>
                      <Button
                        type="primary"
                        loading={this.state.loading}
                        className="float-right"
                        onClick={this.submit}
                      >
                        Submit
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </div>
            </div>
          </div>
          <div key="2">
            <div className="box box-default">
              <div className="box-header">Search Devices</div>
              <div className="box-body">
                <Form>
                  <Row gutter={24}>
                    <Col span={8} order={3}>
                      <FormItem>
                        {/* <Input placeholder="Serial number" onChange={this.onChange} /> */}
                        <Search
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
                  <Table dataSource={this.state.loadFilterDevices}>
                    <Column title="Serial Number" dataIndex="serial" key="serial" />
                    <Column title="Created Date" dataIndex="createDate" key="createDate" />
                    <Column
                      title="Status"
                      dataIndex="status"
                      key="status"
                      render={status => (
                        <Tag color={userStatus[status].color}>{userStatus[status].label}</Tag>
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

const registration = () => <WrappedData />;

export default registration;
