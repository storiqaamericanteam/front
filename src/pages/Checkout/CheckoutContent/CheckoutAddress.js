// @flow

import React from 'react';
import { pathOr } from 'ramda';

import { Checkbox } from 'components/common/Checkbox';
import { Select } from 'components/common/Select';
import { Input } from 'components/common/Input';
import { Row, Col } from 'layout';
import { AddressForm } from 'components/AddressAutocomplete';

import type { AddressFullType } from 'components/AddressAutocomplete/AddressForm';

import { getAddressFullByValue, addressesToSelect } from '../utils';

import AddressInfo from './AddressInfo';

import './CheckoutAddress.scss';

type PropsType = {
  deliveryAddresses: any,
  onChangeOrderInput: Function,
  onChangeAddressType: Function,
  orderInput: any,
  me: any,
  isAddressSelect: boolean,
  isNewAddress: boolean,
};

class CheckoutContent extends React.Component<PropsType> {
  handleOnSelectAddress = (item: any) => {
    const { onChangeOrderInput, orderInput, deliveryAddresses } = this.props;
    const addressFull = getAddressFullByValue(deliveryAddresses, item.label);
    onChangeOrderInput({
      ...orderInput,
      addressFull,
    });
  };

  handleChangeReceiver = (e: any) => {
    const { onChangeOrderInput, orderInput } = this.props;
    onChangeOrderInput({
      ...orderInput,
      receiverName: e.target.value,
    });
  };

  handleOnCheckExistingAddress = () => {
    // $FlowIgnore
    this.setState(({ isCheckedExistingAddress }) => ({
      isCheckedExistingAddress: !isCheckedExistingAddress,
    }));
  };

  handleOnCheckNewAddress = () => {
    // $FlowIgnore
    this.setState(({ isCheckedNewAddress }) => ({
      isCheckedNewAddress: !isCheckedNewAddress,
    }));
  };

  handleInputChange = (id: string) => (e: any) => {
    const { onChangeOrderInput, orderInput } = this.props;
    const { value } = e.target;
    onChangeOrderInput({
      ...orderInput,
      addressFull: {
        ...orderInput.addressFull,
        [id]: value,
      },
    });
  };

  handleChangeData = (addressFullData: AddressFullType): void => {
    const { onChangeOrderInput, orderInput } = this.props;
    onChangeOrderInput({
      ...orderInput,
      addressFull: addressFullData,
    });
  };

  render() {
    const {
      me,
      isAddressSelect,
      isNewAddress,
      orderInput,
      onChangeAddressType,
      deliveryAddresses,
    } = this.props;

    const { addressFull } = orderInput;

    // $FlowIgnore
    const addressValue = pathOr(
      null,
      ['orderInput', 'addressFull', 'value'],
      this.props,
    );
    return (
      <Row>
        <Col size={6}>
          <div styleName="container">
            <div styleName="title">Delivery info</div>
            <div styleName="receiverContainer">
              <Input
                fullWidth
                id="receiverName"
                label="Receiver name"
                onChange={this.handleChangeReceiver}
                value={orderInput.receiverName}
                limit={50}
              />
            </div>
            <div styleName="selectAddressContainer">
              <Checkbox
                id="existingAddressCheckbox"
                label="choose your address"
                isChecked={isAddressSelect}
                onChange={onChangeAddressType}
              />
              {isAddressSelect && (
                <div styleName="selectWrapper">
                  Address
                  <Select
                    items={addressesToSelect(deliveryAddresses)}
                    activeItem={
                      addressValue && { id: addressValue, label: addressValue }
                    }
                    onSelect={this.handleOnSelectAddress}
                    forForm
                    containerStyle={{ width: '24rem' }}
                  />
                </div>
              )}
            </div>
            <div styleName="newAddressForm">
              <Checkbox
                id="newAddressCheckbox"
                label="Or fill fields below and save as address"
                isChecked={isNewAddress}
                onChange={onChangeAddressType}
              />

              {isNewAddress && (
                <div styleName="formWrapper">
                  <AddressForm
                    isOpen
                    onChangeData={this.handleChangeData}
                    country={addressFull ? addressFull.country : null}
                    address={addressFull ? addressFull.value : null}
                    addressFull={addressFull}
                  />
                </div>
              )}
            </div>
          </div>
        </Col>
        <Col size={6}>
          {orderInput.addressFull.value && (
            <div styleName="addressInfoContainer">
              <AddressInfo
                addressFull={orderInput.addressFull}
                receiverName={
                  orderInput.receiverName || `${me.firstName} ${me.lastName}`
                }
                email={me.email}
              />
            </div>
          )}
        </Col>
      </Row>
    );
  }
}

export default CheckoutContent;