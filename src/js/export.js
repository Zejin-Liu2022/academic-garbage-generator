/**
 * 导出功能模块
 * 负责 Word 和 PDF 导出
 */

// 辅助函数：获取去分页后的纯净内容容器
function getCleanContentContainer() {
    const container = document.createElement('div');
    container.className = 'paper-page';
    
    container.style.minHeight = 'auto';
    container.style.height = 'auto';
    container.style.margin = '0';
    container.style.boxShadow = 'none';
    container.style.padding = '20mm';
    container.style.width = '210mm';
    container.style.backgroundColor = 'white';
    
    const pages = document.querySelectorAll('.paper-page');
    pages.forEach(page => {
        Array.from(page.children).forEach(child => {
            if (child.id !== 'placeholder-text') {
                container.appendChild(child.cloneNode(true));
            }
        });
    });
    
    return container;
}

function exportToWord() {
    const headerTitle = document.getElementById('headerTitle').value || 'document';
    
    const cleanContainer = getCleanContentContainer();
    
    let isRef = false;
    Array.from(cleanContainer.children).forEach(child => {
        if (child.tagName === 'H4' && (child.innerText.includes('参考文献') || child.innerText.includes('References'))) {
            isRef = true;
            child.style.cssText = 'font-family: "SimHei", sans-serif !important; font-size: 14pt !important; text-align: center; margin-top: 2em; border-top: 1px solid #000; padding-top: 1em;';
        } else if (isRef) {
            if (['H1', 'H2', 'H3'].includes(child.tagName)) {
                isRef = false;
            } else if (child.tagName === 'P') {
                child.style.cssText = 'font-family: "Times New Roman", "SimSun", serif !important; font-size: 10.5pt !important; text-indent: 0 !important; margin-bottom: 4px;';
            }
        }
    });

    const contentHtml = cleanContainer.innerHTML;

    const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { 
                    font-family: "Times New Roman", serif; 
                    mso-fareast-font-family: "SimSun";
                    font-size: 12pt;
                    line-height: 1.5; 
                }
                
                p { 
                    font-family: "Times New Roman", serif;
                    mso-fareast-font-family: "SimSun";
                    font-size: 12pt;
                    text-indent: 2em; 
                    text-align: justify; 
                    margin-bottom: 0;
                    line-height: 1.5; 
                }

                h1 { 
                    font-family: "SimHei", sans-serif; 
                    mso-fareast-font-family: "SimHei";
                    font-size: 22pt;
                    font-weight: bold; 
                    text-align: center; 
                    margin-bottom: 24px; 
                    text-indent: 0 !important; 
                }

                h2 { 
                    font-family: "SimHei", sans-serif; 
                    mso-fareast-font-family: "SimHei"; 
                    font-size: 16pt;
                    font-weight: bold; 
                    margin-top: 18pt; 
                    margin-bottom: 12pt; 
                    text-indent: 0 !important; 
                }

                h3 { 
                    font-family: "SimHei", sans-serif; 
                    mso-fareast-font-family: "SimHei"; 
                    font-size: 14pt;
                    font-weight: bold; 
                    margin-top: 12pt; 
                    margin-bottom: 6pt; 
                    text-indent: 0 !important; 
                }

                h4 { 
                    font-family: "SimHei", sans-serif; 
                    mso-fareast-font-family: "SimHei"; 
                    font-size: 12pt;
                    font-weight: bold; 
                    margin-top: 12pt; 
                    margin-bottom: 6pt; 
                    text-indent: 0 !important; 
                }

                .abstract, .keywords { 
                    font-family: "Times New Roman", serif;
                    mso-fareast-font-family: "SimSun";
                    font-size: 12pt;
                    margin-bottom: 1em; 
                    padding: 0 2em; 
                    text-indent: 0; 
                }

                h4.ref-title { 
                    font-family: "SimHei", sans-serif;
                    mso-fareast-font-family: "SimHei";
                    font-size: 14pt;
                    text-align: center; 
                    margin-top: 2em; 
                    border-top: 1px solid #000; 
                    padding-top: 1em; 
                }

                p.ref-content { 
                    font-family: "Times New Roman", serif;
                    mso-fareast-font-family: "SimSun";
                    font-size: 10.5pt;
                    text-indent: 0 !important; 
                    margin-bottom: 4px; 
                }
                
                sup { vertical-align: super; font-size: smaller; }
            </style>
        </head>
        <body>
            ${contentHtml}
        </body>
        </html>
    `;

    if (window.htmlDocx) {
        const converted = window.htmlDocx.asBlob(fullHtml);
        saveAs(converted, `${headerTitle}.docx`);
    } else {
        alert("导出插件加载失败，请检查网络连接");
    }
}

function exportToPDF() {
    const headerTitle = document.getElementById('headerTitle').value || 'document';
    
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.innerHTML = `
        <div style="font-size: 18px; color: #333; margin-bottom: 10px; font-weight: bold;">正在生成 PDF...</div>
        <div style="font-size: 14px; color: #666;">请稍候，文档较长时可能需要几秒钟</div>
    `;
    document.body.appendChild(overlay);

    const element = getCleanContentContainer();
    
    element.style.padding = '0'; 
    element.style.width = '170mm'; 
    element.style.margin = '0 auto'; 
    element.style.backgroundColor = 'white';
    
    document.body.appendChild(element);
    
    const opt = {
        margin:       [15, 20, 15, 20], 
        filename:     `${headerTitle}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true }, 
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    if (window.html2pdf) {
        window.scrollTo(0, 0);
        
        html2pdf().set(opt).from(element).save().then(() => {
            document.body.removeChild(element);
            document.body.removeChild(overlay);
        }).catch(err => {
            console.error("PDF Export Error:", err);
            alert("导出出错: " + err.message);
            if (document.body.contains(element)) document.body.removeChild(element);
            if (document.body.contains(overlay)) document.body.removeChild(overlay);
        });
    } else {
        alert("导出插件加载失败，请检查网络连接");
        document.body.removeChild(element);
        document.body.removeChild(overlay);
    }
}

function copyFullText() {
    const cleanContainer = getCleanContentContainer();
    const text = cleanContainer.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.querySelector('button[onclick="copyFullText()"]');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check text-green-600"></i> 已复制';
        setTimeout(() => {
            btn.innerHTML = originalHtml;
        }, 2000);
    }).catch(err => {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
    });
}
