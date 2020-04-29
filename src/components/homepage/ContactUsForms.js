import React, { useState } from 'react';
import css from 'styled-jsx/css';

import { fetchJson } from '../../lib/fetch';

export const modalCustomStyle = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    background: '#3C5869',
    border: 'none',
  },
};

const styles = css`
  .contactUsForm {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }
  .title {
    font-weight: bold;
    font-size: 32px;
    line-height: 40px;
    color: #fffef9;
  }
  form {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }
  .inputWrapper {
    display: flex;
    flex-direction: column;
  }
  .input {
    background: #fffef9;
    border-radius: 8px;
    padding: 17px 24px;
    margin-bottom: 24px;
    font-weight: 500;
    font-size: 16px;
    line-height: 21px;
    color: #3c5869;
    outline: none;
    border: none;
    margin-right: 10px;
  }
  textarea {
    outline: none;
    border: none;
    background: #fffef9;
    border-radius: 8px;
    font-weight: 500;
    font-size: 16px;
    line-height: 21px;
    color: #3c5869;
    padding: 24px;
    height: 168px;
    margin-bottom: 24px;
  }
  .sendButton {
    border: 2px solid #ffffff;
    box-sizing: border-box;
    border-radius: 24px;
    padding: 12px 24px;
    font-weight: bold;
    font-size: 14px;
    line-height: 16px;
    text-align: center;
    letter-spacing: -0.02em;
    color: #fffef9;
    background: transparent;
    min-width: 100%;
    cursor: pointer;
  }
  .closeModal:focus,
  .sendButton:focus {
    outline: none;
  }
  .sendButton:disabled {
    background: #7a9fb8;
    border: 2px solid #ffffff;
    box-sizing: border-box;
  }
  .failed:disabled {
    background: #f55882;
  }
  input::-webkit-input-placeholder,
  textarea::-webkit-input-placeholder {
    /* Chrome/Opera/Safari */
    font-family: 'Fira Code', monospace;
    font-weight: 400;
  }
  input::-moz-placeholder,
  textarea::-moz-placeholder {
    /* Firefox 18- */
    font-family: 'Fira Code', monospace;
    font-weight: 400;
  }
  .modal .titleWrapper {
    display: flex;
    justify-content: space-between;
    flex-direction: column-reverse;
  }
  .closeModal {
    padding: 12px 18px;
    border: 2px solid #ffffff;
    box-sizing: border-box;
    color: #ffffff;
    background: #3c5869;
    height: 48px;
    border-radius: 75px;
    width: 48px;
    cursor: pointer;
  }
  .modal .closeModal {
    align-self: flex-end;
  }
  .closeModal:hover {
    background-color: #7a9fb8;
  }

  @media screen and (min-width: 768px) {
    .title {
      margin-bottom: 20px;
    }
    form,
    .contactUsForm {
      width: 458px;
    }
    .input {
      width: 336px;
    }
    textarea {
      width: 405px;
    }
    .sendButton {
      align-self: flex-end;
      min-width: 82px;
    }
  }

  @media screen and (min-width: 1024px) {
    .modal form,
    .modal {
      width: 705px;
    }
    .modal form textarea {
      width: 650px;
    }
    .modal form .organizationInput {
      width: 290px;
    }
    .modal .titleWrapper {
      flex-direction: row;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .modal .closeModal {
      align-self: center;
    }
    .inputWrapper {
      flex-direction: row;
    }
  }
  @media screen and (min-width: 1440px) {
    form,
    .contactUsForm {
      width: 705px;
    }
    textarea {
      width: 650px;
    }
    .organizationInput {
      width: 290px;
    }
  }
`;

const useForm = (inital = {}) => {
  const [state, setstate] = useState(inital);

  return {
    onChange: event => {
      const name = event.target.name;
      const value = event.target.value;
      setstate({
        ...state,
        formState: null,
        [name]: value,
      });
    },
    onSubmit: async event => {
      event.preventDefault();
      fetchJson('/data/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(state),
      })
        .then(() => {
          setstate({
            formState: 'success',
            type: state.type,
            name: '',
            email: '',
            organization: '',
            message: '',
          });
        })
        .catch(() => {
          setstate({ ...state, formState: 'failed' });
        });
    },
    state,
  };
};

export const InquiriesForm = ({ usedIn, closeModal }) => {
  const { onChange, onSubmit, state } = useForm({
    type: 'inquiries',
    formState: null,
    name: '',
    email: '',
    message: '',
  });
  const isEnabled =
    state.email.length > 0 && state.name.length > 0 && state.message.length > 0;

  return (
    <div className="contactUsForm">
      <style jsx>{styles}</style>
      <div className="titleWrapper">
        <h3 className="title">Contact us</h3>
        {usedIn === 'modal' && (
          <button className="closeModal" onClick={() => closeModal()}>
            x
          </button>
        )}
      </div>
      <form onSubmit={onSubmit}>
        <div className="inputWrapper">
          <input
            type="text"
            className="input nameInput"
            name="name"
            onChange={onChange}
            value={state.name}
            required
            placeholder="What's your name?"
          />
          <input
            type="email"
            className="input"
            name="email"
            onChange={onChange}
            value={state.email}
            required
            placeholder="Enter your email"
          />
        </div>
        <textarea
          className="textarea"
          placeholder="Write us a message"
          name="message"
          required
          value={state.message}
          onChange={onChange}
        ></textarea>
        <button
          type="submit"
          className={
            state.formState === 'failed' ? 'sendButton failed' : 'sendButton'
          }
          disabled={!isEnabled}
        >
          {state.formState === 'success' && 'Message submitted!'}
          {!state.formState && 'Send'}
          {state.formState === 'failed' && 'Oops! There was a problem'}
        </button>
      </form>
    </div>
  );
};

export const BecomeBetaTesterForm = ({ usedIn, closeModal }) => {
  const { onChange, onSubmit, state } = useForm({
    formState: null,
    type: 'betaTester',
    name: '',
    email: '',
    message: '',
  });
  const isEnabled =
    state.email.length > 0 && state.name.length > 0 && state.message.length > 0;

  return (
    <div
      className={usedIn === 'modal' ? 'contactUsForm modal' : 'contactUsForm'}
    >
      <style jsx>{styles}</style>
      <div className="titleWrapper">
        <h3 className="title">Become a beta tester</h3>
        {usedIn === 'modal' && (
          <button className="closeModal" onClick={() => closeModal()}>
            x
          </button>
        )}
      </div>
      <form onSubmit={onSubmit}>
        <div className="inputWrapper">
          <input
            type="text"
            className="input nameInput"
            name="name"
            placeholder="What's your name?"
            onChange={onChange}
            value={state.name}
            required
          />
          <input
            type="email"
            className="input"
            name="email"
            placeholder="Enter your email"
            onChange={onChange}
            value={state.email}
            required
          />
        </div>
        <textarea
          className="textarea"
          placeholder="Write us a message"
          name="message"
          value={state.message}
          onChange={onChange}
          required
        ></textarea>
        <button
          type="submit"
          className={
            state.formState === 'failed' ? 'sendButton failed' : 'sendButton'
          }
          disabled={!isEnabled}
        >
          {state.formState === 'success' && 'Message submitted!'}
          {!state.formState && 'Send'}
          {state.formState === 'failed' && 'Oops! There was a problem'}
        </button>
      </form>
    </div>
  );
};

export const PartnershipForm = ({ usedIn, closeModal }) => {
  const { onChange, onSubmit, state } = useForm({
    type: 'partnership',
    formState: null,
    organization: '',
    name: '',
    email: '',
    message: '',
  });
  const isEnabled =
    state.email.length > 0 &&
    state.name.length > 0 &&
    state.message.length > 0 &&
    state.organization.length > 0;

  return (
    <div
      className={usedIn === 'modal' ? 'contactUsForm modal' : 'contactUsForm'}
    >
      <style jsx>{styles}</style>
      <div className="titleWrapper">
        <h3 className="title">Become a Partner</h3>
        {usedIn === 'modal' && (
          <button className="closeModal" onClick={() => closeModal()}>
            x
          </button>
        )}
      </div>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          className="input organizationInput"
          name="organization"
          placeholder="Name of your organization"
          onChange={onChange}
          value={state.organization}
          required
        />
        <div className="inputWrapper">
          <input
            type="text"
            className="input nameInput"
            name="name"
            placeholder="What's your name?"
            onChange={onChange}
            value={state.name}
            required
          />
          <input
            type="email"
            className="input"
            name="email"
            placeholder="Enter your email"
            onChange={onChange}
            value={state.email}
            required
          />
        </div>
        <textarea
          className="textarea"
          placeholder="Write us a message"
          name="message"
          value={state.message}
          onChange={onChange}
          required
        ></textarea>
        <button
          type="submit"
          className={
            state.formState === 'failed' ? 'sendButton failed' : 'sendButton'
          }
          disabled={!isEnabled}
        >
          {state.formState === 'success' && 'Message submitted!'}
          {!state.formState && 'Send'}
          {state.formState === 'failed' && 'Oops! There was a problem'}
        </button>
      </form>
    </div>
  );
};