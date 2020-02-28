import React from 'react';
import QueueAnim from 'rc-queue-anim';
import { Button } from 'antd';
import { DEFAULT_REDIRECT_ROUTE } from 'constants/authority/authority';

const Page = props => {
  return (
    <div className="page-err">
      {console.log(props)}
      <QueueAnim type="bottom" className="ui-animate">
        <div key="1">
          <div className="err-container text-center">
            <div className="err-code-container">
              <div className="err-code">
                {' '}
                <h1>403</h1>{' '}
              </div>
            </div>
            <h2>Sorry, you don't have permission to access</h2>
            <Button href={DEFAULT_REDIRECT_ROUTE}>Go Back to Home Page</Button>
          </div>
        </div>
      </QueueAnim>
    </div>
  );
};

export default Page;
