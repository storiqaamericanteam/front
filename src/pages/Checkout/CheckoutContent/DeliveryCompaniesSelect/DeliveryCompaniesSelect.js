// @flow strict

import React, { Component, Fragment } from 'react';
import { find, whereEq, isEmpty } from 'ramda';
import PropTypes from 'prop-types';

import { SpinnerCircle, Button } from 'components/common';

import { fetchAvailableDeliveryPackages } from './DeliveryCompaniesSelect.utils';
import Dropdown from './Dropdown';

import type { AvailableDeliveryPackageType } from './DeliveryCompaniesSelect.utils';

import './DeliveryCompaniesSelect.scss';

type PropsType = {
  country: string,
  baseProductId: number,
  selectedCompanyShippingRawId: ?number,
  onPackagesFetched: (packages: Array<AvailableDeliveryPackageType>) => void,
  onPackageSelect: (pkg: ?AvailableDeliveryPackageType) => Promise<boolean>,
};

type StateType = {
  isFetching: boolean,
  isFetchingError: boolean,
  packages: Array<AvailableDeliveryPackageType>,
  isDropdownOpened: boolean,
  selectedPackage: ?AvailableDeliveryPackageType, // using for temp handling
  isLoading: boolean,
  isError: boolean,
};

const Loading = () => (
  <div styleName="loadingWrapper">
    <div>loading...</div>
    <SpinnerCircle
      additionalStyles={{ width: '2rem', height: '2rem' }}
      containerStyles={{ width: '2rem', height: '2rem', marginLeft: 0 }}
    />
  </div>
);

const FetchError = ({ onRetryClick }: { onRetryClick: () => void }) => (
  <div styleName="errorWrapper">
    <div>Error :( Please, retry</div>
    <div>
      <Button small onClick={onRetryClick}>
        Retry
      </Button>
    </div>
  </div>
);

class DeliveryCompaniesSelect extends Component<PropsType, StateType> {
  state = {
    isFetching: true,
    isFetchingError: false,
    packages: [],
    isDropdownOpened: false,
    selectedPackage: null,
    isLoading: false,
    isError: false,
  };

  componentDidMount() {
    this.mounted = true;
    this.fetchData();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  mounted: boolean = false;

  fetchData = () => {
    this.setState({ isFetching: true, isFetchingError: false });
    fetchAvailableDeliveryPackages({
      destinationCountry: this.props.country,
      baseProductId: this.props.baseProductId,
      environment: this.context.environment,
    })
      .then(packages => {
        this.setState({ packages }, () => {
          this.props.onPackagesFetched(packages);
        });
      })
      .catch(() => {
        this.setState({ isFetchingError: true });
      })
      .finally(() => {
        this.setState({ isFetching: false });
      });
  };

  render() {
    const {
      isFetching,
      isFetchingError,
      selectedPackage,
      packages,
    } = this.state;

    const selectedPkg = find(
      whereEq({ shippingId: this.props.selectedCompanyShippingRawId }),
      packages,
    );

    return (
      <div styleName="container">
        {isFetching && <Loading />}
        {isFetchingError && <FetchError onRetryClick={this.fetchData} />}
        {!isFetching &&
          !isFetchingError && (
            <Fragment>
              {!isEmpty(packages) ? (
                <Dropdown
                  packages={this.state.packages}
                  selectedPackage={selectedPackage || selectedPkg}
                  isOpen={this.state.isDropdownOpened}
                  isLoading={this.state.isLoading}
                  isError={this.state.isError}
                  toggleExpand={(e: SyntheticEvent<HTMLDivElement>) => {
                    e.stopPropagation();
                    const { selectedCompanyShippingRawId } = this.props;
                    this.setState(prevState => {
                      if (prevState.isDropdownOpened) {
                        return {
                          selectedPackage:
                            selectedCompanyShippingRawId == null
                              ? null
                              : find(
                                  whereEq({ selectedCompanyShippingRawId }),
                                  this.state.packages,
                                ),
                          isDropdownOpened: !prevState.isDropdownOpened,
                        };
                      }
                      return {
                        isDropdownOpened: !prevState.isDropdownOpened,
                      };
                    });
                  }}
                  onPackageSelect={(id: string) => {
                    if (selectedPackage && selectedPackage.id === id) {
                      this.setState({ selectedPackage: null });
                    } else {
                      this.setState({
                        selectedPackage: find(
                          whereEq({ id }),
                          this.state.packages,
                        ),
                      });
                    }
                  }}
                  onAccept={() => {
                    this.setState({ isLoading: true, isError: false }, () => {
                      this.props
                        .onPackageSelect(this.state.selectedPackage)
                        .catch(() => {
                          this.setState({ isError: true });
                        })
                        .finally(() => {
                          this.setState({
                            isLoading: false,
                            isDropdownOpened: false,
                            selectedPackage: null,
                          });
                        });
                    });
                  }}
                />
              ) : (
                <span>Seller does not ship to selected country</span>
              )}
            </Fragment>
          )}
      </div>
    );
  }
}

DeliveryCompaniesSelect.contextTypes = {
  environment: PropTypes.object.isRequired,
};

export default DeliveryCompaniesSelect;