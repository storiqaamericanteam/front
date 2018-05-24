// @flow

import React, { Component } from 'react';
import cn from 'classnames';

import { Icon } from 'components/Icon';

import './ShowMore.scss';

type PropsType = {
  height?: ?number, // max container height in rem (needed for animation)
  children?: any,
};

type StateType = {
  on: boolean,
};

class ShowMore extends Component<PropsType, StateType> {
  state = {
    on: false,
  };

  handleClick() {
    this.setState({ on: !this.state.on });
  }

  render() {
    const title = this.state.on ? 'Show less' : 'Show more';
    const height = this.state.on ? this.props.height || 25 : 0;
    return (
      <div>
        <button styleName="header" onClick={() => this.handleClick()}>
          <div styleName="icon">
            <div styleName={cn({ on: this.state.on, off: !this.state.on })}>
              <Icon type="arrowExpand" size={16} inline />
            </div>
          </div>
          <div styleName="text">{title}</div>
        </button>
        <div styleName="content" style={{ maxHeight: `${height}rem` }}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default ShowMore;