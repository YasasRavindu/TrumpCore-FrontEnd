import React from 'react';
import {
  Table,
  Icon,
  Input,
  Button,
  Modal,
  AutoComplete,
  Form,
  Tag,
  Divider,
  Row,
  Col,
  Select,
} from 'antd';
const Search = Input.Search;
const FormItem = Form.Item;
const { Option } = Select;
const { Column, ColumnGroup } = Table;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const tableData = [
  {
    createDate: '123424443uur',
    count: '1234-87275-2354',
    type: 'credit',
    status: 'INITIATED',
  },
  {
    createDate: '123424443uur',
    count: '1234-87275-2354',
    type: 'debit',
    status: 'DOWNLOADED',
  },
  {
    createDate: '123424443uur',
    count: '1234-87275-2354',
    type: 'debit',
    status: 'ACTIVATED',
  },
];

class Data extends React.Component {
  state = {};

  render() {
    return (
      <React.Fragment>
        <Form>
          <Row gutter={24}>
            <Col span={6} order={3}>
              {/* <Search
              placeholder="Search"
              onSearch={value => console.log(value)}
              style={{ width: 400 }}
            /> */}
            </Col>
            <Col span={6} order={2}>
              <FormItem {...formItemLayout} label="Card Type">
                <Select style={{ width: 120 }}>
                  <Option value="CASH">Cash</Option>
                  <Option value="DEBIT">Debit</Option>
                </Select>
              </FormItem>
            </Col>
            <Col span={6} order={1}>
              <FormItem {...formItemLayout} label="Status">
                <Select style={{ width: 120 }}>
                  <Option value="CASH">Cash</Option>
                  <Option value="DEBIT">Debit</Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
        </Form>

        <article className="article mt-2">
          <Table dataSource={tableData}>
            <Column title="Create Date" dataIndex="createDate" key="createDate" />
            <Column title="Card Count" dataIndex="count" key="count" />
            <Column title="Card Type" dataIndex="type" key="type" />
            <Column
              title="Status"
              dataIndex="status"
              key="status"
              //   render={status => (
              //     <span>
              //       {status.map(s => (
              //         <Tag color="blue" key={s}>
              //           {s}
              //         </Tag>
              //       ))}
              //     </span>
              //   )}
            />
            <Column
              title="Action"
              key="action"
              render={(text, record) => (
                <span>
                  <a>Invite {record.lastName}</a>
                  <Divider type="vertical" />
                  <a>Delete</a>
                </span>
              )}
            />
          </Table>
        </article>
      </React.Fragment>
    );
  }
}

const WrappedData = Form.create()(Data);

const cardTable = () => (
  <div className="box box-default">
    {/* <div className="box-header">Add POS ID with Account ID</div> */}
    <div className="box-body">
      <WrappedData />
    </div>
  </div>
);

export default cardTable;
