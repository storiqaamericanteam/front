// @flow strict

import React, { Component } from 'react';
import { Editor } from 'slate-react';
import { Value } from 'slate';
import { contains } from 'ramda';
import PluginDeepTable from 'slate-deep-table';

import { log } from 'utils';

import Toolbar from './Toolbar';
import NodeVideo from './NodeVideo';

import './HTMLEditor.scss';

type PropsType = {
  //
};

type StateType = {
  value: {},
};

const tablePlugin = PluginDeepTable();

const plugins = [tablePlugin];

const initialValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            leaves: [
              {
                text: '',
              },
            ],
          },
        ],
      },
    ],
  },
});

const schema = {
  blocks: {
    image: {
      isVoid: true,
    },
    video: {
      isVoid: true,
    },
  },
};

const NodeImg = props => {
  const { attributes, src, selected } = props;
  return (
    <img
      {...attributes}
      src={src}
      alt=""
      style={{
        display: 'block',
        maxWidth: '100%',
        maxHeight: '20em',
        boxShadow: selected ? '0 0 0 2px blue' : 'none',
      }}
    />
  );
};

type NodeColorType = 'gray' | 'blue' | 'pink';
const colorsHashMap = {
  gray: '#505050',
  blue: '#03A9FF',
  pink: '#FF62A4',
};
const NodeColor = props => {
  const { children, attributes } = props;
  return (
    <span {...attributes} style={{ color: colorsHashMap[props.color] }}>
      {children}
    </span>
  );
};

const NodeBgColor = props => {
  const { children, attributes } = props;
  return (
    <span
      {...attributes}
      style={{ backgroundColor: colorsHashMap[props.color] }}
    >
      {children}
    </span>
  );
};

const NodeAligned = props => {
  const { children, attributes } = props;
  return (
    <div
      style={{ display: 'flex', flex: 1, justifyContent: props.align }}
      {...attributes}
    >
      {children}
    </div>
  );
};

class HTMLEditor extends Component<PropsType, StateType> {
  state = {
    value: initialValue,
  };

  onChange = ({ value }) => {
    this.setState({ value });
  };

  onInsertTable = () => {
    this.onChange(this.editor.insertTable());
  };

  onInsertColumn = () => {
    this.onChange(this.editor.insertColumn());
  };

  onInsertRow = () => {
    this.onChange(this.editor.insertRow());
  };

  onRemoveColumn = () => {
    this.onChange(this.editor.removeColumn());
  };

  onRemoveRow = () => {
    this.onChange(this.editor.removeRow());
  };

  onRemoveTable = () => {
    this.onChange(this.editor.removeTable());
  };

  onToggleHeaders = () => {
    this.onChange(this.editor.toggleTableHeaders());
  };

  editor = null;

  isAlignBlockType = (blockType: MarkType): boolean =>
    contains(blockType, ['align_left', 'align_center', 'align_right']);

  hasLinks = () => {
    const { value } = this.state;
    return value.inlines.some(inline => inline.type === 'link');
  };

  handleMarkButtonClicked = (type: MarkType) => {
    this.editor.toggleMark(type);
  };

  handleBlockButtonClicked = (blockType: MarkType) => {
    const isActive = this.state.value.blocks.some(
      node => node.type === blockType,
    );

    if (blockType === 'table') {
      this.onChange(this.editor.insertTable());
    } else if (blockType === 'video') {
      const src = window.prompt('Enter the id(!) of the youtube video:');
      if (!src) return;
      this.editor.command((editor, _src, target) => {
        if (target) {
          editor.select(target);
        }

        editor
          .insertBlock({
            type: 'video',
            data: { video: `https://www.youtube.com/embed/${_src}` },
          })
          .insertBlock({
            type: 'paragraph',
          });
      }, src);
    } else if (blockType === 'image') {
      const src = window.prompt('Enter the URL of the image:');
      if (!src) return;
      this.editor.command((editor, _src, target) => {
        if (target) {
          editor.select(target);
        }

        editor
          .insertBlock({
            type: 'image',
            data: { src: _src },
          })
          .insertBlock({
            type: 'paragraph',
          });
      }, src);
    } else if (blockType === 'link') {
      if (this.hasLinks()) {
        this.editor.command(editor => {
          editor.unwrapInline('link');
        });
      } else if (this.state.value.selection.isExpanded) {
        const href = window.prompt('Enter the URL of the link:');

        if (href === null) {
          return;
        }

        this.editor.command((editor, href) => {
          editor.wrapInline({
            type: 'link',
            data: { href },
          });

          editor.moveToEnd();
        }, href);
      } else {
        const href = window.prompt('Enter the URL of the link:');

        if (href === null) {
          return;
        }

        const text = window.prompt('Enter the text for the link:');

        if (text === null) {
          return;
        }

        this.editor
          .insertText(text)
          .moveFocusBackward(text.length)
          .command((editor, href) => {
            editor.wrapInline({
              type: 'link',
              data: { href },
            });

            editor.moveToEnd();
          }, href);
      }
    } else if (this.isAlignBlockType(blockType)) {
      const isType = this.state.value.blocks.some(
        block =>
          !!this.state.value.document.getClosest(
            block.key,
            parent => parent.type === blockType,
          ),
      );
      if (isType) {
        this.editor
          .setBlocks('paragraph')
          .unwrapBlock('align_left')
          .unwrapBlock('align_center')
          .unwrapBlock('align_right');
      } else {
        this.editor.wrapBlock(blockType);
      }
    } else {
      this.editor.setBlocks(isActive ? 'paragraph' : blockType);
    }
  };

  renderMark = (props, editor, next) => {
    const { children, mark, attributes } = props;

    switch (mark.type) {
      case 'color_gray':
        return <NodeColor {...props} color="gray" />;
      case 'color_blue':
        return <NodeColor {...props} color="blue" />;
      case 'color_pink':
        return <NodeColor {...props} color="pink" />;
      case 'bg_color_gray':
        return <NodeBgColor {...props} color="gray" />;
      case 'bg_color_blue':
        return <NodeBgColor {...props} color="blue" />;
      case 'bg_color_pink':
        return <NodeBgColor {...props} color="pink" />;
      case 'bold':
        return <strong {...attributes}>{children}</strong>;
      case 'italic':
        return <em {...attributes}>{children}</em>;
      case 'underlined':
        return <u {...attributes}>{children}</u>;
      default:
        return next();
    }
  };

  renderNode = (props, editor, next) => {
    const { attributes, children, node, isFocused } = props;

    switch (node.type) {
      case 'h1':
        return <h1 {...attributes}>{children}</h1>;
      case 'h2':
        return <h2 {...attributes}>{children}</h2>;
      case 'h3':
        return <h3 {...attributes}>{children}</h3>;
      case 'h4':
        return <h4 {...attributes}>{children}</h4>;
      case 'align_left':
        return <NodeAligned {...props} align="left" />;
      case 'align_center':
        return <NodeAligned {...props} align="center" />;
      case 'align_right':
        return <NodeAligned {...props} align="right" />;
      case 'link': {
        const { data } = node;
        const href = data.get('href');
        return (
          <a {...attributes} href={href}>
            {children}
          </a>
        );
      }
      case 'image': {
        const src = node.data.get('src');
        return <NodeImg {...props} src={src} selected={isFocused} />;
      }
      case 'video':
        return <NodeVideo {...props} />;
      default:
        return next();
    }
  };

  renderTableToolbar = () => (
    <div className="toolbar">
      <button style={{ margin: '0.5rem' }} onClick={this.onInsertColumn}>
        Insert Column
      </button>
      <button style={{ margin: '0.5rem' }} onClick={this.onInsertRow}>
        Insert Row
      </button>
      <button style={{ margin: '0.5rem' }} onClick={this.onRemoveColumn}>
        Remove Column
      </button>
      <button style={{ margin: '0.5rem' }} onClick={this.onRemoveRow}>
        Remove Row
      </button>
      <button style={{ margin: '0.5rem' }} onClick={this.onRemoveTable}>
        Remove Table
      </button>
    </div>
  );

  render() {
    const { value } = this.state;
    const isTable = this.editor && this.editor.isSelectionInTable(value);

    return (
      <div styleName="editor">
        {isTable ? (
          this.renderTableToolbar()
        ) : (
          <Toolbar
            editorValue={this.state.value}
            onMarkButtonClick={this.handleMarkButtonClicked}
            onBlockButtonClick={this.handleBlockButtonClicked}
          />
        )}
        <Editor
          autoFocus
          schema={schema}
          value={this.state.value}
          onChange={this.onChange}
          ref={ref => {
            this.editor = ref;
            if (ref) {
              this.submitChange = ref.change;
            }
          }}
          style={{
            border: '1px solid lightgray',
            width: '90%',
            height: '500px',
            padding: '2rem',
            overflowY: 'scroll',
          }}
          renderMark={this.renderMark}
          renderNode={this.renderNode}
          plugins={plugins}
          placeholder="Enter some text..."
        />
      </div>
    );
  }
}

export default HTMLEditor;
