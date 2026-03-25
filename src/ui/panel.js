const openListeners = {};
let activePanel = null;

export const onPanelOpen = (id, callback) => {
    openListeners[id] = callback;
};

export const closePanel = () => {
    if (!activePanel) return;
    const { overlay } = activePanel;
    overlay.classList.add('map-panel-overlay--closing');
    overlay.addEventListener('animationend', () => overlay.remove(), { once: true });
    activePanel = null;
};

export const openPanel = (id, content) => {
    closePanel();

    const overlay = document.createElement('div');
    overlay.className = 'map-panel-overlay';

    const panel = document.createElement('div');
    panel.className = 'map-panel';
    panel.setAttribute('role', 'dialog');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'map-panel-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', closePanel);
    panel.appendChild(closeBtn);

    const contentWrapper = document.createElement('div');
    contentWrapper.innerHTML = content;
    panel.appendChild(contentWrapper);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    activePanel = { overlay, id };

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closePanel();
    });

    if (openListeners[id]) openListeners[id]();
};
