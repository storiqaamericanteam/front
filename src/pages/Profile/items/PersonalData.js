// @flow

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import {
  assocPath,
  propOr,
  toUpper,
  toLower,
  find,
  propEq,
  isEmpty,
  pathOr,
  omit,
} from 'ramda';
import { validate } from '@storiqa/shared';

import { Input } from 'components/common/Input';
import { Select } from 'components/common/Select';
import { BirthdateSelect } from 'pages/Profile/items/BirthdateSelect';
import { SpinnerButton } from 'components/common/SpinnerButton';
import { withShowAlert } from 'components/App/AlertContext';

import type { AddAlertInputType } from 'components/App/AlertContext';

import { log, fromRelayError } from 'utils';
import { renameKeys } from 'utils/ramda';

import { UpdateUserMutation } from 'relay/mutations';
import type { MutationParamsType } from 'relay/mutations/UpdateUserMutation';

import '../Profile.scss';

type DataType = {
  firstName: string,
  lastName: string,
  phone: ?string,
  birthdate: ?string,
  gender: 'MALE' | 'FEMALE' | 'UNDEFINED',
};

type PropsType = {
  data: {
    id: string,
    firstName: string,
    lastName: string,
    phone: ?string,
    birthdate: ?string,
    gender: 'MALE' | 'FEMALE' | 'UNDEFINED',
  },
  subtitle: string,
  showAlert: (input: AddAlertInputType) => void,
};

type StateType = {
  data: DataType,
  formErrors: {
    [string]: ?any,
  },
  isLoading: boolean,
};

const genderItems = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
];

class PersonalData extends Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props);
    const { data } = props;
    this.state = {
      data: {
        phone: data.phone || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        birthdate: data.birthdate || '',
        gender: data.gender || 'UNDEFINED',
      },
      formErrors: {},
      isLoading: false,
    };
  }

  handleSave = () => {
    const { environment } = this.context;
    const { data: propsData } = this.props;
    const { data } = this.state;
    const { phone, firstName, lastName, birthdate, gender } = data;

    const { errors: formErrors } = validate(
      {
        firstName: [
          [
            (value: string) => value && value.length > 0,
            'First name must not be empty',
          ],
        ],
        lastName: [
          [
            (value: string) => value && value.length > 0,
            'Last name must not be empty',
          ],
        ],
        phone: [
          [
            (value: string) => /^\+?\d{7}\d*$/.test(value),
            'Incorrect phone format',
          ],
        ],
      },
      {
        firstName,
        lastName,
        phone,
      },
    );

    if (formErrors) {
      this.setState({ formErrors });
      return;
    }

    this.setState(() => ({ isLoading: true }));

    const params: MutationParamsType = {
      input: {
        clientMutationId: '',
        id: propsData.id,
        phone: phone || null,
        firstName: firstName || null,
        lastName: lastName || null,
        birthdate: birthdate || null,
        gender: gender || null,
        avatar: null,
      },
      environment,
      onCompleted: (response: ?Object, errors: ?Array<any>) => {
        log.debug({ response, errors });
        const relayErrors = fromRelayError({ source: { errors } });
        log.debug({ relayErrors });
        // $FlowIgnoreMe
        const validationErrors = pathOr({}, ['100', 'messages'], relayErrors);
        // $FlowIgnoreMe
        const status: string = pathOr('', ['100', 'status'], relayErrors);
        this.setState(() => ({ isLoading: false }));
        if (!isEmpty(validationErrors)) {
          this.setState({
            formErrors: renameKeys(
              {
                first_name: 'firstName',
                last_name: 'lastName',
              },
              validationErrors,
            ),
          });
          return;
        } else if (status) {
          this.props.showAlert({
            type: 'danger',
            text: `Error: "${status}"`,
            link: { text: 'Close.' },
          });
          return;
        } else if (errors) {
          this.props.showAlert({
            type: 'danger',
            text: 'Something going wrong :(',
            link: { text: 'Close.' },
          });
          return;
        }
        this.props.showAlert({
          type: 'success',
          text: 'User update!',
          link: { text: 'Got it!' },
        });
      },
      onError: (error: Error) => {
        this.setState(() => ({ isLoading: false }));
        log.debug({ error });
        const relayErrors = fromRelayError(error);
        log.debug({ relayErrors });
        this.setState(() => ({ isLoading: false }));
        // $FlowIgnoreMe
        const validationErrors = pathOr(null, ['100', 'messages'], relayErrors);
        if (!isEmpty(validationErrors)) {
          this.setState({
            formErrors: renameKeys(
              {
                first_name: 'firstName',
                last_name: 'lastName',
              },
              validationErrors,
            ),
          });
          return;
        }
        this.props.showAlert({
          type: 'danger',
          text: 'Something going wrong :(',
          link: { text: 'Close.' },
        });
      },
    };
    UpdateUserMutation.commit(params);
  };

  handleInputChange = (id: string) => (e: any) => {
    this.setState({ formErrors: omit([id], this.state.formErrors) });
    const { value } = e.target;
    if (id === 'phone' && !/^\+?\d*$/.test(value)) {
      return;
    }
    if (value.length <= 50) {
      this.setState((prevState: StateType) =>
        assocPath(['data', id], value.replace(/\s\s/, ' '), prevState),
      );
    }
  };

  handleGenderSelect = (genderValue: { id: string, label: string }) => {
    this.setState((prevState: StateType) =>
      assocPath(['data', 'gender'], toUpper(genderValue.id), prevState),
    );
  };

  handleBirthdateSelect = (value: string) => {
    this.setState((prevState: StateType) =>
      assocPath(['data', 'birthdate'], value, prevState),
    );
  };

  /* eslint-disable */
  renderInput = ({
    id,
    label,
    limit,
  }: {
    id: string,
    label: string,
    limit?: number,
  }) => (
    <div styleName="formItem">
      <Input
        id={id}
        // $FlowIgnoreMe
        value={propOr('', id, this.state.data)}
        label={label}
        onChange={this.handleInputChange(id)}
        errors={propOr(null, id, this.state.formErrors)}
        limit={limit}
      />
    </div>
  );

  render() {
    const { subtitle } = this.props;
    const { data, isLoading, formErrors } = this.state;
    const genderValue = find(propEq('id', toLower(data.gender)))(genderItems);
    return (
      <Fragment>
        <div styleName="subtitle">
          <strong>{subtitle}</strong>
        </div>
        {this.renderInput({
          id: 'firstName',
          label: 'First name',
          limit: 50,
        })}
        {this.renderInput({
          id: 'lastName',
          label: 'Last name',
          limit: 50,
        })}
        <div styleName="formItem">
          <Select
            forForm
            label="Gender"
            activeItem={genderValue}
            items={genderItems}
            onSelect={this.handleGenderSelect}
            dataTest="profileGenderSelect"
          />
        </div>
        <div styleName="formItem">
          <BirthdateSelect
            birthdate={data.birthdate}
            handleBirthdateSelect={this.handleBirthdateSelect}
            errors={propOr(null, 'birthdate', formErrors)}
          />
        </div>
        {this.renderInput({
          id: 'phone',
          label: 'Phone',
        })}
        <div styleName="formItem">
          <SpinnerButton
            onClick={this.handleSave}
            isLoading={isLoading}
            dataTest="saveButton"
          >
            Save
          </SpinnerButton>
        </div>
      </Fragment>
    );
  }
}

PersonalData.contextTypes = {
  environment: PropTypes.object.isRequired,
};

export default withShowAlert(PersonalData);