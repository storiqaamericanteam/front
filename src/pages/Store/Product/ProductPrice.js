// @flow

import React, { Fragment } from 'react';
import classNames from 'classnames';
import { map, addIndex } from 'ramda';

import { CurrencyPrice } from 'components/common';
import { MultiCurrencyDropdown } from 'components/common/MultiCurrencyDropdown';
import { formatPrice, currentCurrency } from 'utils';

import './ProductPrice.scss';

type PropsType = {
  currency?: string,
  price: number,
  cashback: number,
  discount: number,
  buttonText?: string,
  priceUsd: ?number,
};

const indexedMap = addIndex(map);

const ProductPrice = ({
  currency,
  price,
  cashback,
  discount,
  buttonText,
  priceUsd,
}: PropsType) => (
  <div styleName="container">
    {discount && discount > 0 ? (
      <div styleName="price">
        <div styleName="title">
          <strong>Price</strong>
        </div>
        <thin styleName="lastPrice">
          {formatPrice(price)} {currency}
        </thin>
      </div>
    ) : null}
    <div styleName="stq">
      <MultiCurrencyDropdown
        price={discount && discount > 0 ? price * (1 - discount) : price}
        renderPrice={(item: { price: number, currencyCode: string }) => (
          <Fragment>
            <div styleName="title">
              <strong>Discount price</strong>
            </div>
            <div styleName="discountPrice">
              <b>
                {formatPrice(item.price)} {item.currencyCode}
              </b>
              {priceUsd && (
                <div styleName="currencyPrice">
                  <span styleName="slash">/</span>
                  <CurrencyPrice
                    forProduct
                    reverse
                    price={item.price || 0}
                    currencyPrice={priceUsd}
                    currencyCode="$"
                    toFixedValue={2}
                  />
                </div>
              )}
            </div>
          </Fragment>
        )}
        renderDropdown={(
          rates: Array<{ currencyCode: string, value: number }>,
        ) => (
          <div styleName="priceDropdownList">
            {indexedMap(
              (item, idx) =>
                item.currencyCode !== currentCurrency() && (
                  <div key={`priceDropdownItem-${idx}-${item.currencyCode}`}>
                    {`${formatPrice(item.value)} ${item.currencyCode}`}
                  </div>
                ),
              rates,
            )}
          </div>
        )}
        renderDropdownToggle={(isDropdownOpened: boolean) => (
          <button
            styleName={
              isDropdownOpened ? 'dropdownToggleOpened' : 'dropdownToggleClosed'
            }
          />
        )}
      />
      {Boolean(cashback) && (
        <div styleName={classNames('cashback', { noCashback: !cashback })}>
          {buttonText} {`${cashback ? (cashback * 100).toFixed(0) : 0}%`}
        </div>
      )}
    </div>
  </div>
);

ProductPrice.defaultProps = {
  currency: currentCurrency() || 'STQ',
  buttonText: 'Cashback',
};

export default ProductPrice;
