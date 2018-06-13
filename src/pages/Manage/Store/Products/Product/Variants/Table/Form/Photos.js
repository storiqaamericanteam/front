// @flow

import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';

import { UploadWrapper } from 'components/Upload';
import { uploadFile, convertSrc } from 'utils';

import './Photos.scss';

type PropsType = {
  onAddPhoto: Function,
  photos: ?Array<string>,
};

class Photos extends PureComponent<PropsType> {
  handleOnUpload = async (e: any) => {
    e.preventDefault();
    const file = e.target.files[0];
    const result = await uploadFile(file);
    if (!result.url) return;
    this.props.onAddPhoto(result.url);
  };

  render() {
    const { photos: items } = this.props;
    return (
      <div styleName="container">
        <div styleName="title">
          <strong>Product photos</strong>
        </div>
        <div styleName="upload">
          <UploadWrapper
            id="foods_foto"
            onUpload={this.handleOnUpload}
            buttonHeight={10}
            buttonWidth={10}
            buttonIconType="camera"
            buttonLabel="Add photo"
            dataTest="productPhotosUploader"
          />
        </div>
        {items &&
          items.length > 0 && (
            <Fragment>
              {items.map(item => (
                <div key={item} styleName="item">
                  <div styleName="itemWrap">
                    <img src={convertSrc(item, 'small')} alt="img" />
                  </div>
                </div>
              ))}
            </Fragment>
          )}
      </div>
    );
  }
}

Photos.contextTypes = {
  directories: PropTypes.object,
};

export default Photos;
