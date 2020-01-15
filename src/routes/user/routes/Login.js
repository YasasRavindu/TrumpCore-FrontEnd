import React from 'react';
import QueueAnim from 'rc-queue-anim';
import LoginForm from 'routes/form/routes/forms/components/LoginForm';

const FormCard = () => (
  <section className="form-card-page form-card row no-gutters">
    <div
      className="form-card__img form-card__img--left col-lg-6"
      style={{
        // backgroundImage: "url('assets/images-demo/covers/Trumpcore_Login_Background-01.jpg')",
        backgroundImage: "url('assets/images-demo/covers/Trumpcore_Login_Background-02.jpg')",
        // backgroundImage: "url('assets/images-demo/covers/Trumpcore_Login_Background-03.jpg')",
        //backgroundImage: "url('assets/images-demo/covers/Trumpcore_Login_Background-04.jpg')",
      }}
    />
    <div className="form-card__body col-lg-6 p-5 px-lg-8 d-flex align-items-center">
      <LoginForm />
    </div>
  </section>
);

const Page = () => (
  <QueueAnim type="bottom" className="ui-animate">
    <div key="1">
      <FormCard />
    </div>
  </QueueAnim>
);

export default Page;
