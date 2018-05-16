// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay';
import { pathOr, isEmpty } from 'ramda';

import { log, fromRelayError } from 'utils';
import { Page } from 'components/App';
import { CreateWizardMutation, UpdateWizardMutation } from 'relay/mutations';

import WizardHeader from './WizardHeader';
import WizardFooter from './WizardFooter';
import FirstForm from './FirstForm';
import SecondForm from './SecondForm';

import './Wizard.scss';

type PropsType = {};

type StateType = {};

class WizardWrapper extends React.Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props);
    const stepOne = pathOr(null, ['me', 'wizardStore', 'stepOne'], props);
    const stepTwo = pathOr(null, ['me', 'wizardStore', 'stepTwo'], props);
    const stepThree = pathOr(null, ['me', 'wizardStore', 'stepThree'], props);
    this.state = {
      step: 1,
      wizardStore: {
        ...stepOne,
        ...stepTwo,
        ...stepThree,
      },
      formErrors: {},
      isLoading: false,
    };

    // create Wizard on initial start selling
  }

  componentDidMount() {
    this.createWizard();
  }

  createWizard = () => {
    this.setState(() => ({ isLoading: true }));
    CreateWizardMutation.commit({
      environment: this.context.environment,
      onCompleted: (response: ?Object, errors: ?Array<any>) => {
        log.debug({ response, errors });
        const relayErrors = fromRelayError({ source: { errors } });
        log.debug({ relayErrors });
        this.setState(() => ({ isLoading: false }));
        // $FlowIgnoreMe
        const validationErrors = pathOr({}, ['100', 'messages'], relayErrors);
        // $FlowIgnoreMe
        const status = pathOr('', ['100', 'status'], relayErrors);
        if (validationErrors && !isEmpty(validationErrors)) {
          this.setState({ formErrors: validationErrors });
        } else if (status) {
          // $FlowIgnoreMe
          alert(`Error: "${status}"`); // eslint-disable-line
        }
      },
      onError: (error: Error) => {
        log.debug({ error });
        const relayErrors = fromRelayError(error);
        log.debug({ relayErrors });
        this.setState(() => ({ isLoading: false }));
        // $FlowIgnoreMe
        const validationErrors = pathOr(null, ['100', 'messages'], relayErrors);
        if (validationErrors) {
          this.setState({ formErrors: validationErrors });
          return;
        }
        // eslint-disable-next-line
        alert('Something going wrong :(');
      },
      updater: relayStore => {
        const me = relayStore.getRoot().getLinkedRecord('me');
        const wizardRecord = relayStore.getRootField('createWizardStore');
        me.setLinkedRecord(wizardRecord, 'wizardStore');
      }
    });
  }

  updateWizard = (fieldName, value) => {
    this.setState(() => ({ isLoading: true }));
    UpdateWizardMutation.commit({
      [fieldName]: value,
      environment: this.context.environment,
      onCompleted: (response: ?Object, errors: ?Array<any>) => {
        log.debug({ response, errors });
        const relayErrors = fromRelayError({ source: { errors } });
        log.debug({ relayErrors });
        this.setState(() => ({ isLoading: false }));
      },
      onError: (error: Error) => {
        log.debug({ error });
        const relayErrors = fromRelayError(error);
        log.debug({ relayErrors });
        this.setState(() => ({ isLoading: false }));
        // eslint-disable-next-line
        alert('Something going wrong :(');
      },
    });
  }

  handleChangeStep = (step: number) => {
    this.setState({ step });
  };

  handleChangeForm = (value, fieldName) => {
    this.setState({
      wizardStore: {
        ...this.state.wizardStore,
        [fieldName]: value,
      },
    });
  };

  handleOnSaveWizard = fieldName => {
    const { wizardStore } = this.state;
    // console.log('**** handleOnSaveWizard: ', {
    //   value: wizardStore[fieldName],
    //   fieldName,
    // });
    if (wizardStore[fieldName] || wizardStore[fieldName] === '') {
      this.updateWizard(fieldName, wizardStore[fieldName]);
    }
  };

  renderForm = () => {
    const { step, wizardStore } = this.state;
    switch (step) {
      case 1:
        return (
          <div>
            <div styleName="headerTitle">Give your store a name</div>
            <div styleName="headerDescription">
              Make a bright name for your store to attend your customers and
              encrease your sales
            </div>
            <FirstForm
              data={wizardStore}
              onChange={this.handleChangeForm}
              onSave={this.handleOnSaveWizard}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <div styleName="headerTitle">Set up store</div>
            <div styleName="headerDescription">
              Define a few settings that will make your sells effective and
              comfortable.
            </div>
            <SecondForm
              data={wizardStore}
              languages={this.props.languages}
              onChange={this.handleChangeForm}
              onSave={this.handleOnSaveWizard}
            />
          </div>
        );
      case 3:
        return (
          <div>
            <div styleName="headerTitle">Fill your store with goods</div>
            <div styleName="headerDescription">
              Choose what you gonna sale in your marketplace and add it with
              ease
            </div>
          </div>
        );
      default:
        break;
    }
    return null;
  };

  render() {
    const { step, wizardStore } = this.state;

    console.log('**** Wizard props: ', this.props);

    return (
      <div styleName="wizardContainer">
        <div styleName="stepperWrapper">
          <WizardHeader currentStep={step} onChange={this.handleChangeStep} />
        </div>
        <div styleName="contentWrapper">
          <div styleName="formWrapper">{this.renderForm()}</div>
        </div>
        <div styleName="footerWrapper">
          <WizardFooter
            step={step}
            onChange={this.handleChangeStep}
            onSave={this.handleOnSave}
          />
        </div>
      </div>
    );
  }
}


WizardWrapper.contextTypes = {
  environment: PropTypes.object.isRequired,
};

export default createFragmentContainer(
  Page(WizardWrapper),
  graphql`
    fragment Wizard_me on User {
      id
      rawId
      isActive
      wizardStore {
        id
        rawId
        stepOne {
          name
          slug
          shortDescription
        }
        stepTwo {
          country
          address
          defaultLanguage
        }
        stepThree {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  `,
);
