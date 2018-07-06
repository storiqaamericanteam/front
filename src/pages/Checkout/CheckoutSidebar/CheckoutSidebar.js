// @flow

import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-relay';
import { pathOr, map } from 'ramda';

import { formatPrice } from 'utils';
import { Button } from 'components/common/Button';

import { calcTotal } from '../utils';

import './CheckoutSidebar.scss';

const STICKY_THRESHOLD_REM = 90;

type PropsType = {
  storesRef: ?Object,
  onClick: Function,
  isReadyToClick: Function,
  buttonText: string,
};

type Totals = ?{
  productsCost: number,
  deliveryCost: number,
  totalCount: number,
  totalCost: number,
};

type StateType = {
  currentClass: 'sticky' | 'top' | 'bottom',
  totals: Totals,
};

const STICKY_PADDING_TOP_REM = 2;
const STICKY_PADDING_BOTTOM_REM = 2;

const STORES_FRAGMENT = graphql`
  fragment CheckoutSidebarStoresLocalFragment on CartStoresConnection { 
    edges { 
      node { 
        id 
        productsCost 
        deliveryCost 
        totalCost 
        totalCount
      }
    }
  }
`;

const getTotals = (data: any) => {
  const stores = map(i => i.node, pathOr([], ['edges'], data));
  return {
    productsCost: calcTotal(stores, 'productsCost') || 0,
    deliveryCost: calcTotal(stores, 'deliveryCost') || 0,
    totalCount: calcTotal(stores, 'totalCount') || 0,
    totalCost: calcTotal(stores, 'totalCost') || 0,
  };
};

class CheckoutSidebar extends React.Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props);
    this.handleScroll = this.handleScrollEvent.bind(this);
    this.state = {
      currentClass: 'top',
      totals: null,
    };
  }

  componentWillMount() {
    const store = this.context.environment.getStore();
    if (process.env.BROWSER) {
      window.store = store;
    }
    const connectionId = `client:root:cart:__Cart_stores_connection`; 
    // const connectionId = `client:root:__Cart_stores_connection`;
    const queryNode = STORES_FRAGMENT.data();
    const snapshot = store.lookup({
      dataID: connectionId, // root
      node: queryNode, // query starting from root
    });
    const { dispose } = store.subscribe(snapshot, s => {
      console.log('>>> CheckoutSidebar snapshot: ', { s: s.data, store });
      this.setState({ totals: getTotals(s.data) });
    });
    this.dispose = dispose;
    console.log('>>> CheckoutSide:__Cart_stores_connectionbar snapshot: ', { snapshot: snapshot.data, store });
    this.setState({ totals: getTotals(snapshot.data) });
  }

  componentDidMount() {
    if (!window) return;
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    if (!window) return;
    window.removeEventListener('scroll', this.handleScroll);
    if (this.dispose) {
      this.dispose();
    }
  }

  setRef(ref: ?Object) {
    this.ref = ref;
  }

  dispose: Function;
  ref: ?{ className: string };
  scrolling: boolean;
  handleScroll: () => void;
  scrolling = false;

  updateStickiness() {
    if (!window) return;
    if (!this.ref || !this.props.storesRef) return;
    const rem = parseFloat(
      window.getComputedStyle(document.documentElement).fontSize,
    );
    const offset = window.pageYOffset;
    // $FlowIgnoreMe
    const rect = this.ref.getBoundingClientRect();
    const height = rect.bottom - rect.top;
    const {
      top: viewTop,
      bottom: viewBottom,
      // $FlowIgnoreMe
    } = this.props.storesRef.getBoundingClientRect();
    if (viewBottom - viewTop < STICKY_THRESHOLD_REM * rem) {
      if (this.state.currentClass !== 'top') {
        this.setState({ currentClass: 'top' });
      }
      return;
    }
    const top = viewTop + (offset - STICKY_PADDING_TOP_REM * rem);
    const bottom =
      viewBottom +
      (offset - (STICKY_PADDING_TOP_REM + STICKY_PADDING_BOTTOM_REM) * rem);
    let currentClass = 'top';
    if (offset >= top) {
      currentClass = 'sticky';
    }
    if (offset + height >= bottom) {
      currentClass = 'bottom';
    }
    // $FlowIgnoreMe
    if (this.ref.className !== currentClass) {
      // $FlowIgnoreMe
      this.ref.className = currentClass;
    }
  }

  handleScrollEvent() {
    if (!this.scrolling) {
      window.requestAnimationFrame(() => {
        this.updateStickiness();
        this.scrolling = false;
      });
      this.scrolling = true;
    }
  }

  render() {
    const { totals } = this.state;
    const { onClick, isReadyToClick, buttonText } = this.props;
    return (
      <div className="top" ref={ref => this.setRef(ref)}>
        <div styleName="container">
          <div styleName="title">Subtotal</div>
          <div styleName="totalsContainer">
            <div styleName="attributeContainer">
              <div styleName="label">Subtotal</div>
              <div styleName="value">
                {totals && `${formatPrice(totals.productsCost || 0)} STQ`}
              </div>
            </div>
            <div styleName="attributeContainer">
              <div styleName="label">Delivery</div>
              <div styleName="value">
                {totals && `${formatPrice(totals.deliveryCost || 0)} STQ`}
              </div>
            </div>
            <div styleName="attributeContainer">
              <div styleName="label">
                Total{' '}
                <span styleName="subLabel">
                  ({totals && totals.totalCount} items)
                </span>
              </div>
              <div styleName="value">
                {totals && `${formatPrice(totals.totalCost || 0)} STQ`}
              </div>
            </div>
          </div>
          <div styleName="checkout">
            <Button
              id="cartTotalCheckout"
              disabled={!isReadyToClick}
              big
              onClick={onClick}
            >
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

CheckoutSidebar.contextTypes = {
  environment: PropTypes.object.isRequired,
};

export default CheckoutSidebar;
