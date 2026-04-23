// DOM 元素缓存
const DOM = {
    menuButton: null,
    mainNav: null,
    backToTopButton: null,
    modules: null,
    moduleHeaders: null,
    sidebarLinks: null,
    sections: null,
    cards: null,
    languageLinks: null
};

// 初始化 DOM 元素缓存
function initDOMCache() {
    DOM.moduleHeaders = document.querySelectorAll('.module-header');
    DOM.mainNav = document.querySelector('.main-nav ul');
    DOM.modules = document.querySelectorAll('.module');
    DOM.sidebarLinks = document.querySelectorAll('.sidebar-nav a');
    DOM.sections = document.querySelectorAll('.submodule, .module');
    DOM.cards = document.querySelectorAll('.card');
    DOM.languageLinks = document.querySelectorAll('.language a');
}

// 平滑滚动
function initSmoothScroll() {
    document.addEventListener('click', function(e) {
        const anchor = e.target.closest('a');
        if (!anchor) return;
        
        const href = anchor.getAttribute('href');
        
        // 处理锚点链接（页面内跳转）
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href;
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        }
        // 外部链接和页面跳转由浏览器默认处理
    });
}

// 侧边栏展开/收起功能
function initSidebarToggle() {
    if (!DOM.moduleHeaders) return;
    
    // 为子模块链接添加点击事件，阻止冒泡
    const submoduleLinks = document.querySelectorAll('.submodule-list a');
    submoduleLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 阻止事件冒泡到module-header
            e.stopPropagation();
        });
    });
    
    // 为切换按钮添加点击事件
    const toggles = document.querySelectorAll('.toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const header = this.closest('.module-header');
            const submoduleList = header.nextElementSibling;
            
            if (submoduleList.classList.contains('active')) {
                submoduleList.classList.remove('active');
                this.textContent = '+';
            } else {
                submoduleList.classList.add('active');
                this.textContent = '-';
            }
        });
    });
    
    // 为模块标题链接添加点击事件
    const moduleLinks = document.querySelectorAll('.module-header a');
    moduleLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 正常跳转到链接，不阻止默认行为
            // 但阻止事件冒泡，避免触发header的点击事件
            e.stopPropagation();
        });
    });
    
    // 为模块标题添加点击事件（仅当点击空白区域时）
    DOM.moduleHeaders.forEach(header => {
        header.addEventListener('click', function(e) {
            // 如果点击的是切换按钮或链接，不处理
            if (e.target.classList.contains('toggle') || e.target.tagName === 'A') {
                return;
            }
            
            // 点击空白区域时，展开/收起子模块
            const toggle = this.querySelector('.toggle');
            const submoduleList = this.nextElementSibling;
            
            if (submoduleList.classList.contains('active')) {
                submoduleList.classList.remove('active');
                toggle.textContent = '+';
            } else {
                submoduleList.classList.add('active');
                toggle.textContent = '-';
            }
        });
    });
    
    // 默认展开第一个模块和当前页面的模块
    const firstModule = document.querySelector('.module-item .submodule-list');
    if (firstModule) {
        firstModule.classList.add('active');
        const firstToggle = document.querySelector('.module-item .toggle');
        if (firstToggle) {
            firstToggle.textContent = '-';
        }
    }
    
    // 展开当前页面的模块
    DOM.moduleHeaders.forEach(header => {
        const moduleLink = header.querySelector('a');
        if (moduleLink) {
            const moduleHref = moduleLink.getAttribute('href');
            const currentUrl = window.location.href;
            // 检查当前URL是否包含模块链接的href
            if (currentUrl.includes(moduleHref)) {
                const submoduleList = header.nextElementSibling;
                const toggle = header.querySelector('.toggle');
                if (submoduleList) {
                    // 确保添加active类，展开所有子模块
                    submoduleList.classList.add('active');
                    if (toggle) {
                        toggle.textContent = '-';
                    }
                }
            }
        }
    });
}

// 侧边栏激活状态
function updateActiveSidebarLink() {
    if (!DOM.sections || !DOM.sidebarLinks) return;
    
    let currentSection = '';
    let closestSection = '';
    let minDistance = Infinity;
    
    // 找到当前视口中最接近顶部的部分
    DOM.sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const distance = Math.abs(window.pageYOffset + 100 - sectionTop);
        
        // 检查部分是否在视口中
        if (window.pageYOffset >= sectionTop - 100 && window.pageYOffset < sectionTop + sectionHeight - 100) {
            currentSection = '#' + section.getAttribute('id');
        }
        
        // 找到距离视口顶部最近的部分
        if (distance < minDistance) {
            minDistance = distance;
            closestSection = '#' + section.getAttribute('id');
        }
    });
    
    // 如果没有找到在视口中的部分，使用最接近的部分
    if (!currentSection) {
        currentSection = closestSection;
    }
    
    DOM.sidebarLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentSection) {
            link.classList.add('active');
            // 自动展开包含当前链接的模块
            const moduleItem = link.closest('.module-item');
            if (moduleItem) {
                const submoduleList = moduleItem.querySelector('.submodule-list');
                const toggle = moduleItem.querySelector('.toggle');
                if (submoduleList && !submoduleList.classList.contains('active')) {
                    submoduleList.classList.add('active');
                    if (toggle) {
                        toggle.textContent = '-';
                    }
                }
            }
        }
    });
}

// 响应式导航菜单
function initResponsiveNav() {
    if (!DOM.mainNav) return;
    
    // 创建菜单按钮
    DOM.menuButton = document.createElement('button');
    DOM.menuButton.textContent = '☰';
    DOM.menuButton.id = 'menuButton';
    DOM.menuButton.style.cssText = `
        display: none;
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 15px;
    `;
    
    DOM.mainNav.parentNode.insertBefore(DOM.menuButton, DOM.mainNav);
    
    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            DOM.menuButton.style.display = 'block';
            DOM.mainNav.style.display = 'none';
            DOM.mainNav.style.flexDirection = 'column';
            DOM.mainNav.style.position = 'absolute';
            DOM.mainNav.style.top = '100%';
            DOM.mainNav.style.left = '0';
            DOM.mainNav.style.right = '0';
            DOM.mainNav.style.background = '#444';
            DOM.mainNav.style.boxShadow = '0 5px 10px rgba(0,0,0,0.1)';
            DOM.mainNav.style.zIndex = '1000';
        } else {
            DOM.menuButton.style.display = 'none';
            DOM.mainNav.style.display = 'flex';
            DOM.mainNav.style.flexDirection = 'row';
            DOM.mainNav.style.position = 'static';
            DOM.mainNav.style.boxShadow = 'none';
        }
    }
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    DOM.menuButton.addEventListener('click', function() {
        if (DOM.mainNav.style.display === 'none') {
            DOM.mainNav.style.display = 'flex';
        } else {
            DOM.mainNav.style.display = 'none';
        }
    });
}

// 返回顶部按钮
function initBackToTopButton() {
    // 创建返回顶部按钮
    DOM.backToTopButton = document.createElement('button');
    DOM.backToTopButton.textContent = '↑';
    DOM.backToTopButton.id = 'backToTop';
    DOM.backToTopButton.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: #3498db;
        color: white;
        border: none;
        font-size: 24px;
        cursor: pointer;
        display: none;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(DOM.backToTopButton);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            DOM.backToTopButton.style.display = 'block';
        } else {
            DOM.backToTopButton.style.display = 'none';
        }
    });
    
    DOM.backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 模块高亮效果
function initModuleHighlight() {
    if (!DOM.modules) return;
    
    function highlightCurrentModule() {
        const scrollPosition = window.pageYOffset + 100;
        
        DOM.modules.forEach(module => {
            const moduleTop = module.offsetTop;
            const moduleBottom = moduleTop + module.offsetHeight;
            
            if (scrollPosition >= moduleTop && scrollPosition < moduleBottom) {
                module.style.backgroundColor = 'rgba(52, 152, 219, 0.05)';
            } else {
                module.style.backgroundColor = '#1e1e1e'; // 修复背景色，与CSS保持一致
            }
        });
    }
    
    window.addEventListener('scroll', highlightCurrentModule);
}

// 表格响应式处理
function initResponsiveTables() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        table.style.width = '100%';
        table.style.maxWidth = '100%';
    });
}

// 卡片悬停效果增强
function initCardHoverEffects() {
    if (!DOM.cards) return;
    
    DOM.cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// 语言切换功能
function initLanguageToggle() {
    if (!DOM.languageLinks) return;
    
    DOM.languageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            DOM.languageLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            // 这里可以添加语言切换逻辑
        });
    });
}

// 节流函数
function throttle(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        if (!timeout) {
            timeout = setTimeout(() => {
                timeout = null;
                func.apply(context, args);
            }, wait);
        }
    };
}

// 初始化所有功能
function init() {
    initDOMCache();
    initSmoothScroll();
    initSidebarToggle();
    initResponsiveNav();
    initBackToTopButton();
    initModuleHighlight();
    initResponsiveTables();
    initCardHoverEffects();
    initLanguageToggle();
    
    // 使用节流优化滚动事件
    window.addEventListener('scroll', throttle(updateActiveSidebarLink, 100));
    
    // 初始调用
    updateActiveSidebarLink();
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}