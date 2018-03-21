// @flow

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { pathOr } from 'ramda';

import { currentUserShape } from 'utils/shapes';
import { Page } from 'components/App';
import { Container, Row, Col } from 'layout';

import CategoriesMenu from './CategoriesMenu';

import './Start.scss';

class Start extends PureComponent<{}> {
  render() {
    const categories = pathOr({}, ['categories', 'children'], this.context.directories);
    return (
      <div styleName="container">
        <CategoriesMenu categories={categories} />
        <Container>
          <Row>
            <Col size={4}>
              Block
            </Col>
            <Col size={4}>
              Block
            </Col>
            <Col size={4}>
              Block
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

Start.contextTypes = {
  environment: PropTypes.object.isRequired,
  directories: PropTypes.object,
  currentUser: currentUserShape,
};

export default Page(Start);