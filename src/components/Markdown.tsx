import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { isValidElement, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { MermaidDiagram } from './MermaidDiagram';

interface Props {
  source: string;
  className?: string;
}

function extractLang(node: ReactNode): string | null {
  if (!isValidElement(node)) return null;
  const cls = (node.props as { className?: string }).className ?? '';
  const m = /language-(\w+)/.exec(cls);
  return m ? m[1] : null;
}

function extractCodeText(node: ReactNode): string {
  if (!isValidElement(node)) return '';
  return String((node.props as { children?: ReactNode }).children ?? '');
}

export function Markdown({ source, className }: Props) {
  return (
    <div className={cn('prose-app', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Bypass <pre> for mermaid blocks so the diagram renders cleanly.
          pre({ children, ...rest }) {
            const lang = extractLang(children);
            if (lang === 'mermaid') {
              return <MermaidDiagram source={extractCodeText(children).trim()} />;
            }
            return <pre {...rest}>{children}</pre>;
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
