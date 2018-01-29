// @flow

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { log } from 'utils';
import { CreateUserMutation } from 'relay/mutations';

type StateType = {
  login: string,
  password: string,
};

type PropsType = {};

class Registration extends Component<PropsType, StateType> {
  state: StateType = {
    login: '',
    password: '',
  };

  handleRegistrationClick = () => {
    const { login, password } = this.state;
    CreateUserMutation.commit({
      login,
      password,
      environment: this.context.environment,
      onCompleted: (response: ?Object, errors: ?Array<Error>) => log.debug({ response, errors }),
      onError: (error: Error) => log.error({ error }),
    });
  };

  handleInputChange = (e: Object) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;

    this.setState({
      [name]: value,
    });
  };

  render() {
    return (
      <form>
        <label htmlFor="login">
          Login
          <br />
          <input
            name="login"
            type="text"
            value={this.state.login}
            onChange={this.handleInputChange}
          />
        </label>
        <br />
        <br />
        <label htmlFor="password">
          Password
          <br />
          <input
            name="password"
            type="password"
            value={this.state.password}
            onChange={this.handleInputChange}
          />
        </label>
        <br />
        <br />
        <button
          type="button"
          onClick={this.handleRegistrationClick}
        >
          Register
        </button>
      </form>
    );
  }
}

Registration.contextTypes = {
  environment: PropTypes.object.isRequired,
};

export default Registration;