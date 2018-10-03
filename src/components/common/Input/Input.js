// @flow strict

import React, { Component } from 'react';
import type { Element } from 'react';
import classNames from 'classnames';
import { isNil, isEmpty } from 'ramda';

import { Icon } from 'components/Icon';

import './Input.scss';

type PropsType = {
  id: string,
  value: string,
  label: string | Element<'span'>,
  errors?: ?Array<string>,
  onChange: (e: SyntheticInputEvent<HTMLInputElement>) => void,
  onBlur: (e: SyntheticInputEvent<HTMLInputElement>) => void,
  onFocus: (e: SyntheticInputEvent<HTMLInputElement>) => void,
  onKeyDown: () => void,
  onClick: () => void,
  min: string,
  icon: string,
  isUrl: boolean,
  inputRef: ?(node: ?HTMLInputElement) => void,
  isAutocomplete: boolean,
  limit?: ?number,
  type?: string,
  fullWidth?: boolean,
  postfix: string,
  dataTest: ?string,
  inline: boolean,
  search: boolean,
  align?: 'center' | 'left' | 'right',
};

type StateType = {
  labelFloat: boolean,
  isFocus: boolean,
};

class Input extends Component<PropsType, StateType> {
  static defaultProps = {
    id: 'stq-input',
    label: '',
    icon: '',
    isAutocomplete: false,
    search: false,
    isUrl: false,
    postfix: '',
    dataTest: '',
    min: '',
    inline: false,
    onChange: () => {},
    onBlur: () => {},
    onFocus: () => {},
    onKeyDown: () => {},
    onClick: () => {},
    inputRef: () => {},
  };
  static getDerivedStateFromProps(nextProps: PropsType, prevState: StateType) {
    const value = nextProps.value == null ? '' : `${nextProps.value}`;
    if (Boolean(value) !== prevState.labelFloat) {
      return {
        ...prevState,
        labelFloat: prevState.isFocus ? true : Boolean(value),
      };
    }

    return null;
  }

  state = {
    labelFloat: false,
    isFocus: false,
  };

  input: ?HTMLInputElement;

  handleChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const { onChange } = this.props;
    onChange(e);
  };

  handleFocus = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const { onFocus } = this.props;
    this.setState({
      labelFloat: !this.state.labelFloat || true,
      isFocus: true,
    });
    if (onFocus) onFocus(e);
  };

  handleBlur = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const { value, onBlur } = this.props;
    this.setState({
      labelFloat: Boolean(value) && value.length > 0,
      isFocus: false,
    });
    if (onBlur) onBlur(e);
  };

  renderInput() {
    const {
      onChange,
      inputRef,
      isAutocomplete,
      id,
      value,
      type,
      min,
      dataTest,
      align,
    } = this.props;
    return isAutocomplete ? (
      <input
        type="text"
        ref={inputRef}
        value={this.props.value || ''}
        onChange={onChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onKeyDown={this.props.onKeyDown}
        onClick={this.props.onClick}
        data-test={!isEmpty(dataTest) || id}
        style={{ textAlign: align || 'left' }}
      />
    ) : (
      <input
        id={id}
        ref={inputRef}
        name={id}
        type={!isNil(type) || 'text'}
        value={value || ''}
        min={!isEmpty(min) || ''}
        onChange={onChange}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
        onKeyDown={this.props.onKeyDown}
        data-test={!isEmpty(dataTest) || id}
        style={{ textAlign: align || 'left' }}
      />
    );
  }

  render() {
    const {
      id,
      value,
      label,
      errors,
      icon,
      isUrl,
      limit,
      fullWidth,
      postfix,
      inline,
      search,
    } = this.props;
    const { labelFloat, isFocus } = this.state;
    return (
      <label
        htmlFor={id}
        styleName={classNames('container', {
          isFocus,
          isError: errors,
          isIcon: icon || search,
          isSearch: search,
          fullWidth,
          inline,
        })}
      >
        {!isEmpty(label) && (
          <span
            styleName={classNames('label', { labelFloat: labelFloat || value })}
          >
            {label}
          </span>
        )}
        {(icon || search) && (
          <div styleName="icon">
            <Icon type={search ? 'magnifier' : icon} />
          </div>
        )}
        <div styleName="input">
          <div styleName="inputContent">
            {this.renderInput()}
            {!isEmpty(postfix) && <span styleName="postfix">{postfix}</span>}
          </div>
          <hr />
        </div>
        {errors &&
          errors.length > 0 && (
            <div styleName="errors">
              {errors.map((item, idx) => (
                <div
                  key={/* eslint-disable */ idx /* eslint-enable */}
                  id={`error-label-${id}`}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        {isFocus &&
          !isUrl &&
          !isNil(limit) && (
            <div
              styleName={classNames('valueLength', {
                maxValueLength: value && value.length === limit,
              })}
            >
              {value ? value.length : 0} / {limit}
            </div>
          )}
      </label>
    );
  }
}

export default Input;
