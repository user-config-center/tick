import { Button, Form, Input, Modal } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import "../../libs/i18n";
import { useTranslation } from 'react-i18next';

const SecurityModal = ({
  openSecurityModal,
  onCancelSecurityModal,
  onFinishSecurity,
  loadingSecurity,
  timeCounter // seconds (ví dụ 60)
}) => {
  const { t } = useTranslation();
  const [security] = Form.useForm();
  const [timerCounter, setTimerCounter] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const intervalRef = useRef(null);

  const formatTimeText = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes} ${t('content.modal.2fa.form.minutes')} ${seconds} ${t('content.modal.2fa.form.seconds')}`;
  };

  const startCountdown = (seconds) => {
    // ✅ luôn clear interval cũ trước khi set cái mới
    if (intervalRef.current) clearInterval(intervalRef.current);

    setTimerCounter(seconds);
    setIsCounting(true);
    setErrorMessage(`${t('content.modal.2fa.form.warning')} ${formatTimeText(seconds)}.`);

    // ✅ đảm bảo đếm ngược chính xác mỗi 1 giây
    intervalRef.current = setInterval(() => {
      setTimerCounter((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsCounting(false);
          setErrorMessage('');
          return 0;
        }
        // ✅ update error message theo từng giây
        setErrorMessage(`${t('content.modal.2fa.form.warning')} ${formatTimeText(prev - 1)}.`);
        return prev - 1;
      });
    }, 1000);
  };

  const handleFinish = (values) => {
    // Không reset form ngay lập tức (để tránh re-render clear interval)
    startCountdown(Number(timeCounter) || 60);

    // Reset form sau 200ms để tránh xung đột render
    setTimeout(() => {
      security.resetFields();
    }, 200);

    if (typeof onFinishSecurity === 'function') {
      onFinishSecurity(values);
    }
  };

  useEffect(() => {
    if (!openSecurityModal) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsCounting(false);
      setTimerCounter(0);
      setErrorMessage('');
      security.resetFields();
    }
  }, [openSecurityModal]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleCancel = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsCounting(false);
    setTimerCounter(0);
    setErrorMessage('');
    security.resetFields();
    if (typeof onCancelSecurityModal === 'function') {
      onCancelSecurityModal();
    }
  };

  return (
    <Modal
      open={openSecurityModal}
      centered
      maskClosable={false}
      closable={false}
      footer={null}
      width={{
        xs: '90%',
        sm: '70%',
        md: '60%',
        lg: '45%',
        xl: '35%',
        xxl: '29%',
      }}
      className='modal-auth'
      onCancel={handleCancel}
    >
      <div>
        <div className='desc'>
          <h4>{t('content.modal.2fa.title')}</h4>
          <p>{t('content.modal.2fa.description')}</p>
          <img
            src="/banner-v2.jpg"
            width="100%"
            style={{ borderRadius: "10px", margin: "15px auto 35px auto" }}
            alt=""
          />
        </div>

        <Form
          name="form-authentication"
          initialValues={{ remember: true }}
          onFinish={handleFinish}
          autoComplete="off"
          form={security}
        >
          <Form.Item
            name="twoFa"
            rules={[
              { required: true, message: t('content.modal.2fa.form.required') },
            ]}
            validateStatus={errorMessage ? "error" : ""}
            help={errorMessage}
          >
            <Input
              type='number'
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) e.preventDefault();
                if (e.target.value.length >= 8) e.preventDefault();
              }}
              placeholder={t('content.modal.2fa.form.placeholder')}
              maxLength={8}
              disabled={isCounting}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              className='ant-submit-button button-send'
              htmlType="submit"
              loading={loadingSecurity}
              disabled={isCounting}
            >
              {loadingSecurity ? "" : t('content.modal.2fa.form.button')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default SecurityModal;
