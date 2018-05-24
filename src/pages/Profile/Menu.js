// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'found';
import classNames from 'classnames';

import { UploadWrapper } from 'components/Upload';
import { Icon } from 'components/Icon';
import { uploadFile, log, fromRelayError } from 'utils';

import { UpdateUserMutation } from 'relay/mutations';
import type { MutationParamsType } from 'relay/mutations/UpdateUserMutation';

import './Menu.scss';

type PropsType = {
  menuItems: Array<{ id: string, title: string }>,
  activeItem: string,
  firstName: string,
  lastName: string,
  avatar: ?string,
  id: string,
};

class Menu extends PureComponent<PropsType> {
  handleOnUpload = async (e: any) => {
    e.preventDefault();
    const file = e.target.files[0];
    const result = await uploadFile(file);
    if (result && result.url) {
      // this.props.onLogoUpload(result.url);
      this.handleUpdateUser(result.url);
    }
  };

  handleUpdateUser = (avatar: string) => {
    const { environment } = this.context;

    const params: MutationParamsType = {
      input: {
        clientMutationId: '',
        avatar,
        id: this.props.id,
        phone: null,
        firstName: null,
        lastName: null,
        birthdate: null,
        gender: null,
      },
      environment,
      onCompleted: (response: ?Object, errors: ?Array<any>) => {
        log.debug({ response, errors });
        const relayErrors = fromRelayError({ source: { errors } });
        log.debug({ relayErrors });
      },
      onError: (error: Error) => {
        log.debug({ error });
        const relayErrors = fromRelayError(error);
        log.debug({ relayErrors });
        // eslint-disable-next-line
        alert('Something going wrong :(');
      },
    };
    UpdateUserMutation.commit(params);
  };

  render() {
    const { activeItem, menuItems, firstName, lastName, avatar } = this.props;
    return (
      <div styleName="menu">
        <div styleName="imgWrap">
          <UploadWrapper
            id="new-store-id"
            onUpload={this.handleOnUpload}
            buttonHeight={26}
            buttonWidth={26}
            buttonIconType="user"
            buttonIconSize={48}
            buttonLabel="Click to download avatar"
            overPicture={avatar}
            dataTest="storeImgUploader"
          />
          {avatar && (
            <div
              styleName="cross"
              onClick={() => {
                this.handleUpdateUser('');
              }}
              onKeyDown={() => {}}
              role="button"
              tabIndex="0"
            >
              <Icon type="cross" />
            </div>
          )}
        </div>
        <div styleName="title">{`${firstName} ${lastName}`}</div>
        <div styleName="items">
          {menuItems.map(item => {
            const isActive = item.id === activeItem;
            return (
              <Link
                key={item.id}
                to={`/profile/${item.id}`}
                styleName={classNames('item', { isActive })}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }
}

Menu.contextTypes = {
  environment: PropTypes.object.isRequired,
};

export default Menu;