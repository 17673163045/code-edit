import React from 'react'
import { useDebounceFn } from "ahooks"

import { Button, Grow, Paper } from '@mui/material'

import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'

import styles from './index.less'

export default function IndexPage(props: any) {
    const { id, onDelete, itemData } = props;
    const { html: htmlCodeProp, css: cssCodeProp, js: jsCodeProp, title: titleProp } = itemData || {};
    const iframeRef = React.useRef<any>();
    const titleRef = React.useRef<any>();
    const [hoveredAdd, setHoveredAdd] = React.useState(false);
    const [hoveredDelete, setHoveredDelete] = React.useState(false);
    const [codeModule, setCodeModule] = React.useState({
        html: true,
        css: false,
        js: false
    });

    const [htmlCode, setHtmlCode] = React.useState<string>(htmlCodeProp || defaultHtmlCode);
    const [cssCode, setCssCode] = React.useState<string>(cssCodeProp);
    const [jsCode, setJsCode] = React.useState<string>(jsCodeProp);

    const [title, setTitle] = React.useState(titleProp || '');

    React.useEffect(() => {
        if (!titleRef.current) return;
        titleRef.current.innerHTML = title;
    }, [titleRef.current])

    React.useEffect(() => {
        if (!iframeRef.current) return;
        loadHtml(iframeRef.current.contentDocument, htmlCode)
        loadCss(iframeRef.current.contentDocument, cssCode)
        loadJS(iframeRef.current.contentDocument, jsCode)
    }, [iframeRef.current])

    function loadHtml(dt: any, code: string) {
        const _html = dt.querySelector('#customHTML')
        if (_html) dt.body.removeChild(_html)
        const html = dt.createElement('div')
        html.id = 'customHTML'
        html.innerHTML = code
        dt.body.appendChild(html)
    }

    const { run: debounceLoadHtml } = useDebounceFn(loadHtml, { wait: 600 })

    function loadCss(dt: any, code: string) {
        const _css = dt.querySelector('#customCSS')
        if (_css) dt.head.removeChild(_css)
        const css = dt.createElement('style')
        css.id = 'customCSS'
        css.innerHTML = code
        dt.head.appendChild(css)
    }
    const { run: debounceLoadCss } = useDebounceFn(loadCss, { wait: 600 })

    function loadJS(dt: any, code: string) {
        const _script = dt.querySelector('#customJS')
        if (_script) dt.body.removeChild(_script)
        const script = dt.createElement('script')
        script.id = 'customJS'
        script.innerHTML = `try{${code}}catch(e){}`
        dt.body.appendChild(script)
    }
    const { run: debounceLoadJs } = useDebounceFn(loadJS, { wait: 600 })

    function addCodeModule(codeModule: string) {
        const loadMap: any = {
            html: debounceLoadHtml,
            css: debounceLoadCss,
            js: debounceLoadJs
        };
        const codeMap: any = {
            html: htmlCode,
            css: cssCode,
            js: jsCode
        }
        setCodeModule(pre => ({ ...pre, [codeModule]: true }))
        loadMap[codeModule]?.(iframeRef.current.contentDocument, codeMap[codeModule])
    }

    function deleteCodeModule(codeModule: string) {
        setCodeModule(pre => ({ ...pre, [codeModule]: false }))
    }

    function onCodeChange(code: any, type: 'html' | 'css' | 'js' | 'title') {
        const editCodeList: any[] = JSON.parse(localStorage.getItem('editCodeList') || '[]');
        if (editCodeList.length && !!editCodeList.filter(item => item?.id === id)[0]) {
            const currentIndex = editCodeList.findIndex(item => item.id === id);
            editCodeList[currentIndex][type] = code;
        } else {
            editCodeList.push({ id, [type]: code })
        }
        localStorage.setItem('editCodeList', JSON.stringify(editCodeList))
    }

    const renderHtmlCodeModule = <div className={`${styles.editorWrap} ${styles.htmlEditor}`}>
        <div className={styles.codeCopy}>html 复制代码</div>
        <CodeMirror
            style={{ height: '100%' }}
            extensions={[html({ matchClosingTags: true })]}
            value={htmlCode}
            onChange={(code) => {
                setHtmlCode(code);
                debounceLoadHtml(iframeRef.current.contentDocument, code)
                onCodeChange(code, 'html')
            }}
        />
    </div>;

    const renderCssModule = <div className={`${styles.editorWrap} ${styles.cssEditor}`}>
        <div className={styles.codeCopy}>css 复制代码</div>
        <CodeMirror
            style={{ height: '100%' }}
            extensions={[css()]}
            value={cssCode}
            onChange={(code) => {
                setCssCode(code)
                debounceLoadCss(iframeRef.current.contentDocument, code)
                onCodeChange(code, 'css')
            }}
        />
    </div>;

    const renderJSModule = <div className={`${styles.editorWrap} ${styles.jsEditor}`}>
        <div className={styles.codeCopy}>javascript 复制代码</div>
        <CodeMirror
            extensions={[javascript({ jsx: true })]}
            value={jsCode}
            onChange={(code) => {
                setJsCode(code)
                debounceLoadJs(iframeRef.current.contentDocument, code)
                onCodeChange(code, 'js')
            }}
        />
    </div>;

    const renderAdd = <div className={styles.add} onMouseLeave={() => setHoveredAdd(false)} onMouseEnter={() => setHoveredAdd(true)}>
        <Button>添加</Button>
        <Grow in={hoveredAdd}>
            <Paper className={styles.menu}>
                <li>
                    <Button style={{ width: '100%' }} onClick={() => addCodeModule('html')}>添加Html模块</Button>
                </li>
                <li>
                    <Button style={{ width: '100%' }} onClick={() => addCodeModule('css')}>添加Css模块</Button>
                </li>
                <li>
                    <Button style={{ width: '100%' }} onClick={() => addCodeModule('js')}>添加Js模块</Button>
                </li>
            </Paper>
        </Grow>
    </div>

    const renderDelete = <div className={styles.delete} onMouseLeave={() => setHoveredDelete(false)} onMouseEnter={() => setHoveredDelete(true)}>
        <Button>删除</Button>
        <Grow in={hoveredDelete}>
            <Paper className={styles.menu}>
                <li>
                    <Button style={{ width: '100%' }} onClick={() => deleteCodeModule('html')}>删除Html模块</Button>
                </li>
                <li>
                    <Button style={{ width: '100%' }} onClick={() => deleteCodeModule('css')}>删除Css模块</Button>
                </li>
                <li>
                    <Button style={{ width: '100%' }} onClick={() => deleteCodeModule('js')}>删除Js模块</Button>
                </li>
                <li>
                    <Button style={{ width: '100%' }} onClick={() => onDelete?.(id)}>删除此项</Button>
                </li>
            </Paper>
        </Grow>
    </div>;

    return (
        <div className={styles.wrap}>
            <div className={styles.titleWrap}>
                <div ref={titleRef} className={styles.title} contentEditable onInput={(e: any) => {
                    onCodeChange(e.target.innerHTML, 'title')
                    setTitle(e.target.innerHTML)
                }}>
                </div>
                {renderAdd}
                {renderDelete}
            </div>

            <div className={styles.container}>
                <div className={styles.editorsContainer}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
                        {/* html */}
                        {codeModule.html && renderHtmlCodeModule}

                        {/* css */}
                        {codeModule.css && renderCssModule}

                        {/* js */}
                        {codeModule.js && renderJSModule}
                    </div>
                </div>

                {/* iframe */}
                <div className={styles.iframeWrap} style={{ display: Object.values(codeModule).some(item => !!item) ? 'block' : 'none' }}>
                    <iframe ref={iframeRef} />
                </div>
            </div>
        </div>
    );
}

const defaultHtmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
</body>
</html>`