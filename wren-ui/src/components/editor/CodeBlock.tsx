import { useEffect } from 'react';
import { Button, Typography } from 'antd';
import styled from 'styled-components';
import '@/components/editor/AceEditor';
import { Loading } from '@/components/PageLoading';
import CheckOutlined from '@ant-design/icons/CheckOutlined';
import CopyOutlined from '@ant-design/icons/CopyOutlined';

const Block = styled.div<{ inline?: boolean; maxHeight?: string }>`
  position: relative;
  white-space: pre;
  font-size: 14px;
  border: 1px var(--gray-4) solid;
  border-radius: 4px;
  ${(props) =>
    props.inline
      ? `
      display: inline; border: none; background: transparent !important; padding: 0;
      * { display: inline !important; }
      `
      : `background: var(--gray-1); padding: 8px;`}

  .adm-code-wrap {
    ${(props) => (props.inline ? '' : 'overflow: auto;')}
    ${(props) => (props.maxHeight ? `max-height: ${props.maxHeight}px;` : ``)}
  }

  .adm-code-line {
    display: block;
    &-number {
      user-select: none;
      display: inline-block;
      min-width: 14px;
      text-align: right;
      margin-right: 1em;
      color: var(--gray-6);
      font-weight: 700;
      font-size: 14px;
    }
  }
`;

const CopyText = styled(Typography.Text)`
  position: absolute;
  top: 8px;
  right: 20px;
  font-size: 0;
  .ant-typography-copy {
    font-size: 12px;
  }

  .ant-btn:not(:hover) {
    color: var(--gray-8);
  }
`;

interface Props {
  code: string;
  copyable?: boolean;
  inline?: boolean;
  loading?: boolean;
  maxHeight?: string;
  showLineNumbers?: boolean;
}

const addThemeStyleManually = (cssText) => {
  // same id as ace editor appended, it will exist only one.
  const id = 'ace-tomorrow';
  const themeElement = document.getElementById(id);
  if (!themeElement) {
    const styleElement = document.createElement('style');
    styleElement.id = id;
    document.head.appendChild(styleElement);
    styleElement.appendChild(document.createTextNode(cssText));
  }
};

export default function CodeBlock(props: Props) {
  const { code, copyable, maxHeight, inline, loading, showLineNumbers } = props;
  const { ace } = window as any;
  const { Tokenizer } = ace.require('ace/tokenizer');
  const { SqlHighlightRules } = ace.require(`ace/mode/sql_highlight_rules`);
  const rules = new SqlHighlightRules();
  const tokenizer = new Tokenizer(rules.getRules());

  useEffect(() => {
    const { cssText } = ace.require('ace/theme/tomorrow');
    addThemeStyleManually(cssText);
  }, []);

  const lines = (code || '').split('\n').map((line, index) => {
    const tokens = tokenizer.getLineTokens(line).tokens;
    const children = tokens.map((token, index) => {
      const classNames = token.type.split('.').map((name) => `ace_${name}`);
      return (
        <span key={index} className={classNames.join(' ')}>
          {token.value}
        </span>
      );
    });

    return (
      <span className="adm-code-line ace_line" key={`${line}-${index}`}>
        {showLineNumbers && (
          <span className="adm-code-line-number">{index + 1}</span>
        )}
        {children}
      </span>
    );
  });

  return (
    <Block
      className="ace_editor ace-tomorrow adm_code-block"
      inline={inline}
      maxHeight={maxHeight}
    >
      <Loading spinning={loading}>
        <div className="adm-code-wrap">
          {lines}
          {copyable && (
            <CopyText
              copyable={{
                icon: [
                  <Button
                    key="copy-icon"
                    icon={<CopyOutlined />}
                    size="small"
                    style={{ backgroundColor: 'transparent' }}
                  />,
                  <Button
                    key="copied-icon"
                    icon={<CheckOutlined className="green-6" />}
                    size="small"
                  />,
                ],
              }}
            >
              {code}
            </CopyText>
          )}
        </div>
      </Loading>
    </Block>
  );
}
