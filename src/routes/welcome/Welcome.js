import React from 'react';
import QueueAnim from 'rc-queue-anim';
import { AutoComplete } from 'antd';

const Welcome = () => (
  <div className="container-fluid no-breadcrumb container-mw-xl chapter">
    <QueueAnim type="bottom" className="ui-animate">
      <div>
        <article className="article">
          <section className="hero text-center text-body-reverse rounded">
            <div
              className="hero-bg-img rounded"
              style={{
                backgroundImage: 'url(/assets/images-demo/covers/Welcome-Banner.jpg)',
                height: '300%',
              }}
            ></div>
          </section>
        </article>
      </div>
    </QueueAnim>
  </div>
);

export default Welcome;
